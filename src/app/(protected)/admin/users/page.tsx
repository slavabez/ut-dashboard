import React from "react";

import UserList from "@/app/(protected)/admin/users/_components/user-list";

const UsersAdminPage = () => {
  return (
    <div className="max-w-full">
      <h1 className="text-xl font-semibold text-center p-2">Пользователи</h1>
      <UserList />
    </div>
  );
};

export default UsersAdminPage;
