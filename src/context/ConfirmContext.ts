import { createContext } from "react";
import { ConfirmDialogProps } from "@/components/ui/ConfirmDialog";

const ConfirmContext = createContext<(options?: ConfirmDialogProps) => void>(
  () => {}
);

export default ConfirmContext;
