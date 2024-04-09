import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";

interface ILinkButtonProps {
  children: React.ReactNode;
  href: string;
  className?: string;
}

const LinkButton = ({ children, href, className }: ILinkButtonProps) => {
  return (
    <Button asChild className={className}>
      <Link href={href}>{children}</Link>
    </Button>
  );
};

export default LinkButton;
