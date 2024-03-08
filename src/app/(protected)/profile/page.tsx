import React from "react";

import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

const ProfilePage = async () => {
  const session = await auth();

  return (
    <div>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <Button type="submit">Sign out</Button>
      </form>
    </div>
  );
};

export default ProfilePage;
