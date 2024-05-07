import React from "react";

import { getOrdersForUserByDateWithAdditionalFields } from "@/actions/orders";
import { getAllUsers } from "@/actions/user/all-users";
import TrackerForm from "@/app/(protected)/manager/employee-tracking/_components/tracker-form";
import TrackerMap from "@/app/(protected)/manager/employee-tracking/_components/tracker-map";
import { AdminPageWrapper, PageWrapper } from "@/components/layout-components";
import { H1 } from "@/components/typography";
import { Alert } from "@/components/ui/alert";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";
import { IOrder } from "@/lib/1c-adapter";

const EmployeeTrackingPage = async () => {
  return (
    <AdminPageWrapper>
      <ResizablePanelGroup
        direction="horizontal"
        className="max-h-[calc(100vh-148px)]"
      >
        <ResizablePanel defaultSize={50}>
          <Skeleton />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50}>
          <Skeleton />
        </ResizablePanel>
      </ResizablePanelGroup>
    </AdminPageWrapper>
  );
};

export default EmployeeTrackingPage;
