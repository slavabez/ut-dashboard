"use client";

import React, { RefObject } from "react";
import { MapRef } from "react-map-gl/maplibre";

import AgentSelect from "@/app/(protected)/manager/employee-tracking/_components/agent-select";
import TrackingOrderList from "@/app/(protected)/manager/employee-tracking/_components/tracking-order-list";
import CustomDatePicker from "@/app/_components/custom-calendar-picker";
import { H1 } from "@/components/typography";
import { IOrder } from "@/lib/1c-adapter";
import { UserSelectNonSensitive } from "@/lib/common-types";

const TrackerForm = (props: {
  agents: UserSelectNonSensitive[];
  orders: IOrder[];
  mapRef: RefObject<MapRef>;
}) => {
  return (
    <section className="flex h-[calc(100vh-148px)] flex-col gap-4 overflow-auto p-4">
      <H1>Контроль передвижения т/а</H1>
      {/* TODO: Use labels instead for accessibility  */}
      <div className="flex items-center gap-4">
        <span className="w-40">Дата</span>
        <CustomDatePicker layout="horizontal" searchParamName="date" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-40">Торговый</span>
        <AgentSelect agents={props.agents} searchParamName="userId" />
      </div>

      <TrackingOrderList orders={props.orders} mapRef={props.mapRef} />
    </section>
  );
};

export default TrackerForm;
