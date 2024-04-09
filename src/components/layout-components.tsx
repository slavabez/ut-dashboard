import React from "react";

interface IPageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const PageWrapper = ({ children, className }: IPageWrapperProps) => {
  return (
    <div className={`flex flex-col gap-4 p-4 ${className}`}>{children}</div>
  );
};

export default PageWrapper;
