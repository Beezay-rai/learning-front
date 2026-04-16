import ConfirmContext from "@/context/ConfirmContext";
import { useContext } from "react";

const useConfirm = () => {
  const confirm = useContext(ConfirmContext);
  return confirm;
};

export default useConfirm;
