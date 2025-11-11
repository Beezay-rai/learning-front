"use client";

import React, { memo, ReactNode } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import {
  Controller,
  get,
  useController,
  useFormContext,
} from "react-hook-form";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
  Typography,
} from "@mui/material";

export interface FormSelectOption {
  label: string | ReactNode;
  value: string | number;
}
type FormSelectProps = SelectProps & {
  name: string;
  options: FormSelectOption[];
};

function FormSelect(props: FormSelectProps) {
  const {
    control,
    watch,
    formState: { errors },
    clearErrors,
  } = useFormContext();

  const {
    name = "",
    label,
    error,
    disabled,
    required,
    options,
    ...rest
  } = props;

  const value = watch(name);
  const isFieldError = get(errors, name);

  const isError = !!error || !!isFieldError;
  const errorMessage = isFieldError?.message;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl size="small" fullWidth sx={{ minWidth: 120 }}>
          <InputLabel>Method</InputLabel>
          <Select
            value={value}
            name="method"
            label="Method"
            onChange={(e) => {
              console.log(e);
              field.onChange(e);
              //   setMethod(e.target.value as HttpMethod);
            }}
          >
            {Array.isArray(options)
              ? options.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))
              : options}
          </Select>
        </FormControl>
      )}
    />
  );
}

export default memo(FormSelect);
