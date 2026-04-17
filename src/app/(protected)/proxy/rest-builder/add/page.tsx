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
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { coreApiSchema } from "@/services/apiServices/core/schema/coreApiSchema";
import RestBuilderForm from "../RestBuilderForm";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { routes } from "@/app/routes.generated";
import useCoreApiService from "@/services/apiServices/core/useCoreApiService";

interface ResponseData {
  status: number;
  statusText: string;
  timeMs: number;
  sizeKb: number;
  body: string;
  headers: Record<string, string>;
}

export default function AddRestApi() {
  const router = useRouter();
  const { useAddRestApiBuilder } = useCoreApiService();
  const { mutateAsync, isPending: isSubmitting } = useAddRestApiBuilder();

  const onSubmit = async (data: RestApiBuilderRequest) => {
    try {
      await mutateAsync(data, {
        onSuccess: () => {
          toast.success("Route created successfully!");
          router.push(routes["(protected)"]["proxy"]["rest-builder"].index);
        },
      });
    } catch (err) {
      console.error("Failed to add :", err);
      toast.error("Failed to create API");
    }
  };
  return (
    <Paper sx={{ p: 4 }}>
      <Typography sx={{ mb: 3 }} variant="h5">
        Add Api
      </Typography>
      <RestBuilderForm onSubmit={onSubmit}></RestBuilderForm>
    </Paper>
  );
}
