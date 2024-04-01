import React from "react";

import UserList from "@/app/(protected)/admin/users/_components/user-list";

const UsersAdminPage = () => {
  return (
    <div className="max-w-full">
      <h1 className="p-2 text-center text-xl font-semibold">Пользователи</h1>
      <UserList />
    </div>
  );
};

export default UsersAdminPage;
