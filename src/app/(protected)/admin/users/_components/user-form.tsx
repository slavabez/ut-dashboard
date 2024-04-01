"use client";

import React from "react";

import UserMetaUpdateForm from "@/app/(protected)/admin/users/_components/user-meta-update-section";
import UserUpdateForm from "@/app/(protected)/admin/users/_components/user-update-form";
import { IUserMeta, UserSelectNonSensitive } from "@/lib/common-types";
import { timeAgo } from "@/lib/utils";

interface UserUpdateFormProps {
  userData: UserSelectNonSensitive;
}

const UserForm = ({ userData }: UserUpdateFormProps) => {
  const userMeta = userData.meta as IUserMeta;
  return (
    <div className="mx-auto flex max-w-[600px] flex-col gap-4 p-4">
      <UserUpdateForm userData={userData} />
      <UserMetaUpdateForm initialUserMeta={userMeta} />
      <div className="flex flex-col gap-4">
        <p suppressHydrationWarning>Создан: {timeAgo(userData.createdAt)}</p>
        <p suppressHydrationWarning>Обновлен: {timeAgo(userData.updatedAt)}</p>
      </div>
    </div>
  );
};

export default UserForm;
