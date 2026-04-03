// calendarLogic.js
// Pure logic extracted from script.js for unit testing.
// These functions have no DOM or localStorage dependencies.

/**
 * Formats a "YYYY-MM-DD" key for a given date.
 */
function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Converts a 24-hour time string (e.g. "14:30") to 12-hour format ("2:30 PM").
 */
function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Adds an event to the events store for a given date key.
 * Returns a new events object (does not mutate the original).
 * Sorts events by time after inserting.
 */
function addEvent(events, dateKey, { title, time = '', desc = '' }) {
  if (!title || !title.trim()) {
    throw new Error('Event title is required.');
  }
  const updated = { ...events };
  if (!updated[dateKey]) updated[dateKey] = [];

  updated[dateKey] = [
    ...updated[dateKey],
    { title: title.trim(), time, desc: desc.trim() }
  ];

  // Sort by time (events with no time sort to end)
  updated[dateKey].sort((a, b) =>
    (a.time || '99:99').localeCompare(b.time || '99:99')
  );

  return updated;
}

/**
 * Removes the event at `index` from the given date key.
 * Returns a new events object. If no events remain for that day, the key is removed.
 */
function deleteEvent(events, dateKey, index) {
  if (!events[dateKey]) return events;

  const updated = { ...events };
  const newList = [...updated[dateKey]];
  newList.splice(index, 1);

  if (newList.length === 0) {
    delete updated[dateKey];
  } else {
    updated[dateKey] = newList;
  }

  return updated;
}

module.exports = { dateKey, formatTime, addEvent, deleteEvent };
