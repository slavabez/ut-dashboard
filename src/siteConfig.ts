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
    base: env.NEXT_PUBLIC_APP_URL,
    author: "https://bezgachev.com",
  },
  links: {
    github: "",
  },
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,
};
