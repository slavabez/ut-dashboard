"use client";

import React from "react";

import DeleteUserForm from "@/app/(protected)/admin/users/_components/delete-user-form";
import SetPasswordForm from "@/app/(protected)/admin/users/_components/set-password-form";
import UserMetaUpdateForm from "@/app/(protected)/admin/users/_components/user-meta-update-section";
import UserUpdateForm from "@/app/(protected)/admin/users/_components/user-update-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IUserMeta, UserSelectNonSensitive } from "@/lib/common-types";
import { timeAgo } from "@/lib/utils";

interface UserUpdateFormProps {
  userData?: UserSelectNonSensitive;
  skeleton?: boolean;
}

const UserForm = ({ userData, skeleton }: UserUpdateFormProps) => {
  const userMeta = userData?.meta as IUserMeta;

  // TODO: improve the skeleton visually
  if (skeleton || !userData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
            <div className="h-4 w-1/2 rounded bg-gray-200"></div>
          </div>
        </CardContent>
        <CardFooter>
          <Button disabled>Сохранить</Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      <UserUpdateForm userData={userData} />
      <SetPasswordForm userId={userData.id} />
      <UserMetaUpdateForm initialUserMeta={userMeta} />
      <DeleteUserForm userId={userData.id} />

      <div className="flex flex-col gap-4">
        <p suppressHydrationWarning>Создан: {timeAgo(userData.createdAt)}</p>
        <p suppressHydrationWarning>Обновлен: {timeAgo(userData.updatedAt)}</p>
      </div>
    </>
  );
};

export default UserForm;
