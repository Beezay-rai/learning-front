"use client";

import { useCallback, useState, useMemo, useRef } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeMouseHandler,
  OnNodeDrag,
  ReactFlowProvider,
  useReactFlow,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { Save, ArrowLeft, Trash2, Code2 } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";

import {
  nodeTypes,
  STATE_PALETTE,
  PARALLEL_MIN_WIDTH,
  PARALLEL_MIN_HEIGHT,
  PARALLEL_HEADER_HEIGHT,
} from "../../components/WorkflowNodes";
import NodeForm from "../../components/NodeForm";
import NodePalette from "../../components/NodePalette";
import { routes } from "@/app/routes.generated";
import useWorkflowService from "@/services/apiServices/workflow/useWorkflowService";
import type {
  ChoiceNodeFormData,
  NodeFormData,
  ParallelNodeFormData,
  StateType,
} from "../../schemas/nodeSchema";
import { nodeDefaults } from "../../schemas/nodeSchema";
import {
  buildWorkflowDocument,
  workflowDocumentToXml,
} from "../../schemas/workflowDocument";

/** Layout used for nodes placed inside a Parallel container */
const PARALLEL_CARD_WIDTH = 220;
const PARALLEL_CARD_HEIGHT = 132;
const PARALLEL_PADDING = 16;
const PARALLEL_ROW_GAP = 14;
const PARALLEL_COLUMN_STEP = 232;
const PARALLEL_BODY_TOP = PARALLEL_HEADER_HEIGHT + 8;

const getContainerSize = (node: Node) => ({
  width:
    node.measured?.width ??
    (typeof node.style?.width === "number"
      ? node.style.width
      : PARALLEL_MIN_WIDTH),
  height:
    node.measured?.height ??
    (typeof node.style?.height === "number"
      ? node.style.height
      : PARALLEL_MIN_HEIGHT),
});

/**
 * React Flow looks up a node's parent while building its internal lookup, so a
 * parent MUST come before its children in the nodes array. Otherwise the child
 * is not dragged with its container and `extent: "parent"` is ignored.
 */
const orderNodesByHierarchy = (nodes: Node[]): Node[] => {
  const byId = new Map(nodes.map((node) => [node.id, node]));

  const depthOf = (node: Node, seen: Set<string>): number => {
    if (!node.parentId || seen.has(node.id)) return 0;
    const parent = byId.get(node.parentId);
    if (!parent) return 0;
    seen.add(node.id);
    return 1 + depthOf(parent, seen);
  };

  return nodes
    .map((node, index) => ({ node, index, depth: depthOf(node, new Set<string>()) }))
    .sort((a, b) => a.depth - b.depth || a.index - b.index)
    .map((entry) => entry.node);
};

/** Make sure parallel containers always have a measurable size and children stay attached. */
const normalizeCanvasNodes = (loaded: Node[]): Node[] =>
  orderNodesByHierarchy(
    loaded.map((node) => {
    if (node.type === "Parallel") {
      const { width, height } = getContainerSize(node);
      return { ...node, style: { ...node.style, width, height } };
    }
    if (node.parentId && node.extent !== "parent") {
      return { ...node, extent: "parent" as const };
    }
    return node;
    })
  );

/**
 * Snapshots saved before the Parallel container existed linked its branches with
 * arrows. Turn those targets into children inside the container on load.
 */
const migrateParallelChildren = (
  loaded: Node[],
  loadedEdges: Edge[]
): { nodes: Node[]; edges: Edge[] } => {
  const nodes = normalizeCanvasNodes(loaded);
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const assignments = new Map<string, string[]>();

  nodes.forEach((container) => {
    if (container.type !== "Parallel") return;
    const stored =
      (container.data as { targetNodeIds?: string[] })?.targetNodeIds ?? [];
    const linked = loadedEdges
      .filter((edge) => edge.source === container.id)
      .map((edge) => edge.target);
    const ids = Array.from(new Set([...stored, ...linked])).filter(
      (id) =>
        id !== container.id &&
        byId.has(id) &&
        byId.get(id)?.type !== "Parallel"
    );
    if (ids.length > 0) assignments.set(container.id, ids);
  });

  if (assignments.size === 0) return { nodes, edges: loadedEdges };

  const childAssignments = new Map<string, { parentId: string; index: number }>();
  const layouts = new Map<string, { width: number; height: number }>();

  assignments.forEach((ids, containerId) => {
    const container = byId.get(containerId);
    if (!container) return;
    const { width, height } = getContainerSize(container);
    const rows = Math.ceil(ids.length / 2);
    layouts.set(containerId, {
      width,
      height: Math.max(
        height,
        PARALLEL_BODY_TOP +
          rows * (PARALLEL_CARD_HEIGHT + PARALLEL_ROW_GAP) +
          PARALLEL_PADDING
      ),
    });
    ids.forEach((id, index) => {
      if (!childAssignments.has(id)) childAssignments.set(id, { parentId: containerId, index });
    });
  });

  const nextNodes = nodes.map((node) => {
    const layout = layouts.get(node.id);
    if (layout) {
      return { ...node, style: { ...node.style, ...layout } };
    }

    const assignment = childAssignments.get(node.id);
    if (!assignment) return node;

    return {
      ...node,
      parentId: assignment.parentId,
      extent: "parent" as const,
      position: {
        x: PARALLEL_PADDING + (assignment.index % 2) * PARALLEL_COLUMN_STEP,
        y:
          PARALLEL_BODY_TOP +
          Math.floor(assignment.index / 2) *
            (PARALLEL_CARD_HEIGHT + PARALLEL_ROW_GAP),
      },
    };
  });

  const nextEdges = loadedEdges.filter(
    (edge) =>
      childAssignments.get(edge.target)?.parentId !== edge.source &&
      childAssignments.get(edge.source)?.parentId !== edge.target
  );

  return { nodes: orderNodesByHierarchy(nextNodes), edges: nextEdges };
};

function WorkflowBuilder() {
  const params = useParams();
  const workflowId = params?.id as string;
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const { useGetWorkflowById, useSaveCanvasSnapshot } = useWorkflowService();
  const { data: workflow, isLoading } = useGetWorkflowById(workflowId);
  const { mutateAsync: saveCanvas, isPending: isSaving } = useSaveCanvasSnapshot();

  // Merged document preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFormat, setPreviewFormat] = useState<"json" | "xml">("json");

  // React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState(
    workflow?.canvasSnapshot?.nodes ?? []
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    workflow?.canvasSnapshot?.edges ?? []
  );

  // Node form state
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<string[]>([]);
  const [pendingNodeType, setPendingNodeType] = useState<StateType | null>(null);
  const [pendingNodePosition, setPendingNodePosition] = useState<{ x: number; y: number } | null>(null);
  const [pendingParentId, setPendingParentId] = useState<string | null>(null);

  // Initialize canvas with start and end nodes if empty
  const initializeCanvas = useCallback(() => {
    if (nodes.length === 0) {
      const startNode: Node = {
        id: "start-node",
        type: "start",
        position: { x: 250, y: 50 },
        data: { label: "Start" },
        draggable: false,
      };
      const endNode: Node = {
        id: "end-node",
        type: "end",
        position: { x: 250, y: 500 },
        data: { label: "End" },
        draggable: false,
      };
      setNodes([startNode, endNode]);
    }
  }, [nodes.length, setNodes]);

  // Initialize on mount
  useMemo(() => {
    if (!isLoading && workflow?.canvasSnapshot?.nodes) {
      const migrated = migrateParallelChildren(
        workflow.canvasSnapshot.nodes,
        workflow.canvasSnapshot.edges
      );
      setNodes(migrated.nodes);
      setEdges(migrated.edges);
    } else if (!isLoading && nodes.length === 0) {
      initializeCanvas();
    }
  }, [workflow, isLoading]);

  // Handle connection between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  // Handle node selection
  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      setSelectedNodes([node.id]);
    },
    []
  );

  // Snap a node back inside its Parallel container when the drag ends
  const onNodeDragStop: OnNodeDrag = useCallback(
    (_, node) => {
      if (!node.parentId) return;
      const parent = nodes.find((n) => n.id === node.parentId);
      if (!parent) return;

      const { width, height } = getContainerSize(parent);
      const cardWidth = node.measured?.width ?? PARALLEL_CARD_WIDTH;
      const cardHeight = node.measured?.height ?? PARALLEL_CARD_HEIGHT;
      const position = {
        x: Math.min(
          Math.max(PARALLEL_PADDING, node.position.x),
          Math.max(PARALLEL_PADDING, width - cardWidth - PARALLEL_PADDING)
        ),
        y: Math.min(
          Math.max(PARALLEL_BODY_TOP, node.position.y),
          Math.max(PARALLEL_BODY_TOP, height - cardHeight - PARALLEL_PADDING)
        ),
      };

      if (position.x === node.position.x && position.y === node.position.y) {
        return;
      }

      setNodes((nds) =>
        nds.map((n) => (n.id === node.id ? { ...n, position } : n))
      );
    },
    [nodes, setNodes]
  );

  // Handle drag and drop from palette
  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const nodeType = type as StateType;

      // Dropping inside a Parallel container makes the node one of its children
      const parent = nodes.find((node) => {
        if (node.type !== "Parallel") return false;
        const { width, height } = getContainerSize(node);
        return (
          position.x >= node.position.x &&
          position.x <= node.position.x + width &&
          position.y >= node.position.y &&
          position.y <= node.position.y + height
        );
      });

      // Set pending node info and open form
      setPendingNodeType(nodeType);
      setPendingNodePosition(position);
      // containers cannot be nested inside another Parallel container
      setPendingParentId(nodeType === "Parallel" ? null : parent?.id ?? null);
      setFormMode("add");
      setEditingNodeId(null);
      setFormOpen(true);
    },
    [screenToFlowPosition, nodes]
  );

  // Handle node drag start from palette
  const onPaletteDragStart = useCallback((nodeType: StateType) => {
    return (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("application/reactflow", nodeType);
    };
  }, []);

  // Open form to edit existing node
  const handleEditNode = useCallback((nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    setFormMode("edit");
    setEditingNodeId(nodeId);
    setFormOpen(true);
  }, [nodes]);

  // Draw the arrow to a target chosen in the form (e.g. Choice → next node)
  const linkTargetNode = useCallback(
    (
      sourceId: string,
      targetNodeId?: string,
      options?: { sourceHandle?: string | null; label?: string }
    ) => {
      if (!targetNodeId || targetNodeId === sourceId) return;
      setEdges((eds) => {
        const existing = eds.find(
          (e) => e.source === sourceId && e.target === targetNodeId
        );
        if (existing) {
          return eds.map((e) =>
            e.id === existing.id
              ? {
                  ...e,
                  sourceHandle: options?.sourceHandle ?? e.sourceHandle,
                  label: options?.label ?? e.label,
                }
              : e
          );
        }
        return addEdge(
          {
            source: sourceId,
            target: targetNodeId,
            sourceHandle: options?.sourceHandle ?? null,
            targetHandle: null,
            ...(options?.label ? { label: options.label } : {}),
          },
          eds
        );
      });
    },
    [setEdges]
  );

  // Choice branches: each condition gets its own labelled arrow
  const connectConditions = useCallback(
    (sourceId: string, data: ChoiceNodeFormData) => {
      (data.conditions ?? []).slice(0, 2).forEach((row, index) => {
        if (!row.targetNodeId) return;
        linkTargetNode(sourceId, row.targetNodeId, {
          sourceHandle: `branch-${index}`,
          label: row.condition || `Branch ${index + 1}`,
        });
      });
    },
    [linkTargetNode]
  );

  // Parallel children live inside the container instead of being linked with arrows
  const moveIntoContainer = useCallback(
    (containerId: string, childIds: string[]) => {
      const ids = childIds.filter((id) => id && id !== containerId);
      if (ids.length === 0) return;

      setNodes((nds) => {
        const container = nds.find((n) => n.id === containerId);
        if (!container) return nds;
        const { width } = getContainerSize(container);
        const rows = Math.ceil(ids.length / 2);
        const height = Math.max(
          getContainerSize(container).height,
          PARALLEL_BODY_TOP +
            rows * (PARALLEL_CARD_HEIGHT + PARALLEL_ROW_GAP) +
            PARALLEL_PADDING
        );

        const nextNodes = nds.map((node) => {
          if (node.id === containerId) {
            // grow the container so the parallel row fits inside it
            return { ...node, style: { ...node.style, width, height } };
          }

          const index = ids.indexOf(node.id);
          if (index === -1) return node;

          return {
            ...node,
            parentId: containerId,
            extent: "parent" as const,
            position: {
              x: PARALLEL_PADDING + (index % 2) * PARALLEL_COLUMN_STEP,
              y:
                PARALLEL_BODY_TOP +
                Math.floor(index / 2) *
                  (PARALLEL_CARD_HEIGHT + PARALLEL_ROW_GAP),
            },
          };
        });

        // the container (parent) has to sit before its children
        return orderNodesByHierarchy(nextNodes);
      });

      // no arrows between the parallel container and the nodes inside it
      setEdges((eds) =>
        eds.filter(
          (e) =>
            !(e.source === containerId && ids.includes(e.target)) &&
            !(e.target === containerId && ids.includes(e.source))
        )
      );
    },
    [setNodes, setEdges]
  );

  // Handle form submission
  const handleFormSubmit = useCallback(
    (data: NodeFormData) => {
      const parallelTargets =
        (data as ParallelNodeFormData).targetNodeIds ?? [];

      if (formMode === "add") {
        // Add new node at drag position or default position
        const absolute = pendingNodePosition || { x: 250, y: 250 };
        const parent =
          pendingParentId && data.type !== "Parallel"
            ? nodes.find((n) => n.id === pendingParentId)
            : undefined;
        const position = parent
          ? (() => {
              const { width, height } = getContainerSize(parent);
              return {
                x: Math.min(
                  Math.max(PARALLEL_PADDING, absolute.x - parent.position.x),
                  Math.max(PARALLEL_PADDING, width - PARALLEL_CARD_WIDTH - PARALLEL_PADDING)
                ),
                y: Math.min(
                  Math.max(PARALLEL_BODY_TOP, absolute.y - parent.position.y),
                  Math.max(
                    PARALLEL_BODY_TOP,
                    height - PARALLEL_CARD_HEIGHT - PARALLEL_PADDING
                  )
                ),
              };
            })()
          : absolute;

        const newNode: Node = {
          id: `node-${Date.now()}`,
          type: data.type,
          position,
          data: { ...data },
          ...(parent ? { parentId: parent.id, extent: "parent" as const } : {}),
          ...(data.type === "Parallel"
            ? {
                style: {
                  width: PARALLEL_MIN_WIDTH,
                  height: PARALLEL_MIN_HEIGHT,
                },
              }
            : {}),
        };
        setNodes((nds) => orderNodesByHierarchy([...nds, newNode]));

        if (data.type === "Choice") {
          connectConditions(newNode.id, data as ChoiceNodeFormData);
        } else if (data.type === "Parallel") {
          moveIntoContainer(newNode.id, parallelTargets);
        }

        toast.success("Node added successfully");
        setPendingNodeType(null);
        setPendingNodePosition(null);
        setPendingParentId(null);
      } else if (formMode === "edit" && editingNodeId) {
        // Update existing node
        setNodes((nds) =>
          nds.map((node) =>
            node.id === editingNodeId
              ? { ...node, data: { ...node.data, ...data } }
              : node
          )
        );
        if (data.type === "Choice") {
          connectConditions(editingNodeId, data as ChoiceNodeFormData);
        } else if (data.type === "Parallel") {
          moveIntoContainer(editingNodeId, parallelTargets);
        }
        toast.success("Node updated successfully");
      }
      setFormOpen(false);
    },
    [
      formMode,
      editingNodeId,
      pendingNodePosition,
      pendingParentId,
      nodes,
      setNodes,
      connectConditions,
      moveIntoContainer,
    ]
  );

  // Delete selected nodes
  const handleDeleteSelected = useCallback(() => {
    if (selectedNodes.length === 0) return;
    const removed = new Set(selectedNodes);
    setNodes((nds) => {
      const positions = new Map(nds.map((node) => [node.id, node.position]));
      return orderNodesByHierarchy(
        nds
          .filter((node) => !removed.has(node.id))
          .map((node) => {
            if (!node.parentId || !removed.has(node.parentId)) return node;
            // lift children of a deleted container back onto the canvas
            const parentPosition = positions.get(node.parentId) ?? { x: 0, y: 0 };
            return {
              ...node,
              parentId: undefined,
              extent: undefined,
              position: {
                x: node.position.x + parentPosition.x,
                y: node.position.y + parentPosition.y,
              },
            };
          })
      );
    });
    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !selectedNodes.includes(edge.source) &&
          !selectedNodes.includes(edge.target)
      )
    );
    setSelectedNodes([]);
    toast.success(`Deleted ${selectedNodes.length} node(s)`);
  }, [selectedNodes, setNodes, setEdges]);

  // Save canvas
  const handleSave = useCallback(async () => {
    try {
      await saveCanvas({
        id: workflowId,
        nodes,
        edges,
      });
      toast.success("Workflow saved successfully");
    } catch (error) {
      toast.error("Failed to save workflow");
      console.error(error);
    }
  }, [workflowId, nodes, edges, saveCanvas]);

  const getEditingNodeData = useMemo(() => {
    if (!editingNodeId) return undefined;
    const node = nodes.find((n) => n.id === editingNodeId);
    if (!node) return undefined;

    const data = node.data as Partial<NodeFormData>;
    const linkedTargets = edges
      .filter((e) => e.source === editingNodeId)
      .map((e) => e.target);
    const hydrated: Record<string, unknown> = {
      ...(data as Record<string, unknown>),
    };

    // Pre-select the nodes this container is already connected to
    if (node.type === "Choice") {
      const choice = data as ChoiceNodeFormData;
      hydrated.conditions =
        (choice.conditions?.length ?? 0) > 0
          ? choice.conditions
          : linkedTargets.map((targetId) => ({
              condition: choice.condition ?? "",
              targetNodeId: targetId,
            }));
    }

    if (node.type === "Parallel") {
      const parallel = data as ParallelNodeFormData;
      const children = nodes
        .filter((child) => child.parentId === editingNodeId)
        .map((child) => child.id);
      hydrated.targetNodeIds = Array.from(
        new Set([
          ...(parallel.targetNodeIds?.length
            ? parallel.targetNodeIds
            : linkedTargets),
          ...children,
        ])
      ).filter((id) => id !== editingNodeId);
    }

    return hydrated as Partial<NodeFormData>;
  }, [editingNodeId, nodes, edges]);

  const getPendingNodeDefaultData = useMemo(() => {
    if (!pendingNodeType) return undefined;
    return nodeDefaults[pendingNodeType] as Partial<NodeFormData>;
  }, [pendingNodeType]);

  // Containers a branch/condition can point at
  const availableTargets = useMemo(
    () =>
      nodes
        .filter((n) => n.type !== "start" && n.type !== "end")
        .map((n) => ({
          id: n.id,
          label: (n.data as { label?: string })?.label || String(n.type),
          type: String(n.type),
        })),
    [nodes]
  );

  // never offer the container itself as one of its own targets/children
  const branchTargets = useMemo(
    () => availableTargets.filter((n) => n.id !== editingNodeId),
    [availableTargets, editingNodeId]
  );

  // Merged JSON document of every container on the canvas
  const mergedDocument = useMemo(
    () =>
      buildWorkflowDocument(nodes, edges, {
        name: workflow?.name ?? "Workflow",
        description: workflow?.description ?? "",
      }),
    [nodes, edges, workflow?.name, workflow?.description]
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography>Loading workflow...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      {/* Top toolbar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Link href={routes["(protected)"].workflow.index}>
            <IconButton size="small">
              <ArrowLeft size={20} />
            </IconButton>
          </Link>
          <Box>
            <Typography variant="h6">{workflow?.name || "Workflow Builder"}</Typography>
            <Typography variant="caption" color="text.secondary">
              {workflow?.description || "Visual workflow designer"}
            </Typography>
          </Box>
          <Chip
            label={`${nodes.filter((n) => n.type !== "start" && n.type !== "end").length} nodes`}
            size="small"
            variant="outlined"
          />
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<Code2 size={18} />}
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </Button>
          {selectedNodes.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Trash2 size={18} />}
              onClick={handleDeleteSelected}
            >
              Delete ({selectedNodes.length})
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Save size={18} />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </Stack>
      </Paper>

      {/* Canvas and palette */}
      <Box sx={{ flex: 1, display: "flex" }}>
        {/* Left panel - Node palette */}
        <Box sx={{ width: 280, borderRight: 1, borderColor: "divider", p: 2 }}>
          <NodePalette />
        </Box>

        {/* Right panel - Canvas */}
        <Box sx={{ flex: 1, position: "relative" }}>
          <div
            ref={reactFlowWrapper}
            style={{ width: "100%", height: "100%" }}
            onDragOver={onDragOver}
            onDrop={onDrop}
          >
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={onNodeClick}
              onNodeDragStop={onNodeDragStop}
              onNodeDoubleClick={(_, node) => handleEditNode(node.id)}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{
                labelStyle: { fontSize: 10, fontWeight: 600, fill: "#6d28d9" },
                labelBgStyle: { fill: "#f5f3ff", fillOpacity: 1 },
                labelBgPadding: [6, 3] as [number, number],
                labelBgBorderRadius: 4,
                style: { strokeWidth: 1.5 },
              }}
              fitView
              attributionPosition="bottom-left"
            >
              <Background />
              <Controls />
              <MiniMap
                nodeColor={(node) => {
                  const type = node.type as StateType;
                  return STATE_PALETTE[type]?.accent ?? "#94a3b8";
                }}
              />
            </ReactFlow>
          </div>
        </Box>
      </Box>

      {/* Node form modal */}
      <NodeForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setPendingNodeType(null);
          setPendingNodePosition(null);
          setPendingParentId(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={getEditingNodeData || getPendingNodeDefaultData}
        mode={formMode}
        availableNodes={branchTargets}
      />

      {/* Merged workflow document preview */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Workflow Document
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Merged schema of every container on the canvas
            </Typography>
          </Box>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={previewFormat}
            onChange={(_, value: "json" | "xml" | null) => {
              if (value) setPreviewFormat(value);
            }}
          >
            <ToggleButton value="json">JSON</ToggleButton>
            <ToggleButton value="xml">XML</ToggleButton>
          </ToggleButtonGroup>
        </DialogTitle>

        <Divider />

        <DialogContent>
          <Box
            component="pre"
            sx={{
              m: 0,
              p: 2,
              borderRadius: 1.5,
              bgcolor: "#0f172a",
              color: "#e2e8f0",
              fontFamily:
                "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
              fontSize: 12,
              lineHeight: 1.6,
              overflow: "auto",
              maxHeight: "60vh",
            }}
          >
            {previewFormat === "json"
              ? JSON.stringify(mergedDocument, null, 2)
              : workflowDocumentToXml(mergedDocument)}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default function WorkflowBuilderPage() {
  return (
    <ReactFlowProvider>
      <WorkflowBuilder />
    </ReactFlowProvider>
  );
}