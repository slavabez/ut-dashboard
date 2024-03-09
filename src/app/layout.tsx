import "./globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import Link from "next/link";

import UserAvatarMenu from "@/app/(protected)/_components/user-avatar-menu";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import { auth } from "@/auth";
import { siteConfig } from "@/siteConfig";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <html lang="ru">
        <body
          className={`${inter.className} w-screen max-w-full min-h-screen flex flex-col`}
        >
          <header className="w-full bg-orange-500 text-white flex flex-col p-4">
            <div className="max-w-[800px] mx-auto flex justify-between w-full items-center">
              <Link className="text-2xl" href="/">
                Сказка
              </Link>
              <UserAvatarMenu />
            </div>
          </header>
          <Breadcrumbs />
          <main className="max-w-[800px] w-full mx-auto h-full justify-center items-center flex-grow">
            {children}
          </main>
          <footer className="bg-orange-500 text-white p-2">
            <div className="max-w-[800px] mx-auto text-center">
              Сказка, панель управления
            </div>
          </footer>
        </body>
      </html>
    </SessionProvider>
  );
}
