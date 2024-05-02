import Link from "next/link";
import React from "react";

import { getUserByIdAction } from "@/actions/user/all-users";
import UserForm from "@/app/(protected)/admin/users/_components/user-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const UserDetailsPage = async ({ params }: { params: { id: string } }) => {
  const userId = params.id;

  const userDetailsReq = await getUserByIdAction(userId);

  if (userDetailsReq.status === "error") {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Alert variant="destructive">
          <AlertTitle>Ошибка</AlertTitle>
          <AlertDescription>{userDetailsReq.error}</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href={`/admin/users`}>Назад</Link>
        </Button>
      </div>
    );
  }

  const userDetails = userDetailsReq.data;

  return (
    <div className="flex flex-col gap-4 p-4">
      <UserForm userData={userDetails} />
    </div>
  );
};

export default UserDetailsPage;
