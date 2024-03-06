"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { login } from "@/actions/auth/login";
import CardWrapper from "@/components/auth/card-wrapper";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginSchema } from "@/schemas";

const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");

    startTransition(() => {
      login(values).then((data) => {
        setError(data?.error);
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Вход"
      backButtonLabel="Первый раз? Зарегистрироваться"
      backButtonHref="/auth/register"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Номер телефона</FormLabel>
                  <FormControl>
                    <>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="+7 777 777 7777"
                        type="tel"
                      />
                      {form.formState.errors.phone && (
                        <FormError
                          message={form.formState.errors.phone.message}
                        />
                      )}
                    </>
                  </FormControl>
                </FormItem>
              )}
              name="phone"
            />
            <FormField
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="*********"
                        type="password"
                      />
                      {form.formState.errors.password && (
                        <FormError
                          message={form.formState.errors.password?.message}
                        />
                      )}
                    </>
                  </FormControl>
                </FormItem>
              )}
              name="password"
            />
          </div>
          <FormError message={error} />
          <Button type="submit" className="w-full" disabled={isPending}>
            Войти на сайт
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default LoginForm;
