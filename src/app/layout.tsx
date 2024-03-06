import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

import { siteConfig } from "@/siteConfig";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${inter.className} w-screen min-h-screen flex flex-col`}
      >
        <header className="w-full bg-orange-500 text-white flex flex-col p-4">
          <Link className="text-2xl" href="/">
            Сказка
          </Link>
        </header>
        <nav className="flex h-5 items-center p-4 space-x-4 text-lg w-full justify-between">
          <Link href="/panel" className="">
            Для торговых
          </Link>
          <Link href="/user">Для клиентов</Link>
        </nav>
        <main className="w-full h-full justify-center items-center flex-grow">
          {children}
        </main>
        <footer>Footer</footer>
      </body>
    </html>
  );
}
