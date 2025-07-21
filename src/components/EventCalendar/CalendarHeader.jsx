import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar } from 'lucide-react';

const CalendarHeader = ({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onAddEvent
}) => {
  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="mb-6">
      {/* Title and Add Event Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="text-blue-600" />
          Event Calendar
        </h1>
        <button
          onClick={onAddEvent}
          aria-label="Add new event"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
        >
          <Plus size={16} />
          Add Event
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviousMonth}
            aria-label="Previous month"
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold text-center min-w-48">
            {monthYear}
          </h2>
          <button
            onClick={onNextMonth}
            aria-label="Next month"
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <button
          onClick={onToday}
          aria-label="Go to today"
          className="px-4 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Today
        </button>
      </div>
    </div>
  );
};

export default CalendarHeader;
