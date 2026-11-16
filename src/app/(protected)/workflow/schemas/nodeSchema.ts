import * as yup from "yup";
import type { StateType } from "@/app/(protected)/workflow/components/WorkflowNodes";

/* ──────────────────────────────────────────────────────────────
   Common shape shared by all node types
────────────────────────────────────────────────────────────── */
export type { StateType };

export interface BaseNodeFormData {
  type: StateType;
  label: string;
  /** Human readable description of what this container does */
  description?: string;
}

/* ──────────────────────────────────────────────────────────────
   Type-specific extensions
────────────────────────────────────────────────────────────── */
export interface TaskNodeFormData extends BaseNodeFormData {
  type: "Task";
  resource: string;
  timeout?: number;
  retryCount?: number;
}

export interface ConditionBranch {
  condition: string;
  /** Node this condition points at (arrow is created automatically) */
  targetNodeId: string;
}

export interface ChoiceNodeFormData extends BaseNodeFormData {
  type: "Choice";
  /** Each condition can point at its own target node */
  conditions: ConditionBranch[];
  /** Legacy single-condition field kept for previously saved canvases */
  condition?: string;
}

export interface ParallelNodeFormData extends BaseNodeFormData {
  type: "Parallel";
  branches: number;
  /** Nodes that run in parallel (arrows are created automatically) */
  targetNodeIds: string[];
}

export interface MapNodeFormData extends BaseNodeFormData {
  type: "Map";
  inputPath: string;
  itemVariable: string;
}

export interface WaitNodeFormData extends BaseNodeFormData {
  type: "Wait";
  waitType: "duration" | "timestamp" | "event";
  duration?: string; // ISO 8601 duration (e.g., "PT30S")
  timestamp?: string; // ISO 8601 timestamp
  eventName?: string;
}

export interface PassNodeFormData extends BaseNodeFormData {
  type: "Pass";
  result?: Record<string, unknown>;
}

export interface SucceedNodeFormData extends BaseNodeFormData {
  type: "Succeed";
}

export interface FailNodeFormData extends BaseNodeFormData {
  type: "Fail";
  error: string;
  cause?: string;
}

export interface StartNodeFormData extends BaseNodeFormData {
  type: "Start";
}

export interface EndNodeFormData extends BaseNodeFormData {
  type: "End";
}

/* ──────────────────────────────────────────────────────────────
   Discriminated union of all possible form data
────────────────────────────────────────────────────────────── */
export type NodeFormData =
  | TaskNodeFormData
  | ChoiceNodeFormData
  | ParallelNodeFormData
  | MapNodeFormData
  | WaitNodeFormData
  | PassNodeFormData
  | SucceedNodeFormData
  | FailNodeFormData
  | StartNodeFormData
  | EndNodeFormData;

/* ──────────────────────────────────────────────────────────────
   Yup validation schemas per type
────────────────────────────────────────────────────────────── */
const baseSchema = yup.object({
  type: yup.string().required("Node type is required"),
  label: yup.string().required("Label is required").min(1).max(100),
  description: yup
    .string()
    .max(200, "Description must be 200 characters or less")
    .default(""),
});

export const nodeSchemas: Record<StateType, yup.ObjectSchema<NodeFormData>> = {
  Task: baseSchema.concat(
    yup.object({
      resource: yup.string().required("Resource is required"),
      timeout: yup.number().positive().integer().default(30),
      retryCount: yup.number().min(0).max(5).default(0),
    }),
  ),
  Choice: baseSchema.concat(
    yup.object({
      conditions: yup
        .array()
        .of(
          yup.object({
            condition: yup.string().default(""),
            targetNodeId: yup.string().default(""),
          }),
        )
        .max(2, "Choice supports two branches")
        .default([]),
    }),
  ),
  Parallel: baseSchema.concat(
    yup.object({
      branches: yup.number().integer().min(2).max(10).default(2),
      targetNodeIds: yup.array().of(yup.string()).default([]),
    }),
  ),
  Map: baseSchema.concat(
    yup.object({
      inputPath: yup.string().required("Input path is required"),
      itemVariable: yup.string().required("Item variable name is required").matches(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
    }),
  ),
  Wait: baseSchema.concat(
    yup.object({
      waitType: yup.string().oneOf(["duration", "timestamp", "event"]).required(),
      duration: yup.string().when("waitType", { is: "duration", then: (s) => s.required("Duration is required") }),
      timestamp: yup.string().when("waitType", { is: "timestamp", then: (s) => s.required("Timestamp is required") }),
      eventName: yup.string().when("waitType", { is: "event", then: (s) => s.required("Event name is required") }),
    }),
  ),
  Pass: baseSchema.concat(
    yup.object({
      result: yup.mixed().default({}),
    }),
  ),
  Succeed: baseSchema,
  Fail: baseSchema.concat(
    yup.object({
      error: yup.string().required("Error code is required"),
      cause: yup.string(),
    }),
  ),
  Start: baseSchema,
  End: baseSchema,
};

/* ──────────────────────────────────────────────────────────────
   Default values for each node type
────────────────────────────────────────────────────────────── */
export const nodeDefaults: Record<StateType, Partial<NodeFormData>> = {
  Task: {
    type: "Task",
    label: "Task",
    description: "Invoke a resource or service",
    resource: "",
    timeout: 30,
    retryCount: 0,
  },
  Choice: {
    type: "Choice",
    label: "Choice",
    description: "Branch when a condition matches",
    conditions: [{ condition: "", targetNodeId: "" }],
  },
  Parallel: {
    type: "Parallel",
    label: "Parallel",
    description: "Run branches at the same time",
    branches: 2,
    targetNodeIds: [],
  },
  Map: {
    type: "Map",
    label: "Map",
    description: "Iterate over each item in an array",
    inputPath: "$.items",
    itemVariable: "item",
  },
  Wait: {
    type: "Wait",
    label: "Wait",
    description: "Pause for a duration or event",
    waitType: "duration",
    duration: "PT30S",
  },
  Pass: {
    type: "Pass",
    label: "Pass",
    description: "Pass input through to output",
    result: {},
  },
  Succeed: {
    type: "Succeed",
    label: "Succeed",
    description: "End the workflow successfully",
  },
  Fail: {
    type: "Fail",
    label: "Fail",
    description: "End the workflow with an error",
    error: "Error",
    cause: "",
  },
  Start: { type: "Start", label: "Start", description: "Workflow entry point" },
  End: { type: "End", label: "End", description: "Workflow termination point" },
};

/* ──────────────────────────────────────────────────────────────
   Helper to get schema for a node type
────────────────────────────────────────────────────────────── */
export function getNodeSchema(type: StateType): yup.ObjectSchema<NodeFormData> {
  return nodeSchemas[type];
}

/* ──────────────────────────────────────────────────────────────
   JSON container descriptor  (name / description / config)
────────────────────────────────────────────────────────────── */
export interface NodeJsonContainer {
  type: StateType;
  name: string;
  description: string;
  config: Record<string, unknown>;
}

const CONFIG_KEYS: Record<string, string[]> = {
  Task: ["resource", "timeout", "retryCount"],
  Choice: ["conditions", "condition"],
  Parallel: ["branches", "targetNodeIds"],
  Map: ["inputPath", "itemVariable"],
  Wait: ["waitType", "duration", "timestamp", "eventName"],
  Pass: [],
  Succeed: [],
  Fail: ["error", "cause"],
  Start: [],
  End: [],
};

/**
 * Build the JSON document stored for a container: type, name, description
 * and only the config keys that belong to that container type.
 */
export function buildNodeJson(data: Partial<NodeFormData>): NodeJsonContainer {
  const type = (data.type ?? "Task") as StateType;
  const values = data as Record<string, unknown>;
  const config: Record<string, unknown> = {};

  for (const key of CONFIG_KEYS[type] ?? []) {
    let value = values[key];
    if (key === "conditions" && Array.isArray(value)) {
      // drop blank condition rows from the descriptor
      value = value.filter(
        (row) =>
          row &&
          typeof row === "object" &&
          ((row as ConditionBranch).targetNodeId ||
            (row as ConditionBranch).condition),
      );
    }
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;
    config[key] = value;
  }

  return {
    type,
    name: (data.label as string) || "Untitled",
    description: (data.description as string) ?? "",
    config,
  };
}