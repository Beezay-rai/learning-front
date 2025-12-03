"use client";

import React, { memo, ReactNode } from "react";
import { Controller, get, useFormContext } from "react-hook-form";
import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectProps,
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
  } = useFormContext();

  const { name = "", label, error, options } = props;

  const value = watch(name);
  const isFieldError = get(errors, name);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <FormControl fullWidth sx={{ minWidth: 120 }}>
          <InputLabel>{label}</InputLabel>
          <Select
            value={value ?? ""}
            name={name}
            label={label}
            onChange={(e) => {
              console.log(e);
              field.onChange(e);
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
