"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Handle,
  Position,
  NodeProps,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  Connection,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

// ─── Shared constants ─────────────────────────────────────────────────────────
const CARD_STYLE = {
  bg: "#ffffff",
  border: "1.5px solid #cbd5e1",
  borderSelected: "2px solid #6366f1",
  shadow: "0 2px 8px rgba(0,0,0,0.10)",
  shadowSelected: "0 0 0 3px rgba(99,102,241,0.18), 0 2px 8px rgba(0,0,0,0.10)",
  radius: 10,
  handleColor: "#6366f1",
  labelColor: "#1e293b",
  subColor: "#64748b",
};

let nodeCounter = 0;

// ─── Shared delete button ─────────────────────────────────────────────────────
// Nodes are deletable by selecting and pressing Delete/Backspace
function DeleteButton(_: { nodeId: string }) {
  return null;
}

// ─── Inline editable label ────────────────────────────────────────────────────
function InlineLabel({ nodeId, value }: { nodeId: string; value: string }) {
  const { updateNodeData } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    const v = draft.trim() || value;
    setDraft(v);
    updateNodeData(nodeId, { label: v });
    setEditing(false);
  };

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
          fontSize: 13, fontWeight: 600, color: CARD_STYLE.labelColor,
          background: "#f8fafc", border: "1.5px solid #6366f1",
          borderRadius: 4, padding: "2px 6px", width: "100%",
          outline: "none",
        }}
      />
    );
  }

  return (
    <span
      title="Double-click to rename"
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      style={{
        fontSize: 13, fontWeight: 600, color: CARD_STYLE.labelColor,
        cursor: "text", borderBottom: "1px dashed #cbd5e1",
        paddingBottom: 1, display: "inline-block",
        maxWidth: 150, overflow: "hidden",
        textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}
    >
      {draft || "Untitled"}
    </span>
  );
}

// ─── Shared API card shell ─────────────────────────────────────────────────────
// symbol: small colored icon/badge that identifies the node type
function ApiCard({
  id,
  selected,
  symbol,
  subLabel,
  data,
}: {
  id: string;
  selected: boolean;
  symbol: React.ReactNode;
  subLabel: string;
  data: Record<string, unknown>;
}) {
  return (
    <div
      style={{
        position: "relative",
        background: CARD_STYLE.bg,
        border: selected ? CARD_STYLE.borderSelected : CARD_STYLE.border,
        borderRadius: CARD_STYLE.radius,
        padding: "10px 16px 10px 12px",
        minWidth: 170,
        boxShadow: selected ? CARD_STYLE.shadowSelected : CARD_STYLE.shadow,
        cursor: "grab",
        userSelect: "none",
      }}
    >
      <DeleteButton nodeId={id} />
      <Handle
        type="target" position={Position.Top}
        style={{ background: CARD_STYLE.handleColor, border: "2px solid #fff", width: 9, height: 9 }}
      />

      {/* header row: symbol + sub-label */}
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
        {symbol}
        <span style={{ fontSize: 10, color: CARD_STYLE.subColor, fontWeight: 500 }}>
          {subLabel}
        </span>
      </div>

      {/* editable name */}
      <InlineLabel nodeId={id} value={data.label as string} />

      <Handle
        type="source" position={Position.Bottom}
        style={{ background: CARD_STYLE.handleColor, border: "2px solid #fff", width: 9, height: 9 }}
      />
    </div>
  );
}

// ─── Symbol components ────────────────────────────────────────────────────────
const RestSymbol = () => (
  <span style={{
    width: 22, height: 22, borderRadius: 6,
    background: "#eff6ff", border: "1.5px solid #93c5fd",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 9, fontWeight: 800, color: "#2563eb", flexShrink: 0,
    letterSpacing: 0.3,
  }}>
    ↔
  </span>
);

const SoapSymbol = () => (
  <span style={{
    width: 22, height: 22, borderRadius: 6,
    background: "#fefce8", border: "1.5px solid #fcd34d",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 800, color: "#d97706", flexShrink: 0,
  }}>
    ✉
  </span>
);

const DiamondSymbol = () => (
  <span style={{
    width: 22, height: 22, borderRadius: 6,
    background: "#f5f3ff", border: "1.5px solid #c4b5fd",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 11, fontWeight: 800, color: "#7c3aed", flexShrink: 0,
  }}>
    ◇
  </span>
);

// ─── Node renderers ───────────────────────────────────────────────────────────
function RestApiNode({ id, data, selected }: NodeProps) {
  return (
    <ApiCard
      id={id} selected={!!selected}
      symbol={<RestSymbol />} subLabel="REST API"
      data={data as Record<string, unknown>}
    />
  );
}

function SoapApiNode({ id, data, selected }: NodeProps) {
  return (
    <ApiCard
      id={id} selected={!!selected}
      symbol={<SoapSymbol />} subLabel="SOAP API"
      data={data as Record<string, unknown>}
    />
  );
}

// ─── Diamond / Gateway node ───────────────────────────────────────────────────
// Rendered as a rotated square (standard BPMN/draw.io gateway diamond)
function DiamondNode({ id, data, selected }: NodeProps) {
  const SIZE = 90;
  return (
    <div style={{ position: "relative", width: SIZE, height: SIZE, cursor: "grab" }}>
      <DeleteButton nodeId={id} />

      {/* rotated diamond shell */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: "rotate(45deg)",
          background: CARD_STYLE.bg,
          border: selected ? CARD_STYLE.borderSelected : CARD_STYLE.border,
          borderRadius: 6,
          boxShadow: selected ? CARD_STYLE.shadowSelected : CARD_STYLE.shadow,
        }}
      />

      {/* handles on all 4 cardinal points */}
      <Handle type="target" position={Position.Top}
        style={{ background: CARD_STYLE.handleColor, border: "2px solid #fff", top: 0, left: "50%" }} />
      <Handle type="source" position={Position.Bottom}
        style={{ background: CARD_STYLE.handleColor, border: "2px solid #fff", bottom: 0, left: "50%" }} />
      <Handle type="source" id="left" position={Position.Left}
        style={{ background: CARD_STYLE.handleColor, border: "2px solid #fff", top: "50%", left: 0 }} />
      <Handle type="source" id="right" position={Position.Right}
        style={{ background: CARD_STYLE.handleColor, border: "2px solid #fff", top: "50%", right: 0 }} />

      {/* counter-rotated content */}
      <div
        style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 3, padding: 4,
          userSelect: "none",
        }}
      >
        <DiamondSymbol />
        <DiamondInlineLabel nodeId={id} value={data.label as string} />
      </div>
    </div>
  );
}

// Compact inline label for diamond (no border-bottom, smaller)
function DiamondInlineLabel({ nodeId, value }: { nodeId: string; value: string }) {
  const { updateNodeData } = useReactFlow();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraft(value); }, [value]);
  useEffect(() => { if (editing) inputRef.current?.select(); }, [editing]);

  const commit = () => {
    const v = draft.trim() || value;
    setDraft(v);
    updateNodeData(nodeId, { label: v });
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef} value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
          e.stopPropagation();
        }}
        style={{
          fontSize: 10, fontWeight: 600, color: CARD_STYLE.labelColor,
          background: "#f8fafc", border: "1px solid #6366f1",
          borderRadius: 3, padding: "1px 4px", width: 64,
          outline: "none", textAlign: "center",
        }}
      />
    );
  }

  return (
    <span
      title="Double-click to rename"
      onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
      style={{
        fontSize: 10, fontWeight: 600, color: CARD_STYLE.labelColor,
        cursor: "text", maxWidth: 70,
        overflow: "hidden", textOverflow: "ellipsis",
        whiteSpace: "nowrap", textAlign: "center",
      }}
    >
      {draft || "Untitled"}
    </span>
  );
}

// ─── Start / End nodes (unchanged visually) ───────────────────────────────────
function StartNode({ selected }: NodeProps) {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: "50%",
      background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
      border: selected ? "3px solid #15803d" : "3px solid #86efac",
      boxShadow: selected
        ? "0 0 0 4px rgba(34,197,94,0.2), 0 4px 12px rgba(22,163,74,0.35)"
        : "0 4px 12px rgba(22,163,74,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "grab", userSelect: "none",
    }}>
      <Handle type="source" position={Position.Bottom}
        style={{ background: "#15803d", border: "2px solid #fff", width: 10, height: 10 }} />
      <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>START</span>
    </div>
  );
}

function EndNode({ selected }: NodeProps) {
  return (
    <div style={{
      width: 64, height: 64, borderRadius: "50%",
      background: "linear-gradient(135deg, #374151 0%, #111827 100%)",
      border: selected ? "3px solid #9ca3af" : "3px solid #6b7280",
      boxShadow: selected
        ? "0 0 0 4px rgba(55,65,81,0.25), 0 4px 12px rgba(17,24,39,0.4)"
        : "0 4px 12px rgba(17,24,39,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      cursor: "grab", userSelect: "none", position: "relative",
    }}>
      <Handle type="target" position={Position.Top}
        style={{ background: "#6b7280", border: "2px solid #fff", width: 10, height: 10 }} />
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        background: "linear-gradient(135deg, #4b5563 0%, #1f2937 100%)",
        border: "2px solid #6b7280",
      }} />
      <span style={{
        position: "absolute", fontSize: 9,
        fontWeight: 800, color: "#fff", letterSpacing: 0.5,
      }}>END</span>
    </div>
  );
}

// ─── Node types registry ──────────────────────────────────────────────────────
const nodeTypes = {
  start: StartNode,
  end: EndNode,
  restApi: RestApiNode,
  soapApi: SoapApiNode,
  diamond: DiamondNode,
};

// ─── Initial canvas ───────────────────────────────────────────────────────────
const initialNodes: Node[] = [
  { id: "start", type: "start", position: { x: 230, y: 40 },  data: {}, deletable: false },
  { id: "rest-1", type: "restApi", position: { x: 100, y: 180 }, data: { label: "REST API" } },
  { id: "soap-1", type: "soapApi", position: { x: 330, y: 180 }, data: { label: "SOAP API" } },
  { id: "diamond-1", type: "diamond", position: { x: 215, y: 330 }, data: { label: "Condition" } },
  { id: "end", type: "end", position: { x: 230, y: 470 }, data: {}, deletable: false },
];
const initialEdges: Edge[] = [];

// ─── Sidebar palette config ───────────────────────────────────────────────────
const paletteItems = [
  { type: "restApi",  label: "REST API",  subLabel: "REST API",  symbol: <RestSymbol /> },
  { type: "soapApi",  label: "SOAP API",  subLabel: "SOAP API",  symbol: <SoapSymbol /> },
  { type: "diamond",  label: "Condition", subLabel: "Gateway",   symbol: <DiamondSymbol /> },
];

// ─── Page shell ───────────────────────────────────────────────────────────────
export default function WorkflowPage() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas />
    </ReactFlowProvider>
  );
}

function WorkflowCanvas() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) =>
        applyNodeChanges(
          changes.filter(
            (c) => !(c.type === "remove" && (c.id === "start" || c.id === "end"))
          ),
          nds
        )
      ),
    []
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      if (!reactFlowInstance || !reactFlowWrapper.current) return;
      const type  = event.dataTransfer.getData("application/reactflow-type");
      const label = event.dataTransfer.getData("application/reactflow-label");
      if (!type) return;
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });
      nodeCounter += 1;
      setNodes((nds) => nds.concat({
        id: `${type}-${nodeCounter}`, type, position, data: { label },
      }));
    },
    [reactFlowInstance]
  );

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const addFromPalette = useCallback((type: string, label: string) => {
    nodeCounter += 1;
    setNodes((nds) => nds.concat({
      id: `${type}-${nodeCounter}`, type,
      position: { x: 100 + Math.random() * 280, y: 100 + Math.random() * 180 },
      data: { label },
    }));
  }, []);

  return (
    <div style={{ display: "flex", width: "100%", height: "100vh" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 188,
        background: "#fff",
        borderRight: "1px solid #e2e8f0",
        display: "flex", flexDirection: "column",
        padding: "16px 12px",
        gap: 6,
        boxShadow: "2px 0 8px rgba(0,0,0,0.05)",
        zIndex: 10,
      }}>
        <p style={{
          fontSize: 10, fontWeight: 700, color: "#94a3b8",
          textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6,
        }}>
          Nodes
        </p>

        {paletteItems.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("application/reactflow-type", item.type);
              e.dataTransfer.setData("application/reactflow-label", item.label);
              e.dataTransfer.effectAllowed = "move";
            }}
            onClick={() => addFromPalette(item.type, item.label)}
            style={{
              background: "#fff",
              border: "1.5px solid #e2e8f0",
              borderRadius: 8,
              padding: "8px 10px",
              cursor: "grab",
              display: "flex", alignItems: "center", gap: 9,
              transition: "border-color 0.15s, box-shadow 0.15s",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "#a5b4fc";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(99,102,241,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
            }}
          >
            {item.symbol}
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1e293b" }}>{item.label}</div>
              <div style={{ fontSize: 10, color: "#94a3b8" }}>{item.subLabel}</div>
            </div>
          </div>
        ))}

        <p style={{
          fontSize: 10, color: "#cbd5e1",
          marginTop: "auto", textAlign: "center", lineHeight: 1.5,
        }}>
          Drag or click<br />to place
        </p>
      </aside>

      {/* ── Canvas ── */}
      <div
        ref={reactFlowWrapper}
        style={{ flex: 1, position: "relative" }}
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onInit={setReactFlowInstance}
          nodeTypes={nodeTypes}
          fitView
          snapToGrid
          snapGrid={[16, 16]}
          defaultEdgeOptions={{ animated: true }}
          style={{ background: "#ffffff" }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1.2} color="#cbd5e1" />
          <Controls />
          <MiniMap
            nodeColor={(n) => {
              if (n.type === "start")   return "#22c55e";
              if (n.type === "end")     return "#374151";
              if (n.type === "diamond") return "#ede9fe";
              return "#f1f5f9";
            }}
            style={{ border: "1px solid #e2e8f0", borderRadius: 8 }}
          />
        </ReactFlow>
      </div>
    </div>
  );
}
