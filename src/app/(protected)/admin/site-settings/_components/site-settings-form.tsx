"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { ISiteSettings, saveSiteSettings } from "@/actions/site-settings";
import FormError from "@/components/form-error";
import FormSuccess from "@/components/form-success";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

interface ISiteSettingsFormProps {
  initialData?: ISiteSettings;
  guidsFrom1C: any;
}

const SiteSettingsForm = (props: ISiteSettingsFormProps) => {
  const { initialData, guidsFrom1C } = props;
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();
  const form = useForm<ISiteSettings>({
    defaultValues: {
      ...initialData,
    },
    mode: "onChange",
  });

  const onSubmit = (values: ISiteSettings) => {
    startTransition(() => {
      saveSiteSettings(values).then((response) => {
        if (response.status === "success") {
          const newSettings = response.data.settings as ISiteSettings;
          form.setValue("guidsForSync", newSettings.guidsForSync);
          setSuccess("Настройки сохранены");
        } else {
          setError("Ошибка сохранения");
        }
      });
    });
  };

  return (
    <div>
      <Form {...form}>
        <form
          className="mx-auto flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormSuccess message={success} />
          <FormError message={error} />
          <Separator />
          <h2 className="text-lg font-bold">Для пользователей</h2>
          <FormField
            name="guidsForSync.user.showOnSite"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Показывать на сайте</FormLabel>
                  <FormDescription>
                    Дополнительный реквизит из 1С &apos;Показывать на сайте
                    сверки заказов&apos;
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите доп. реквизит" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {guidsFrom1C?.additionalProperties?.map(
                        (property: any) => (
                          <SelectItem
                            key={property.Ref_Key}
                            value={property.Ref_Key}
                          >
                            {property.Имя}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            name="guidsForSync.user.sitePassword"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Пароль на сайте</FormLabel>
                  <FormDescription>
                    Дополнительный реквизит из 1С &apos;Пароль для входа на
                    сайт&apos;
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите доп. реквизит" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {guidsFrom1C?.additionalProperties?.map(
                        (property: any) => (
                          <SelectItem
                            key={property.Ref_Key}
                            value={property.Ref_Key}
                          >
                            {property.Имя ?? property.Description}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            name="guidsForSync.user.siteRole"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Роль на сайте</FormLabel>
                  <FormDescription>
                    Дополнительный реквизит из 1С &apos;Роль на сайте&apos;
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите доп. реквизит" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {guidsFrom1C?.additionalProperties?.map(
                        (property: any) => (
                          <SelectItem
                            key={property.Ref_Key}
                            value={property.Ref_Key}
                          >
                            {property.Имя ?? property.Description}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            name="guidsForSync.user.siteRoleAdminValue"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Значение Администратор</FormLabel>
                  <FormDescription>
                    Значение &apos;Администратор&apos; дополнительного реквизита
                    из 1С &apos;Роль на сайте&apos;
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите значение" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {guidsFrom1C?.propertyValues?.map((property: any) => (
                        <SelectItem
                          key={property.Ref_Key}
                          value={property.Ref_Key}
                        >
                          {property.Description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            name="guidsForSync.user.siteRoleEmployeeValue"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Значение Пользователь</FormLabel>
                  <FormDescription>
                    Значение &apos;Пользователь&apos; дополнительного реквизита
                    из 1С &apos;Роль на сайте&apos;
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите значение" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {guidsFrom1C?.propertyValues?.map((property: any) => (
                        <SelectItem
                          key={property.Ref_Key}
                          value={property.Ref_Key}
                        >
                          {property.Description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Separator />
          <h2 className="text-lg font-bold">Для номенклатуры</h2>
          <FormField
            name="guidsForSync.warehouse"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Главный склад</FormLabel>
                  <FormDescription>
                    Главный склад, с которого будут браться остатки по товарам
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите склад" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {guidsFrom1C?.warehouses.map((warehouse: any) => (
                        <SelectItem
                          key={warehouse.Ref_Key}
                          value={warehouse.Ref_Key}
                        >
                          {warehouse.Description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            name="guidsForSync.nomenclature.minimumNonDivisibleWeight"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Обязательная кратность</FormLabel>
                  <FormDescription>
                    Дополнительный реквизит из 1С &apos;Обязательная
                    кратность&apos;
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите доп. реквизит" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {guidsFrom1C?.additionalProperties?.map(
                        (property: any) => (
                          <SelectItem
                            key={property.Ref_Key}
                            value={property.Ref_Key}
                          >
                            {property.Имя ?? property.Description}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            name="guidsForSync.nomenclature.showOnSite"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Показывать на сайте</FormLabel>
                  <FormDescription>
                    Дополнительный реквизит из 1С &apos;Показывать на
                    сайте&apos;
                  </FormDescription>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите доп. реквизит" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {guidsFrom1C?.additionalProperties?.map(
                        (property: any) => (
                          <SelectItem
                            key={property.Ref_Key}
                            value={property.Ref_Key}
                          >
                            {property.Имя ?? property.Description}
                          </SelectItem>
                        ),
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            name="guidsForSync.units.kilogram"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Базовая единица Килограмм</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите единицу" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {guidsFrom1C?.mainUnits?.map((property: any) => (
                        <SelectItem
                          key={property.Ref_Key}
                          value={property.Ref_Key}
                        >
                          {property.Description} - Код ЭСФ: {property.КодЭСФ}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            name="guidsForSync.units.piece"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Базовая единица Штука</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Выберите единицу" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {guidsFrom1C?.mainUnits?.map((property: any) => (
                        <SelectItem
                          key={property.Ref_Key}
                          value={property.Ref_Key}
                        >
                          {property.Description} - Код ЭСФ: {property.КодЭСФ}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button variant="default">Сохранить {isPending ? "..." : ""}</Button>
        </form>
      </Form>
      {/*<pre>{JSON.stringify({ guidsFrom1C }, null, 2)}</pre>*/}
    </div>
  );
};

export default SiteSettingsForm;
