'use client';

import React, { useMemo } from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, startOfMonth, eachMonthOfInterval, subYears, addMonths } from 'date-fns';

const MonthlyTrendChart: React.FC = () => {
  const { dailyEntries } = useCalendarStore();

  const chartData = useMemo(() => {
    const today = new Date();
    const twelveMonthsAgo = subYears(today, 1);
    const months = eachMonthOfInterval({
      start: startOfMonth(twelveMonthsAgo),
      end: startOfMonth(today),
    });

    return months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = addMonths(monthStart, 1);

      const entriesInMonth = dailyEntries.filter(entry => {
        const entryDate = new Date(entry.entry_date);
        return entryDate >= monthStart && entryDate < monthEnd;
      });

      const totalTarget = entriesInMonth.reduce((sum, entry) => sum + entry.target_hours, 0);
      const totalActual = entriesInMonth.reduce((sum, entry) => sum + entry.actual_hours, 0);

      return {
        name: format(month, 'MMM yy'),
        Target: totalTarget,
        Actual: totalActual,
      };
    });
  }, [dailyEntries]);

  return (
    <div className="p-4 shadow-md rounded-lg bg-white dark:bg-gray-800">
      <h3 className="font-semibold text-lg mb-4">Monthly Target vs. Actual (Last 12 Months)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Target" fill="#8884d8" />
          <Bar dataKey="Actual" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyTrendChart;
