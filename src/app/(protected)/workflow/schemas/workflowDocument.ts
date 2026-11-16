/**
 * workflowDocument.ts
 * Merges every container on the canvas into a single workflow document
 * (JSON) and renders the same document as XML.
 */

import type { Edge, Node } from "@xyflow/react";
import type { StateType } from "../components/WorkflowNodes";
import {
  buildNodeJson,
  type ConditionBranch,
  type NodeFormData,
} from "./nodeSchema";

export type WorkflowStateType = StateType | "Start" | "End";

export interface WorkflowStateJson {
  type: WorkflowStateType;
  description?: string;
  config?: Record<string, unknown>;
  next?: string | string[];
  choices?: Array<{ condition: string; next: string }>;
  branches?: string[];
}

export interface WorkflowDocument {
  name: string;
  description: string;
  startAt: string;
  states: Record<string, WorkflowStateJson>;
}

/**
 * Merge all canvas nodes + edges into one document:
 * every container becomes a named state with its config and next targets.
 */
export function buildWorkflowDocument(
  nodes: Node[],
  edges: Edge[],
  meta: { name: string; description?: string },
): WorkflowDocument {
  /* unique state names derived from container names */
  const names = new Map<string, string>();
  const used = new Set<string>();

  for (const node of nodes) {
    const label = String(
      (node.data as { label?: string } | undefined)?.label ?? node.id,
    ).trim();
    const base = label || node.id;
    let name = base;
    let i = 2;
    while (used.has(name)) name = `${base} ${i++}`;
    used.add(name);
    names.set(node.id, name);
  }

  /* outgoing targets per node */
  const outgoing = new Map<string, string[]>();
  for (const edge of edges) {
    const target = names.get(edge.target);
    if (!target) continue;
    const list = outgoing.get(edge.source) ?? [];
    if (!list.includes(target)) list.push(target);
    outgoing.set(edge.source, list);
  }

  const states: Record<string, WorkflowStateJson> = {};

  for (const node of nodes) {
    const data = (node.data ?? {}) as Record<string, unknown>;
    const rawType = String(node.type ?? "Task");
    const type = (
      rawType === "start" ? "Start" : rawType === "end" ? "End" : rawType
    ) as WorkflowStateType;
    const name = names.get(node.id) as string;
    const { config } = buildNodeJson({
      ...data,
      type,
      label: name,
    } as unknown as Partial<NodeFormData>);

    const entry: WorkflowStateJson = { type };
    if (data.description) entry.description = String(data.description);
    if (Object.keys(config).length > 0) entry.config = config;

    const targets = outgoing.get(node.id) ?? [];

    if (type === "Choice") {
      // one branch per condition, each pointing at its own target node
      const rows = Array.isArray(data.conditions)
        ? (data.conditions as ConditionBranch[])
        : [];
      const branches = rows
        .map((row) => ({
          condition: String(row?.condition || "default"),
          next: row?.targetNodeId ? names.get(row.targetNodeId) : undefined,
        }))
        .filter((b): b is { condition: string; next: string } => !!b.next);

      if (branches.length > 0) {
        entry.choices = branches;
      } else if (targets.length > 0) {
        entry.choices = targets.map((next) => ({
          condition: String(data.condition || "default"),
          next,
        }));
      }
    } else if (type === "Parallel") {
      // Nodes placed inside the container are its parallel branches
      const children = nodes
        .filter((child) => child.parentId === node.id)
        .map((child) => names.get(child.id))
        .filter((name): name is string => !!name);
      const legacy = Array.isArray(data.targetNodeIds)
        ? (data.targetNodeIds as string[])
            .map((id) => names.get(id))
            .filter((name): name is string => !!name)
        : [];
      const branches = children.length > 0 ? children : legacy;

      if (branches.length > 0) entry.branches = branches;

      if (targets.length === 1) {
        entry.next = targets[0];
      } else if (targets.length > 1) {
        entry.next = targets;
      }
    } else {
      if (targets.length === 1) {
        entry.next = targets[0];
      } else if (targets.length > 1) {
        entry.next = targets;
      }
    }

    states[name] = entry;
  }

  const startNode = nodes.find((n) => n.type === "start");
  const startTargets = startNode ? outgoing.get(startNode.id) ?? [] : [];
  const startAt = startTargets[0] ?? Object.keys(states)[0] ?? "";

  return {
    name: meta.name,
    description: meta.description ?? "",
    startAt,
    states,
  };
}

/* ═══════════════════════════════════════════════════════════
   XML rendering of the same merged document
═══════════════════════════════════════════════════════════ */
const XML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
};

const escapeXml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char]);

const capitalize = (key: string) => key.charAt(0).toUpperCase() + key.slice(1);

const isRenderable = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as object).length > 0;
  return true;
};

function renderXmlValue(key: string, value: unknown, indent: string): string {
  if (Array.isArray(value)) {
    const inner = value
      .map((item) => renderXmlValue("item", item, `${indent}  `))
      .join("\n");
    return `${indent}<${key}>\n${inner}\n${indent}</${key}>`;
  }

  if (value && typeof value === "object") {
    const inner = Object.entries(value as Record<string, unknown>)
      .map(([childKey, childValue]) =>
        renderXmlValue(childKey, childValue, `${indent}  `),
      )
      .join("\n");
    return `${indent}<${key}>\n${inner}\n${indent}</${key}>`;
  }

  return `${indent}<${key}>${escapeXml(String(value ?? ""))}</${key}>`;
}

/** Render the merged workflow document as XML. */
export function workflowDocumentToXml(doc: WorkflowDocument): string {
  const states = Object.entries(doc.states)
    .map(([name, state]) => {
      const { type, ...rest } = state;
      const children = Object.entries(rest)
        .filter(([, value]) => isRenderable(value))
        .map(([key, value]) => renderXmlValue(capitalize(key), value, "      "))
        .join("\n");

      return [
        `    <State name="${escapeXml(name)}" type="${escapeXml(String(type))}">`,
        children,
        "    </State>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<Workflow name="${escapeXml(doc.name)}" description="${escapeXml(
      doc.description,
    )}">`,
    `  <StartAt>${escapeXml(doc.startAt)}</StartAt>`,
    "  <States>",
    states,
    "  </States>",
    "</Workflow>",
  ]
    .filter(Boolean)
    .join("\n");
}
