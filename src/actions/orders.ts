"use server";

import { ConvertFrom1C, IOrder } from "@/lib/1c-adapter";
import { currentRole, currentUser } from "@/lib/auth";
import { IActionResponse } from "@/lib/common-types";
import {
  getMultipleOrderAdditionalProperties,
  getOrderContent,
  getOrderById as getOrderFrom1CById,
  getOrdersForUserByDate,
  getOrdersForUserByDeliveryDate,
} from "@/lib/odata/orders";

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

  const orders = await getOrdersForUserByDate({
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

  const orders = await getOrdersForUserByDeliveryDate({
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

  const orderDetails = await getOrderFrom1CById(orderId);
  const orderContent = await getOrderContent(orderId);

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

export async function getOrdersForUserForDate(
  userId: string,
  day: string,
): Promise<IActionResponse<IOrder[]>> {
  const role = await currentRole();

  if (!role || !["manager", "admin"].includes(role)) {
    return {
      status: "error",
      error: "Заказ не найден",
    };
  }

  if (!day.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return {
      status: "error",
      error: "Неверный формат даты",
    };
  }

  const ordersRaw = await getOrdersForUserByDate({
    userId,
    startDate: day,
    endDate: day,
  });
  const orders = ordersRaw.map(ConvertFrom1C.order);

  const additionalProperties = await getMultipleOrderAdditionalProperties(
    orders.map((o) => o.id),
  );

  const injectedOrders =
    await ConvertFrom1C.injectAdditionalPropertiesIntoOrders(
      orders,
      additionalProperties,
    );

  return {
    status: "success",
    data: injectedOrders,
  };
}
