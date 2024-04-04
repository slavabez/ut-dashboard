import { env } from "@/env.js";

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
  [
    "/admin/nomenclature",
    {
      id: "admin/nomenclature",
      name: "Номенклатура",
      href: "/admin/nomenclature",
    },
  ],
  [
    "/admin/prices",
    {
      id: "admin/prices",
      name: "Настройки цен",
      href: "/admin/prices",
    },
  ],
  [
    "/admin/site-settings",
    {
      id: "admin/site-settings",
      name: "Настройки сайта",
      href: "/admin/site-settings",
    },
  ],
  [
    "/orders",
    {
      id: "orders",
      name: "Сверка заказов",
      href: "/orders",
    },
  ],
  [
    "/orders/by-date",
    {
      id: "/orders/by-date",
      name: "Заказы по дате создания",
      href: "/orders/by-date",
    },
  ],
  [
    "/orders/by-delivery-date",
    {
      id: "/orders/by-delivery-date",
      name: "Заказы по дате доставки",
      href: "/orders/by-delivery-date",
    },
  ],
  [
    "/reports",
    {
      id: "/reports",
      name: "Отчёты по продажам",
      href: "/reports",
    },
  ],
  [
    "/reports/sales-by-goods",
    {
      id: "/reports/sales-by-goods",
      name: "Продажи по товарам",
      href: "/reports/sales-by-goods",
    },
  ],
  [
    "/reports/sales-by-clients",
    {
      id: "/reports/sales-by-clients",
      name: "Продажи по клиентам",
      href: "/reports/sales-by-clients",
    },
  ],
  [
    "/reports/sales-by-clients-and-goods",
    {
      id: "/reports/sales-by-clients-and-goods",
      name: "Продажи по клиентам и товарам",
      href: "/reports/sales-by-clients-and-goods",
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
      allNavItems.get("/profile")!,
      allNavItems.get("/orders")!,
      allNavItems.get("/reports")!,
    ],
  ],
  [
    "/admin",
    [
      allNavItems.get("/admin/sync")!,
      allNavItems.get("/admin/users")!,
      allNavItems.get("/admin/nomenclature")!,
      allNavItems.get("/admin/prices")!,
    ],
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
  [
    "/orders",
    [
      allNavItems.get("/orders/by-date")!,
      allNavItems.get("/orders/by-delivery-date")!,
    ],
  ],
  [
    "/reports",
    [
      allNavItems.get("/reports/sales-by-goods")!,
      allNavItems.get("/reports/sales-by-clients")!,
      allNavItems.get("/reports/sales-by-clients-and-goods")!,
    ],
  ],
]);

export const getSubNavItems = (path: string): INavItem[] => {
  return subNavItems.get(path) ?? [];
};
