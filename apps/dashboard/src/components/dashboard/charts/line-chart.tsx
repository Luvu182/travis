'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from 'next-themes';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  data: { timestamp: number; value: number }[];
  label: string;
  color?: string;
  fill?: boolean;
}

export const LineChart = React.memo(function LineChart({
  data,
  label,
  color = 'hsl(220, 70%, 50%)',
  fill = false,
}: LineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = {
    labels: data.map((d) =>
      new Date(d.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      })
    ),
    datasets: [
      {
        label,
        data: data.map((d) => d.value),
        borderColor: color,
        backgroundColor: fill ? `${color}33` : 'transparent',
        fill,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        titleColor: isDark ? '#f9fafb' : '#111827',
        bodyColor: isDark ? '#f9fafb' : '#111827',
        borderColor: isDark ? '#374151' : '#e5e7eb',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 6,
          color: isDark ? '#9ca3af' : '#6b7280',
        },
      },
      y: {
        grid: {
          color: isDark ? '#374151' : '#e5e7eb',
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  };

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
});
