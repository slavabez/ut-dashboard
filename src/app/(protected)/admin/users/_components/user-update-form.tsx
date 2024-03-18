"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { updateUserById } from "@/actions/user/all-users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { UserRoleMap } from "@/drizzle/schema";
import { UserSelectNonSensitive } from "@/lib/common-types";
import { UserUpdateSchema } from "@/schemas";

interface UserUpdateFormProps {
  userData: UserSelectNonSensitive;
}

const UserUpdateForm = ({ userData }: UserUpdateFormProps) => {
  const [isUpdatePending, startUpdate] = useTransition();
  const form = useForm<z.infer<typeof UserUpdateSchema>>({
    defaultValues: {
      phone: userData.phone ?? "",
      email: userData.email ?? "",
      name: userData.name ?? "",
      role: userData.role,
      id: userData.id,
    },
    resolver: zodResolver(UserUpdateSchema),
    mode: "onChange",
  });

  function onSubmit(values: z.infer<typeof UserUpdateSchema>) {
    startUpdate(() => {
      updateUserById(userData.id, values).then((data) => {
        if (data.status === "success") {
          if (data.data.phone) form.setValue("phone", data.data.phone);
          if (data.data.email) form.setValue("email", data.data.email);
          if (data.data.name) form.setValue("name", data.data.name);
          if (data.data.role) form.setValue("role", data.data.role);
        }
      });
    });
  }

  return (
    <Form {...form}>
      <Card>
        <form
          className="p-4 flex flex-col gap-4 max-w-[600px] mx-auto"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <CardHeader>
            <CardTitle>Пользователь {form.getValues("name")}</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel htmlFor="user-name">Имя пользователя</FormLabel>
                    <FormControl>
                      <Input
                        id="user-name"
                        placeholder="Имя пользователя"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Имя пользователя, которое будет отображаться на сайте
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <Separator className="my-2" />
            <FormField
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel htmlFor="user-phone">Телефон</FormLabel>
                    <FormControl>
                      <Input
                        id="user-phone"
                        placeholder="+77777777777"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Номер телефона в формате +7 777 777 77 77
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
              name="phone"
            />
            <Separator className="my-2" />
            <FormField
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel htmlFor="user-email">Email</FormLabel>
                    <FormControl>
                      <Input
                        id="user-email"
                        placeholder="email@domain.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>Адрес электронной почты</FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
              name="email"
            />
            <Separator className="my-2" />
            <FormField
              control={form.control}
              render={({ field }) => {
                return (
                  <FormItem>
                    <FormLabel htmlFor="user-role">Роль</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите роль" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from(UserRoleMap.values()).map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Роль пользователя</FormDescription>
                    <FormMessage />
                  </FormItem>
                );
              }}
              name="role"
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              variant="default"
              disabled={!form.formState.isValid}
              className="w-full justify-center items-center gap-2"
              onClick={form.handleSubmit(onSubmit)}
            >
              Сохранить {isUpdatePending ? "..." : ""}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Form>
  );
};

export default UserUpdateForm;
