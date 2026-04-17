"use client";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Modal,
  Stack,
  Typography,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import QuestionMark from "@mui/icons-material/QuestionMark";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import { styled } from "@mui/material/styles";
import React from "react";

const icons: Record<string, React.ElementType> = {
  success: CheckIcon,
  error: CloseIcon,
  warning: PriorityHighIcon,
  info: PriorityHighIcon,
  question: QuestionMark,
};
export interface ConfirmDialogProps {
  confirmText?: string;
  cancellationText?: string;
  title?: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  showIcon?: boolean;
  pending?: boolean;
  icon?: "success" | "error" | "warning" | "info" | "question";
}

export default function ConfirmDialog({
  props,
  open,
}: {
  props: ConfirmDialogProps;
  open: boolean;
}) {
  const {
    title,
    onClose,
    onConfirm,
    onCancel,
    description,
    confirmText,
    cancellationText,
    icon = "info",
    pending,
  } = props;
  const renderIcon = (
    icon: "success" | "error" | "warning" | "info" | "question",
  ) => {
    const IconComponent = icons[icon];

    const colorMap: Record<typeof icon, string> = {
      success: "success",
      error: "error",
      warning: "warning",
      info: "warning",
      question: "primary",
    };

    return <IconComponent color={colorMap[icon]} fontSize="large" />;
  };

  return (
    <Dialog open={open} onClose={props.pending ? undefined : props.onCancel}>
      <Box sx={{ padding: "20px", maxWidth: "330px" }}>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {renderIcon(icon)}
        </Box>

        <DialogTitle id="alert-dialog-title" textAlign={"center"}>
          {title}
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center" }}>
          <DialogContentText id="alert-dialog-description">
            {description}
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="error" onClick={onCancel}>
            {cancellationText}
          </Button>
          <Button
            variant="contained"
            disabled={pending}
            color="warning"
            onClick={onConfirm}
          >
            {confirmText}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
