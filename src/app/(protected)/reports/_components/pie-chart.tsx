"use client";

import "chart.js/auto";
import React from "react";
import { Pie } from "react-chartjs-2";

interface IPieChartProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor?: string[];
      borderWidth?: number;
    }[];
  };
}

const PieChart = (props: IPieChartProps) => {
  const { data } = props;
  // Inject the tailwind orange colors into the chart
  data.datasets[0].backgroundColor = [
    "rgb(255 237 213)",
    "rgb(254 215 170)",
    "rgb(253 186 116)",
    "rgb(251 146 60)",
    "rgb(249 115 22)",
    "rgb(234 88 12)",
    "rgb(194 65 12)",
    "rgb(154 52 18)",
  ].reverse();
  data.datasets[0].borderWidth = 1;
  return (
    <div className="w-full max-w-[500px] m-auto py-4">
      <Pie data={data} />
    </div>
  );
};

export default PieChart;
