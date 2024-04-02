import React from "react";

import UserForm from "@/app/(protected)/admin/users/_components/user-form";

const UserPageLoading = () => {
  return (
    <div className="flex max-w-[600px] flex-col gap-4 p-4">
      <UserForm skeleton />
    </div>
  );
};

export default UserPageLoading;
