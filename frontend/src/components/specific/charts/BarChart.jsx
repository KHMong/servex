import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ labels, data, label, color = "#4ADE80" }) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: label,
        data: data,
        backgroundColor: color,
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, grid: { display: false } },
      x: { grid: { display: false } }
    },
  };

  return <div style={{ height: '250px' }}><Bar options={options} data={chartData} /></div>;
};

export default BarChart;