"use server";

import { ConvertFrom1C, IOrder } from "@/lib/1c-adapter";
import { currentUser } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import { From1C } from "@/lib/odata";

export async function getOrdersByDate(
  day: string,
): Promise<IActionResponse<IOrder[]>> {
  const user = await currentUser();

  if (!user) {
    return {
      status: "error",
      error: "Вы не вошли",
    };
  }
  if (user.role === "client") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }
  if (!user.id) {
    return {
      status: "error",
      error: "Не удалось получить информацию о пользователе",
    };
  }

  // Verify the day parameter is in the correct format "YYYY-MM-DD"
  if (!day.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return {
      status: "error",
      error: "Неверный формат даты",
    };
  }

  const orders = await From1C.getOrdersForUserByDate({
    userId: user.id,
    startDate: day,
    endDate: day,
  });

  return {
    status: "success",
    data: orders.map(ConvertFrom1C.order),
  };
}

export async function getOrdersByDeliveryDate(
  day: string,
): Promise<IActionResponse<IOrder[]>> {
  const user = await currentUser();

  if (!user) {
    return {
      status: "error",
      error: "Вы не вошли",
    };
  }
  if (user.role === "client") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }
  if (!user.id) {
    return {
      status: "error",
      error: "Не удалось получить информацию о пользователе",
    };
  }

  // Verify the day parameter is in the correct format "YYYY-MM-DD"
  if (!day.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return {
      status: "error",
      error: "Неверный формат даты",
    };
  }

  const orders = await From1C.getOrdersForUserByDeliveryDate({
    userId: user.id,
    startDate: day,
    endDate: day,
  });

  return {
    status: "success",
    data: orders.map(ConvertFrom1C.order),
  };
}

export const getOrderById = async (
  orderId: string,
): Promise<IActionResponse<IOrder>> => {
  const user = await currentUser();

  if (!user) {
    return {
      status: "error",
      error: "Вы не вошли",
    };
  }
  if (user.role === "client") {
    return {
      status: "error",
      error: "У вас недостаточно прав для этого действия",
    };
  }
  if (!user.id) {
    return {
      status: "error",
      error: "Не удалось получить информацию о пользователе",
    };
  }

  const orderDetails = await From1C.getOrderById(orderId);
  const orderContent = await From1C.getOrderContent(orderId);

  if (orderDetails.length === 0) {
    return {
      status: "error",
      error: "Заказ не найден",
    };
  }
  const order = ConvertFrom1C.order(orderDetails[0]);
  order.items = orderContent.map(ConvertFrom1C.orderItem);

  return {
    status: "success",
    data: order,
  };
};
