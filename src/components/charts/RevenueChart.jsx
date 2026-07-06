import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const RevenueChart = ({ data = [] }) => {
  const formatYAxis = (tickItem) => {
    return `₹${tickItem}`;
  };

  const formatTooltip = (value) => {
    return [`₹${value.toLocaleString('en-IN')}`, 'Revenue'];
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#E8006F" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#E8006F" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#FFCCE5" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#555555"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#555555"
            fontSize={11}
            tickFormatter={formatYAxis}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip formatter={formatTooltip} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#E8006F"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRevenue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
