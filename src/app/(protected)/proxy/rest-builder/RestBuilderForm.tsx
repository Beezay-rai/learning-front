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
import { RestApiBuilderRequest } from "@/services/apiServices/core/interface/restApiBuilderModel";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { coreApiSchema } from "@/services/apiServices/core/schema/apiSchema";
import FormTextField from "@/components/molecules/FormTextField";
import Link from "next/link";
import { routes } from "@/app/routes.generated";
import FormSelect, {
  FormSelectOption,
} from "@/components/molecules/FormSelect";

interface ResponseData {
  status: number;
  statusText: string;
  timeMs: number;
  sizeKb: number;
  body: string;
  headers: Record<string, string>;
}

interface RestBuilderFormProps {
  onSubmit: (data: RestApiBuilderRequest) => void;
  loading?: boolean;
  defaultValue?: RestApiBuilderRequest;
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
    resolver: yupResolver(coreApiSchema.RestBuilder.Add as any),
    defaultValues: {
      ...(defaultValue ?? {
        name: "",
        description: "",
        url: "",
        headers: [],
        method: "GET",
        params: [],
      }),
    },
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

  const [contentType, setContentType] = useState("application/json");

  const [auth, setAuth] = useState<AuthConfig>({ type: "none" });

  const [response, setResponse] = useState<ResponseData | null>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const finalUrl = useMemo(() => {
    // const enabled = params.filter((p) => p.enabled && p.key.trim());
    // if (enabled.length === 0) return rawUrl;

    try {
      const u = new URL(rawUrl);
      // enabled.forEach((p) => {
      //   u.searchParams.set(p.key.trim(), p.value.trim());
      // });
      paramFields.forEach((p) => {
        u.searchParams.set(p.key.trim(), p.value.trim());
      });
      return u.toString();
    } catch {
      return rawUrl;
    }
  }, [rawUrl, params]);

  const requestHeaders = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": contentType };

    if (auth.type === "basic") {
      h["Authorization"] =
        "Basic " +
        btoa(`${(auth as AuthBasic).username}:${(auth as AuthBasic).password}`);
    } else if (auth.type === "bearer") {
      h["Authorization"] = "Bearer " + (auth as AuthBearer).token;
    } else if (
      auth.type === "api-key" &&
      (auth as AuthApiKey).addTo === "header"
    ) {
      h[(auth as AuthApiKey).key] = (auth as AuthApiKey).value;
    }

    return h;
  }, [headerFields, contentType, auth]);

  const sendRequest = useCallback(async () => {
    setApiLoading(true);
    setResponse(null);
    const start = performance.now();

    try {
      const res = await fetch("/api/proxy", {
        method: "POST",
        body: JSON.stringify({
          url: finalUrl,
          method: method,
          headers: { ...requestHeaders },
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
    } catch (err: any) {
      const end = performance.now();
      setResponse({
        status: 0,
        statusText: err.message ?? "Network error",
        timeMs: Math.round(end - start),
        sizeKb: 0,
        body: "",
        headers: {},
      });
    } finally {
      setApiLoading(false);
    }
  }, [finalUrl, method, requestHeaders, body]);

  const formatJson = (raw: string) => {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
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
          color: m === "GET" ? "#2ca" : m === "POST" ? "#fb3" : "#666",
        }}
      >
        {m}
      </Typography>
    ),
  }));

  return (
    <Paper
      elevation={3}
      sx={{ borderRadius: 2, overflow: "hidden", height: "100%" }}
    >
      <FormProvider {...formMethods}>
        <form
          onSubmit={formMethods.handleSubmit(
            (data) => {
              // called if form is valid
              onSubmit(data);
            },
            (errors) => {
              // called if form has validation errors
              console.log("Form validation errors:", errors);
            }
          )}
        >
          <Grid
            container
            spacing={2}
            sx={{
              p: 2,
            }}
          >
            <Grid size={4}>
              <FormTextField fullWidth label="Name" name="name" />
            </Grid>
            <Grid size={8}>
              <FormTextField fullWidth label="Description" name="description" />
            </Grid>

            <Grid size={1}>
              <FormSelect
                name="method"
                label="Method"
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
            <Grid size={10}>
              <FormTextField
                name="url"
                fullWidth
                size="small"
                placeholder="Enter request URL"
                onKeyDown={(e) => e.key === "Enter" && sendRequest()}
              ></FormTextField>
            </Grid>
            <Grid size={1}>
              <Button
                variant="contained"
                startIcon={<SendIcon />}
                onClick={sendRequest}
                disabled={apiLoading}
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
                      onChange={(e) => setAuth({ type: e.target.value as any })}
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
                <RadioGroup
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                  value={contentType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setContentType(val);
                    // setHeaders((prev) =>
                    //   prev.map((h) =>
                    //     h.key === "Content-Type" ? { ...h, value: val } : h
                    //   )
                    // );
                  }}
                >
                  <FormControlLabel value="" control={<Radio />} label="none" />
                  <FormControlLabel
                    value="application/json"
                    control={<Radio />}
                    label="application/json"
                  />
                  <FormControlLabel
                    value="application/x-www-form-urlencoded"
                    control={<Radio />}
                    label="x-www-form-urlencoded"
                  />
                  <FormControlLabel
                    value="text/plain"
                    control={<Radio />}
                    label="text/plain"
                  />
                  <FormControlLabel
                    value="multipart/form-data"
                    control={<Radio />}
                    label="multipart/form-data"
                  />
                </RadioGroup>

                {contentType !== "multipart/form-data" ? (
                  <CodeMirror
                    value={body}
                    height="280px"
                    extensions={[json()]}
                    theme={oneDark}
                    onChange={(val) => setBody(val)}
                  />
                ) : (
                  <>
                    <Typography
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      No request body
                    </Typography>
                  </>
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
