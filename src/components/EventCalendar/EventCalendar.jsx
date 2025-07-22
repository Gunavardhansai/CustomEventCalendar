import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { 
  format, 
  isSameDay, 
  addDays, 
  addWeeks, 
  addMonths, 
  startOfMonth, 
  endOfMonth 
} from '../../utils/dateUtils';
import { get, set } from '../../utils/storage';
import { EVENT_COLORS } from '../../utils/constants';
import CalendarHeader from './CalendarHeader';
import SearchFilter from './SearchFilter';
import CalendarGrid from './CalendarGrid';
import EventForm from './EventForm';

const generateRecurringEvents = (event, endDate = null) => {
  if (event.recurrence === 'none') return [event];
  
  const events = [event];
  const maxRecurrences = 100;
  const end = endDate || addMonths(new Date(event.date), 12);
  let currentDate = new Date(event.date);
  let count = 0;
  
  while (count < maxRecurrences) {
    let nextDate;
    
    switch (event.recurrence) {
      case 'daily':
        nextDate = addDays(currentDate, 1);
        break;
      case 'weekly':
        nextDate = addWeeks(currentDate, 1);
        break;
      case 'monthly':
        nextDate = addMonths(currentDate, 1);
        break;
      case 'custom':
        nextDate = addDays(currentDate, event.customInterval || 1);
        break;
      default:
        return events;
    }
    
    if (nextDate > end) break;
    
    const recurringEvent = {
      ...event,
      id: ${event.id}-${count + 1},
      date: format(nextDate, 'YYYY-MM-DD'),
      isRecurring: true,
      parentId: event.id
    };
    
    events.push(recurringEvent);
    currentDate = nextDate;
    count++;
  }
  
  return events;
};

const EventCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [colorFilter, setColorFilter] = useState('all');
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  
  // Load events from localStorage on mount
  useEffect(() => {
    const savedEvents = get('calendar-events') || [];
    setEvents(savedEvents);
  }, []);
  
  // Save events to localStorage whenever events change
  useEffect(() => {
    set('calendar-events', events);
  }, [events]);
  
  // Generate all events including recurring ones
  const allEvents = useMemo(() => {
    const generated = [];
    const endDate = addMonths(currentDate, 6);
    
    events.forEach(event => {
      if (!event.isRecurring) {
        const recurringEvents = generateRecurringEvents(event, endDate);
        generated.push(...recurringEvents);
      }
    });
    
    return generated;
  }, [events, currentDate]);
  
  // Filter and search events
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesColor = colorFilter === 'all' || event.color === colorFilter;
      return matchesSearch && matchesColor;
    });
  }, [allEvents, searchQuery, colorFilter]);
  
  // Check for conflicts
  useEffect(() => {
    const checkConflicts = () => {
      const conflictingEvents = [];
      const eventsByDate = {};
      
      filteredEvents.forEach(event => {
        const dateKey = event.date;
        if (!eventsByDate[dateKey]) {
          eventsByDate[dateKey] = [];
        }
        eventsByDate[dateKey].push(event);
      });
      
      Object.entries(eventsByDate).forEach(([date, dayEvents]) => {
        for (let i = 0; i < dayEvents.length; i++) {
          for (let j = i + 1; j < dayEvents.length; j++) {
            const event1 = dayEvents[i];
            const event2 = dayEvents[j];
            
            if (event1.time === event2.time) {
              conflictingEvents.push(event1.id, event2.id);
            }
          }
        }
      });
      
      setConflicts([...new Set(conflictingEvents)]);
    };
    
    checkConflicts();
  }, [filteredEvents]);
  
  // Calendar navigation
  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prev => addMonths(prev, -1));
  }, []);
  
  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => addMonths(prev, 1));
  }, []);
  
  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);
  
  const handleAddEvent = useCallback(() => {
    setShowEventForm(true);
    setEditingEvent(null);
  }, []);
  
  // Event management
  const handleSaveEvent = useCallback((eventData) => {
    setEvents(prev => {
      const existing = prev.find(e => e.id === eventData.id);
      if (existing) {
        return prev.map(e => e.id === eventData.id ? eventData : e);
      } else {
        return [...prev, eventData];
      }
    });
    
    setShowEventForm(false);
    setEditingEvent(null);
  }, []);
  
  const handleDeleteEvent = useCallback((eventId) => {
    setEvents(prev => {
      const event = prev.find(e => e.id === eventId);
      if (event && event.parentId) {
        // Delete all recurring instances
        return prev.filter(e => e.id !== event.parentId && e.parentId !== event.parentId);
      } else {
        // Delete single event or main recurring event
        return prev.filter(e => e.id !== eventId && e.parentId !== eventId);
      }
    });
    
    setShowEventForm(false);
    setEditingEvent(null);
  }, []);
  
  const handleEditEvent = useCallback((event) => {
    setEditingEvent(event);
    setShowEventForm(true);
  }, []);
  
  // Drag and drop
  const handleDragStart = useCallback((event) => {
    setDraggedEvent(event);
  }, []);
  
  const handleDragEnd = useCallback(() => {
    setDraggedEvent(null);
  }, []);
  
  const handleDrop = useCallback((eventId, newDate) => {
    if (!draggedEvent) return;
    
    const newDateString = format(newDate, 'YYYY-MM-DD');
    
    setEvents(prev => prev.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          date: newDateString,
          datetime: ${newDateString}T${event.time}
        };
      }
      return event;
    }));
  }, [draggedEvent]);
  
  const handleDayClick = useCallback((day) => {
    setSelectedDate(day);
    setEditingEvent({ date: format(day, 'YYYY-MM-DD') });
    setShowEventForm(true);
  }, []);
  
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
      
      {/* Conflicts Warning */}
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
