import React from "react";

import AddUserForm from "@/app/(protected)/admin/users/_components/add-user";
import UserList from "@/app/(protected)/admin/users/_components/user-list";

const UsersAdminPage = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-center text-2xl font-semibold">Пользователи</h1>
      <AddUserForm />
      <UserList />
    </div>
  );
};

export default UsersAdminPage;
