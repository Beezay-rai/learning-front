/**
 * useWorkflowService
 *
 * Manages workflow definitions (state-machine metadata + canvas snapshot).
 * Uses localStorage as the persistence layer since there is no backend
 * workflow endpoint yet.  Follows the same React-Query + mutation pattern
 * used by useOrchestratorApiService.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { Node, Edge } from "@xyflow/react";

/* =============================================================
   Interfaces
============================================================= */

export type WorkflowStatus = "active" | "inactive" | "draft";

export interface WorkflowState {
  id: string;
  type:
    | "Task"
    | "Choice"
    | "Parallel"
    | "Map"
    | "Wait"
    | "Pass"
    | "Succeed"
    | "Fail"
    | "Start"
    | "End";
  name: string;
  config?: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  status: WorkflowStatus;
  comment?: string;
  /** Number of states (computed from canvas nodes, minus start/end) */
  stateCount: number;
  createdAt: string;
  updatedAt: string;
  /** Serialised canvas – nodes & edges stored as JSON string */
  canvasSnapshot?: {
    nodes: Node[];
    edges: Edge[];
  };
}

export interface WorkflowRequest {
  name: string;
  description: string;
  status: WorkflowStatus;
  comment?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
}

/* =============================================================
   LocalStorage persistence helpers
============================================================= */

const LS_KEY = "flowx_workflows";

const DEMO_WORKFLOWS: Workflow[] = [
  {
    id: "wf-1",
    name: "Order Processing",
    description: "Handles end-to-end order placement, payment and fulfilment",
    status: "active",
    comment: "Core e-commerce flow",
    stateCount: 6,
    createdAt: new Date(Date.now() - 7 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86_400_000).toISOString(),
  },
  {
    id: "wf-2",
    name: "User Onboarding",
    description: "New user registration, verification and welcome e-mail",
    status: "active",
    comment: "",
    stateCount: 4,
    createdAt: new Date(Date.now() - 14 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86_400_000).toISOString(),
  },
  {
    id: "wf-3",
    name: "Report Generator",
    description: "Parallel report generation and delivery workflow",
    status: "draft",
    comment: "WIP – not yet deployed",
    stateCount: 3,
    createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86_400_000).toISOString(),
  },
];

function loadAll(): Workflow[] {
  try {
    if (typeof window === "undefined") return DEMO_WORKFLOWS;
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      // seed demo data on first load
      localStorage.setItem(LS_KEY, JSON.stringify(DEMO_WORKFLOWS));
      return DEMO_WORKFLOWS;
    }
    return JSON.parse(raw) as Workflow[];
  } catch {
    return DEMO_WORKFLOWS;
  }
}

function saveAll(workflows: Workflow[]): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(workflows));
  } catch {
    /* ignore storage errors */
  }
}

function generateId(): string {
  return `wf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

/* =============================================================
   Async helpers  (simulate network latency ~ 200 ms)
============================================================= */

const delay = (ms = 200) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

const getWorkflows = async (params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<PaginatedResponse<Workflow>> => {
  await delay();
  let items = loadAll();
  if (params?.search) {
    const q = params.search.toLowerCase();
    items = items.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q),
    );
  }
  const total = items.length;
  if (params?.page !== undefined && params?.pageSize !== undefined) {
    const start = (params.page - 1) * params.pageSize;
    items = items.slice(start, start + params.pageSize);
  }
  return { items, total };
};

const getWorkflowById = async (id: string): Promise<Workflow> => {
  await delay();
  const wf = loadAll().find((w) => w.id === id);
  if (!wf) throw new Error(`Workflow ${id} not found`);
  return wf;
};

const createWorkflow = async (payload: WorkflowRequest): Promise<Workflow> => {
  await delay();
  const all = loadAll();
  const now = new Date().toISOString();
  const wf: Workflow = {
    id: generateId(),
    ...payload,
    stateCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  saveAll([...all, wf]);
  return wf;
};

const updateWorkflow = async ({
  id,
  payload,
}: {
  id: string;
  payload: Partial<WorkflowRequest>;
}): Promise<Workflow> => {
  await delay();
  const all = loadAll();
  const idx = all.findIndex((w) => w.id === id);
  if (idx === -1) throw new Error(`Workflow ${id} not found`);
  const updated: Workflow = {
    ...all[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  saveAll(all);
  return updated;
};

const deleteWorkflow = async (id: string): Promise<void> => {
  await delay();
  saveAll(loadAll().filter((w) => w.id !== id));
};

/** Persist the visual canvas snapshot + recompute stateCount */
const saveCanvasSnapshot = async ({
  id,
  nodes,
  edges,
}: {
  id: string;
  nodes: Node[];
  edges: Edge[];
}): Promise<Workflow> => {
  await delay(100);
  const all = loadAll();
  const idx = all.findIndex((w) => w.id === id);
  if (idx === -1) throw new Error(`Workflow ${id} not found`);
  const stateCount = nodes.filter(
    (n) => n.type !== "start" && n.type !== "end",
  ).length;
  const updated: Workflow = {
    ...all[idx],
    stateCount,
    canvasSnapshot: { nodes, edges },
    updatedAt: new Date().toISOString(),
  };
  all[idx] = updated;
  saveAll(all);
  return updated;
};

/* =============================================================
   React-Query hook
============================================================= */

const QUERY_KEYS = {
  workflows: ["workflows"] as const,
  workflowList: (params?: object) => ["workflows", "list", params] as const,
  workflowById: (id: string) => ["workflows", id] as const,
};

export default function useWorkflowService() {
  const queryClient = useQueryClient();

  /* ── Queries ── */

  const useGetWorkflows = (
    params?: { page?: number; pageSize?: number; search?: string },
    options?: Omit<
      UseQueryOptions<PaginatedResponse<Workflow>, Error>,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: QUERY_KEYS.workflowList(params),
      queryFn: () => getWorkflows(params),
      ...options,
    });

  const useGetWorkflowById = (
    id: string,
    options?: Omit<
      UseQueryOptions<Workflow, Error>,
      "queryKey" | "queryFn"
    >,
  ) =>
    useQuery({
      queryKey: QUERY_KEYS.workflowById(id),
      queryFn: () => getWorkflowById(id),
      enabled: !!id,
      ...options,
    });

  /* ── Mutations ── */

  const useCreateWorkflow = () =>
    useMutation({
      mutationFn: createWorkflow,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workflows }),
    });

  const useUpdateWorkflow = () =>
    useMutation({
      mutationFn: updateWorkflow,
      onSuccess: (_, vars) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workflows });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.workflowById(vars.id),
        });
      },
    });

  const useDeleteWorkflow = () =>
    useMutation({
      mutationFn: deleteWorkflow,
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workflows }),
    });

  const useSaveCanvasSnapshot = () =>
    useMutation({
      mutationFn: saveCanvasSnapshot,
      onSuccess: (wf) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.workflows });
        queryClient.setQueryData(QUERY_KEYS.workflowById(wf.id), wf);
      },
    });

  return {
    useGetWorkflows,
    useGetWorkflowById,
    useCreateWorkflow,
    useUpdateWorkflow,
    useDeleteWorkflow,
    useSaveCanvasSnapshot,
  };
}
