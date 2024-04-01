import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import React from "react";

interface FormErrorProps {
  message?: string;
}

const FormError = ({ message }: FormErrorProps) => {
  if (!message) return null;
  return (
    <div className="test-sm flex items-center gap-x-2 rounded-md bg-destructive/15 p-3 text-destructive">
      <ExclamationTriangleIcon className="h-8 w-8" />
      <p className="text-sm">{message}</p>
    </div>
  );
};

export default FormError;
