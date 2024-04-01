import { CheckCircledIcon } from "@radix-ui/react-icons";
import React from "react";

interface FormSuccessProps {
  message?: string;
}

const FormSuccess = ({ message }: FormSuccessProps) => {
  if (!message) return null;
  return (
    <div className="test-sm flex items-center gap-x-2 rounded-md bg-emerald-500/15 p-3 text-emerald-500">
      <CheckCircledIcon className="h-4 w-4" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default FormSuccess;
