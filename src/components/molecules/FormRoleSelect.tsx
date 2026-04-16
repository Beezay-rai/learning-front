"use client";

import React, { memo, useMemo } from "react";
import { Controller, get, useFormContext } from "react-hook-form";
import {
  Autocomplete,
  Box,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import useIdsrvService from "@/services/apiServices/idsrv/useIdsrvService";

export interface FormSelectOption {
  label: string | React.ReactNode;
  value: string | number;
}

type FormSelectProps = {
  name: string;
  label?: string;
  user_type_id_name?: string;
};

function FormRoleSelect({ name, label, user_type_id_name }: FormSelectProps) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const userTypeId = watch(user_type_id_name ?? "user_type_id") ?? 0;
  const fieldValue = watch(name); // primitive stored in RHF (e.g. number or string)
  const isFieldError = get(errors, name);

  const { useGetRoles } = useIdsrvService();
  const { data, isFetching, isRefetching, refetch } = useGetRoles({
    userTypeId: Number(userTypeId),
    page: 1,
    pageSize: 50,
  });

  // Build options as objects with { value, label }
  const roleOptions = useMemo<FormSelectOption[]>(
    () =>
      data?.data.items?.map((it: any) => ({
        value: it.id,
        label: it.name,
      })) ?? [],
    [data]
  );

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const selectedOption =
          roleOptions.find((o) => o.value === field.value) ?? null;

        return (
          <Box display="flex" alignItems="center" gap={1}>
            <Autocomplete
              fullWidth
              options={roleOptions}
              value={selectedOption}
              onChange={(_, newOption: FormSelectOption | null) =>
                field.onChange(newOption ? newOption.value : null)
              }
              disabled={isFetching || isRefetching}
              loading={isFetching || isRefetching}
              noOptionsText={
                isFetching || isRefetching ? "Loading..." : "No roles available"
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={label}
                  error={!!isFieldError}
                  helperText={isFieldError?.message}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {(isFetching || isRefetching) && (
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
            />

            <Tooltip title="Refresh" arrow placement="top">
              <IconButton
                onClick={() => refetch()}
                disabled={isFetching || isRefetching}
                aria-label="Refresh roles"
              >
                <RefreshRoundedIcon />
              </IconButton>
            </Tooltip>
          </Box>
        );
      }}
    />
  );
}

export default memo(FormRoleSelect);
