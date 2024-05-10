"use client";

import React, { useEffect, useRef } from "react";
import { MapRef } from "react-map-gl/maplibre";

import TrackerForm from "@/app/(protected)/manager/employee-tracking/_components/tracker-form";
import TrackerMap from "@/app/(protected)/manager/employee-tracking/_components/tracker-map";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { IOrder } from "@/lib/1c-adapter";
import { UserSelectNonSensitive } from "@/lib/common-types";
import {
  calculateGeoAverages,
  sortOrdersByAgentDateCreated,
} from "@/lib/utils";

const TrackingPanels = (props: {
  orders: IOrder[];
  users: UserSelectNonSensitive[];
}) => {
  const mapRef = useRef<MapRef>(null);
  const orderedOrders = sortOrdersByAgentDateCreated(props.orders);
  const center = calculateGeoAverages(orderedOrders);

  useEffect(() => {
    if (mapRef?.current) {
      mapRef.current.zoomTo(center?.zoom ?? 12);
      mapRef.current.flyTo({
        zoom: center?.zoom ?? 12,
        center: {
          lat: center?.avgLat ?? 53.29,
          lon: center?.avgLon ?? 69.39331,
        },
      });
    }
  }, [props.orders]);

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="max-h-[calc(100vh-148px)]"
    >
      <ResizablePanel defaultSize={50}>
        <TrackerMap
          orders={orderedOrders}
          ref={mapRef}
          initialViewState={{
            zoom: center?.zoom ?? 12,
            latitude: center?.avgLat ?? 53.29,
            longitude: center?.avgLon ?? 69.39331,
          }}
        />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={50}>
        <TrackerForm
          agents={props.users}
          orders={orderedOrders}
          mapRef={mapRef}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

TrackingPanels.displayName = "TrackingPanels";

export default TrackingPanels;
