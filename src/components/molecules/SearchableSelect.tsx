"use client";

import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { Controller, Control, FieldValues, Path } from "react-hook-form";

interface Option {
  label: string;
  value: string | number;
}

interface SearchableSelectProps<TFieldValues extends FieldValues> {
  name: Path<TFieldValues>;
  options: Option[];
  label?: string;
  multiple?: boolean;
  placeholder?: string;
  control: Control<TFieldValues>;
}

export function SearchableSelect<TFieldValues extends FieldValues>({
  options,
  name,
  label,
  multiple = false,
  placeholder,
  control,
}: SearchableSelectProps<TFieldValues>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Autocomplete
          {...field}
          multiple={multiple}
          options={options}
          getOptionLabel={(option) => option.label}
          value={
            multiple
              ? options.filter((opt) =>
                  (Array.isArray(field.value)
                    ? (field.value as Array<Option["value"]>)
                    : []
                  ).includes(opt.value),
                )
              : options.find((opt) => opt.value === field.value) || null
          }
          onChange={(event, newValue) => {
            const finalValue = multiple
              ? (newValue as Option[]).map((opt) => opt.value)
              : (newValue as Option)?.value || "";
            field.onChange(finalValue);
          }}
          filterSelectedOptions
          isOptionEqualToValue={(option, val) => option.value === val.value}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label}
              placeholder={placeholder || "Search..."}
              error={!!fieldState.error} // shows red border
              helperText={fieldState.error?.message}
            />
          )}
        />
      )}
    ></Controller>
  );
}
