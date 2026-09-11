"use client";

/**
 * WorkflowNodes.tsx
 * All AWS Step Functions-style node renderers + shared helpers.
 * Imported by the builder page and by nodeTypes registry.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Handle,
  Position,
  NodeProps,
  useReactFlow,
} from "@xyflow/react";

/* ═══════════════════════════════════════════════════════════
   Design tokens
═══════════════════════════════════════════════════════════ */
export const TOKEN = {
  radius: 10,
  handleColor: "#6366f1",
  handleSize: 9,
  labelColor: "#0f172a",
  subColor: "#64748b",
  cardBg: "#ffffff",
  cardBorder: "1.5px solid #cbd5e1",
  cardBorderSelected: "2px solid #6366f1",
  cardShadow: "0 2px 8px rgba(0,0,0,0.09)",
  cardShadowSelected:
    "0 0 0 3px rgba(99,102,241,0.18), 0 2px 8px rgba(0,0,0,0.10)",
  minWidth: 168,
  font: "'Inter', system-ui, sans-serif",
} as const;

/* ── State-type palettes ──────────────────────────────────── */
export const STATE_PALETTE = {
  Task: { bg: "#eff6ff", border: "#93c5fd", text: "#1d4ed8", icon: "⚙" },
  Choice: { bg: "#faf5ff", border: "#c4b5fd", text: "#6d28d9", icon: "◇" },
  Parallel: { bg: "#f0fdf4", border: "#86efac", text: "#15803d", icon: "⫼" },
  Map: { bg: "#fff7ed", border: "#fdba74", text: "#c2410c", icon: "↺" },
  Wait: { bg: "#fefce8", border: "#fde047", text: "#a16207", icon: "⏱" },
  Pass: { bg: "#f8fafc", border: "#94a3b8", text: "#475569", icon: "→" },
  Succeed: { bg: "#f0fdf4", border: "#4ade80", text: "#15803d", icon: "✓" },
  Fail: { bg: "#fff1f2", border: "#fca5a5", text: "#b91c1c", icon: "✕" },
} as const;

export type StateType = keyof typeof STATE_PALETTE;

/* ═══════════════════════════════════════════════════════════
   Inline-editable label  (shared)
═══════════════════════════════════════════════════════════ */
function InlineLabel({
  nodeId,
  value,
  fontSize = 13,
  maxWidth = 148,
  center = false,
}: {
  nodeId: string;
  value: string;
  fontSize?: number;
  maxWidth?: number;
  center?: boolean;
}) {
  const { updateNodeData } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value ?? ""); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

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
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
          e.stopPropagation();
        }}
        style={{
          fontSize,
          fontWeight: 600,
          color: TOKEN.labelColor,
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
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      style={{
        fontSize,
        fontWeight: 600,
        color: TOKEN.labelColor,
        cursor: "text",
        borderBottom: "1px dashed #cbd5e1",
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
   State-type badge  (coloured pill in top-left)
═══════════════════════════════════════════════════════════ */
function TypeBadge({ type }: { type: StateType }) {
  const p = STATE_PALETTE[type];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        padding: "2px 7px",
        borderRadius: 12,
        background: p.bg,
        border: `1px solid ${p.border}`,
        fontSize: 10,
        fontWeight: 700,
        color: p.text,
        fontFamily: TOKEN.font,
        letterSpacing: 0.3,
        userSelect: "none",
      }}
    >
      <span style={{ fontSize: 11 }}>{p.icon}</span>
      {type}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   Generic card  (Task / Pass / Wait / Map / Parallel)
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
  return (
    <div
      style={{
        position: "relative",
        background: TOKEN.cardBg,
        border: selected ? TOKEN.cardBorderSelected : TOKEN.cardBorder,
        borderRadius: TOKEN.radius,
        padding: "10px 14px 10px 12px",
        minWidth: TOKEN.minWidth,
        boxShadow: selected ? TOKEN.cardShadowSelected : TOKEN.cardShadow,
        cursor: "grab",
        userSelect: "none",
        fontFamily: TOKEN.font,
      }}
    >
      <Handle type="target" position={Position.Top} style={hStyle} />

      {/* type badge row */}
      <div style={{ marginBottom: 7 }}>
        <TypeBadge type={type} />
      </div>

      {/* editable name */}
      <InlineLabel nodeId={id} value={data.label as string} />

      {/* resource / config summary */}
      {data.resource && (
        <div
          style={{
            marginTop: 5,
            fontSize: 10,
            color: TOKEN.subColor,
            fontFamily: TOKEN.font,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: TOKEN.minWidth - 20,
          }}
        >
          {data.resource as string}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={hStyle} />

      {extraSourceHandles?.map((hid) => (
        <Handle
          key={hid}
          id={hid}
          type="source"
          position={hid === "left" ? Position.Left : Position.Right}
          style={hStyle}
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
  return (
    <StateCard
      id={id}
      selected={!!selected}
      type="Parallel"
      data={data as Record<string, unknown>}
    />
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
  const d = data as Record<string, unknown>;
  return (
    <div
      style={{
        position: "relative",
        background: "#fff1f2",
        border: selected
          ? "2px solid #f87171"
          : "1.5px solid #fca5a5",
        borderRadius: TOKEN.radius,
        padding: "10px 14px 10px 12px",
        minWidth: TOKEN.minWidth,
        boxShadow: selected
          ? "0 0 0 3px rgba(239,68,68,0.18), 0 2px 8px rgba(0,0,0,0.10)"
          : TOKEN.cardShadow,
        cursor: "grab",
        userSelect: "none",
        fontFamily: TOKEN.font,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ ...hStyle, background: "#ef4444" }} />
      <div style={{ marginBottom: 7 }}>
        <TypeBadge type="Fail" />
      </div>
      <InlineLabel nodeId={id} value={d.label as string} />
      {d.error && (
        <div style={{ marginTop: 4, fontSize: 10, color: "#b91c1c", fontFamily: TOKEN.font }}>
          Error: {d.error as string}
        </div>
      )}
      {d.cause && (
        <div style={{ fontSize: 10, color: TOKEN.subColor, fontFamily: TOKEN.font }}>
          Cause: {d.cause as string}
        </div>
      )}
    </div>
  );
}

/* ── Choice (diamond) ─────────────────────────────────────── */
export function ChoiceNode({ id, data, selected }: NodeProps) {
  const SIZE = 96;
  return (
    <div
      style={{
        position: "relative",
        width: SIZE,
        height: SIZE,
        cursor: "grab",
        userSelect: "none",
        fontFamily: TOKEN.font,
      }}
    >
      {/* rotated square → diamond */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: "rotate(45deg)",
          background: "#faf5ff",
          border: selected
            ? "2px solid #7c3aed"
            : "1.5px solid #c4b5fd",
          borderRadius: 8,
          boxShadow: selected
            ? "0 0 0 3px rgba(124,58,237,0.18), 0 2px 8px rgba(0,0,0,0.10)"
            : TOKEN.cardShadow,
        }}
      />

      {/* Top target handle */}
      <Handle type="target" position={Position.Top}
        style={{ ...hStyle, top: 0, left: "50%", transform: "translateX(-50%)" }}
      />

      {/* Bottom / Left / Right source handles */}
      <Handle type="source" position={Position.Bottom}
        style={{ ...hStyle, bottom: 0, left: "50%", transform: "translateX(-50%)" }}
      />
      <Handle id="left" type="source" position={Position.Left}
        style={{ ...hStyle, top: "50%", left: 0, transform: "translateY(-50%)" }}
      />
      <Handle id="right" type="source" position={Position.Right}
        style={{ ...hStyle, top: "50%", right: 0, transform: "translateY(-50%)" }}
      />

      {/* Counter-rotated content */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
          padding: 4,
        }}
      >
        <span style={{ fontSize: 16, color: "#6d28d9" }}>◇</span>
        <span
          title="Double-click to rename"
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: "#6d28d9",
            maxWidth: 70,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            textAlign: "center",
          }}
        >
          {(data as Record<string, unknown>).label as string ?? "Choice"}
        </span>
      </div>
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
  { type: "Task",     label: "Task",     description: "Invoke a resource" },
  { type: "Choice",   label: "Choice",   description: "Branch on condition" },
  { type: "Parallel", label: "Parallel", description: "Run branches in parallel" },
  { type: "Map",      label: "Map",      description: "Iterate over array" },
  { type: "Wait",     label: "Wait",     description: "Delay or wait for event" },
  { type: "Pass",     label: "Pass",     description: "Pass input to output" },
  { type: "Succeed",  label: "Succeed",  description: "End successfully" },
  { type: "Fail",     label: "Fail",     description: "End with error" },
];
