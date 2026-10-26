"use client";

import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import ApiScopeForm, { ScopeFormValues } from "../ApiScopeForm";
import useIdsrvService from "@/services/apiServices/idsrv/useIdsrvService";

const emptyValues: ScopeFormValues = {
  name: "",
  displayName: "",
  description: "",
  enabled: true,
  userClaims: [{ value: "" }],
};

export default function ScopeEditor({ id }: { id?: number }) {
  const router = useRouter();
  const form = useForm<ScopeFormValues>({ defaultValues: emptyValues });
  const { useGetApiScopeById, useAddApiScope, useUpdateApiScope } = useIdsrvService();
  const scopeQuery = useGetApiScopeById(id ?? 0, { enabled: id !== undefined });
  const addMutation = useAddApiScope();
  const updateMutation = useUpdateApiScope();

  useEffect(() => {
    const scope = scopeQuery.data?.data;
    if (!scope) return;
    form.reset({
      name: scope.name,
      displayName: scope.displayName,
      description: scope.description || "",
      enabled: scope.enabled,
      userClaims: scope.userClaims?.length ? scope.userClaims.map((value) => ({ value })) : [{ value: "" }],
    });
  }, [scopeQuery.data, form]);

  const onSubmit = async (values: ScopeFormValues) => {
    const payload = {
      ...values,
      userClaims: values.userClaims.map(({ value }) => value.trim()).filter(Boolean),
    };
    const options = {
      onSuccess: () => {
        toast.success(`API scope ${id === undefined ? "added" : "updated"} successfully.`);
        router.push("/configure/idsrv");
      },
      onError: () => toast.error(`Failed to ${id === undefined ? "add" : "update"} API scope.`),
    };
    if (id === undefined) {
      await addMutation.mutateAsync(payload, options);
    } else {
      await updateMutation.mutateAsync({ id, payload }, options);
    }
  };

  if (id !== undefined && scopeQuery.isLoading) {
    return <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>;
  }

  return <ApiScopeForm form={form} isEditing={id !== undefined} isPending={addMutation.isPending || updateMutation.isPending} onSubmit={onSubmit} onCancel={() => router.push("/configure/idsrv")} />;
}
