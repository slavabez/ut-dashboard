import Link from "next/link";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IUserMeta, UserSelectNonSensitive } from "@/lib/common-types";
import { formatRelativeDate } from "@/lib/utils";

const UserListItem = ({ user }: { user: UserSelectNonSensitive }) => {
  const user1CMeta = user.meta as IUserMeta;

  return (
    <li key={user.id}>
      <Card>
        <CardHeader>
          <CardTitle>{user.name}</CardTitle>
          <CardDescription>
            Создан: {formatRelativeDate(user.createdAt)}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <dl>
            <dt className="text-gray-500">Имя физ. лица</dt>
            <dd>{user1CMeta.realName}</dd>
          </dl>
          <dl>
            <dt className="text-gray-500">Роль</dt>
            <dd>{user.role}</dd>
          </dl>
          <dl>
            <dt className="text-gray-500">Телефон</dt>
            <dd>{user.phone}</dd>
          </dl>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <Link href={`/admin/users/${user.id}`}>Изменить</Link>
          </Button>
        </CardFooter>
      </Card>
    </li>
  );
};

export default UserListItem;
