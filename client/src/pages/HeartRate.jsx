import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

export default function HeartRate() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("day");

  // Mock data for heart rate
  const generateData = (points) => {
    const data = [];
    let base = 72;
    for (let i = 0; i < points; i++) {
      base += (Math.random() - 0.5) * 10;
      data.push(Math.round(base));
    }
    return data;
  };

  const timeRanges = {
    day: { label: "Today", points: 24, unit: "Hours" },
    week: { label: "This Week", points: 7, unit: "Days" },
    month: { label: "This Month", points: 30, unit: "Days" }
  };

  const currentRange = timeRanges[timeRange];
  const data = generateData(currentRange.points);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const avg = Math.round(data.reduce((a, b) => a + b, 0) / data.length);

  const GraphBar = ({ value, index, total }) => {
    const height = ((value - min) / (max - min)) * 100 + 20;
    const isMax = value === max;
    const isMin = value === min;

    return (
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${height}%` }}
        transition={{ delay: index * 0.02 }}
        className={`flex-1 mx-0.5 rounded-t-sm ${
          isMax ? "bg-pink" : isMin ? "bg-ok" : "bg-brand"
        }`}
        style={{ minHeight: "8px" }}
      />
    );
  };

  const InsightCard = ({ icon, title, value, trend, color }) => (
    <div className="bg-navy/50 border border-border rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`w-10 h-10 bg-${color}/20 rounded-full flex items-center justify-center`}>
          {icon}
        </div>
        <div>
          <p className="text-muted text-sm">{title}</p>
          <p className="text-xl font-bold text-white">{value}</p>
        </div>
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm ${trend.positive ? "text-ok" : "text-pink"}`}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            {trend.positive ? (
              <path d="M7 14l5-5 5 5H7z"/>
            ) : (
              <path d="M7 10l5 5 5-5H7z"/>
            )}
          </svg>
          <span>{trend.text}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-dvh bg-navy flex flex-col">
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 py-2 text-white text-sm">
        <span>09:41</span>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate("/home")} className="text-white">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Heart Rate</h1>
          <p className="text-muted text-sm">Track your cardiovascular health</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto space-y-6">
        {/* Current Heart Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-brand/20 to-brand/5 border border-brand/30 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-muted text-sm">Current Heart Rate</p>
              <p className="text-5xl font-extrabold text-white">72 BPM</p>
            </div>
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg className="w-20 h-20 text-pink" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </motion.div>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-ok/20 text-ok px-3 py-1 rounded-full text-sm font-semibold">Normal</span>
            <span className="text-muted text-sm">Resting rate</span>
          </div>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex gap-2 bg-navy/50 rounded-xl p-1">
            {Object.entries(timeRanges).map(([key, range]) => (
              <button
                key={key}
                onClick={() => setTimeRange(key)}
                className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                  timeRange === key ? "bg-brand text-white" : "text-muted"
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Graph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-navy/50 border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Heart Rate Trend</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-pink rounded-full" />
                <span className="text-muted">Max</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-ok rounded-full" />
                <span className="text-muted">Min</span>
              </div>
            </div>
          </div>
          <div className="h-40 flex items-end gap-1">
            {data.map((value, index) => (
              <GraphBar key={index} value={value} index={index} total={data.length} />
            ))}
          </div>
          <div className="mt-4 flex justify-between text-xs text-muted">
            <span>0 {currentRange.unit}</span>
            <span>{currentRange.points} {currentRange.unit}</span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 gap-4"
        >
          <InsightCard
            icon={<svg className="w-5 h-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            title="Average"
            value={`${avg} BPM`}
            trend={{ positive: true, text: "3% vs last week" }}
            color="brand"
          />
          <InsightCard
            icon={<svg className="w-5 h-5 text-pink" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
            title="Peak"
            value={`${max} BPM`}
            color="pink"
          />
          <InsightCard
            icon={<svg className="w-5 h-5 text-ok" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>}
            title="Lowest"
            value={`${min} BPM`}
            color="ok"
          />
          <InsightCard
            icon={<svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            title="Variability"
            value="Normal"
            trend={{ positive: true, text: "Good recovery" }}
            color="purple"
          />
        </motion.div>

        {/* Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-navy/50 border border-border rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Insights</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-ok/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-ok" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </div>
              <p className="text-muted text-sm">Your resting heart rate is within the healthy range for your age group.</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-brand/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-brand" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                </svg>
              </div>
              <p className="text-muted text-sm">Heart rate variability indicates good stress recovery capabilities.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
