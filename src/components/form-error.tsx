import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import React from "react";

interface FormErrorProps {
  message?: string;
}

const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;
  return (
    <div className="bg-destructive/15 p-3 rounded-md flex items-center gap-x-2 test-sm text-destructive">
      <ExclamationTriangleIcon className="h-20 w-20" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default FormError;
