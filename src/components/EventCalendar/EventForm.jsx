import React, { useState } from 'react';
import { X, Save, Trash2, Clock } from 'lucide-react';
import { EVENT_COLORS, RECURRENCE_OPTIONS } from '../../utils/constants';

const EventForm = ({ event, onSave, onCancel, onDelete }) => {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const eventData = {
      ...formData,
      id: event?.id || `event-${Date.now()}`,
      datetime: `${formData.date}T${formData.time}`,
      createdAt: event?.createdAt || new Date().toISOString()
    };

    onSave(eventData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 shadow-lg rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
            <h2 className="text-2xl font-extrabold tracking-wide text-gray-900">
              {event ? 'Edit Event' : 'Add New Event'}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-700 transition"
              aria-label="Close event form"
            >
              <X size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-gray-800 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full rounded-lg px-4 py-2 border bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-300 transition ${
                  errors.title ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="Enter event title"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Date + Time */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-gray-800 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={`w-full rounded-lg px-4 py-2 border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-300 transition ${
                    errors.date ? 'border-red-400' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="text-red-600 text-sm mt-1">{errors.date}</p>}
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-semibold text-gray-800 mb-1">
                  Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={`w-full rounded-lg pl-12 pr-4 py-2 border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-300 transition ${
                      errors.time ? 'border-red-400' : 'border-gray-300'
                    }`}
                  />
                </div>
                {errors.time && <p className="text-red-600 text-sm mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-800 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-lg px-4 py-2 border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
                rows={4}
                placeholder="Enter event description"
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Color</label>
              <div className="flex gap-3">
                {EVENT_COLORS.map(color => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                    className={`w-8 h-8 rounded-full border-2 transition-transform duration-200 focus:outline-none ${
                      formData.color === color.value
                        ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                        : 'hover:scale-110'
                    } ${color.className}`}
                    aria-label={`Select ${color.label} color`}
                  />
                ))}
              </div>
            </div>

            {/* Recurrence */}
            <div>
              <label htmlFor="recurrence" className="block text-sm font-semibold text-gray-800 mb-1">
                Repeat
              </label>
              <select
                id="recurrence"
                name="recurrence"
                value={formData.recurrence}
                onChange={handleChange}
                className="w-full rounded-lg px-4 py-2 border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
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
                <label htmlFor="customInterval" className="block text-sm font-semibold text-gray-800 mb-1">
                  Repeat every (days)
                </label>
                <input
                  type="number"
                  id="customInterval"
                  name="customInterval"
                  min="1"
                  value={formData.customInterval}
                  onChange={handleChange}
                  className="w-full rounded-lg px-4 py-2 border bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-300 transition"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-400 flex items-center justify-center gap-2 transition"
              >
                <Save size={18} />
                Save Event
              </button>
              {event && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(event.id)}
                  className="px-5 py-3 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-400 flex items-center justify-center transition"
                >
                  <Trash2 size={18} />
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
