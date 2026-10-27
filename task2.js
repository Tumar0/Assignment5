// ===== Task 2: Kanban Board =====
const WIP_LIMIT = 3; // max cards in "In progress"

const COLUMNS = [
  { id: 'todo', title: 'To do' },
  { id: 'progress', title: 'In progress' },
  { id: 'done', title: 'Done' }
];

const PRIORITY_LABELS = { 1: 'High', 2: 'Medium', 3: 'Low' };

// Data: every object has a unique id and properties of different types
const tasks = [
  { id: 1,  title: 'Design homepage',      tag: 'design',   priority: 1, hours: 6, urgent: true,  status: 'todo' },
  { id: 2,  title: 'Write navigation HTML', tag: 'frontend', priority: 2, hours: 3, urgent: false, status: 'todo' },
  { id: 3,  title: 'Style the footer',     tag: 'design',   priority: 3, hours: 2, urgent: false, status: 'todo' },
  { id: 4,  title: 'Form validation',      tag: 'frontend', priority: 1, hours: 5, urgent: true,  status: 'progress' },
  { id: 5,  title: 'Set up GitHub repo',   tag: 'devops',   priority: 2, hours: 1, urgent: false, status: 'done' },
  { id: 6,  title: 'Deploy to GitHub Pages', tag: 'devops', priority: 2, hours: 2, urgent: false, status: 'todo' },
  { id: 7,  title: 'Write the report',     tag: 'docs',     priority: 1, hours: 4, urgent: true,  status: 'todo' },
  { id: 8,  title: 'Take screenshots',     tag: 'docs',     priority: 3, hours: 1, urgent: false, status: 'todo' },
  { id: 9,  title: 'Responsive layout',    tag: 'frontend', priority: 1, hours: 4, urgent: false, status: 'progress' },
  { id: 10, title: 'Choose color palette', tag: 'design',   priority: 2, hours: 1, urgent: false, status: 'done' },
  { id: 11, title: 'Fix console errors',   tag: 'frontend', priority: 2, hours: 2, urgent: false, status: 'todo' },
  { id: 12, title: 'Prepare for defense',  tag: 'docs',     priority: 1, hours: 3, urgent: true,  status: 'todo' }
];

const state = { sort: 'priority', tag: 'all', query: '' };

const board = document.getElementById('board');
const searchInput = document.getElementById('search');
const tagSelect = document.getElementById('tag-filter');
const sortSelect = document.getElementById('sort');
const progressBar = document.getElementById('progress');
const progressText = document.getElementById('progress-text');
const messageEl = document.getElementById('message');
const nothingFound = document.getElementById('nothing-found');

// ---------- helpers ----------
function showMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = 'message ' + type;
}

function countStatus(status) {
  let count = 0;
  for (const t of tasks) {
    if (t.status === status) count++;
  }
  return count;
}

// own loop: total hours of the visible cards of a column
function sumHours(list) {
  let total = 0;
  for (let i = 0; i < list.length; i++) {
    total += list[i].hours;
  }
  return total;
}

function getVisibleTasks() {
  const query = state.query.trim().toLowerCase();
  const result = [];
  for (const t of tasks) {
    const tagOk = state.tag === 'all' || t.tag === state.tag;
    const textOk = query === '' || t.title.toLowerCase().includes(query);
    if (tagOk && textOk) result.push(t);
  }
  result.sort((a, b) => {
    if (state.sort === 'title') return a.title.localeCompare(b.title);
    if (state.sort === 'hours') return b.hours - a.hours;
    return a.priority - b.priority;
  });
  return result;
}

function fillTagFilter() {
  const tags = [];
  for (const t of tasks) {
    if (!tags.includes(t.tag)) tags.push(t.tag);
  }
  tags.sort();
  const all = new Option('All tags', 'all');
  tagSelect.appendChild(all);
  for (const tag of tags) {
    tagSelect.appendChild(new Option(tag, tag));
  }
}

// ---------- the one render function ----------
function createCard(task, columnIndex) {
  const card = document.createElement('article');
  card.className = `task p${task.priority}`;
  card.classList.toggle('done', task.status === 'done');
  card.dataset.id = task.id;

  const title = document.createElement('div');
  title.className = 'title';
  title.textContent = task.title;

  const info = document.createElement('div');
  info.className = 'info';
  const tagBadge = document.createElement('span');
  tagBadge.className = 'badge';
  tagBadge.textContent = task.tag;
  info.append(tagBadge, ` ${PRIORITY_LABELS[task.priority]} · ${task.hours} h `);
  if (task.urgent) {
    const urgent = document.createElement('span');
    urgent.className = 'badge urgent';
    urgent.textContent = 'urgent';
    info.appendChild(urgent);
  }

  const actions = document.createElement('div');
  actions.className = 'actions';

  const back = document.createElement('button');
  back.className = 'btn secondary small';
  back.type = 'button';
  back.dataset.action = 'left';
  back.dataset.id = task.id;
  back.textContent = '← Back';
  back.disabled = columnIndex === 0;
  back.setAttribute('aria-label', `Move "${task.title}" back`);

  const next = document.createElement('button');
  next.className = 'btn small';
  next.type = 'button';
  next.dataset.action = 'right';
  next.dataset.id = task.id;
  next.textContent = 'Next →';
  next.disabled = columnIndex === COLUMNS.length - 1;
  next.setAttribute('aria-label', `Move "${task.title}" forward`);

  actions.append(back, next);
  card.append(title, info, actions);
  return card;
}

function render() {
  const visible = getVisibleTasks();
  board.replaceChildren();

  COLUMNS.forEach((col, index) => {
    const column = document.createElement('section');
    column.className = 'column';
    column.classList.toggle('full', col.id === 'progress' && countStatus('progress') >= WIP_LIMIT);

    const inColumn = visible.filter((t) => t.status === col.id);

    const heading = document.createElement('h3');
    const name = document.createElement('span');
    name.textContent = col.id === 'progress'
      ? `${col.title} (${countStatus('progress')}/${WIP_LIMIT})`
      : col.title;
    const meta = document.createElement('span');
    meta.className = 'meta';
    meta.textContent = `${inColumn.length} cards · ${sumHours(inColumn)} h`;
    heading.append(name, meta);
    column.appendChild(heading);

    if (inColumn.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = 'No cards';
      column.appendChild(empty);
    }
    for (const task of inColumn) {
      column.appendChild(createCard(task, index));
    }
    board.appendChild(column);
  });

  nothingFound.classList.toggle('hidden', visible.length > 0);

  const done = countStatus('done');
  progressBar.max = tasks.length;
  progressBar.value = done;
  progressText.textContent = `${done} of ${tasks.length} cards finished (${Math.round((done / tasks.length) * 100)}%)`;
}

// ---------- actions ----------
function moveTask(id, direction) {
  const task = tasks.find((t) => t.id === id);
  if (!task) return;

  const currentIndex = COLUMNS.findIndex((c) => c.id === task.status);
  const newIndex = currentIndex + direction;
  if (newIndex < 0 || newIndex >= COLUMNS.length) return;

  const target = COLUMNS[newIndex];
  // Rule: the middle column holds at most WIP_LIMIT cards
  if (target.id === 'progress' && countStatus('progress') >= WIP_LIMIT) {
    showMessage(`Blocked: "In progress" already has ${WIP_LIMIT} cards. Finish one first.`, 'error');
    return;
  }

  task.status = target.id;      // change data first…
  showMessage(`"${task.title}" moved to "${target.title}".`, 'success');
  render();                     // …then render
}

// ONE listener on the container (event delegation)
board.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || !board.contains(button)) return;
  const id = Number(button.dataset.id);
  moveTask(id, button.dataset.action === 'right' ? 1 : -1);
});

searchInput.addEventListener('input', () => { state.query = searchInput.value; render(); });
tagSelect.addEventListener('change', () => { state.tag = tagSelect.value; render(); });
sortSelect.addEventListener('change', () => { state.sort = sortSelect.value; render(); });

fillTagFilter();
render();
