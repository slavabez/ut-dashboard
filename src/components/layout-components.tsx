import React from "react";

interface IPageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const PageWrapper = ({ children, className }: IPageWrapperProps) => {
  return (
    <main className="mx-auto h-full w-full max-w-[800px] flex-grow items-center justify-center">
      <div className={`flex flex-col gap-4 p-4 ${className}`}>{children}</div>
    </main>
  );
};

export const AdminPageWrapper = ({
  children,
  className,
}: IPageWrapperProps) => {
  return (
    <main
      className={`min-h-[calc(100vh-148px)] w-full flex-grow overflow-auto ${className ? className : ""}`}
    >
      {children}
    </main>
  );
};
