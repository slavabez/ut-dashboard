import packageJson from "../../package.json";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import Link from "next/link";
import React, { ReactNode } from "react";

import UserAvatarMenu from "@/app/(protected)/_components/user-avatar-menu";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import { CSPostHogProvider } from "@/app/providers";
import { auth } from "@/auth";
import { siteConfig } from "@/site-config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const session = await auth();
  return (
    <html lang="ru">
      <body
        className={`${inter.className} flex min-h-screen w-screen max-w-full flex-col`}
      >
        <SessionProvider session={session}>
          <CSPostHogProvider>
            <header className="flex w-full flex-col bg-orange-500 p-4 text-white">
              <div className="mx-auto flex w-full max-w-[800px] items-center justify-between">
                <Link className="text-2xl" href="/">
                  Сказка
                </Link>
                <UserAvatarMenu />
              </div>
            </header>
            <Breadcrumbs />
            {children}
            <footer className="bg-orange-500 p-2 text-white">
              <div className="mx-auto max-w-[800px] text-center">
                Сказка, панель управления, {packageJson.version}, 2024
              </div>
            </footer>
          </CSPostHogProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
