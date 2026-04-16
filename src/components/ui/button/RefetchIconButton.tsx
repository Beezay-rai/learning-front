import React from "react";
import Tooltip from "@mui/material/Tooltip";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";

import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";

export default function ReloadIconButton(props: IconButtonProps) {
  return (
    <Tooltip title="Refresh" placement="top" arrow>
      <IconButton
        sx={{
          border: "1px solid",
          borderColor: "grey.400",
          borderRadius: 1,
        }}
        {...props}
        aria-label="reload-button"
      >
        <RefreshRoundedIcon />
      </IconButton>
    </Tooltip>
  );
}
