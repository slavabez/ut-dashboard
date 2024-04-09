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
    "#e11d48",
    "#d946ef",
    "#8b5cf6",
    "#3b82f6",
    "#10b981",
    "#84cc16",
    "#f97316",
    "#ef4444",
  ].reverse();
  data.datasets[0].borderWidth = 1;
  return (
    <div className="m-auto w-full max-w-[500px] py-4">
      <Pie data={data} />
    </div>
  );
};

export default PieChart;
