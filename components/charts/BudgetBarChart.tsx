"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DataPoint {
  name: string;
  budgeted: number;
  actual: number;
}

interface Props {
  data: DataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-surface rounded-xl p-3 shadow-warm text-xs">
      <p className="font-bold text-primary mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: p.fill }}
          />
          <span className="text-on-surface-muted capitalize">{p.name}:</span>
          <span className="font-semibold text-primary">
            ₹{p.value.toLocaleString("en-IN")}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function BudgetBarChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        barCategoryGap="30%"
        barGap={4}
      >
        <XAxis
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#a79e9c", fontFamily: "Manrope" }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 10, fill: "#a79e9c", fontFamily: "Manrope" }}
          tickFormatter={(v) =>
            v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
          }
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "transparent" }} />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{
            fontSize: "11px",
            fontFamily: "Manrope",
            color: "#a79e9c",
          }}
        />
        <Bar
          dataKey="budgeted"
          fill="#e5e2e0"
          radius={[4, 4, 0, 0]}
          name="Budgeted"
        />
        <Bar
          dataKey="actual"
          fill="#b58863"
          radius={[4, 4, 0, 0]}
          name="Actual"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}