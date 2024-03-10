import { env } from "@/env.mjs";

export type SiteConfig = {
  name: string;
  author: string;
  description: string;
  keywords: Array<string>;
  url: {
    base: string;
    author: string;
  };
  links: {
    github: string;
  };
  ogImage: string;
};

export const siteConfig: SiteConfig = {
  name: "Панель управления Сказка",
  author: "Slava",
  description: "Панель управления для ИП Бегачева О.А., г. Кокшетау, Казахстан",
  keywords: [],
  url: {
    base: env.NEXT_PUBLIC_APP_URL ?? "",
    author: "https://bezgachev.com",
  },
  links: {
    github: "",
  },
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,
};

export interface INavItem {
  id: string;
  name: string;
  href: string;
}

export interface IBreadcrumbItem {
  id: string;
  name: string;
  href?: string;
  subItems?: INavItem[];
}

interface IPageMeta {
  breadcrumbs: IBreadcrumbItem[];
}

export const allNavItems: Map<string, INavItem> = new Map([
  [
    "/",
    {
      id: "home",
      name: "Главная",
      href: "/",
    },
  ],
  [
    "/auth/register",
    {
      id: "register",
      name: "Регистрация",
      href: "/auth/register",
    },
  ],
  [
    "/auth/login",
    {
      id: "login",
      name: "Вход",
      href: "/auth/login",
    },
  ],
  [
    "/profile",
    {
      id: "profile",
      name: "Профиль",
      href: "/profile",
    },
  ],
  [
    "/admin",
    {
      id: "admin",
      name: "Админка",
      href: "/admin",
    },
  ],
  [
    "/admin/users",
    {
      id: "users",
      name: "Пользователи",
      href: "/admin/users",
    },
  ],
  [
    "/admin/sync",
    {
      id: "sync",
      name: "Синхронизация",
      href: "/admin/sync",
    },
  ],
  [
    "/admin/sync/manufacturers",
    {
      id: "manufacturers",
      name: "Производители",
      href: "/admin/sync/manufacturers",
    },
  ],
  [
    "/admin/sync/measurement-units",
    {
      id: "measurement-units",
      name: "Ед. измерения",
      href: "/admin/sync/measurement-units",
    },
  ],
  [
    "/admin/sync/nomenclature",
    {
      id: "nomenclature",
      name: "Номенклатура",
      href: "/admin/sync/nomenclature",
    },
  ],
  [
    "/admin/sync/nomenclature-types",
    {
      id: "nomenclature-types",
      name: "Виды номенклатуры",
      href: "/admin/sync/nomenclature-types",
    },
  ],
  [
    "/admin/sync/prices",
    {
      id: "prices",
      name: "Цены",
      href: "/admin/sync/prices",
    },
  ],
  [
    "/admin/sync/stock",
    {
      id: "stock",
      name: "Остатки",
      href: "/admin/sync/stock",
    },
  ],
]);

export const getBreadcrumbsForPath = (path: string): IBreadcrumbItem[] => {
  const pathParts = path.split("/").filter((p) => p);
  const breadcrumbs: IBreadcrumbItem[] = [allNavItems.get("/")!];
  let href = "";
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    href += `/${part}`;
    const item = allNavItems.get(href);
    if (item) {
      breadcrumbs.push({
        id: item.id,
        name: item.name,
        href,
      });
    }
  }
  return breadcrumbs;
};

export const subNavItems = new Map<string, INavItem[]>([
  [
    "/",
    [
      allNavItems.get("/auth/register")!,
      allNavItems.get("/auth/login")!,
      allNavItems.get("/profile")!,
      allNavItems.get("/admin")!,
    ],
  ],
  [
    "/admin",
    [allNavItems.get("/admin/sync")!, allNavItems.get("/admin/users")!],
  ],
  [
    "/admin/sync",
    [
      allNavItems.get("/admin/sync/manufacturers")!,
      allNavItems.get("/admin/sync/measurement-units")!,
      allNavItems.get("/admin/sync/nomenclature")!,
      allNavItems.get("/admin/sync/nomenclature-types")!,
      allNavItems.get("/admin/sync/prices")!,
      allNavItems.get("/admin/sync/stock")!,
    ],
  ],
]);

export const getSubNavItems = (path: string): INavItem[] => {
  return subNavItems.get(path) ?? [];
};
