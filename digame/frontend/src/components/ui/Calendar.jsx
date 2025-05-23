import React, { useState, useMemo } from 'react';

// Main Calendar component
export const Calendar = ({ 
  value,
  onChange,
  mode = 'single', // single, multiple, range
  className = '',
  showOutsideDays = true,
  showWeekNumbers = false,
  weekStartsOn = 0, // 0 = Sunday, 1 = Monday
  disabled = [],
  minDate,
  maxDate,
  locale = 'en-US'
}) => {
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [selectedDates, setSelectedDates] = useState(
    mode === 'multiple' ? (Array.isArray(value) ? value : []) :
    mode === 'range' ? (value || { from: null, to: null }) :
    value || null
  );

  const monthNames = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { month: 'long' });
    return Array.from({ length: 12 }, (_, i) => 
      formatter.format(new Date(2023, i, 1))
    );
  }, [locale]);

  const dayNames = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: 'short' });
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(2023, 0, 1 + i + weekStartsOn);
      days.push(formatter.format(day));
    }
    return days;
  }, [locale, weekStartsOn]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() - weekStartsOn + 7) % 7;

    const days = [];

    // Previous month days
    if (showOutsideDays) {
      const prevMonth = new Date(year, month - 1, 0);
      for (let i = startingDayOfWeek - 1; i >= 0; i--) {
        days.push({
          date: new Date(year, month - 1, prevMonth.getDate() - i),
          isCurrentMonth: false,
          isPreviousMonth: true
        });
      }
    } else {
      for (let i = 0; i < startingDayOfWeek; i++) {
        days.push(null);
      }
    }

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }

    // Next month days
    const remainingDays = 42 - days.length; // 6 weeks * 7 days
    if (showOutsideDays) {
      for (let day = 1; day <= remainingDays; day++) {
        days.push({
          date: new Date(year, month + 1, day),
          isCurrentMonth: false,
          isNextMonth: true
        });
      }
    }

    return days;
  };

  const isDateDisabled = (date) => {
    if (!date) return false;
    
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    
    return disabled.some(disabledDate => {
      if (typeof disabledDate === 'function') {
        return disabledDate(date);
      }
      return date.toDateString() === disabledDate.toDateString();
    });
  };

  const isDateSelected = (date) => {
    if (!date || !selectedDates) return false;

    if (mode === 'single') {
      return selectedDates && date.toDateString() === selectedDates.toDateString();
    }

    if (mode === 'multiple') {
      return selectedDates.some(selected => 
        selected.toDateString() === date.toDateString()
      );
    }

    if (mode === 'range') {
      const { from, to } = selectedDates;
      if (from && date.toDateString() === from.toDateString()) return true;
      if (to && date.toDateString() === to.toDateString()) return true;
      if (from && to && date > from && date < to) return true;
    }

    return false;
  };

  const isDateInRange = (date) => {
    if (mode !== 'range' || !selectedDates) return false;
    const { from, to } = selectedDates;
    return from && to && date > from && date < to;
  };

  const handleDateClick = (date) => {
    if (!date || isDateDisabled(date)) return;

    let newSelectedDates;

    if (mode === 'single') {
      newSelectedDates = date;
    } else if (mode === 'multiple') {
      const isAlreadySelected = selectedDates.some(selected => 
        selected.toDateString() === date.toDateString()
      );
      
      if (isAlreadySelected) {
        newSelectedDates = selectedDates.filter(selected => 
          selected.toDateString() !== date.toDateString()
        );
      } else {
        newSelectedDates = [...selectedDates, date];
      }
    } else if (mode === 'range') {
      const { from, to } = selectedDates;
      
      if (!from || (from && to)) {
        newSelectedDates = { from: date, to: null };
      } else if (from && !to) {
        if (date < from) {
          newSelectedDates = { from: date, to: from };
        } else {
          newSelectedDates = { from, to: date };
        }
      }
    }

    setSelectedDates(newSelectedDates);
    onChange?.(newSelectedDates);
  };

  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + direction);
      return newMonth;
    });
  };

  const navigateYear = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setFullYear(prev.getFullYear() + direction);
      return newMonth;
    });
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className={`calendar bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateYear(-1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Previous year"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Previous month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h2>
          <button
            onClick={goToToday}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Today
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Next month"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button
            onClick={() => navigateYear(1)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            aria-label="Next year"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {showWeekNumbers && (
          <div className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            Wk
          </div>
        )}
        {dayNames.map((day, index) => (
          <div key={index} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (!day) {
            return <div key={index} className="h-8" />;
          }

          const isSelected = isDateSelected(day.date);
          const isInRange = isDateInRange(day.date);
          const isDisabled = isDateDisabled(day.date);
          const isToday = day.date.toDateString() === new Date().toDateString();

          return (
            <button
              key={index}
              onClick={() => handleDateClick(day.date)}
              disabled={isDisabled}
              className={`
                h-8 w-8 flex items-center justify-center text-sm rounded transition-colors
                ${day.isCurrentMonth 
                  ? 'text-gray-900' 
                  : 'text-gray-400'
                }
                ${isSelected 
                  ? 'bg-blue-600 text-white' 
                  : isInRange
                    ? 'bg-blue-100 text-blue-900'
                    : isToday
                      ? 'bg-blue-100 text-blue-600 font-medium'
                      : 'hover:bg-gray-100'
                }
                ${isDisabled 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'
                }
              `}
            >
              {day.date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// Date Picker component
export const DatePicker = ({ 
  value,
  onChange,
  placeholder = 'Select date',
  className = '',
  disabled = false,
  ...calendarProps
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(
    value ? value.toLocaleDateString() : ''
  );

  const handleDateChange = (date) => {
    onChange?.(date);
    setInputValue(date ? date.toLocaleDateString() : '');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        value={inputValue}
        placeholder={placeholder}
        readOnly
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}
        `}
      />
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50">
          <Calendar
            value={value}
            onChange={handleDateChange}
            {...calendarProps}
          />
        </div>
      )}
    </div>
  );
};

// Mini Calendar
export const MiniCalendar = ({ 
  value,
  onChange,
  className = '',
  ...props
}) => {
  return (
    <Calendar
      value={value}
      onChange={onChange}
      className={`text-xs ${className}`}
      showOutsideDays={false}
      {...props}
    />
  );
};

// Calendar with Events
export const EventCalendar = ({ 
  events = [],
  onEventClick,
  className = '',
  ...calendarProps
}) => {
  const getEventsForDate = (date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className={`event-calendar ${className}`}>
      <Calendar {...calendarProps} />
      
      {/* Event indicators could be added here */}
    </div>
  );
};

export default Calendar;