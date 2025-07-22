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
      id: event?.id || event-${Date.now()},
      datetime: ${formData.date}T${formData.time},
      createdAt: event?.createdAt || new Date().toISOString()
    };
    
    onSave(eventData);
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
            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }}
                placeholder="Enter event title"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>
            
            {/* Date and Time Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>
              
              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className={w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.time ? 'border-red-500' : 'border-gray-300'
                    }}
                  />
                  {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
                </div>
              </div>
            </div>
            
            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Enter event description"
              />
            </div>
            
            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex gap-2">
                {EVENT_COLORS.map(color => {
                  const isSelected = formData.color === color.value;
                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200 focus:outline-none
                        ${isSelected ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : 'hover:scale-110'}`}
                      aria-label={`Select ${color.label} color`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full ${color.className} border border-white shadow-sm`}
                      ></span>
                    </button>
                  );
                ))}
              </div>
            </div>
            
            {/* Recurrence Options */}
            <div>
              <label htmlFor="recurrence" className="block text-sm font-medium text-gray-700 mb-1">
                Repeat
              </label>
              <select
                id="recurrence"
                name="recurrence"
                value={formData.recurrence}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {RECURRENCE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Custom Interval (only shown when recurrence is custom) */}
            {formData.recurrence === 'custom' && (
              <div>
                <label htmlFor="customInterval" className="block text-sm font-medium text-gray-700 mb-1">
                  Repeat every (days)
                </label>
                <input
                  type="number"
                  id="customInterval"
                  name="customInterval"
                  min="1"
                  value={formData.customInterval}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
              >
                <Save size={16} />
                Save Event
              </button>
              
              {event && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(event.id)}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center"
                  aria-label="Delete event"
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
