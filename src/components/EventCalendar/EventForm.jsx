import React, { useState } from 'react';
import { X, Save, Trash2, Clock } from 'lucide-react';
import { EVENT_COLORS, RECURRENCE_OPTIONS } from '../../utils/constants';

const EventForm = ({ event, onSave, onCancel, onDelete, existingEvents = [] }) => {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '09:00',
    description: '',
    color: 'blue',
    recurrence: 'none',
    customInterval: 1,
    ...event
  });

  const [errors, setErrors] = useState({});
  const [conflictError, setConflictError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'customInterval' ? parseInt(value, 10) || 1 : value
    }));
  };

  const isConflicting = (newDateTime, currentEventId) => {
    return existingEvents.some(ev =>
      ev.id !== currentEventId && ev.datetime === newDateTime
    );
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  const newErrors = {};
  if (!formData.title.trim()) newErrors.title = 'Title is required';
  if (!formData.date) newErrors.date = 'Date is required';
  if (!formData.time) newErrors.time = 'Time is required';
  if (formData.recurrence === 'custom' && (!formData.customInterval || formData.customInterval < 1)) {
    newErrors.customInterval = 'Enter valid number of days';
  }

  const datetime = `${formData.date}T${formData.time}`;
  const hasConflict = isConflicting(datetime, event?.id);

  if (hasConflict) {
    setConflictError('This time slot already has another event. Please pick a different time.');
    return; // ❌ Do not proceed with save
  } else {
    setConflictError('');
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  const eventData = {
    ...formData,
    id: event?.id || `event-${Date.now()}`,
    datetime,
    createdAt: event?.createdAt || new Date().toISOString()
  };

  onSave(eventData); // ✅ Safe save
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {event ? 'Edit Event' : 'Add New Event'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Event Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter event title"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time *</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-3 py-2 border rounded-md ${
                      errors.time ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.time && <p className="text-red-500 text-sm">{errors.time}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter event description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <div className="flex gap-2">
                {EVENT_COLORS.map(color => {
                  const isSelected = formData.color === color.value;
                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-transform duration-200
                        ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-105'}
                        ${color.bg} ${color.border}`}
                      aria-label={`Select ${color.label} color`}
                    >
                      <div className="w-4 h-4 rounded-full bg-white"></div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Repeat</label>
              <select
                name="recurrence"
                value={formData.recurrence}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {RECURRENCE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {formData.recurrence === 'custom' && (
              <div>
                <label className="block text-sm font-medium mb-1">Repeat every (days)</label>
                <input
                  type="number"
                  name="customInterval"
                  value={formData.customInterval}
                  onChange={handleChange}
                  min={1}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.customInterval ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.customInterval && (
                  <p className="text-red-500 text-sm">{errors.customInterval}</p>
                )}
              </div>
            )}

            {conflictError && <p className="text-red-500 text-sm">{conflictError}</p>}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Event
              </button>

              {event && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    onDelete(event.id);
                    onCancel(); // ensure modal closes after delete
                  }}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 flex items-center justify-center"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
