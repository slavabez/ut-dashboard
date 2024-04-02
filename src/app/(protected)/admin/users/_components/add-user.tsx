"use client";

import { useRouter } from "next/navigation";
import React, { useState, useTransition } from "react";

import { addUserFrom1C } from "@/actions/auth/register";
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

const AddUserForm = () => {
  const [isPending, startTransition] = useTransition();
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const router = useRouter();

  const handleSetPassword = () => {
    startTransition(() => {
      setSuccess(undefined);
      setError(undefined);
      addUserFrom1C(phone).then((data) => {
        if (data.status === "success") {
          setSuccess(
            `Пользователь ${data.data.name} успешно добавлен, перенаправление...`,
          );
          setTimeout(() => {
            setSuccess(undefined);
            router.push(`/admin/users/${data.data.id}`);
          }, 2000);

          setPhone("");
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
          <CardTitle>Добавить пользователя из 1С</CardTitle>
        </CardHeader>
        <CardContent>
          <Label htmlFor="phone">Номер телефона физ. лица</Label>
          <Input
            id="phone"
            type="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button disabled={isPending} onClick={handleSetPassword}>
            Добавить
          </Button>
        </CardFooter>
      </Card>
      <FormSuccess message={success} />
      <FormError message={error} />
    </>
  );
};

export default AddUserForm;
