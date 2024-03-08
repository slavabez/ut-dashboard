import { CheckCircledIcon } from "@radix-ui/react-icons";
import React from "react";

interface FormSuccessProps {
  message?: string;
}

const FormSuccess = ({ message }: FormSuccessProps) => {
  if (!message) return null;
  return (
    <div className="bg-emerald-500/15 p-3 rounded-md flex items-center gap-x-2 test-sm text-emerald-500">
      <CheckCircledIcon className="h-20 w-20" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default FormSuccess;
