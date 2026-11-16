"use client";

/**
 * WorkflowNodes.tsx
 * All AWS Step Functions-style node renderers + shared helpers.
 * Each container type gets its own colour theme, lucide icon and
 * name/description block so the canvas is readable at a glance.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { Handle, Position, NodeProps, useReactFlow, useStore } from "@xyflow/react";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  GitBranch,
  GitFork,
  Map as MapIcon,
  XCircle,
  type LucideIcon,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   Design tokens
═══════════════════════════════════════════════════════════ */
export const TOKEN = {
  radius: 12,
  handleColor: "#6366f1",
  handleSize: 9,
  labelColor: "#0f172a",
  subColor: "#64748b",
  cardBg: "#ffffff",
  cardShadow: "0 2px 10px rgba(15,23,42,0.08)",
  cardShadowSelected:
    "0 0 0 3px rgba(99,102,241,0.16), 0 10px 24px rgba(15,23,42,0.12)",
  minWidth: 200,
  font: "'Inter', system-ui, sans-serif",
} as const;

/* ── Parallel container geometry (shared with the builder) ── */
export const PARALLEL_MIN_WIDTH = 500;
export const PARALLEL_MIN_HEIGHT = 320;
export const PARALLEL_HEADER_HEIGHT = 92;

/* ── State-type palettes (per-container theme) ────────────── */
export const STATE_PALETTE = {
  Task: { bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8", accent: "#3b82f6" },
  Choice: { bg: "#f5f3ff", border: "#ddd6fe", text: "#6d28d9", accent: "#8b5cf6" },
  Parallel: { bg: "#ecfdf5", border: "#a7f3d0", text: "#047857", accent: "#10b981" },
  Map: { bg: "#fff7ed", border: "#fed7aa", text: "#c2410c", accent: "#f97316" },
  Wait: { bg: "#fefce8", border: "#fde68a", text: "#a16207", accent: "#eab308" },
  Pass: { bg: "#f8fafc", border: "#e2e8f0", text: "#475569", accent: "#64748b" },
  Succeed: { bg: "#f0fdf4", border: "#86efac", text: "#15803d", accent: "#16a34a" },
  Fail: { bg: "#fff1f2", border: "#fecdd3", text: "#b91c1c", accent: "#ef4444" },
} as const;

export type StateType = keyof typeof STATE_PALETTE;

/* ── Container icons (clean, line-based) ──────────────────── */
export const NODE_ICONS: Record<StateType, LucideIcon> = {
  Task: Cpu,
  Choice: GitBranch,
  Parallel: GitFork,
  Map: MapIcon,
  Wait: Clock,
  Pass: ArrowRight,
  Succeed: CheckCircle2,
  Fail: XCircle,
};

/* ── Type label + short tagline used when a node has none ─── */
export const NODE_META: Record<StateType, { label: string; tagline: string }> = {
  Task: { label: "Task", tagline: "Invoke a resource or service" },
  Choice: { label: "Choice", tagline: "Branch when a condition matches" },
  Parallel: { label: "Parallel", tagline: "Run branches at the same time" },
  Map: { label: "Map", tagline: "Iterate over each item in an array" },
  Wait: { label: "Wait", tagline: "Pause for a duration or event" },
  Pass: { label: "Pass", tagline: "Pass input through to output" },
  Succeed: { label: "Succeed", tagline: "End the workflow successfully" },
  Fail: { label: "Fail", tagline: "End the workflow with an error" },
};

/* ═══════════════════════════════════════════════════════════
   Inline-editable label  (shared)
═══════════════════════════════════════════════════════════ */
function InlineLabel({
  nodeId,
  value,
  color = TOKEN.labelColor,
  fontSize = 13,
  maxWidth = 168,
  center = false,
}: {
  nodeId: string;
  value: string;
  color?: string;
  fontSize?: number;
  maxWidth?: number;
  center?: boolean;
}) {
  const { updateNodeData } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraft(value ?? "");
  }, [value]);
  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = useCallback(() => {
    const v = draft.trim() || value;
    updateNodeData(nodeId, { label: v });
    setDraft(v);
    setEditing(false);
  }, [draft, nodeId, updateNodeData, value]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") {
            setDraft(value);
            setEditing(false);
          }
          e.stopPropagation();
        }}
        style={{
          fontSize,
          fontWeight: 600,
          color,
          background: "#f8fafc",
          border: "1.5px solid #6366f1",
          borderRadius: 4,
          padding: "2px 6px",
          width: "100%",
          outline: "none",
          textAlign: center ? "center" : "left",
          fontFamily: TOKEN.font,
        }}
      />
    );
  }

  return (
    <span
      title="Double-click to rename"
      onDoubleClick={(e) => {
        e.stopPropagation();
        setEditing(true);
      }}
      style={{
        fontSize,
        fontWeight: 600,
        color,
        cursor: "text",
        paddingBottom: 1,
        display: "inline-block",
        maxWidth,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        textAlign: center ? "center" : "left",
        fontFamily: TOKEN.font,
      }}
    >
      {draft || "Untitled"}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   Handle helpers
═══════════════════════════════════════════════════════════ */
const hStyle = {
  background: TOKEN.handleColor,
  border: "2px solid #fff",
  width: TOKEN.handleSize,
  height: TOKEN.handleSize,
};

/* ═══════════════════════════════════════════════════════════
   Config summary rows  (type-specific detail line)
═══════════════════════════════════════════════════════════ */
function getDetails(
  type: StateType,
  data: Record<string, unknown>,
): Array<[string, string]> {
  const s = (v: unknown) =>
    v === undefined || v === null || v === "" ? "" : String(v);

  switch (type) {
    case "Task": {
      const rows: Array<[string, string]> = [];
      if (s(data.resource)) rows.push(["resource", s(data.resource)]);
      const policy = [
        s(data.timeout) ? `${s(data.timeout)}s timeout` : "",
        s(data.retryCount) ? `${s(data.retryCount)} retries` : "",
      ]
        .filter(Boolean)
        .join(" · ");
      if (policy) rows.push(["policy", policy]);
      return rows;
    }
    case "Choice": {
      const rows = Array.isArray(data.conditions)
        ? (data.conditions as Array<{ condition?: string }>)
        : [];
      if (rows.length > 0) {
        return [
          ["rules", `${rows.length} condition${rows.length > 1 ? "s" : ""}`],
          ["when", rows[0]?.condition || "not set"],
        ];
      }
      return s(data.condition) ? [["when", s(data.condition)]] : [];
    }
    case "Parallel": {
      const targets = Array.isArray(data.targetNodeIds)
        ? (data.targetNodeIds as string[])
        : [];
      if (targets.length > 0) {
        return [["runs", `${targets.length} node${targets.length > 1 ? "s" : ""}`]];
      }
      return s(data.branches) ? [["branches", `${s(data.branches)} parallel`]] : [];
    }
    case "Map": {
      const rows: Array<[string, string]> = [];
      if (s(data.inputPath)) rows.push(["items", s(data.inputPath)]);
      if (s(data.itemVariable)) rows.push(["as", s(data.itemVariable)]);
      return rows;
    }
    case "Wait": {
      if (data.waitType === "timestamp")
        return s(data.timestamp) ? [["until", s(data.timestamp)]] : [];
      if (data.waitType === "event")
        return s(data.eventName) ? [["event", s(data.eventName)]] : [];
      return s(data.duration) ? [["wait", s(data.duration)]] : [];
    }
    case "Fail": {
      const rows: Array<[string, string]> = [];
      if (s(data.error)) rows.push(["error", s(data.error)]);
      if (s(data.cause)) rows.push(["cause", s(data.cause)]);
      return rows;
    }
    default:
      return [];
  }
}

/* ═══════════════════════════════════════════════════════════
   Themed container card  (Task / Parallel / Map / Wait / …)
═══════════════════════════════════════════════════════════ */
interface CardProps {
  id: string;
  selected: boolean;
  type: StateType;
  data: Record<string, unknown>;
  /** extra handles: left/right source ids for Choice node */
  extraSourceHandles?: string[];
}

function StateCard({ id, selected, type, data, extraSourceHandles }: CardProps) {
  const p = STATE_PALETTE[type];
  const Icon = NODE_ICONS[type];
  const meta = NODE_META[type];
  const details = getDetails(type, data);
  const description =
    typeof data.description === "string" && data.description.trim()
      ? (data.description as string)
      : meta.tagline;

  return (
    <div
      style={{
        position: "relative",
        minWidth: TOKEN.minWidth,
        maxWidth: 260,
        background: TOKEN.cardBg,
        border: selected ? `2px solid ${p.accent}` : `1.5px solid ${p.border}`,
        borderRadius: TOKEN.radius,
        boxShadow: selected ? TOKEN.cardShadowSelected : TOKEN.cardShadow,
        overflow: "hidden",
        cursor: "grab",
        userSelect: "none",
        fontFamily: TOKEN.font,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...hStyle, background: p.accent }}
      />

      {/* themed header: icon + container type */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 10px",
          background: p.bg,
          borderBottom: `1px solid ${p.border}`,
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: p.accent,
            color: "#ffffff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={13} strokeWidth={2.4} />
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            color: p.text,
          }}
        >
          {meta.label}
        </span>
      </div>

      {/* name + description + config */}
      <div style={{ padding: "9px 11px 11px" }}>
        <InlineLabel nodeId={id} value={data.label as string} />

        <div
          style={{
            marginTop: 3,
            fontSize: 10.5,
            lineHeight: 1.35,
            color: TOKEN.subColor,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </div>

        {details.length > 0 && (
          <div
            style={{
              marginTop: 7,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {details.map(([key, value]) => (
              <div
                key={key}
                style={{ display: "flex", alignItems: "baseline", gap: 6 }}
              >
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    color: "#94a3b8",
                    minWidth: 46,
                    flexShrink: 0,
                  }}
                >
                  {key}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: p.text,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...hStyle, background: p.accent }}
      />

      {extraSourceHandles?.map((hid) => (
        <Handle
          key={hid}
          id={hid}
          type="source"
          position={hid === "left" ? Position.Left : Position.Right}
          style={{ ...hStyle, background: p.accent }}
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Node renderers
═══════════════════════════════════════════════════════════ */

export function TaskNode({ id, data, selected }: NodeProps) {
  return (
    <StateCard
      id={id}
      selected={!!selected}
      type="Task"
      data={data as Record<string, unknown>}
    />
  );
}

export function PassNode({ id, data, selected }: NodeProps) {
  return (
    <StateCard
      id={id}
      selected={!!selected}
      type="Pass"
      data={data as Record<string, unknown>}
    />
  );
}

export function WaitNode({ id, data, selected }: NodeProps) {
  return (
    <StateCard
      id={id}
      selected={!!selected}
      type="Wait"
      data={data as Record<string, unknown>}
    />
  );
}

export function MapNode({ id, data, selected }: NodeProps) {
  return (
    <StateCard
      id={id}
      selected={!!selected}
      type="Map"
      data={data as Record<string, unknown>}
    />
  );
}

export function ParallelNode({ id, data, selected }: NodeProps) {
  const p = STATE_PALETTE.Parallel;
  const Icon = NODE_ICONS.Parallel;
  const d = data as Record<string, unknown>;
  const childCount = useStore(
    (store) => store.nodes.filter((node) => node.parentId === id).length
  );
  const description =
    typeof d.description === "string" && d.description.trim()
      ? (d.description as string)
      : NODE_META.Parallel.tagline;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: PARALLEL_MIN_WIDTH,
        minHeight: PARALLEL_MIN_HEIGHT,
        background: "rgba(236,253,245,0.5)",
        border: selected ? `2px solid ${p.accent}` : `1.5px dashed ${p.border}`,
        borderRadius: TOKEN.radius,
        boxShadow: selected ? TOKEN.cardShadowSelected : TOKEN.cardShadow,
        fontFamily: TOKEN.font,
        userSelect: "none",
        cursor: "grab",
        boxSizing: "border-box",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...hStyle, background: p.accent }}
      />

      {/* container header — fixed height so children start below it */}
      <div
        style={{
          height: PARALLEL_HEADER_HEIGHT,
          boxSizing: "border-box",
          padding: "10px 14px",
          background: "#ffffff",
          borderBottom: `1px solid ${p.border}`,
          borderRadius: `${TOKEN.radius}px ${TOKEN.radius}px 0 0`,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: p.accent,
              color: "#ffffff",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Icon size={13} strokeWidth={2.4} />
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: 0.8,
              textTransform: "uppercase",
              color: p.text,
            }}
          >
            {NODE_META.Parallel.label}
          </span>
          <span
            style={{
              marginLeft: "auto",
              padding: "1px 7px",
              borderRadius: 10,
              background: p.bg,
              border: `1px solid ${p.border}`,
              fontSize: 9,
              fontWeight: 700,
              color: p.text,
            }}
          >
            {childCount} {childCount === 1 ? "node" : "nodes"}
          </span>
        </div>

        <div style={{ marginTop: 6 }}>
          <InlineLabel nodeId={id} value={d.label as string} maxWidth={300} />
        </div>
        <div
          style={{
            marginTop: 1,
            fontSize: 10.5,
            lineHeight: 1.3,
            color: TOKEN.subColor,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {description}
        </div>
      </div>

      {/* empty-state hint only — children occupy this area */}
      {childCount === 0 && (
        <div
          style={{
            position: "absolute",
            inset: `${PARALLEL_HEADER_HEIGHT + 12}px 14px 14px`,
            border: `1.5px dashed ${p.border}`,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 8,
            fontSize: 10,
            color: "#94a3b8",
            pointerEvents: "none",
          }}
        >
          Drop nodes here to run them in parallel
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...hStyle, background: p.accent }}
      />
    </div>
  );
}

/* ── Succeed ──────────────────────────────────────────────── */
export function SucceedNode({ id, data, selected }: NodeProps) {
  return (
    <StateCard
      id={id}
      selected={!!selected}
      type="Succeed"
      data={data as Record<string, unknown>}
    />
  );
}

/* ── Fail ─────────────────────────────────────────────────── */
export function FailNode({ id, data, selected }: NodeProps) {
  return (
    <StateCard
      id={id}
      selected={!!selected}
      type="Fail"
      data={data as Record<string, unknown>}
    />
  );
}

/* ── Choice (rectangle with two outgoing branches) ────────── */
export function ChoiceNode({ id, data, selected }: NodeProps) {
  const p = STATE_PALETTE.Choice;
  const Icon = NODE_ICONS.Choice;
  const d = data as Record<string, unknown>;
  const rows = Array.isArray(d.conditions)
    ? (d.conditions as Array<{ condition?: string; targetNodeId?: string }>)
    : [];
  const description =
    typeof d.description === "string" && d.description.trim()
      ? (d.description as string)
      : NODE_META.Choice.tagline;

  return (
    <div
      style={{
        position: "relative",
        width: 220,
        background: TOKEN.cardBg,
        border: selected ? `2px solid ${p.accent}` : `1.5px solid ${p.border}`,
        borderRadius: TOKEN.radius,
        boxShadow: selected ? TOKEN.cardShadowSelected : TOKEN.cardShadow,
        cursor: "grab",
        userSelect: "none",
        fontFamily: TOKEN.font,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...hStyle, background: p.accent }}
      />

      {/* themed header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "7px 10px",
          background: p.bg,
          borderBottom: `1px solid ${p.border}`,
          borderRadius: `${TOKEN.radius}px ${TOKEN.radius}px 0 0`,
        }}
      >
        <span
          style={{
            width: 22,
            height: 22,
            borderRadius: 6,
            background: p.accent,
            color: "#ffffff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={13} strokeWidth={2.4} />
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            color: p.text,
          }}
        >
          {NODE_META.Choice.label}
        </span>
      </div>

      <div style={{ padding: "9px 11px 16px" }}>
        <InlineLabel nodeId={id} value={d.label as string} maxWidth={190} />

        <div
          style={{
            marginTop: 3,
            fontSize: 10.5,
            lineHeight: 1.35,
            color: TOKEN.subColor,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description}
        </div>

        {/* condition list — one per branch */}
        <div style={{ marginTop: 7, display: "flex", flexDirection: "column", gap: 3 }}>
          {[0, 1].map((index) => {
            const condition = rows[index]?.condition;
            return (
              <div key={index} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 4,
                    background: condition ? p.accent : p.border,
                    color: "#ffffff",
                    fontSize: 9,
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: condition ? p.text : "#94a3b8",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: 1,
                  }}
                >
                  {condition || "no condition set"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* exactly two outgoing branches */}
      {[0, 1].map((index) => (
        <Handle
          key={index}
          id={`branch-${index}`}
          type="source"
          position={Position.Bottom}
          style={{
            ...hStyle,
            background: p.accent,
            left: `${35 + index * 30}%`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Start ────────────────────────────────────────────────── */
export function StartNode({ selected }: NodeProps) {
  return (
    <div
      style={{
        width: 68,
        height: 68,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
        border: selected ? "3px solid #15803d" : "3px solid #86efac",
        boxShadow: selected
          ? "0 0 0 4px rgba(34,197,94,0.2), 0 4px 12px rgba(22,163,74,0.35)"
          : "0 4px 12px rgba(22,163,74,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "default",
        userSelect: "none",
        fontFamily: TOKEN.font,
      }}
    >
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ ...hStyle, background: "#15803d" }}
      />
      <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>
        START
      </span>
    </div>
  );
}

/* ── End ──────────────────────────────────────────────────── */
export function EndNode({ selected }: NodeProps) {
  return (
    <div
      style={{
        width: 68,
        height: 68,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #374151 0%, #111827 100%)",
        border: selected ? "3px solid #9ca3af" : "3px solid #6b7280",
        boxShadow: selected
          ? "0 0 0 4px rgba(55,65,81,0.25), 0 4px 12px rgba(17,24,39,0.4)"
          : "0 4px 12px rgba(17,24,39,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "default",
        userSelect: "none",
        position: "relative",
        fontFamily: TOKEN.font,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ ...hStyle, background: "#6b7280" }}
      />
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #4b5563 0%, #1f2937 100%)",
          border: "2px solid #6b7280",
        }}
      />
      <span
        style={{
          position: "absolute",
          fontSize: 9,
          fontWeight: 800,
          color: "#fff",
          letterSpacing: 0.5,
        }}
      >
        END
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   nodeTypes registry  (passed to <ReactFlow nodeTypes={…} />)
═══════════════════════════════════════════════════════════ */
export const nodeTypes = {
  start: StartNode,
  end: EndNode,
  Task: TaskNode,
  Choice: ChoiceNode,
  Parallel: ParallelNode,
  Map: MapNode,
  Wait: WaitNode,
  Pass: PassNode,
  Succeed: SucceedNode,
  Fail: FailNode,
};

/* ═══════════════════════════════════════════════════════════
   Palette items  (used by the left panel in the builder)
═══════════════════════════════════════════════════════════ */
export interface PaletteItem {
  type: StateType;
  label: string;
  description: string;
}

export const PALETTE_ITEMS: PaletteItem[] = [
  { type: "Task", label: "Task", description: "Invoke a resource" },
  { type: "Choice", label: "Choice", description: "Branch on condition" },
  { type: "Parallel", label: "Parallel", description: "Run branches in parallel" },
  { type: "Map", label: "Map", description: "Iterate over array" },
  { type: "Wait", label: "Wait", description: "Delay or wait for event" },
  { type: "Pass", label: "Pass", description: "Pass input to output" },
  { type: "Succeed", label: "Succeed", description: "End successfully" },
  { type: "Fail", label: "Fail", description: "End with error" },
];
