import React from "react";

import { getAllUsers } from "@/actions/user/all-users";
import UserListItem from "@/app/(protected)/admin/users/_components/user-item";

const UserList = async () => {
  const userResponse = await getAllUsers();

  if (userResponse.status === "error") {
    return <div>Ошибка при получении данных пользователей</div>;
  }

  const users = userResponse.data;

  return (
    <ul className="flex flex-col gap-2">
      {users.map((user) => (
        <UserListItem user={user} key={user.id} />
      ))}
    </ul>
  );
};

export default UserList;
