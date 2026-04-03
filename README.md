# Calendar App — Unit Tests

Unit tests for the event **add** and **delete** features of the calendar web application.

---

## Repository Structure

```
calendar-tests/
├── src/
│   ├── index.html          # Original app HTML
│   ├── style.css           # Original app styles
│   ├── script.js           # Original app script (DOM + localStorage version)
│   └── calendarLogic.js    # Pure logic extracted from script.js (testable)
├── tests/
│   └── calendar.test.js    # Jest unit tests
├── package.json
└── README.md
```

---

## Design Approach

`script.js` couples business logic tightly to the DOM and `localStorage`, which makes it difficult to test directly without a full browser. To solve this, the core event logic was extracted into **`src/calendarLogic.js`** as pure functions with no side effects:

| Function | What it tests |
|---|---|
| `addEvent(events, dateKey, eventData)` | Inserting events, sorting by time, input validation |
| `deleteEvent(events, dateKey, index)` | Removing events, cleaning up empty date keys |
| `formatTime(timeStr)` | 24 → 12-hour time formatting |

The original `script.js` and HTML are untouched — `calendarLogic.js` is a parallel file used only for testing.

---

## Running the Tests

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Run all tests
npm test
```

Expected output:

```
PASS tests/calendar.test.js
  addEvent
    ✓ adds a single event to an empty store
    ✓ adds multiple events and sorts them by time
    ✓ events with no time sort after timed events
    ✓ throws when title is empty
    ✓ throws when title is only whitespace
    ✓ trims whitespace from title and description
    ✓ does not mutate the original events object
    ✓ adds events to different date keys independently
  deleteEvent
    ✓ removes the event at the given index
    ✓ removes the last event and deletes the date key entirely
    ✓ does not mutate the original events object
    ✓ returns the original object unchanged when date key does not exist
    ✓ correctly removes the second of two events
  formatTime
    ✓ converts midnight correctly
    ✓ converts noon correctly
    ✓ converts a morning time
    ✓ converts an afternoon time
    ✓ returns empty string for empty input

Tests: 18 passed, 18 total
```

---

## Test Coverage Summary

### `addEvent` (8 tests)
- Happy path: single event added to empty store
- Sorting: multiple events are ordered chronologically by time
- Edge case: events with no time sort after timed events
- Validation: throws on empty or whitespace-only titles
- Data hygiene: whitespace is trimmed from title and description
- Immutability: original events object is not mutated
- Isolation: events on different dates don't interfere

### `deleteEvent` (5 tests)
- Happy path: removes event at specified index
- Cleanup: date key is removed when the last event is deleted
- Immutability: original events object is not mutated
- Safety: no-op when the date key doesn't exist
- Precision: removes the correct event when multiple exist

### `formatTime` (5 tests)
- Boundary values: midnight (00:00) and noon (12:00)
- AM/PM conversion for morning and afternoon times
- Empty string input returns empty string
