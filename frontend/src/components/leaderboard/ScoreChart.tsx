import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ScoreHistory } from "@/types";
import { format } from "date-fns";

interface ScoreChartProps {
  history: ScoreHistory[];
}

export function ScoreChart({ history }: ScoreChartProps) {
  const data = history.map((h) => ({
    ...h,
    dateLabel: format(new Date(h.date), "MMM d"),
  }));

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(160, 10%, 15%)"
          />
          <XAxis
            dataKey="dateLabel"
            tick={{ fontSize: 11, fill: "hsl(160, 10%, 55%)" }}
            axisLine={{ stroke: "hsl(160, 15%, 15%)" }}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "hsl(160, 10%, 55%)" }}
            axisLine={{ stroke: "hsl(160, 15%, 15%)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(160, 15%, 7%)",
              border: "1px solid hsl(160, 15%, 15%)",
              borderRadius: "0.5rem",
              color: "hsl(48, 20%, 90%)",
              fontSize: 12,
            }}
            formatter={(value: number) => [`${value} pts`, "Score"]}
          />
          <Line
            type="monotone"
            dataKey="total_points"
            stroke="#d4a017"
            strokeWidth={2}
            dot={{
              fill: "#d4a017",
              strokeWidth: 0,
              r: 4,
            }}
            activeDot={{
              r: 6,
              fill: "#f0c940",
              strokeWidth: 0,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
