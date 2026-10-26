"use client";

import { useEffect } from "react";
import { Box, CircularProgress } from "@mui/material";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import IdentityClientForm, { ClientFormValues } from "../IdentityClientForm";
import useIdsrvService from "@/services/apiServices/idsrv/useIdsrvService";
import { AddIdentityClientRequest } from "@/services/apiServices/idsrv/interface/IdentityConfigModel";

const emptyValues: ClientFormValues = {
  clientId: "",
  clientName: "",
  clientSecret: "",
  grantTypes: "authorization_code",
  requireConsent: false,
  requirePkce: true,
  redirectUris: [{ value: "" }],
  postLogoutRedirectUris: [{ value: "" }],
  allowedScopes: [{ value: "openid" }, { value: "profile" }, { value: "email" }],
  allowedCorsOrigins: [{ value: "" }],
};

const toArrayField = (values?: string[]) =>
  values?.length ? values.map((value) => ({ value })) : [{ value: "" }];

export default function ClientEditor({ id }: { id?: number }) {
  const router = useRouter();
  const form = useForm<ClientFormValues>({ defaultValues: emptyValues });
  const { useGetClientById, useAddClient, useUpdateClient } = useIdsrvService();
  const clientQuery = useGetClientById(id ?? 0, { enabled: id !== undefined });
  const addMutation = useAddClient();
  const updateMutation = useUpdateClient();

  useEffect(() => {
    const client = clientQuery.data?.data;
    if (!client) return;
    form.reset({
      clientId: client.clientId,
      clientName: client.clientName,
      clientSecret: "",
      grantTypes: client.grantTypes,
      requireConsent: client.requireConsent,
      requirePkce: client.requirePkce,
      redirectUris: toArrayField(client.redirectUris),
      postLogoutRedirectUris: toArrayField(client.postLogoutRedirectUris),
      allowedScopes: toArrayField(client.allowedScopes),
      allowedCorsOrigins: toArrayField(client.allowedCorsOrigins),
    });
  }, [clientQuery.data, form]);

  const onSubmit = async (values: ClientFormValues) => {
    const payload: AddIdentityClientRequest = {
      ...values,
      redirectUris: values.redirectUris.map(({ value }) => value.trim()).filter(Boolean),
      postLogoutRedirectUris: values.postLogoutRedirectUris.map(({ value }) => value.trim()).filter(Boolean),
      allowedScopes: values.allowedScopes.map(({ value }) => value.trim()).filter(Boolean),
      allowedCorsOrigins: values.allowedCorsOrigins.map(({ value }) => value.trim()).filter(Boolean),
    };
    const options = {
      onSuccess: () => {
        toast.success(`Identity client ${id === undefined ? "added" : "updated"} successfully.`);
        router.push("/configure/idsrv");
      },
      onError: () => toast.error(`Failed to ${id === undefined ? "add" : "update"} identity client.`),
    };
    if (id === undefined) {
      await addMutation.mutateAsync(payload, options);
    } else {
      await updateMutation.mutateAsync({ id, payload: { ...payload, clientSecret: values.clientSecret || undefined } }, options);
    }
  };

  if (id !== undefined && clientQuery.isLoading) {
    return <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}><CircularProgress /></Box>;
  }

  return <IdentityClientForm form={form} isEditing={id !== undefined} isPending={addMutation.isPending || updateMutation.isPending} onSubmit={onSubmit} onCancel={() => router.push("/configure/idsrv")} />;
}
