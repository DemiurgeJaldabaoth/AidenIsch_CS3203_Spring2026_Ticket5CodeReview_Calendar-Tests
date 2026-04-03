// tests/calendar.test.js
// Unit tests for the calendar's add-event and delete-event logic.

const { dateKey, formatTime, addEvent, deleteEvent } = require('../src/calendarLogic');

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
const KEY = dateKey(2025, 3, 15); // "2025-04-15"

// ---------------------------------------------------------------------------
// addEvent tests
// ---------------------------------------------------------------------------

describe('addEvent', () => {
  test('adds a single event to an empty store', () => {
    const events = {};
    const result = addEvent(events, KEY, { title: 'Team standup', time: '09:00', desc: '' });

    expect(result[KEY]).toHaveLength(1);
    expect(result[KEY][0].title).toBe('Team standup');
    expect(result[KEY][0].time).toBe('09:00');
  });

  test('adds multiple events and sorts them by time', () => {
    let events = {};
    events = addEvent(events, KEY, { title: 'Lunch', time: '12:00' });
    events = addEvent(events, KEY, { title: 'Morning standup', time: '09:00' });
    events = addEvent(events, KEY, { title: 'End-of-day review', time: '17:00' });

    const titles = events[KEY].map(e => e.title);
    expect(titles).toEqual(['Morning standup', 'Lunch', 'End-of-day review']);
  });

  test('events with no time sort after timed events', () => {
    let events = {};
    events = addEvent(events, KEY, { title: 'No-time task', time: '' });
    events = addEvent(events, KEY, { title: 'Morning standup', time: '09:00' });

    expect(events[KEY][0].title).toBe('Morning standup');
    expect(events[KEY][1].title).toBe('No-time task');
  });

  test('throws when title is empty', () => {
    expect(() => addEvent({}, KEY, { title: '', time: '10:00' })).toThrow(
      'Event title is required.'
    );
  });

  test('throws when title is only whitespace', () => {
    expect(() => addEvent({}, KEY, { title: '   ', time: '' })).toThrow(
      'Event title is required.'
    );
  });

  test('trims whitespace from title and description', () => {
    const result = addEvent({}, KEY, { title: '  Birthday party  ', desc: '  Bring cake  ' });
    expect(result[KEY][0].title).toBe('Birthday party');
    expect(result[KEY][0].desc).toBe('Bring cake');
  });

  test('does not mutate the original events object', () => {
    const original = {};
    addEvent(original, KEY, { title: 'Ghost event' });
    expect(original[KEY]).toBeUndefined();
  });

  test('adds events to different date keys independently', () => {
    const KEY2 = dateKey(2025, 3, 20); // "2025-04-20"
    let events = {};
    events = addEvent(events, KEY, { title: 'Day 15 event' });
    events = addEvent(events, KEY2, { title: 'Day 20 event' });

    expect(events[KEY]).toHaveLength(1);
    expect(events[KEY2]).toHaveLength(1);
    expect(events[KEY][0].title).toBe('Day 15 event');
    expect(events[KEY2][0].title).toBe('Day 20 event');
  });
});

// ---------------------------------------------------------------------------
// deleteEvent tests
// ---------------------------------------------------------------------------

describe('deleteEvent', () => {
  // Build a store with two events to use across tests
  function buildStore() {
    let events = {};
    events = addEvent(events, KEY, { title: 'First event', time: '09:00' });
    events = addEvent(events, KEY, { title: 'Second event', time: '14:00' });
    return events;
  }

  test('removes the event at the given index', () => {
    const events = buildStore();
    const result = deleteEvent(events, KEY, 0);

    expect(result[KEY]).toHaveLength(1);
    expect(result[KEY][0].title).toBe('Second event');
  });

  test('removes the last event and deletes the date key entirely', () => {
    let events = {};
    events = addEvent(events, KEY, { title: 'Only event' });
    const result = deleteEvent(events, KEY, 0);

    expect(result[KEY]).toBeUndefined();
  });

  test('does not mutate the original events object', () => {
    const events = buildStore();
    deleteEvent(events, KEY, 0);
    expect(events[KEY]).toHaveLength(2); // original unchanged
  });

  test('returns the original object unchanged when date key does not exist', () => {
    const events = buildStore();
    const missingKey = dateKey(2025, 3, 1);
    const result = deleteEvent(events, missingKey, 0);

    // The result should still have the original key untouched
    expect(result[KEY]).toHaveLength(2);
    expect(result[missingKey]).toBeUndefined();
  });

  test('correctly removes the second of two events', () => {
    const events = buildStore();
    const result = deleteEvent(events, KEY, 1);

    expect(result[KEY]).toHaveLength(1);
    expect(result[KEY][0].title).toBe('First event');
  });
});

// ---------------------------------------------------------------------------
// formatTime helper tests (bonus)
// ---------------------------------------------------------------------------

describe('formatTime', () => {
  test('converts midnight correctly', () => expect(formatTime('00:00')).toBe('12:00 AM'));
  test('converts noon correctly', () => expect(formatTime('12:00')).toBe('12:00 PM'));
  test('converts a morning time', () => expect(formatTime('09:30')).toBe('9:30 AM'));
  test('converts an afternoon time', () => expect(formatTime('14:45')).toBe('2:45 PM'));
  test('returns empty string for empty input', () => expect(formatTime('')).toBe(''));
});
