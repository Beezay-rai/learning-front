"use client";

import React, { memo } from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import {
  Controller,
  get,
  useController,
  useFormContext,
} from "react-hook-form";

type FormTextFieldProps = TextFieldProps & {
  name: string;
};

function FormTextField(props: FormTextFieldProps) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext();

  const { name = "", label, error, helperText } = props;

  const value = watch(name);
  const isFieldError = get(errors, name);

  const isError = !!error || !!isFieldError;
  const errorMessage = helperText ?? isFieldError?.message;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          {...field}
          {...props}
          value={value ?? ""}
          name={name}
          label={label}
          error={isError}
          helperText={errorMessage}
          onChange={(e) => {
            field.onChange(e);
            props.onChange?.(e);
          }}
        />
      )}
    />
  );
}

export default memo(FormTextField);
