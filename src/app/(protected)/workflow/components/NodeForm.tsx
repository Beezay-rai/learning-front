"use client";

import { useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Box,
  Typography,
  Divider,
  IconButton,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import { FormProvider, useForm, Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Plus, Trash2, X } from "lucide-react";
import FormTextField from "@/components/molecules/FormTextField";
import FormSelect from "@/components/molecules/FormSelect";
import NodeTypeSelector from "./NodeTypeSelector";
import NodePreview from "./NodePreview";
import {
  type ConditionBranch,
  type NodeFormData,
  type StateType,
  buildNodeJson,
  getNodeSchema,
  nodeDefaults,
} from "../schemas/nodeSchema";

interface NodeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: NodeFormData) => void;
  initialData?: Partial<NodeFormData>;
  mode?: "add" | "edit";
  /** Nodes already on the canvas that a branch can point at */
  availableNodes?: Array<{ id: string; label: string; type?: string }>;
}

export default function NodeForm({
  open,
  onClose,
  onSubmit,
  initialData,
  mode = "add",
  availableNodes = [],
}: NodeFormProps) {
  const defaultType: StateType = (initialData?.type as StateType) || "Task";
  const defaultValues = useMemo(
    () => ({
      ...(nodeDefaults[defaultType] || nodeDefaults.Task),
      ...initialData,
    }),
    [defaultType, initialData]
  );

  const formMethods = useForm<NodeFormData>({
    resolver: yupResolver(
      getNodeSchema(defaultType)
    ) as unknown as Resolver<NodeFormData>,
    defaultValues,
    mode: "onChange",
  });

  const { handleSubmit, watch, reset, formState } = formMethods;
  const selectedType = watch("type") as StateType;
  const label = watch("label") || "";
  const description = watch("description") || "";
  const allValues = watch();

  const values = allValues as unknown as Record<string, unknown>;
  const conditions: ConditionBranch[] = Array.isArray(values.conditions)
    ? (values.conditions as ConditionBranch[])
    : [];
  const parallelTargets: string[] = Array.isArray(values.targetNodeIds)
    ? (values.targetNodeIds as string[])
    : [];

  const setField = formMethods.setValue as unknown as (
    name: string,
    value: unknown,
    options?: { shouldValidate?: boolean; shouldDirty?: boolean }
  ) => void;

  const setConditions = (next: ConditionBranch[]) =>
    setField("conditions", next, { shouldValidate: true, shouldDirty: true });

  const updateCondition = (index: number, patch: Partial<ConditionBranch>) =>
    setConditions(
      conditions.map((row, i) => (i === index ? { ...row, ...patch } : row))
    );

  // Update schema when type changes
  useEffect(() => {
    if (selectedType && selectedType !== defaultType) {
      const newDefaults = nodeDefaults[selectedType];
      reset(
        { ...newDefaults, label: label || newDefaults.label } as NodeFormData,
        { keepErrors: false }
      );
    }
  }, [selectedType, defaultType, label, reset]);

  const handleFormSubmit = (data: NodeFormData) => {
    onSubmit(data);
    handleClose();
  };

  const handleClose = () => {
    reset(defaultValues as NodeFormData);
    onClose();
  };

  const getConfigForPreview = (): Record<string, unknown> => {
    const config: Record<string, unknown> = {};
    switch (selectedType) {
      case "Task":
        if (allValues.resource) config.resource = allValues.resource;
        if (allValues.timeout) config.timeout = allValues.timeout;
        if (allValues.retryCount) config.retryCount = allValues.retryCount;
        break;
      case "Choice":
        if (conditions.length > 0) config.conditions = conditions;
        break;
      case "Parallel":
        if (values.branches) config.branches = values.branches;
        if (parallelTargets.length > 0) config.targetNodeIds = parallelTargets;
        break;
      case "Map":
        if (allValues.inputPath) config.inputPath = allValues.inputPath;
        if (allValues.itemVariable)
          config.itemVariable = allValues.itemVariable;
        break;
      case "Wait":
        if (allValues.waitType) config.waitType = allValues.waitType;
        if (allValues.duration) config.duration = allValues.duration;
        if (allValues.timestamp) config.timestamp = allValues.timestamp;
        if (allValues.eventName) config.eventName = allValues.eventName;
        break;
      case "Fail":
        if (allValues.error) config.error = allValues.error;
        if (allValues.cause) config.cause = allValues.cause;
        break;
      default:
        break;
    }
    return config;
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: 500,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {mode === "add" ? "Add Node" : "Edit Node"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Configure node properties and behavior
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <Divider />

      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              {/* Left side - Form fields */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                  {/* Node Type Selector */}
                  <NodeTypeSelector
                    name="type"
                    label="Node Type"
                    disabled={mode === "edit"}
                  />

                  {/* Label / name */}
                  <FormTextField
                    fullWidth
                    name="label"
                    label="Name"
                    placeholder="Enter container name"
                    helperText="A descriptive name for this container"
                  />

                  {/* Description */}
                  <FormTextField
                    fullWidth
                    name="description"
                    label="Description"
                    placeholder="What does this container do?"
                    helperText="Shown on the canvas and in the container JSON"
                    multiline
                    rows={2}
                  />

                  {/* Type-specific fields */}
                  {selectedType === "Task" && (
                    <>
                      <FormTextField
                        fullWidth
                        name="resource"
                        label="Resource"
                        placeholder="arn:aws:lambda:..."
                        helperText="Lambda ARN, API endpoint, or service identifier"
                      />
                      <Grid container spacing={2}>
                        <Grid size={6}>
                          <FormTextField
                            fullWidth
                            name="timeout"
                            label="Timeout (seconds)"
                            type="number"
                            placeholder="30"
                          />
                        </Grid>
                        <Grid size={6}>
                          <FormTextField
                            fullWidth
                            name="retryCount"
                            label="Retry Count"
                            type="number"
                            placeholder="0"
                          />
                        </Grid>
                      </Grid>
                    </>
                  )}

                  {selectedType === "Choice" && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Conditions
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Two branches max — each condition points at its own node and the
                          label is written on the arrow.
                        </Typography>
                      </Box>

                      {conditions.length === 0 && (
                        <Typography variant="caption" color="text.secondary">
                          No conditions yet. Add one to branch the workflow.
                        </Typography>
                      )}

                      {conditions.map((row, index) => (
                        <Box
                          key={index}
                          sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}
                        >
                          <TextField
                            size="small"
                            fullWidth
                            label={`Condition ${index + 1}`}
                            placeholder="$.status === 'active'"
                            value={row.condition ?? ""}
                            onChange={(e) =>
                              updateCondition(index, { condition: e.target.value })
                            }
                          />
                          <TextField
                            select
                            size="small"
                            fullWidth
                            label="Target node"
                            value={row.targetNodeId ?? ""}
                            onChange={(e) =>
                              updateCondition(index, { targetNodeId: e.target.value })
                            }
                          >
                            {availableNodes.map((node) => (
                              <MenuItem key={node.id} value={node.id}>
                                {node.label}
                              </MenuItem>
                            ))}
                          </TextField>
                          <IconButton
                            size="small"
                            aria-label="Remove condition"
                            onClick={() =>
                              setConditions(
                                conditions.filter((_, i) => i !== index)
                              )
                            }
                            sx={{ mt: 0.5 }}
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </Box>
                      ))}

                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Plus size={16} />}
                        sx={{ alignSelf: "flex-start" }}
                        disabled={conditions.length >= 2}
                        onClick={() =>
                          setConditions([
                            ...conditions,
                            { condition: "", targetNodeId: "" },
                          ])
                        }
                      >
                        Add condition ({conditions.length}/2)
                      </Button>

                      {availableNodes.length === 0 && (
                        <Typography variant="caption" color="text.secondary">
                          Drop another container first so a condition has somewhere to point.
                        </Typography>
                      )}
                    </Box>
                  )}

                  {selectedType === "Parallel" && (
                    <>
                      <FormTextField
                        fullWidth
                        name="branches"
                        label="Number of Branches"
                        type="number"
                        placeholder="2"
                        helperText="Number of parallel execution branches (2-10)"
                      />
                      <FormControl fullWidth>
                        <InputLabel id="parallel-targets-label">
                          Nodes to run
                        </InputLabel>
                        <Select
                          multiple
                          labelId="parallel-targets-label"
                          label="Nodes to run"
                          value={parallelTargets}
                          onChange={(e) =>
                            setField("targetNodeIds", e.target.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          renderValue={(selected) =>
                            (selected as string[])
                              .map(
                                (id) =>
                                  availableNodes.find((n) => n.id === id)?.label ??
                                  id
                              )
                              .join(", ")
                          }
                        >
                          {availableNodes
                            .filter((node) => node.type !== "Parallel")
                            .map((node) => (
                              <MenuItem key={node.id} value={node.id}>
                                {node.label}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                          {availableNodes.length === 0
                            ? "Drop other containers first — arrows are drawn automatically."
                            : "Selected nodes run in parallel — arrows are drawn automatically."}
                        </FormHelperText>
                      </FormControl>
                    </>
                  )}

                  {selectedType === "Map" && (
                    <>
                      <FormTextField
                        fullWidth
                        name="inputPath"
                        label="Input Path"
                        placeholder="$.items"
                        helperText="JSONPath to array that will be iterated"
                      />
                      <FormTextField
                        fullWidth
                        name="itemVariable"
                        label="Item Variable Name"
                        placeholder="item"
                        helperText="Variable name for each iteration item"
                      />
                    </>
                  )}

                  {selectedType === "Wait" && (
                    <>
                      <FormSelect
                        name="waitType"
                        label="Wait Type"
                        options={[
                          {
                            label: "Duration",
                            value: "duration",
                          },
                          {
                            label: "Timestamp",
                            value: "timestamp",
                          },
                          {
                            label: "Event",
                            value: "event",
                          },
                        ]}
                      />
                      {allValues.waitType === "duration" && (
                        <FormTextField
                          fullWidth
                          name="duration"
                          label="Duration"
                          placeholder="PT30S"
                          helperText="ISO 8601 duration (e.g., PT30S for 30 seconds)"
                        />
                      )}
                      {allValues.waitType === "timestamp" && (
                        <FormTextField
                          fullWidth
                          name="timestamp"
                          label="Timestamp"
                          type="datetime-local"
                          helperText="Specific date and time to wait until"
                        />
                      )}
                      {allValues.waitType === "event" && (
                        <FormTextField
                          fullWidth
                          name="eventName"
                          label="Event Name"
                          placeholder="OrderConfirmed"
                          helperText="Name of the event to wait for"
                        />
                      )}
                    </>
                  )}

                  {selectedType === "Fail" && (
                    <>
                      <FormTextField
                        fullWidth
                        name="error"
                        label="Error Code"
                        placeholder="ValidationError"
                        helperText="Error code or identifier"
                      />
                      <FormTextField
                        fullWidth
                        name="cause"
                        label="Cause (Optional)"
                        placeholder="Missing required field: email"
                        helperText="Detailed error message or cause"
                        multiline
                        rows={2}
                      />
                    </>
                  )}

                  {(selectedType === "Pass" ||
                    selectedType === "Succeed" ||
                    selectedType === "Start" ||
                    selectedType === "End") && (
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        bgcolor: "action.hover",
                        border: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {selectedType === "Pass" &&
                          "Pass nodes forward input to output with optional transformation."}
                        {selectedType === "Succeed" &&
                          "Succeed nodes terminate the workflow successfully."}
                        {selectedType === "Start" &&
                          "Start nodes mark the entry point of the workflow."}
                        {selectedType === "End" &&
                          "End nodes mark the termination point of the workflow."}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              {/* Right side - Preview */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    position: "sticky",
                    top: 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    textTransform="uppercase"
                    color="text.secondary"
                  >
                    Preview
                  </Typography>
                  <NodePreview
                    type={selectedType}
                    label={label}
                    description={description}
                    config={getConfigForPreview()}
                  />

                  <Typography
                    variant="caption"
                    fontWeight={600}
                    textTransform="uppercase"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    JSON Schema
                  </Typography>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: "#0f172a",
                      color: "#e2e8f0",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                      fontSize: 11,
                      lineHeight: 1.6,
                      overflow: "auto",
                      maxHeight: 220,
                    }}
                  >
                    {JSON.stringify(buildNodeJson(allValues), null, 2)}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <Divider />

          <DialogActions sx={{ p: 2.5, gap: 1 }}>
            <Button
              onClick={handleClose}
              color="inherit"
              disabled={formState.isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={formState.isSubmitting || !formState.isValid}
            >
              {formState.isSubmitting
                ? "Saving..."
                : mode === "add"
                ? "Add Node"
                : "Update Node"}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
