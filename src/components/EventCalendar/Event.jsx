import React from 'react';
import { Clock } from 'lucide-react';

// Centralized event color config (could be moved to a constants file)
const EVENT_COLORS = [
  { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
  { value: 'green', label: 'Green', class: 'bg-green-500' },
  { value: 'red', label: 'Red', class: 'bg-red-500' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
];

const Event = ({
  event,
  onEdit,
  onDelete, // not used here, but included for extensibility
  isDragging,
  onDragStart,
  onDragEnd
}) => {
  const { id, title, time, isRecurring, color } = event;

  const colorClass = EVENT_COLORS.find(c => c.value === color)?.class || 'bg-blue-500';

  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', id);
    onDragStart?.(event);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onEdit?.(event);
  };

  return (
    <div
      role="button"
      aria-label={`Event: ${title}`}
      tabIndex={0}
      draggable
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onKeyDown={(e) => e.key === 'Enter' && handleClick(e)}
      className={`${colorClass} text-white text-xs p-1.5 rounded cursor-pointer transition-opacity ${
        isDragging ? 'opacity-50' : 'opacity-100'
      } hover:opacity-80`}
    >
      <div className="font-medium truncate">{title}</div>
      <div className="flex items-center gap-1 text-white/80">
        <Clock size={10} />
        <span className="truncate">{time}</span>
        {isRecurring && <span title="Recurring Event">↻</span>}
      </div>
    </div>
  );
};

export default Event;
