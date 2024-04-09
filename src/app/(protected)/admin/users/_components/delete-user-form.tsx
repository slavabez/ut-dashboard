"use client";

import React, { useState, useTransition } from "react";

import { deleteUser } from "@/actions/user/all-users";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface IDeleteUserFormProps {
  userId: string;
}

const DeleteUserForm = (props: IDeleteUserFormProps) => {
  const { userId } = props;
  const [isPending, startTransition] = useTransition();
  const [showDialog, setShowDialog] = useState(false);
  const [success, setSuccess] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const handleDeleteUser = () => {
    startTransition(() => {
      deleteUser(userId).then((res) => {
        if (res.status === "success") {
          setShowDialog(false);
          setSuccess("Пользователь успешно удален");
        } else if (res.status === "error") {
          setError(res.error);
        }
      });
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Удалить пользователя</CardTitle>
        </CardHeader>
        <CardFooter>
          <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Удалить</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                <AlertDialogDescription>
                  Пользователь будет удален безвозвратно. Ну, почти. Его можно
                  будет еще раз добавить из 1С.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPending}>
                  Отмена
                </AlertDialogCancel>
                <AlertDialogAction
                  disabled={isPending}
                  onClick={handleDeleteUser}
                >
                  Удалить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
      <FormSuccess message={success} />
      <FormError message={error} />
    </>
  );
};

export default DeleteUserForm;
