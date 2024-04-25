import Breadcrumbs from "./breadcrumbs";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

describe("Breadcrumbs", () => {
  beforeEach(() => {
    render(<Breadcrumbs />);
  });

  afterEach(cleanup);

  it("renders Breadcrumbs without crashing", () => {
    const breadcrumb = screen.getByRole("navigation");
    expect(breadcrumb).toBeDefined();
  });
});
