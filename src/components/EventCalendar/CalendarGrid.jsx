import React, { useMemo } from 'react';
import CalendarDay from './CalendarDay';
import { DAYS_OF_WEEK } from '../../utils/constants';
import {
  startOfMonth,
  endOfMonth,
  addDays,
  isSameDay,
  format
} from '../../utils/dateUtils';

const CalendarGrid = ({
  currentDate,
  selectedDate,
  events,
  onDayClick,
  onEventDrop,
  onEditEvent,
  onDeleteEvent,
  draggedEvent,
  onDragStart,
  onDragEnd
}) => {
  const today = new Date();

  // Generate the full calendar grid (including padding from previous/next month)
  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const calendarStart = addDays(start, -start.getDay());
    const calendarEnd = addDays(end, 6 - end.getDay());

    const days = [];
    let day = new Date(calendarStart);

    while (day <= calendarEnd) {
      days.push(new Date(day));
      day = addDays(day, 1);
    }

    return days;
  }, [currentDate]);

  // Return events that match the current day
  const getEventsForDay = (day) => {
    const dayStr = format(day, 'YYYY-MM-DD');
    return events.filter((event) => event.date === dayStr);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Days of Week Header */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {DAYS_OF_WEEK.map((dayName) => (
          <div
            key={dayName}
            className="p-3 text-center text-sm font-medium text-gray-700"
          >
            {dayName}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day) => {
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, today);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const dayEvents = getEventsForDay(day);

          return (
            <CalendarDay
              key={day.toISOString()}
              day={day}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              isSelected={isSelected}
              events={dayEvents}
              onClick={onDayClick}
              onDrop={onEventDrop}
              onEditEvent={onEditEvent}
              onDeleteEvent={onDeleteEvent}
              draggedEvent={draggedEvent}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;
