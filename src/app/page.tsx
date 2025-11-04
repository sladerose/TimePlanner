import MyCalendar from '@/components/Calendar';
import SummaryDisplay from '@/components/SummaryDisplay';
import MonthlyTrendChart from '@/components/MonthlyTrendChart';
import NlpEntryInput from '@/components/NlpEntryInput';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start w-full p-4">
      <div className="flex w-full gap-4">
        {/* Left Column (1/4 width) */}
        <div className="flex flex-col w-1/4 space-y-4">
          <NlpEntryInput />
          <SummaryDisplay />
          <MonthlyTrendChart />
        </div>

        {/* Right Column (3/4 width) */}
        <div className="w-3/4">
          <MyCalendar />
        </div>
      </div>
    </main>
  );
}
