"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Typography,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Chip,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { xml } from "@codemirror/lang-xml";
import { oneDark } from "@codemirror/theme-one-dark";
import { KeyValuePair } from "@/common/types/keyValuePair";
import {
  addKeyValuePair,
  deleteKeyValuePair,
  updateKeyValuePair,
} from "@/common/helpers/keyValueHelper";
import {
  AuthApiKey,
  AuthBasic,
  AuthBearer,
  AuthConfig,
} from "@/common/types/authConfig";
import { HttpMethod } from "@/common/types/httpmethod";
import {
  RestApiBuilderModel,
  RestApiBuilderRequest,
} from "@/services/apiServices/core/interface/restApiBuilderModel";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { coreApiSchema } from "@/services/apiServices/core/schema/coreApiSchema";
import FormTextField from "@/components/molecules/FormTextField";
import Link from "next/link";
import { routes } from "@/app/routes.generated";
import FormSelect, {
  FormSelectOption,
} from "@/components/molecules/FormSelect";
import * as yup from "yup";
import {
  GenericKeyValuePair,
  TypeGenericKeyValuePair,
} from "@/services/apiServices/common/GenericKeyValuePair";
import { methodColorMap } from "@/palette/HttpMethodColor";
import { Settings2 } from "lucide-react";

interface ResponseData {
  status: number;
  statusText: string;
  timeMs: number;
  sizeKb: number;
  body: string;
  headers: Record<string, string>;
}

interface BodyField {
  key: string;
  value: string;
  file?: {
    name: string;
    type: string;
    base64: string;
  };
}

type BodyMode = "none" | "raw" | "urlencoded" | "formData";
type RawType = "json" | "xml" | "text";

interface RestBuilderFormProps {
  onSubmit: (data: RestApiBuilderRequest) => void;
  loading?: boolean;
  defaultValue?: RestApiBuilderModel;
  isAdd?: boolean;
}

export default function RestBuilderForm({
  onSubmit,
  loading = false,
  defaultValue,
  isAdd = true,
}: RestBuilderFormProps) {
  const [activeReqTab, setActiveReqTab] = useState(0);
  const [body, setBody] = useState("");
  const formMethods = useForm<RestApiBuilderRequest>({
    resolver: yupResolver(
      coreApiSchema.RestBuilder.Add as yup.ObjectSchema<RestApiBuilderRequest>,
    ),
    defaultValues: defaultValue,
  });
  const rawUrl = formMethods.watch("url");
  const method = formMethods.watch("method");
  const {
    fields: headerFields,
    append: addHeader,
    remove: removeHeader,
  } = useFieldArray({
    control: formMethods.control,
    name: "headers",
  });

  const {
    fields: paramFields,
    append: addParam,
    remove: removeParam,
  } = useFieldArray({
    control: formMethods.control,
    name: "params",
  });
  const params = formMethods.watch("params");
  const headers = formMethods.watch("headers");

  const [bodyMode, setBodyMode] = useState<BodyMode>("raw");
  const [rawType, setRawType] = useState<RawType>("json");
  const [bodyFields, setBodyFields] = useState<BodyField[]>([
    { key: "", value: "" },
  ]);

  const [auth, setAuth] = useState<AuthConfig>({ type: "none" });

  const [response, setResponse] = useState<ResponseData | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const contentType =
    bodyMode === "raw"
      ? rawType === "json"
        ? "application/json"
        : rawType === "xml"
          ? "application/xml"
          : "text/plain"
      : bodyMode === "urlencoded"
        ? "application/x-www-form-urlencoded"
        : bodyMode === "formData"
          ? "multipart/form-data"
          : "";

  const finalUrl = useMemo(() => {
    if (!rawUrl?.trim()) return rawUrl;

    try {
      const u = new URL(rawUrl);

      params?.forEach((param) => {
        const key = param.key.trim();
        if (key) {
          u.searchParams.set(key, param.value);
        }
      });

      return u.toString();
    } catch {
      const query = (params ?? [])
        .filter((param) => param.key.trim())
        .map(
          (param) =>
            `${encodeURIComponent(param.key.trim())}=${encodeURIComponent(param.value)}`,
        )
        .join("&");

      if (!query) return rawUrl;
      return `${rawUrl}${rawUrl.includes("?") ? "&" : "?"}${query}`;
    }
  }, [rawUrl, params]);

  const requestHeaders = useMemo(() => {
    const headers: Record<string, string> =
      contentType === "multipart/form-data"
        ? {}
        : { "Content-Type": contentType };

    if (auth.type === "basic") {
      headers["Authorization"] =
        "Basic " +
        btoa(`${(auth as AuthBasic).username}:${(auth as AuthBasic).password}`);
    } else if (auth.type === "bearer") {
      headers["Authorization"] = "Bearer " + (auth as AuthBearer).token;
    } else if (
      auth.type === "api-key" &&
      (auth as AuthApiKey).addTo === "header"
    ) {
      headers[(auth as AuthApiKey).key] = (auth as AuthApiKey).value;
    }

    return headers;
  }, [headerFields, contentType, auth]);

  const requestBody = useMemo(() => {
    const fields = bodyFields.filter((field) => field.key.trim());

    if (contentType === "application/x-www-form-urlencoded") {
      return fields
        .map(
          (field) =>
            `${encodeURIComponent(field.key.trim())}=${encodeURIComponent(field.value)}`,
        )
        .join("&");
    }

    if (contentType === "multipart/form-data") {
      return {
        type: "multipart",
        fields: fields.map((field) => ({
          name: field.key.trim(),
          value: field.value,
          file: field.file,
        })),
      };
    }

    return bodyMode === "raw" ? body : "";
  }, [body, bodyFields, bodyMode, contentType]);

  const sendRequest = useCallback(async () => {
    setApiLoading(true);
    setResponse(null);
    const start = performance.now();

    try {
      const test = headers?.reduce<Record<string, string>>((acc, x) => {
        acc[x.key] = x.value;
        return acc;
      }, {});

      const res = await fetch("/api/proxy", {
        method: "POST",
        body: JSON.stringify({
          url: finalUrl,
          method: method,
          headers: {
            ...requestHeaders,
            ...test,
          },
          body: requestBody,
        }),
      });

      const text = await res.text();
      const end = performance.now();
      const sizeKb = new Blob([text]).size / 1024;

      setResponse({
        status: res.status,
        statusText: res.statusText,
        timeMs: Math.round(end - start),
        sizeKb: Number(sizeKb.toFixed(2)),
        body: text,
        headers: Object.fromEntries(res.headers.entries()),
      });
    } catch (err: unknown) {
      const end = performance.now();
      setResponse({
        status: 0,
        statusText: err instanceof Error ? err.message : "Network error",
        timeMs: Math.round(end - start),
        sizeKb: 0,
        body: "",
        headers: {},
      });
    } finally {
      setApiLoading(false);
    }
  }, [contentType, finalUrl, method, requestBody, requestHeaders, headers]);

  const formatJson = (raw: string) => {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  };

  const formatXml = (raw: string) => {
    try {
      const document = new DOMParser().parseFromString(raw, "application/xml");
      if (document.querySelector("parsererror")) return raw;

      let level = 0;
      return new XMLSerializer()
        .serializeToString(document)
        .replace(/(>)(<)(\/*)/g, "$1\n$2$3")
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          if (trimmed.startsWith("</")) level -= 1;
          const formatted = `${"  ".repeat(Math.max(level, 0))}${trimmed}`;
          if (
            trimmed.startsWith("<") &&
            !trimmed.startsWith("</") &&
            !trimmed.startsWith("<?") &&
            !trimmed.endsWith("/>")
          ) {
            level += 1;
          }
          return formatted;
        })
        .join("\n");
    } catch {
      return raw;
    }
  };

  const formatRawBody = () => {
    setBody((currentBody) =>
      rawType === "json"
        ? formatJson(currentBody)
        : rawType === "xml"
          ? formatXml(currentBody)
          : currentBody,
    );
  };
  const methodOptions: FormSelectOption[] = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "HEAD",
    "OPTIONS",
  ].map((m) => ({
    value: m,
    label: (
      <Typography
        sx={{
          fontWeight: "bold",
          color: methodColorMap[m] ?? "#666",
        }}
      >
        {m}
      </Typography>
    ),
  }));

  return (
    <Paper
      elevation={0}
      sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden", height: "100%" }}
    >
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5, bgcolor: "action.hover", borderBottom: 1, borderColor: "divider" }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Settings2 size={22} />
          <Box>
            <Typography variant="h6">{isAdd ? "Add REST Request" : "Update REST Request"}</Typography>
            <Typography variant="body2" color="text.secondary">Build, configure, and test an HTTP request.</Typography>
          </Box>
        </Stack>
      </Box>
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(
            (data) => {
              const payload = coreApiSchema.RestBuilder.Add.cast(data, {
                stripUnknown: true,
              });
              console.log(payload);
              onSubmit(payload as RestApiBuilderRequest);
            },
            (errors) => {
              console.log("Form validation errors:", errors);
            },
          )}
        >
          <Grid
            container
            spacing={2}
            sx={{
              p: { xs: 2, md: 3 },
            }}
          >
            <Grid size={{ xs: 12, md: 4 }}>
              <FormTextField fullWidth label="Name" name="name" />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              {/* <FormTextField fullWidth label="Description" name="description" /> */}
            </Grid>

            <Grid size={{ xs: 12, sm: 2, md: 2 }}>
              <FormSelect
                name="method"
                size="small"
                label="Method"
                defaultValue="GET"
                options={methodOptions}
              ></FormSelect>

              {/* <FormControl size="small" fullWidth sx={{ minWidth: 120 }}>
                <InputLabel>Method</InputLabel>
                <Select
                  value={method}
                  name="method"
                  label="Method"
                  onChange={(e) => setMethod(e.target.value as HttpMethod)}
                >
                  {(
                    [
                      "GET",
                      "POST",
                      "PUT",
                      "PATCH",
                      "DELETE",
                      "HEAD",
                      "OPTIONS",
                    ] as HttpMethod[]
                  ).map((m) => (
                    <MenuItem key={m} value={m}>
                      <Typography
                        sx={{
                          fontWeight: "bold",
                          color:
                            m === "GET"
                              ? "#2ca"
                              : m === "POST"
                              ? "#fb3"
                              : "#666",
                        }}
                      >
                        {m}
                      </Typography>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl> */}
            </Grid>
            <Grid size={{ xs: 12, sm: 8, md: 8 }}>
              <FormTextField
                name="url"
                fullWidth
                size="small"
                placeholder="Enter request URL"
                onKeyDown={(e) => e.key === "Enter" && sendRequest()}
              ></FormTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 2, md: 2 }}>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={sendRequest}
                disabled={apiLoading}
                fullWidth
              >
                {apiLoading ? "Sending…" : "Send"}
              </Button>
            </Grid>
          </Grid>

          <Divider />

          <Tabs
            value={activeReqTab}
            onChange={(_, v) => setActiveReqTab(v)}
            sx={{ bgcolor: "#fafafa" }}
          >
            <Tab label="Params" />
            <Tab label="Authorization" />
            <Tab label="Headers" />
            <Tab label="Body" />
            {/* <Tab label="Tests" />
          <Tab label="Settings" /> */}
          </Tabs>

          <Box sx={{ p: 2, minHeight: 220 }}>
            {activeReqTab === 0 && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width={40}></TableCell>
                      <TableCell>Key</TableCell>
                      <TableCell>Value</TableCell>
                      <TableCell width={200}>
                        <Button
                          startIcon={<AddIcon />}
                          onClick={() =>
                            addParam({
                              key: "",
                              value: "",
                            })
                          }
                          // size="small"
                          sx={{ mt: 1 }}
                        >
                          Add Param
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paramFields.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell padding="checkbox">
                          {/* <input
                            type="checkbox"
                            checked={false}
                            // onChange={(e) =>
                            //   updateKeyValuePair(
                            //     params,
                            //     setParams,
                            //     row.id,
                            //     "enabled",
                            //     e.target.checked
                            //   )
                            // }
                          /> */}
                        </TableCell>
                        <TableCell>
                          <FormTextField
                            name={`params.${index}.key`}
                            size="small"
                            fullWidth
                          ></FormTextField>
                        </TableCell>
                        <TableCell>
                          <FormTextField
                            name={`params.${index}.value`}
                            size="small"
                            fullWidth
                          ></FormTextField>
                          {/* <TextField
                            size="small"
                            value={row.value}
                            onChange={(e) =>
                              updateKeyValuePair(
                                params,
                                setParams,
                                row.id,
                                "value",
                                e.target.value
                              )
                            }
                            disabled={!row.enabled}
                            fullWidth
                          /> */}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => removeParam(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {activeReqTab === 1 && (
              <Grid container spacing={2}>
                <Grid size={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Auth Type</InputLabel>
                    <Select
                      value={auth.type}
                      label="Auth Type"
                      onChange={(e) => {
                        const type = e.target.value as AuthConfig["type"];

                        if (type === "basic") {
                          setAuth({
                            type: "basic",
                            username: "",
                            password: "",
                          });
                          return;
                        }

                        if (type === "bearer") {
                          setAuth({ type: "bearer", token: "" });
                          return;
                        }

                        if (type === "api-key") {
                          setAuth({
                            type: "api-key",
                            key: "",
                            value: "",
                            addTo: "header",
                          });
                          return;
                        }

                        setAuth({ type: "none" });
                      }}
                    >
                      <MenuItem value="none">No Auth</MenuItem>
                      <MenuItem value="basic">Basic Auth</MenuItem>
                      <MenuItem value="bearer">Bearer Token</MenuItem>
                      <MenuItem value="api-key">API Key</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={6}>
                  {auth.type === "basic" && (
                    <Stack spacing={1}>
                      <TextField
                        label="Username"
                        size="small"
                        value={(auth as AuthBasic).username}
                        onChange={(e) =>
                          setAuth({ ...auth, username: e.target.value })
                        }
                      />
                      <TextField
                        label="Password"
                        size="small"
                        type="password"
                        value={(auth as AuthBasic).password}
                        onChange={(e) =>
                          setAuth({ ...auth, password: e.target.value })
                        }
                      />
                    </Stack>
                  )}

                  {auth.type === "bearer" && (
                    <TextField
                      label="Token"
                      size="small"
                      value={(auth as AuthBearer).token}
                      onChange={(e) =>
                        setAuth({ ...auth, token: e.target.value })
                      }
                      fullWidth
                    />
                  )}

                  {auth.type === "api-key" && (
                    <Stack spacing={1}>
                      <TextField
                        label="Key"
                        size="small"
                        value={(auth as AuthApiKey).key}
                        onChange={(e) =>
                          setAuth({ ...auth, key: e.target.value })
                        }
                      />
                      <TextField
                        label="Value"
                        size="small"
                        value={(auth as AuthApiKey).value}
                        onChange={(e) =>
                          setAuth({ ...auth, value: e.target.value })
                        }
                      />
                      <FormControl size="small">
                        <InputLabel>Add to</InputLabel>
                        <Select
                          value={(auth as AuthApiKey).addTo}
                          label="Add to"
                          onChange={(e) =>
                            setAuth({
                              ...auth,
                              addTo: e.target.value as "header" | "query",
                            })
                          }
                        >
                          <MenuItem value="header">Header</MenuItem>
                          <MenuItem value="query">Query Param</MenuItem>
                        </Select>
                      </FormControl>
                    </Stack>
                  )}

                  {auth.type === "none" && (
                    <Typography
                      color="text.secondary"
                      sx={{ fontStyle: "italic", pt: 1 }}
                    >
                      No authentication required
                    </Typography>
                  )}
                </Grid>
              </Grid>
            )}

            {/* HEADERS */}
            {activeReqTab === 2 && (
              <Stack spacing={2}>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell width={40}></TableCell>
                        <TableCell>Key</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Value</TableCell>
                        <TableCell width={250}>
                          <Button
                            startIcon={<AddIcon />}
                            onClick={() =>
                              addHeader({
                                key: "",
                                type: "",
                                value: "",
                              })
                            }
                            size="small"
                            sx={{ mt: 1 }}
                          >
                            Add Header
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {headerFields.map((header, index) => (
                        <TableRow key={header.id}>
                          <TableCell padding="checkbox">
                            <input
                              type="checkbox"
                              // checked={row.enabled}
                              // onChange={(e) =>
                              //   updateKeyValuePair(
                              //     headers,
                              //     setHeaders,
                              //     row.id,
                              //     "enabled",
                              //     e.target.checked
                              //   )
                              // }
                            />
                          </TableCell>
                          <TableCell>
                            <FormTextField
                              name={`headers.${index}.key`}
                              size="small"
                              fullWidth
                            ></FormTextField>
                          </TableCell>
                          <TableCell>
                            <FormSelect
                              name={`headers.${index}.type`}
                              options={[
                                {
                                  label: "number",
                                  value: "number",
                                },
                                {
                                  label: "string",
                                  value: "string",
                                },
                              ]}
                              size="small"
                              fullWidth
                            ></FormSelect>
                          </TableCell>

                          <TableCell>
                            <FormTextField
                              name={`headers.${index}.value`}
                              size="small"
                              fullWidth
                            ></FormTextField>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => removeHeader(index)}
                              disabled={header.key === "Content-Type"}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            )}

            {/* BODY + CONTENT-TYPE */}
            {activeReqTab === 3 && (
              <Stack spacing={2}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <RadioGroup
                    row
                    value={bodyMode}
                    onChange={(e) => setBodyMode(e.target.value as BodyMode)}
                  >
                    <FormControlLabel value="none" control={<Radio />} label="None" />
                    <FormControlLabel value="raw" control={<Radio />} label="Raw" />
                    <FormControlLabel
                      value="urlencoded"
                      control={<Radio />}
                      label="x-www-form-urlencoded"
                    />
                    <FormControlLabel
                      value="formData"
                      control={<Radio />}
                      label="form-data"
                    />
                  </RadioGroup>

                  {bodyMode === "raw" && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <FormControl size="small" sx={{ minWidth: 80 }}>
                        <Select
                          value={rawType}
                          variant="standard"
                          disableUnderline
                          sx={{
                            color: "primary.main",
                            "& .MuiSelect-icon": { color: "primary.main" },
                          }}
                          onChange={(e) => setRawType(e.target.value as RawType)}
                        >
                          <MenuItem value="json">JSON</MenuItem>
                          <MenuItem value="xml">XML</MenuItem>
                          <MenuItem value="text">Text</MenuItem>
                        </Select>
                      </FormControl>
                      {rawType !== "text" && (
                        <Button variant="outlined" size="small" onClick={formatRawBody}>
                          Beautify
                        </Button>
                      )}
                    </Stack>
                  )}
                </Stack>

                {bodyMode === "raw" ? (
                  <Stack spacing={1}>
                    <CodeMirror
                      value={body}
                      height="280px"
                      extensions={rawType === "json" ? [json()] : rawType === "xml" ? [xml()] : []}
                      theme={oneDark}
                      onChange={(val) => setBody(val)}
                    />
                  </Stack>
                ) : bodyMode === "urlencoded" || bodyMode === "formData" ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Key</TableCell>
                          <TableCell>Value</TableCell>
                          <TableCell width={120}>
                            <Button
                              startIcon={<AddIcon />}
                              size="small"
                              onClick={() =>
                                setBodyFields((fields) => [
                                  ...fields,
                                  { key: "", value: "" },
                                ])
                              }
                            >
                              Add Field
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bodyFields.map((field, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <TextField
                                size="small"
                                value={field.key}
                                onChange={(event) =>
                                  setBodyFields((fields) =>
                                    fields.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? { ...item, key: event.target.value }
                                        : item,
                                    ),
                                  )
                                }
                                fullWidth
                                placeholder="Field name"
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={field.value}
                                disabled={bodyMode === "formData" && !!field.file}
                                onChange={(event) =>
                                  setBodyFields((fields) =>
                                    fields.map((item, itemIndex) =>
                                      itemIndex === index
                                        ? {
                                            ...item,
                                            value: event.target.value,
                                          }
                                        : item,
                                    ),
                                  )
                                }
                                fullWidth
                                placeholder="Value"
                              />
                              {bodyMode === "formData" && (
                                <Button
                                  component="label"
                                  size="small"
                                  sx={{ mt: 0.5 }}
                                >
                                  {field.file ? field.file.name : "Choose file"}
                                  <input
                                    hidden
                                    type="file"
                                    onChange={async (event) => {
                                      const file = event.target.files?.[0];
                                      if (!file) return;

                                      const bytes = new Uint8Array(
                                        await file.arrayBuffer(),
                                      );
                                      let binary = "";
                                      const chunkSize = 0x8000;
                                      for (
                                        let offset = 0;
                                        offset < bytes.length;
                                        offset += chunkSize
                                      ) {
                                        binary += String.fromCharCode(
                                          ...bytes.subarray(offset, offset + chunkSize),
                                        );
                                      }
                                      const base64 = btoa(binary);

                                      setBodyFields((fields) =>
                                        fields.map((item, itemIndex) =>
                                          itemIndex === index
                                            ? {
                                                ...item,
                                                file: {
                                                  name: file.name,
                                                  type: file.type,
                                                  base64,
                                                },
                                              }
                                            : item,
                                        ),
                                      );
                                    }}
                                  />
                                </Button>
                              )}
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  setBodyFields((fields) =>
                                    fields.filter(
                                      (_, itemIndex) => itemIndex !== index,
                                    ),
                                  )
                                }
                                disabled={bodyFields.length === 1}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                    No request body
                  </Typography>
                )}

                {/* {contentType === "multipart/form-data" && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell width={40}></TableCell>
                          <TableCell>Key</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Value</TableCell>
                          <TableCell width={200}>
                            <Button
                              startIcon={<AddIcon />}
                              onClick={() => addKeyValuePair(params, setParams)}
                              // size="small"
                              sx={{ mt: 1 }}
                            >
                              Add Key
                            </Button>
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {params.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell padding="checkbox">
                              <input
                                type="checkbox"
                                checked={row.enabled}
                                onChange={(e) =>
                                  updateKeyValuePair(
                                    params,
                                    setParams,
                                    row.id,
                                    "enabled",
                                    e.target.checked
                                  )
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.key}
                                onChange={(e) =>
                                  updateKeyValuePair(
                                    params,
                                    setParams,
                                    row.id,
                                    "key",
                                    e.target.value
                                  )
                                }
                                disabled={!row.enabled}
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <TextField
                                size="small"
                                value={row.value}
                                onChange={(e) =>
                                  updateKeyValuePair(
                                    params,
                                    setParams,
                                    row.id,
                                    "value",
                                    e.target.value
                                  )
                                }
                                disabled={!row.enabled}
                                fullWidth
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                size="small"
                                onClick={() =>
                                  deleteKeyValuePair(params, setParams, row.id)
                                }
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )} */}
              </Stack>
            )}
          </Box>

          <Divider />

          {/* --- Response --- */}
          <Box sx={{ p: 2, bgcolor: "#fafafa" }}>
            <Typography variant="subtitle1" gutterBottom>
              Response
            </Typography>

            {response ? (
              <Stack spacing={1}>
                <Grid container spacing={1} alignItems="center">
                  <Grid>
                    <Chip
                      label={`${response.status} ${response.statusText}`}
                      color={
                        response.status >= 200 && response.status < 300
                          ? "success"
                          : "error"
                      }
                      size="small"
                    />
                  </Grid>
                  <Grid>
                    <Chip label={`${response.timeMs} ms`} size="small" />
                  </Grid>
                  <Grid>
                    <Chip label={`${response.sizeKb} KB`} size="small" />
                  </Grid>
                </Grid>

                <Paper variant="outlined" sx={{ p: 1, bgcolor: "#fff", mt: 1 }}>
                  <CodeMirror
                    value={formatJson(response.body)}
                    height="250px"
                    extensions={[json()]}
                    theme={oneDark}
                    readOnly
                  />
                </Paper>
              </Stack>
            ) : (
              <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                {apiLoading
                  ? "Waiting for response…"
                  : "Send a request to see the response"}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: "flex", gap: 2, m: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color={isAdd ? "primary" : "warning"}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading
                ? isAdd
                  ? "Adding..."
                  : "Updating..."
                : isAdd
                  ? "Add Api"
                  : "Update"}
            </Button>

            <Link href={routes["(protected)"]["proxy"]["rest-builder"].index}>
              <Button
                type="button"
                variant="outlined"
                color="error"
                disabled={loading}
                sx={{ minWidth: 120 }}
              >
                Cancel
              </Button>
            </Link>
          </Box>
        </form>
      </FormProvider>
    </Paper>
  );
}
