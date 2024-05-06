import { CalendarDays, Truck } from "lucide-react";
import Link from "next/link";
import React from "react";

import { getAllUsers } from "@/actions/user/all-users";
import EmployeeTracker from "@/app/(protected)/manager/_components/employee-tracker";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const ManagerHomePage = async () => {
  const employeeListResponse = await getAllUsers();
  if (employeeListResponse.status === "error") {
    return (
      <div className="p-4">
        <h1 className="mb-8 mt-2 text-center text-2xl font-semibold">
          Раздел для супервайзеров
        </h1>
        <Alert variant="destructive">{employeeListResponse.error}</Alert>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="mb-8 mt-2 text-center text-2xl font-semibold">
        Раздел для супервайзеров
      </h1>
      <nav className="flex flex-col gap-4">
        <Button asChild>
          <Link className="" href="/orders/by-date">
            <CalendarDays className="mr-2" /> По дате создания заказа
          </Link>
        </Button>
        <Button asChild>
          <Link className="" href="/orders/by-delivery-date">
            <Truck className="mr-2" /> По дате доставки заказа
          </Link>
        </Button>
      </nav>
      <EmployeeTracker employees={employeeListResponse.data} />
    </div>
  );
};

export default ManagerHomePage;
