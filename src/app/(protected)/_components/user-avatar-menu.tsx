"use client";

import { ExitIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import React from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";

const adminLinks = [
  {
    href: "/admin",
    label: "Админка",
  },
  {
    href: "/admin/sync",
    label: "Синхронизация с 1С",
  },
  {
    href: "/admin/users",
    label: "Пользователи",
  },
];
const userLinks = [
  {
    href: "/profile",
    label: "Профиль",
  },
  {
    href: "/orders",
    label: "Сверка заказов",
  },
  {
    href: "/reports",
    label: "Отчеты по продажам",
  },
];

const UserAvatarMenu = () => {
  const user = useCurrentUser();
  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar>
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback className="bg-white text-orange-500">
            {/*<FaUser className="text-white" />*/}
            {user?.name && user?.name[0]}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50" align="end">
        <DropdownMenuGroup>
          {user?.name && (
            <DropdownMenuItem asChild>
              <Link href="/profile" className="text-gray-500">
                {user?.name}
              </Link>
            </DropdownMenuItem>
          )}
          {user?.role === "admin" &&
            adminLinks.map((link) => (
              <DropdownMenuItem key={link.href} asChild>
                <Link href={link.href}>{link.label}</Link>
              </DropdownMenuItem>
            ))}
          {user?.role === "employee" &&
            userLinks.map((link) => (
              <DropdownMenuItem key={link.href} asChild>
                <Link href={link.href}>{link.label}</Link>
              </DropdownMenuItem>
            ))}
        </DropdownMenuGroup>

        <LogoutButton>
          <DropdownMenuItem>
            <ExitIcon className="h-4 w-4 mr-2" />
            Выйти
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAvatarMenu;
