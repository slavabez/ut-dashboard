import { useRouter } from "next-router-mock";
import { afterAll, beforeAll, vi } from "vitest";

beforeAll(() => {
  vi.mock("next/navigation", () => ({
    useRouter,
    usePathname: vi.fn().mockImplementation(() => {
      const router = useRouter();
      return router.asPath;
    }),
    useSearchParams: vi.fn().mockImplementation(() => {
      const router = useRouter();
      return new URLSearchParams(router.query as unknown as string);
    }),
  }));
});

afterAll(() => {
  vi.clearAllMocks();
});
