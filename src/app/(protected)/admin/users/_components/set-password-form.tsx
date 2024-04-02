"use client";

import React, { useState, useTransition } from "react";

import { setUserPassword } from "@/actions/user/all-users";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ISetPasswordFormProps {
  userId: string;
}

const SetPasswordForm = (props: ISetPasswordFormProps) => {
  const { userId } = props;
  const [isPending, startTransition] = useTransition();
  const [password, setPassword] = useState("");
  const [success, setSuccess] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const handleSetPassword = () => {
    startTransition(() => {
      setSuccess(undefined);
      setError(undefined);
      setUserPassword(userId, password).then((data) => {
        if (data.status === "success") {
          setSuccess("Пароль успешно установлен");
          setPassword("");
        } else {
          setError(data.error);
        }
      });
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Установить пароль</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="password">Новый пароль</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button disabled={isPending} onClick={handleSetPassword}>
            Установить пароль
          </Button>
        </CardFooter>
      </Card>
      <FormSuccess message={success} />
      <FormError message={error} />
    </>
  );
};

export default SetPasswordForm;
