"use client";
import ConfirmDialog, {
  ConfirmDialogProps,
} from "@/components/ui/dialog/ConfirmDialog";
import ConfirmContext from "@/context/ConfirmContext";
import React, { useCallback, useState } from "react";

const DefaultConfirmProps: ConfirmDialogProps = {
  title: "Are you sure you want to perform this action ?",
  description: "",
  confirmText: "Confirm",
  cancellationText: "Cancel",
};

export default function ConfirmProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const confirm = useCallback((options?: ConfirmDialogProps) => {
    setConfirmOptions({
      ...DefaultConfirmProps,
      ...options,
    });
    setOpen(true);
  }, []);

  const [confirmOptions, setConfirmOptions] =
    useState<ConfirmDialogProps>(DefaultConfirmProps);

  const handleConfirm = useCallback(async () => {
    if (!confirmOptions.onConfirm) return;

    try {
      setLoading(true);
      await confirmOptions.onConfirm();
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, [confirmOptions]);

  const handleCancel = useCallback(() => {
    confirmOptions.onCancel?.();
    setOpen(false);
  }, [confirmOptions]);

  return (
    <>
      <ConfirmContext.Provider value={confirm}>
        {children}
        <ConfirmDialog
          props={{
            ...confirmOptions,
            onConfirm: handleConfirm,
            onCancel: handleCancel,
            pending: loading,
          }}
          open={open}
        ></ConfirmDialog>
      </ConfirmContext.Provider>
    </>
  );
}
