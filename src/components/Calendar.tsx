'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isSameDay, isSameMonth } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useCalendarStore, DailyEntry } from '@/store/useCalendarStore';
import { getDailyRAGStatus } from '@/utils/ragCalculations';
import { supabase } from '@/lib/supabase';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Custom DateCellWrapper to display target and actual hours
  const DateCellWrapper = ({ children, value, dailyEntries, currentDate }: { children: React.ReactNode; value: Date; dailyEntries: DailyEntry[]; currentDate: Date }) => {
    const entryForDay = dailyEntries.find(entry => isSameDay(new Date(entry.entry_date), value));
  
      const targetHours = entryForDay ? entryForDay.target_hours : 0;
      const actualHours = entryForDay ? entryForDay.actual_hours : 0;
    
      // Ensure actualHours is a number for display
      const displayActualHours = typeof actualHours === 'number' ? actualHours : 0;  
      const { status } = getDailyRAGStatus(entryForDay);
    
      const isFutureDate = value > new Date();
    
      let ragClass = '';
      if (!isFutureDate) {
        if (status === 'red') ragClass = 'bg-red-200';
        else if (status === 'amber') ragClass = 'bg-yellow-200';
        else if (status === 'green') ragClass = 'bg-green-200';
      }  
    const isCurrentDay = isSameDay(value, new Date());
    const isOutsideMonth = !isSameMonth(value, currentDate); // Use currentDate for comparison
  
    let dayClasses = '';
    if (isOutsideMonth) {
      dayClasses += ' opacity-50'; // Dim out days outside the current month
    }
    if (isCurrentDay) {
      dayClasses += ' border-2 border-blue-500'; // Highlight current day
    }
  
    return React.cloneElement(children as React.ReactElement, {      children: (
        <div className={`${ragClass} h-full w-full${dayClasses}`}>
          {children.props.children}
                  <div className="rbc-day-cell-content text-xs text-gray-500">
                    <div>Target: {targetHours}h</div>
                    <div>Actual: {displayActualHours}h</div>
                  </div>        </div>
      ),
    });
  };

  const MyCalendar = () => {
    const { dailyEntries, fetchInitialData } = useCalendarStore();
    const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const [myEvents, setMyEvents] = useState([]); // Still using this for RBL events, but dailyEntries for our custom display

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(1970, 1, 1, 6),
    }),
    []
  );

  if (dailyEntries.length === 0) return <div className="text-center p-4">Loading calendar data...</div>;

  return (
    <div className="h-screen">
      <Calendar
        localizer={localizer}
        events={myEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        defaultView="month"
        views={['month', 'week', 'day']}
        date={currentDate}
        onNavigate={(newDate) => setCurrentDate(newDate)}
        scrollToTime={scrollToTime}
        components={{
          dateCellWrapper: (props) => <DateCellWrapper {...props} dailyEntries={dailyEntries} currentDate={currentDate} />,
        }}
      />
    </div>
  );
};

export default MyCalendar;
