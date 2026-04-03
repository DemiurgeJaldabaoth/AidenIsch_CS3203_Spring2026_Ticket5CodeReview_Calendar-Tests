const monthYear = document.getElementById('month-year');
const grid = document.getElementById('grid');
const prev = document.getElementById('prev');
const next = document.getElementById('next');

// Modal elements
const modalOverlay = document.getElementById('modal-overlay');
const modalDateTitle = document.getElementById('modal-date-title');
const eventList = document.getElementById('event-list');
const eventTitleInput = document.getElementById('event-title');
const eventTimeInput = document.getElementById('event-time');
const eventDescInput = document.getElementById('event-desc');
const addEventBtn = document.getElementById('add-event-btn');
const modalClose = document.getElementById('modal-close');

let date = new Date();
let selectedDateKey = null; // "YYYY-MM-DD"

// --- Storage helpers ---

function loadEvents() {
  return JSON.parse(localStorage.getItem('calendarEvents') || '{}');
}

function saveEvents(events) {
  localStorage.setItem('calendarEvents', JSON.stringify(events));
}

function dateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// --- Calendar rendering ---

function renderCalendar() {
  const year = date.getFullYear();
  const month = date.getMonth();
  const events = loadEvents();

  monthYear.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });
  grid.innerHTML = '';

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement('div');
    empty.classList.add('empty');
    grid.appendChild(empty);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const day = document.createElement('div');
    day.classList.add('day');

    const numSpan = document.createElement('span');
    numSpan.textContent = d;
    day.appendChild(numSpan);

    const key = dateKey(year, month, d);
    const dayEvents = events[key] || [];

    if (dayEvents.length > 0) {
      const dots = document.createElement('div');
      dots.classList.add('event-dots');
      const max = Math.min(dayEvents.length, 3);
      for (let i = 0; i < max; i++) {
        const dot = document.createElement('span');
        dot.classList.add('dot');
        dots.appendChild(dot);
      }
      day.appendChild(dots);
    }

    if (
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    ) {
      day.classList.add('today');
    }

    day.addEventListener('click', () => openModal(year, month, d));
    grid.appendChild(day);
  }
}

// --- Modal logic ---

function openModal(year, month, day) {
  selectedDateKey = dateKey(year, month, day);
  const label = new Date(year, month, day).toLocaleDateString('default', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });
  modalDateTitle.textContent = label;
  renderEventList();
  modalOverlay.classList.add('open');
  eventTitleInput.focus();
}

function closeModal() {
  modalOverlay.classList.remove('open');
  selectedDateKey = null;
  eventTitleInput.value = '';
  eventTimeInput.value = '';
  eventDescInput.value = '';
}

function renderEventList() {
  const events = loadEvents();
  const dayEvents = events[selectedDateKey] || [];
  eventList.innerHTML = '';

  if (dayEvents.length === 0) {
    eventList.innerHTML = '<p class="no-events">No events yet.</p>';
    return;
  }

  dayEvents.forEach((ev, idx) => {
    const item = document.createElement('div');
    item.classList.add('event-item');

    const info = document.createElement('div');
    info.classList.add('event-info');

    const titleLine = document.createElement('strong');
    titleLine.textContent = ev.title;
    info.appendChild(titleLine);

    if (ev.time) {
      const timeLine = document.createElement('span');
      timeLine.classList.add('event-time-label');
      timeLine.textContent = formatTime(ev.time);
      info.appendChild(timeLine);
    }

    if (ev.desc) {
      const descLine = document.createElement('p');
      descLine.classList.add('event-desc-label');
      descLine.textContent = ev.desc;
      info.appendChild(descLine);
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.textContent = '✕';
    deleteBtn.title = 'Delete event';
    deleteBtn.addEventListener('click', () => deleteEvent(idx));

    item.appendChild(info);
    item.appendChild(deleteBtn);
    eventList.appendChild(item);
  });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function addEvent() {
  const title = eventTitleInput.value.trim();
  if (!title) {
    eventTitleInput.focus();
    eventTitleInput.classList.add('shake');
    setTimeout(() => eventTitleInput.classList.remove('shake'), 400);
    return;
  }

  const events = loadEvents();
  if (!events[selectedDateKey]) events[selectedDateKey] = [];

  events[selectedDateKey].push({
    title,
    time: eventTimeInput.value,
    desc: eventDescInput.value.trim()
  });

  // Sort by time
  events[selectedDateKey].sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));

  saveEvents(events);
  eventTitleInput.value = '';
  eventTimeInput.value = '';
  eventDescInput.value = '';
  renderEventList();
  renderCalendar();
}

function deleteEvent(idx) {
  const events = loadEvents();
  events[selectedDateKey].splice(idx, 1);
  if (events[selectedDateKey].length === 0) delete events[selectedDateKey];
  saveEvents(events);
  renderEventList();
  renderCalendar();
}

// --- Event listeners ---

addEventBtn.addEventListener('click', addEvent);

eventTitleInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addEvent();
});

modalClose.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

prev.addEventListener('click', () => {
  date.setMonth(date.getMonth() - 1);
  renderCalendar();
});

next.addEventListener('click', () => {
  date.setMonth(date.getMonth() + 1);
  renderCalendar();
});

renderCalendar();
