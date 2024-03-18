import React from "react";

import { getUserByIdAction } from "@/actions/user/all-users";
import UserForm from "@/app/(protected)/admin/users/_components/user-form";
import UserMetaUpdateForm from "@/app/(protected)/admin/users/_components/user-meta-update-section";
import { IUserMeta } from "@/lib/common-types";

const UserDetailsPage = async ({ params }: { params: { id: string } }) => {
  const userId = params.id;

  const userDetailsReq = await getUserByIdAction(userId);

  if (userDetailsReq.status === "error") {
    return <div>{userDetailsReq.error}</div>;
  }

  const userDetails = userDetailsReq.data;

  return (
    <div>
      <UserForm userData={userDetails} />
    </div>
  );
};

export default UserDetailsPage;
