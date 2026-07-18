"use client";

import React from "react";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Card, CardContent } from "@/components/ui/card";

export interface StatsChartsData {
  byCountry: { name: string; count: number }[];
  byGenre: { name: string; value: number }[];
  history: { day: string; episodes: number }[];
}

const COLORS = [
  "oklch(0.68 0.22 18)",
  "oklch(0.82 0.16 75)",
  "oklch(0.74 0.14 195)",
  "oklch(0.78 0.18 295)",
  "oklch(0.76 0.17 145)",
];

const TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  color: "var(--text)",
  fontSize: "11px",
  padding: "6px 10px",
};

const TOOLTIP_LABEL_STYLE = {
  color: "var(--text-secondary)",
  fontSize: "10px",
};

const AXIS_STYLE = {
  fill: "var(--text-muted)",
  fontSize: 10,
  fontFamily: "var(--font-mono)",
};

export default function StatsCharts({ data }: { data: StatsChartsData }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Countries */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted">
            <BarChart3 size={14} className="text-primary" />
            Xem theo quốc gia
          </h3>
          <div className="h-64 w-full font-mono text-xs">
            {data.byCountry.length === 0 ? (
              <p className="pt-16 text-center text-text-muted">Chưa có dữ liệu.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.byCountry}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <XAxis dataKey="name" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                  <YAxis
                    tick={AXIS_STYLE}
                    tickLine={false}
                    axisLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={TOOLTIP_LABEL_STYLE}
                    cursor={{ fill: "var(--surface)" }}
                  />
                  <Bar dataKey="count" fill="oklch(0.68 0.22 18)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Genres */}
      <Card>
        <CardContent className="flex flex-col gap-4 p-5">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted">
            <PieChart size={14} className="text-secondary" />
            Số phim theo thể loại
          </h3>
          <div className="flex h-64 w-full flex-col items-center justify-between gap-4 sm:flex-row">
            {data.byGenre.length === 0 ? (
              <p className="w-full pt-16 text-center text-text-muted">Chưa có dữ liệu.</p>
            ) : (
              <>
                <div className="h-44 w-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={data.byGenre}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="var(--card)"
                      >
                        {data.byGenre.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex w-full shrink-0 flex-col gap-2 text-xs sm:w-auto">
                  {data.byGenre.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-3 sm:justify-start"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="font-semibold">{item.name}</span>
                      </div>
                      <span className="font-mono text-text-secondary">{item.value} phim</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 7-day history */}
      <Card className="md:col-span-2">
        <CardContent className="flex flex-col gap-4 p-5">
          <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-text-muted">
            <TrendingUp size={14} className="text-accent" />
            Số tập xem 7 ngày gần đây
          </h3>
          <div className="h-64 w-full font-mono text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
                <XAxis dataKey="day" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={TOOLTIP_LABEL_STYLE} />
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.74 0.14 195)" />
                    <stop offset="100%" stopColor="oklch(0.82 0.16 75)" />
                  </linearGradient>
                </defs>
                <Line
                  type="monotone"
                  dataKey="episodes"
                  stroke="url(#lineGradient)"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: "var(--card)" }}
                  activeDot={{ r: 6, fill: "oklch(0.82 0.16 75)" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
