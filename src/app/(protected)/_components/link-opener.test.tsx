import LinkOpener from "./link-opener";
import { fireEvent, render } from "@testing-library/react";
import mockRouter from "next-router-mock";
import { describe, expect, test } from "vitest";

describe("LinkOpener component", () => {
  test("Should handle click event and navigate given valid sale link", async () => {
    await mockRouter.push("/");
    const { getByPlaceholderText, getByText } = render(<LinkOpener />);

    const input = getByPlaceholderText("Ссылка в формате e1c://server/...");
    const button = getByText("Открыть");

    fireEvent.change(input, {
      target: {
        value:
          "e1c://server/10.8.10.7/УТ#e1cib/data/Документ.РеализацияТоваровУслуг?ref=89ab000c29dddd3811ed88195828755a",
      },
    });
    fireEvent.click(button);
    expect(mockRouter).toMatchObject({
      pathname: "/sale-document/5828755a-8819-11ed-89ab-000c29dddd38",
    });
  });

  test("Should handle click event and navigate given valid order link", async () => {
    await mockRouter.push("/");
    const { getByPlaceholderText, getByText } = render(<LinkOpener />);

    const input = getByPlaceholderText("Ссылка в формате e1c://server/...");
    const button = getByText("Открыть");

    fireEvent.change(input, {
      target: {
        value:
          "e1c://server/10.8.10.7/УТ#e1cib/data/Документ.ЗаказКлиента?ref=89ab000c29dddd3811ed88195828755a",
      },
    });
    fireEvent.click(button);
    expect(mockRouter).toMatchObject({
      pathname: "/orders/5828755a-8819-11ed-89ab-000c29dddd38",
    });
  });

  test("Should handle click event and navigate given valid nomenclature link", async () => {
    await mockRouter.push("/");
    const { getByPlaceholderText, getByText } = render(<LinkOpener />);

    const input = getByPlaceholderText("Ссылка в формате e1c://server/...");
    const button = getByText("Открыть");

    fireEvent.change(input, {
      target: {
        value:
          "e1c://server/10.8.10.7/УТ#e1cib/data/Справочник.Номенклатура?ref=89ab000c29dddd3811ed88195828755a",
      },
    });
    fireEvent.click(button);
    expect(mockRouter).toMatchObject({
      pathname: "/nomenclature/5828755a-8819-11ed-89ab-000c29dddd38",
    });
  });

  test("Should handle click event and navigate given invalid link", async () => {
    await mockRouter.push("/");
    const { getByPlaceholderText, getByText } = render(<LinkOpener />);

    const input = getByPlaceholderText("Ссылка в формате e1c://server/...");
    const button = getByText("Открыть");

    fireEvent.change(input, {
      target: {
        value:
          "e1c://server/10.8.10.7/УТ#e1cib/data/InvalidLink?ref=89ab000c29dddd3811ed88195828755a",
      },
    });
    fireEvent.click(button);
    expect(mockRouter).toMatchObject({
      pathname: "/",
    });
  });
});
