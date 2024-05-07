import React from "react";

import { AdminPageWrapper } from "@/components/layout-components";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Skeleton } from "@/components/ui/skeleton";

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
