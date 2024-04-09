import React from "react";

interface ITypographyProps {
  children: React.ReactNode;
}

export const H1: React.FC<ITypographyProps> = ({ children }) => (
  <h1 className="flex scroll-m-20 gap-2 text-3xl font-extrabold tracking-tight lg:text-4xl">
    {children}
  </h1>
);

export const H2: React.FC<ITypographyProps> = ({ children }) => (
  <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
    {children}
  </h2>
);

export const H3: React.FC<ITypographyProps> = ({ children }) => (
  <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
    {children}
  </h3>
);

export const H4: React.FC<ITypographyProps> = ({ children }) => (
  <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">
    {children}
  </h4>
);

export const P: React.FC<ITypographyProps> = ({ children }) => (
  <p className="leading-7 [&:not(:first-child)]:mt-6">{children}</p>
);

export const UL: React.FC<ITypographyProps> = ({ children }) => (
  <ul className="my-6 ml-6 list-disc [&>li]:mt-2">{children}</ul>
);

export const Lead: React.FC<ITypographyProps> = ({ children }) => (
  <p className="text-xl text-muted-foreground">{children}</p>
);

export const Large: React.FC<ITypographyProps> = ({ children }) => (
  <div className="text-lg font-semibold">{children}</div>
);

export const Small: React.FC<ITypographyProps> = ({ children }) => (
  <small className="text-sm font-medium leading-none">{children}</small>
);

export const Muted: React.FC<ITypographyProps> = ({ children }) => (
  <p className="text-sm text-muted-foreground">{children}</p>
);
