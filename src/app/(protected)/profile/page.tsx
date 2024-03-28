import React from "react";

import { getActiveUser } from "@/actions/user/active-user";
import { IUserMeta } from "@/lib/common-types";

const ProfilePage = async () => {
  const userResponse = await getActiveUser();
  let user1CMeta: IUserMeta;

  if (userResponse.status === "error") {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-semibold text-center my-4 mb-8">
          👤 Профиль
        </h1>
        <div className="text-center">Вы не вошли</div>
      </div>
    );
  }

  user1CMeta = userResponse.data.meta as IUserMeta;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-semibold text-center mt-2 mb-8">
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
