"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { register } from "@/actions/auth/register";
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
import { RegisterSchema } from "@/schemas";

const RegisterForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      phone: "",
    },
  });

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError("");
    setSuccess("");

    startTransition(() => {
      register(values).then((data) => {
        setError(data?.error);
        setSuccess(data.success);
      });
    });
  };

  return (
    <CardWrapper
      headerLabel="Регистрация"
      backButtonLabel="Уже зарегистрировались? Войти"
      backButtonHref="/auth/login"
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
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          {success && (
            <Link
              className="text-center text-blue-500 block"
              href="/auth/login"
            >
              Войти
            </Link>
          )}
          <Button type="submit" className="w-full" disabled={isPending}>
            Зарегистрироваться
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};

export default RegisterForm;
