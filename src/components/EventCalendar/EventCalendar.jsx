import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  format,
  isSameDay,
  addDays,
  addWeeks,
  addMonths,
} from '../../utils/dateUtils';
import { get, set } from '../../utils/storage';
import CalendarHeader from './CalendarHeader';
import SearchFilter from './SearchFilter';
import CalendarGrid from './CalendarGrid';
import EventForm from './EventForm';

const MAX_RECUR = 100;

const generateRecurringEvents = (event, endDate = null) => {
  if (event.recurrence === 'none') return [event];

  const events = [event];
  const limitDate = endDate || addMonths(new Date(event.date), 12);
  let date = new Date(event.date);
  let count = 0;

  while (count < MAX_RECUR) {
    let next;

    switch (event.recurrence) {
      case 'daily':
        next = addDays(date, 1);
        break;
      case 'weekly':
        next = addWeeks(date, 1);
        break;
      case 'monthly':
        next = addMonths(date, 1);
        break;
      case 'custom':
        next = addDays(date, event.customInterval || 1);
        break;
      default:
        return events;
    }

    if (next > limitDate) break;

    events.push({
      ...event,
      id: `${event.id}-${count + 1}`,
      date: format(next, 'YYYY-MM-DD'),
      isRecurring: true,
      parentId: event.id,
    });

    date = next;
    count++;
  }

  return events;
};

const EventCalendar = () => {
  // ──────── 📅 State ─────────────
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState('all');
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [conflicts, setConflicts] = useState([]);

  // ──────── 💾 Load/Save ─────────────
  useEffect(() => {
    const stored = get('calendar-events') || [];
    setEvents(stored);
  }, []);

  useEffect(() => {
    set('calendar-events', events);
  }, [events]);

  // ──────── 🔁 Recurring Events ─────────────
  const allEvents = useMemo(() => {
    const endDate = addMonths(currentDate, 6);
    return events.flatMap(event =>
      !event.isRecurring ? generateRecurringEvents(event, endDate) : []
    );
  }, [events, currentDate]);

  // ──────── 🔎 Filter/Search ─────────────
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const matchText =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchColor = colorFilter === 'all' || event.color === colorFilter;
      return matchText && matchColor;
    });
  }, [allEvents, searchQuery, colorFilter]);

  // ──────── ⚠️ Conflict Detection ─────────────
  useEffect(() => {
    const byDate = {};
    const conflictsSet = new Set();

    filteredEvents.forEach(event => {
      if (!byDate[event.date]) byDate[event.date] = [];
      byDate[event.date].push(event);
    });

    Object.values(byDate).forEach(dayEvents => {
      for (let i = 0; i < dayEvents.length; i++) {
        for (let j = i + 1; j < dayEvents.length; j++) {
          if (dayEvents[i].time === dayEvents[j].time) {
            conflictsSet.add(dayEvents[i].id);
            conflictsSet.add(dayEvents[j].id);
          }
        }
      }
    });

    setConflicts([...conflictsSet]);
  }, [filteredEvents]);

  // ──────── 📆 Navigation ─────────────
  const goToPreviousMonth = () => setCurrentDate(prev => addMonths(prev, -1));
  const goToNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const goToToday = () => setCurrentDate(new Date());

  // ──────── 🛠 Event Actions ─────────────
  const handleAddEvent = () => {
    setShowEventForm(true);
    setEditingEvent(null);
  };

  const handleSaveEvent = (eventData) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === eventData.id);
      return exists
        ? prev.map(e => (e.id === eventData.id ? eventData : e))
        : [...prev, eventData];
    });
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  };

  const handleDeleteEvent = (eventId) => {
    setEvents(prev => {
      const target = prev.find(e => e.id === eventId);
      return target?.parentId
        ? prev.filter(e => e.id !== target.parentId && e.parentId !== target.parentId)
        : prev.filter(e => e.id !== eventId && e.parentId !== eventId);
    });
    setShowEventForm(false);
    setEditingEvent(null);
  };

  // ──────── 🖱️ Drag and Drop ─────────────
  const handleDragStart = (event) => setDraggedEvent(event);
  const handleDragEnd = () => setDraggedEvent(null);

  const handleDrop = (eventId, newDate) => {
    if (!draggedEvent) return;
    const newDateStr = format(newDate, 'YYYY-MM-DD');
    setEvents(prev =>
      prev.map(e =>
        e.id === eventId
          ? { ...e, date: newDateStr, datetime: `${newDateStr}T${e.time}` }
          : e
      )
    );
  };

  // ──────── 📅 Day Click ─────────────
  const handleDayClick = (day) => {
    setSelectedDate(day);
    setEditingEvent({ date: format(day, 'YYYY-MM-DD') });
    setShowEventForm(true);
  };

  // ──────── 🖼 Render ─────────────
  return (
    <div className="max-w-6xl mx-auto p-4">
      <CalendarHeader
        currentDate={currentDate}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        onAddEvent={handleAddEvent}
      />

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        colorFilter={colorFilter}
        onColorFilterChange={setColorFilter}
      />

      {conflicts.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
          <AlertTriangle className="text-yellow-600" size={16} />
          <span className="text-yellow-800 text-sm">
            {conflicts.length} event{conflicts.length > 1 ? 's have' : ' has'} time conflicts
          </span>
        </div>
      )}

      <CalendarGrid
        currentDate={currentDate}
        selectedDate={selectedDate}
        events={filteredEvents}
        onDayClick={handleDayClick}
        onEventDrop={handleDrop}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        draggedEvent={draggedEvent}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      />

      {showEventForm && (
        <EventForm
          event={editingEvent}
          onSave={handleSaveEvent}
          onCancel={() => {
            setShowEventForm(false);
            setEditingEvent(null);
          }}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};

export default EventCalendar;
