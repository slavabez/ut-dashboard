"use client";

import { PageWrapper } from "../components/layout-components";
import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <PageWrapper>
          <Error />
        </PageWrapper>
      </body>
    </html>
  );
}
