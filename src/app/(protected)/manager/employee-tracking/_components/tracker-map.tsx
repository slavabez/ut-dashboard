"use client";

import React, { useEffect, useRef, useState } from "react";
import Map, { MapRef, Marker } from "react-map-gl/maplibre";

import { Badge } from "@/components/ui/badge";
import { IOrder } from "@/lib/1c-adapter";
import {
  calculateGeoAverages,
  sortOrdersByAgentDateCreated,
} from "@/lib/utils";

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

const TrackerMap = (props: { orders: IOrder[] }) => {
  const [center, setCenter] = useState(calculateGeoAverages(props.orders));
  const [orderedOrders, setOrderedOrders] = useState(
    sortOrdersByAgentDateCreated(props.orders),
  );
  const [points, setPoints] = useState(
    orderedOrders
      .filter((o) => o.additionalProperties?.lon && o.additionalProperties?.lat)
      .map(orderToPoint),
  );
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    const newCenter = calculateGeoAverages(props.orders);
    const newOrderedOrders = sortOrdersByAgentDateCreated(props.orders);
    const newPoints = newOrderedOrders
      .filter((o) => o.additionalProperties?.lon && o.additionalProperties?.lat)
      .map(orderToPoint);
    setCenter(newCenter);
    setOrderedOrders(newOrderedOrders);
    setPoints(newPoints);
    if (mapRef.current) {
      mapRef.current.zoomTo(newCenter?.zoom ?? 12);
      mapRef.current.flyTo({
        zoom: newCenter?.zoom,
        center: {
          lat: newCenter?.avgLat ?? 0,
          lon: newCenter?.avgLon ?? 0,
        },
      });
    }
  }, [props.orders]);

  return (
    <Map
      style={{ width: "100%", height: "100%" }}
      mapStyle="https://api.maptiler.com/maps/streets/style.json?key=v2F8RKCf0TAnZymstnbL"
      initialViewState={{
        zoom: center?.zoom,
        latitude: center?.avgLat,
        longitude: center?.avgLon,
      }}
      ref={mapRef}
    >
      {/*<Source id="path" type="geojson" data={path}>*/}
      {/*  <Layer*/}
      {/*    id="line"*/}
      {/*    type="line"*/}
      {/*    layout={{*/}
      {/*      "line-join": "round",*/}
      {/*      "line-cap": "round",*/}
      {/*    }}*/}
      {/*    paint={{*/}
      {/*      "line-color": "#888",*/}
      {/*      "line-width": 8,*/}
      {/*    }}*/}
      {/*  />*/}
      {/*</Source>*/}
      {points.map((point, index) => (
        <Marker
          key={index}
          longitude={point.geometry.coordinates[0]}
          latitude={point.geometry.coordinates[1]}
          anchor="bottom"
        >
          {/* Customize your marker here, e.g., an SVG or an icon */}
          <Badge>{index + 1}</Badge>
        </Marker>
      ))}
    </Map>
  );
};

export default TrackerMap;
