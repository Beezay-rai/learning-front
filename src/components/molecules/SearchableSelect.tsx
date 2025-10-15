"use client";

import React, { useState } from "react";
import { Autocomplete, TextField, Chip, Box } from "@mui/material";
import { Controller } from "react-hook-form";

export interface Option {
  label: string;
  value: string;
}

interface SearchableSelectProps {
  name: string;
  options: Option[];
  value?: Option | Option[]; // single or multi-select
  label?: string;
  multiple?: boolean;
  placeholder?: string;
  control: any;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  name,
  label,
  multiple = false,
  placeholder,
  control,
}) => {
  const [selectedOption, setSelectedOption] = useState<
    Option | Option[] | null
  >(multiple ? [] : null);

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
              ? options.filter((opt) => (field.value || []).includes(opt.value))
              : options.find((opt) => opt.value === field.value) || null
          }
          onChange={(event, newValue) => {
            const finalValue = multiple
              ? (newValue as Option[]).map((opt) => opt.value)
              : (newValue as Option)?.value || "";
            // setSelectedOption(finalValue);
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
};
