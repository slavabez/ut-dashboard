"use client";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { Fragment } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getBreadcrumbsForPath, getSubNavItems } from "@/siteConfig";

const Breadcrumbs = () => {
  const path = usePathname();
  const allBreadcrumbs = getBreadcrumbsForPath(path) ?? [];

  return (
    <Breadcrumb className="bg-orange-100">
      <BreadcrumbList className="px-4 py-2 gap-2 max-w-[800px] mx-auto">
        {allBreadcrumbs.map((item, index) => {
          const innerItems = getSubNavItems(item.href ?? "");
          if (!innerItems || innerItems.length === 0) {
            return (
              <Fragment key={item.id}>
                <BreadcrumbItem>{item.name}</BreadcrumbItem>
                {index < allBreadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </Fragment>
            );
          }
          return (
            <Fragment key={item.id}>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-orange-600">
                  {item.name}
                  <ChevronDownIcon />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {innerItems.map((i) => (
                    <DropdownMenuItem key={i.id} asChild>
                      <Link href={i.href}>{i.name}</Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {index < allBreadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
