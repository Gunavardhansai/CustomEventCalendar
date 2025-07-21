import React from 'react';
import { Clock } from 'lucide-react';
import { EVENT_COLORS } from '../../utils/constants';

const Event = ({ event, onEdit, onDelete, isDragging, onDragStart, onDragEnd }) => {
  // Find color class from constants
  const colorClass = EVENT_COLORS.find(c => c.value === event.color)?.class || 'bg-blue-500';
  
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', event.id);
    onDragStart(event);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      // Changed styles: rounded-xl, shadow-sm, bg-opacity, left border color, uppercase title, smaller icon text
      className={`relative cursor-pointer mb-1 rounded-xl p-1 text-xs text-white transition-opacity shadow-sm
        ${colorClass} bg-opacity-90
        ${isDragging ? 'opacity-50' : 'opacity-100'}
        hover:opacity-80
      `}
      onClick={(e) => {
        e.stopPropagation();
        onEdit(event);
      }}
      style={{ borderLeft: `4px solid ${colorClass.replace('bg-', '')}` }}
    >
      <div className="font-semibold uppercase tracking-wide truncate">{event.title}</div>
      <div className="flex items-center gap-1 text-white/70 text-[10px] mt-0.5">
        <Clock size={10} />
        <span>{event.time}</span>
        {event.isRecurring && <span className="ml-auto">↻</span>}
      </div>
    </div>
  );
};

export default Event;
