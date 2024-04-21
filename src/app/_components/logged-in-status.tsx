import React from "react";

import LinkButton from "@/components/link-button";
import { P } from "@/components/typography";
import { currentUser } from "@/lib/auth";

const LoggedInStatus = async () => {
  const user = await currentUser();
  if (!user) {
    return <LinkButton href="/auth/login">Войти</LinkButton>;
  }
  switch (user.role) {
    case "employee":
      return (
        <div className="w-auto">
          <P>
            Вы вошли как <span className="font-bold">{user.name}</span>
          </P>
          <LinkButton href="/profile">Перейти в мой раздел</LinkButton>
        </div>
      );
    case "admin":
      return (
        <div className="flex flex-col gap-4">
          <P>
            Вы вошли как <span className="font-bold">{user.name}</span>
          </P>
          <LinkButton href="/admin">Перейти в админку</LinkButton>
        </div>
      );
    default:
      return null;
  }
};

export default LoggedInStatus;
