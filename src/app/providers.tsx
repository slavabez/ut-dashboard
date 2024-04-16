"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { ReactNode, useEffect } from "react";

import { useCurrentUser } from "@/hooks/use-current-user";

if (typeof window !== "undefined") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: "/ingest",
    ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "",
  });
}
export function CSPostHogProvider({ children }: any) {
  return (
    <PostHogProvider client={posthog}>
      <PostHogAuthWeapper>{children}</PostHogAuthWeapper>
    </PostHogProvider>
  );
}

function PostHogAuthWeapper({ children }: { children: ReactNode }) {
  const user = useCurrentUser();
  useEffect(() => {
    if (user?.name) {
      posthog.identify(user.name, user);
    } else {
      posthog.reset();
    }
  }, [user]);
  return children;
}
