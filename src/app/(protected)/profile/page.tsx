import React from "react";
import { FaUser } from "react-icons/fa";

import { getActiveUser } from "@/actions/user/active-user";
import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";
import { IUserMeta } from "@/lib/common-types";

const ProfilePage = async () => {
  const userResponse = await getActiveUser();

  if (userResponse.status === "error") {
    throw new Error(userResponse.error);
  }

  const user1CMeta = userResponse.data.meta as IUserMeta;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-center my-4 mb-8">
        👤 Профиль
      </h1>

      <div className="flex flex-col gap-4 px-4">
        <dl>
          <dt className="text-gray-500">Пользователь</dt>
          <dd>{user1CMeta.name}</dd>
        </dl>
        <dl>
          <dt className="text-gray-500">Имя</dt>
          <dd>{user1CMeta.realName}</dd>
        </dl>
        <dl>
          <dt className="text-gray-500">Роль</dt>
          <dd>{userResponse.data.role}</dd>
        </dl>
        <dl>
          <dt className="text-gray-500">Телефон</dt>
          <dd>{userResponse.data.phone}</dd>
        </dl>
      </div>
    </div>
  );
};

export default ProfilePage;
