"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { FaLink } from "react-icons/fa";
import { z } from "zod";

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
import { UserRoleMap } from "@/drizzle/schema";
import { IUserMeta, UserSelectNonSensitive } from "@/lib/common-types";
import { UserUpdateSchema } from "@/schemas";

interface UserUpdateFormProps {
  initialData: UserSelectNonSensitive;
}

const UserUpdateForm = ({ initialData }: UserUpdateFormProps) => {
  const userMeta = initialData.meta as IUserMeta;
  const form = useForm<z.infer<typeof UserUpdateSchema>>({
    defaultValues: {
      phone: initialData.phone ?? "",
      email: initialData.email ?? "",
      name: initialData.name ?? "",
      role: initialData.role,
      id: initialData.id,
    },
    resolver: zodResolver(UserUpdateSchema),
  });

  function onSubmit(values: z.infer<typeof UserUpdateSchema>) {
    console.log(values);
  }

  return (
    <Form {...form}>
      <form
        className="p-4 flex flex-col gap-4 max-w-[600px] mx-auto"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex gap-2 items-center">
          <h2>{initialData.name}</h2>
        </div>

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
      </form>
    </Form>
  );
};

export default UserUpdateForm;
