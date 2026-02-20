import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const tokenData = [
  { time: '09:00', tokens: 120 },
  { time: '10:00', tokens: 300 },
  { time: '11:00', tokens: 850 },
  { time: '12:00', tokens: 420 },
  { time: '13:00', tokens: 600 },
  { time: '14:00', tokens: 1200 },
  { time: '15:00', tokens: 900 },
];

const modelUsage = [
  { name: 'Flash', usage: 65 },
  { name: 'Pro', usage: 35 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-studio-800 border border-studio-700 p-2 rounded shadow-lg">
        <p className="text-studio-200 text-xs font-mono">{label}</p>
        <p className="text-blue-400 text-sm font-bold">
          {payload[0].value} tokens
        </p>
      </div>
    );
  }
  return null;
};

const DashboardView = () => {
  return (
    <div className="p-8 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-white mb-6">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
            { label: 'Total Requests', value: '1,248', change: '+12%', color: 'text-blue-400' },
            { label: 'Avg. Latency', value: '840ms', change: '-5%', color: 'text-green-400' },
            { label: 'Token Usage', value: '4.2M', change: '+8%', color: 'text-purple-400' },
            { label: 'Error Rate', value: '0.1%', change: '-2%', color: 'text-studio-200' },
        ].map((stat, i) => (
            <div key={i} className="bg-studio-900 border border-studio-800 p-5 rounded-xl">
                <p className="text-studio-400 text-sm font-medium">{stat.label}</p>
                <div className="flex items-end justify-between mt-2">
                    <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                    <span className={`text-xs font-medium bg-studio-800 px-2 py-1 rounded ${stat.color}`}>
                        {stat.change}
                    </span>
                </div>
            </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-studio-900 border border-studio-800 rounded-xl p-6 h-80">
          <h3 className="text-lg font-semibold text-white mb-6">Token Consumption (Last 6 Hours)</h3>
          <ResponsiveContainer width="100%" height="80%">
            <AreaChart data={tokenData}>
              <defs>
                <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="tokens" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-studio-900 border border-studio-800 rounded-xl p-6 h-80">
          <h3 className="text-lg font-semibold text-white mb-6">Model Distribution</h3>
          <ResponsiveContainer width="100%" height="80%">
            <BarChart data={modelUsage} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
              <XAxis type="number" stroke="#64748b" fontSize={12} hide />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={14} width={50} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: '#334155', opacity: 0.4}}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              />
              <Bar dataKey="usage" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;