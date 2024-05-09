import React from "react";

import { getOrdersForUserByDateWithAdditionalFields } from "@/actions/orders";
import { getAllUsers } from "@/actions/user/all-users";
import TrackingPanels from "@/app/(protected)/manager/employee-tracking/_components/tracking-panels";
import { AdminPageWrapper, PageWrapper } from "@/components/layout-components";
import { H1 } from "@/components/typography";
import { Alert } from "@/components/ui/alert";
import { IOrder } from "@/lib/1c-adapter";

const EmployeeTrackingPage = async ({
  searchParams,
}: {
  searchParams: {
    date?: string;
    userId?: string;
  };
}) => {
  const { date, userId } = searchParams;
  const employeeListResponse = await getAllUsers();

  if (employeeListResponse.status === "error") {
    return (
      <PageWrapper>
        <H1>Контроль посещения</H1>
        <Alert variant="destructive">{employeeListResponse.error}</Alert>
      </PageWrapper>
    );
  }
  let orders: IOrder[] = [];
  if (date && userId) {
    const response = await getOrdersForUserByDateWithAdditionalFields(
      userId,
      date,
    );
    if (response.status === "error") {
      return (
        <PageWrapper>
          <H1>Контроль посещения</H1>
          <Alert variant="destructive">{response.error}</Alert>
        </PageWrapper>
      );
    }
    orders = response.data;
  }
  return (
    <AdminPageWrapper>
      <TrackingPanels orders={orders} users={employeeListResponse.data} />
    </AdminPageWrapper>
  );
};

export default EmployeeTrackingPage;
