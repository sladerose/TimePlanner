'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useCalendarStore } from '@/store/useCalendarStore';
import { getMonthlyRAGStatus, getYearlyRAGStatus, calculateMonthlyPlannedHours, calculateMonthlyActualHours, getMonthlyProgressStatus } from '@/utils/ragCalculations';
import { format, startOfMonth } from 'date-fns';
import { supabase } from '@/lib/supabase';

interface SummaryCardProps {
  title: string;
  target: number;
  actual: number;
  status: 'red' | 'amber' | 'green';
}

const SummaryCard: React.FC<SummaryCardProps> = ({ title, target, actual, status }) => {
  let bgColorClass = '';
  if (status === 'red') bgColorClass = 'bg-red-100 text-red-800';
  else if (status === 'amber') bgColorClass = 'bg-yellow-100 text-yellow-800';
  else if (status === 'green') bgColorClass = 'bg-green-100 text-green-800';

  return (
    <div className={`p-4 rounded-lg shadow-md ${bgColorClass}`}>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p>Target: {target.toFixed(2)}h</p>
      <p>Actual: {actual.toFixed(2)}h</p>
      <p>Status: <span className="font-bold capitalize">{status}</span></p>
    </div>
  );
};

const SummaryDisplay: React.FC = () => {
  const { dailyEntries, monthlyTarget, setMonthlyTarget, fetchInitialData, plannedHoursForRestOfMonth } = useCalendarStore();
  const currentDate = useMemo(() => new Date(), []);
  const [monthlyTargetInput, setMonthlyTargetInput] = useState<string>('');
  const [errorMonthlyTarget, setErrorMonthlyTarget] = useState<string | null>(null);

  const currentMonthStart = useMemo(() => startOfMonth(currentDate).toISOString().split('T')[0], [currentDate]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSaveMonthlyTarget = async () => {
    try {
      const targetValue = parseFloat(monthlyTargetInput);
      if (isNaN(targetValue) || targetValue < 0) {
        setErrorMonthlyTarget('Please enter a valid positive number for monthly target.');
        return;
      }

      const userId = '2794e1e5-f071-484c-a886-bf397c23d540';
      const newMonthlyTarget = {
        user_id: userId,
        month: currentMonthStart,
        target_hours: targetValue,
      };

      const { data, error } = await supabase
        .from('monthly_targets')
        .upsert([newMonthlyTarget], { onConflict: 'user_id, month' })
        .select()
        .single();

      if (error) {
        throw error;
      }

      setMonthlyTarget(data);
      setErrorMonthlyTarget(null);
    } catch (err: unknown) {
      console.error('Error saving monthly target:', (err as Error).message);
      setErrorMonthlyTarget((err as Error).message);
    }
  };

  const monthlySummary = useMemo(() => {
    return getMonthlyRAGStatus(currentDate, dailyEntries);
  }, [currentDate, dailyEntries]);

  const yearlySummary = useMemo(() => {
    return getYearlyRAGStatus(currentDate, dailyEntries);
  }, [currentDate, dailyEntries]);

  const monthlyPlannedHours = useMemo(() => {
    return calculateMonthlyPlannedHours(currentDate, dailyEntries);
  }, [currentDate, dailyEntries]);

  const monthlyActualHours = useMemo(() => {
    return calculateMonthlyActualHours(currentDate, dailyEntries);
  }, [currentDate, dailyEntries]);

  const monthlyProgressStatus = useMemo(() => {
    const monthlyTargetValue = monthlyTarget?.target_hours || 0;
    return getMonthlyProgressStatus(monthlyTargetValue, monthlyPlannedHours, monthlyActualHours, dailyEntries);
  }, [monthlyTarget, monthlyPlannedHours, monthlyActualHours, dailyEntries]);

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800 mb-4">
      <h3 className="font-semibold text-lg mb-2">Monthly Target</h3>
      <div className="flex items-center space-x-2 mb-4">
        <input
          type="number"
          min="0"
          className="w-32 p-2 border rounded-md dark:bg-gray-700 dark:text-white"
          value={monthlyTargetInput}
          onChange={(e) => setMonthlyTargetInput(e.target.value)}
          placeholder="Set Monthly Target"
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          onClick={handleSaveMonthlyTarget}
        >
          Save Target
        </button>
      </div>
      {errorMonthlyTarget && <p className="text-red-500 text-sm mb-2">{errorMonthlyTarget}</p>}

      <div className="mb-4">
        <p><strong>Monthly Target:</strong> {monthlyTarget?.target_hours.toFixed(2) || 'N/A'}h</p>
        <p><strong>Monthly Planned:</strong> {monthlyPlannedHours.toFixed(2)}h</p>
        <p><strong>Monthly Actual:</strong> {monthlyActualHours.toFixed(2)}h</p>
        <p><strong>Planned for rest of month:</strong> {plannedHoursForRestOfMonth.toFixed(2)}h</p>
        <p><strong>Progress Status:</strong> {monthlyProgressStatus}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SummaryCard
          title={`Monthly Summary (${format(currentDate, 'MMMM yyyy')})`}
          target={monthlySummary.target}
          actual={monthlySummary.actual}
          status={monthlySummary.status}
        />
        <SummaryCard
          title={`Yearly Summary (${format(currentDate, 'yyyy')})`}
          target={yearlySummary.target}
          actual={yearlySummary.actual}
          status={yearlySummary.status}
        />
      </div>
    </div>
  );
};

export default SummaryDisplay;
