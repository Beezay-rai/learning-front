import { createContext } from "react";
import { ConfirmDialogProps } from "@/components/ui/dialog/ConfirmDialog";

const ConfirmContext = createContext<(options?: ConfirmDialogProps) => void>(
  () => {}
);

export default ConfirmContext;
