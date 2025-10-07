// app/(protected)/dashboard/page.tsx
"use client";

import { Box, Card, CardContent, Typography } from "@mui/material";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  // Random data
  const lineData = Array.from({ length: 5 }, (_, i) => ({
    name: `Month ${i + 1}`,
    value: Math.floor(Math.random() * 1000),
  }));

  const barData = [
    { name: "Product A", sales: Math.floor(Math.random() * 500) },
    { name: "Product B", sales: Math.floor(Math.random() * 500) },
    { name: "Product C", sales: Math.floor(Math.random() * 500) },
  ];

  const pieData = [
    { name: "Chrome", value: Math.floor(Math.random() * 400) },
    { name: "Firefox", value: Math.floor(Math.random() * 300) },
    { name: "Safari", value: Math.floor(Math.random() * 200) },
    { name: "Others", value: Math.floor(Math.random() * 100) },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        p: 3,
        backgroundColor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography variant="h4">Dashboard</Typography>

      {/* Charts container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          flexGrow: 1,
        }}
      >
        {/* Line Chart */}
        <Card sx={{ flex: 1, p: 2, minHeight: 300 }}>
          <Typography variant="h6" mb={2}>
            Line Chart
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#1976d2"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Bar Chart */}
        <Card sx={{ flex: 1, p: 2, minHeight: 300 }}>
          <Typography variant="h6" mb={2}>
            Bar Chart
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#00C49F" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Pie Chart */}
        <Card sx={{ flex: 1, p: 2, minHeight: 300 }}>
          <Typography variant="h6" mb={2}>
            Pie Chart
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </Box>
    </Box>
  );
}
