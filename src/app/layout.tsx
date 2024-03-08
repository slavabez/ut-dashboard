import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";

import Breadcrumbs from "@/app/_components/breadcrumbs";
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
        className={`${inter.className} w-screen max-w-full min-h-screen flex flex-col`}
      >
        <header className="w-full bg-orange-500 text-white flex flex-col p-2">
          <div className="max-w-[800px] mx-auto">
            <Link className="text-2xl" href="/">
              Сказка
            </Link>
          </div>
        </header>
        <Breadcrumbs />
        <main className="max-w-[800px] w-full mx-auto h-full justify-center items-center flex-grow">
          {children}
        </main>
        <footer className="bg-orange-500 text-white p-2">
          <div className="max-w-[800px] mx-auto">Footer</div>
        </footer>
      </body>
    </html>
  );
}
