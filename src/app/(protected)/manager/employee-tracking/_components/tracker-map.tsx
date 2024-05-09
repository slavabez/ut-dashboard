"use client";

import React, { forwardRef } from "react";
import Map, { MapRef, Marker } from "react-map-gl/maplibre";

import { Badge } from "@/components/ui/badge";
import { IOrder } from "@/lib/1c-adapter";

const orderToPoint = (order: IOrder): any => {
  return {
    type: "Feature",
    name: order.partner,
    geometry: {
      type: "Point",
      coordinates: [
        order.additionalProperties?.lon,
        order.additionalProperties?.lat,
      ],
    },
  };
};

const TrackerMap = forwardRef<
  MapRef,
  {
    orders: IOrder[];
    initialViewState: {
      latitude: number;
      longitude: number;
      zoom: number;
    };
  }
>((props, ref) => {
  const points = props.orders
    .filter((o) => o.additionalProperties?.lon && o.additionalProperties?.lat)
    .map(orderToPoint);
  return (
    <Map
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://api.maptiler.com/maps/streets/style.json?key=v2F8RKCf0TAnZymstnbL"
      initialViewState={{
        ...props.initialViewState,
      }}
      ref={ref}
    >
      {points.map((point, index) => (
        <Marker
          key={index}
          longitude={point.geometry.coordinates[0]}
          latitude={point.geometry.coordinates[1]}
          anchor="bottom"
        >
          <Badge>{index + 1}</Badge>
        </Marker>
      ))}
    </Map>
  );
});

TrackerMap.displayName = "TrackerMap";

export default TrackerMap;
