'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Line
} from 'recharts';

export type ChartPeriod = 'daily' | 'monthly';

export interface SalesDataPoint {
  label: string;
  sales: number;
  revenue: number;
}

interface SalesChartProps {
  data: SalesDataPoint[];
  period: ChartPeriod;
  onPeriodChange: (period: ChartPeriod) => void;
  loading?: boolean;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 dark:text-white">{`${label}`}</p>
        <p className="text-blue-600 dark:text-blue-400">
          {`Sales: ${payload[0].value}`}
        </p>
        <p className="text-green-600 dark:text-green-400">
          {`Revenue: ₵${payload[1].value.toLocaleString()}`}
        </p>
      </div>
    );
  }
  return null;
};

export default function SalesChart({ data, period, onPeriodChange, loading = false }: SalesChartProps) {
  const getPeriodLabel = (period: ChartPeriod) => {
    switch (period) {
      case 'daily':
        return 'Daily';
      case 'monthly':
        return 'Monthly';
      default:
        return 'Daily';
    }
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-300">Loading chart data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      {/* Chart Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Sales Analytics</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {getPeriodLabel(period)} sales performance overview
          </p>
        </div>
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {(['daily', 'weekly', 'monthly'] as ChartPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                period === p
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
              }`}
            >
              {getPeriodLabel(p)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-96">
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
              <p className="text-gray-600 dark:text-gray-300">
                No sales data available for {getPeriodLabel(period)} view
              </p>
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis 
                dataKey="label" 
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="left"
                stroke="#3B82F6"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Sales Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#6B7280' } }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#10B981"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: 'Revenue (₵)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle', fill: '#6B7280' } }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36}
                wrapperStyle={{ paddingBottom: '10px' }}
              />
              <Bar 
                yAxisId="left"
                dataKey="sales" 
                fill="#3B82F6" 
                radius={[4, 4, 0, 0]}
                name="Sales Count"
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="revenue" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
                name="Revenue (₵)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Summary Stats */}
      {data.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Sales</p>
                <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {data.reduce((sum, item) => sum + item.sales, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Total Revenue</p>
                <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                  ₵{data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Average Revenue</p>
                <p className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  ₵{Math.round(data.reduce((sum, item) => sum + item.revenue, 0) / data.length).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 