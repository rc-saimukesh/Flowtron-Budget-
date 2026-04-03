"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatINR } from "@/context/BudgetContext";

interface DataPoint {
  name: string;
  value: number;
  color: string;
}

interface Props {
  data: DataPoint[];
  total: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface rounded-xl p-3 shadow-warm text-xs">
      <p className="font-bold text-primary">{payload[0].name}</p>
      <p className="text-on-surface-muted mt-1">
        {formatINR(payload[0].value)}
      </p>
    </div>
  );
};

export default function SpendingDonutChart({ data, total }: Props) {
  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="flex items-center justify-center h-[220px]">
        <p className="text-xs text-on-surface-muted">No spending data yet</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-xs text-on-surface-muted">Total Spent</p>
        <p className="text-lg font-bold text-primary">
          {formatINR(total)}
        </p>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-xs text-on-surface-muted">{d.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}