import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const OrderStatusChart = ({ data = [] }) => {
  const COLORS = {
    pending: '#F59E0B',    // warning yellow
    confirmed: '#3B82F6',  // blue
    processing: '#8B5CF6', // purple
    shipped: '#F97316',    // orange
    delivered: '#22C55E',  // green
    cancelled: '#EF4444',  // red
  };

  const defaultColor = '#E8006F';

  return (
    <div className="w-full h-80 flex flex-col justify-center">
      <ResponsiveContainer width="100%" height={100}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.name.toLowerCase()] || defaultColor}
              />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} Orders`, 'Count']} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={8}
            formatter={(value) => (
              <span className="text-xs text-gray-700 capitalize font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OrderStatusChart;
