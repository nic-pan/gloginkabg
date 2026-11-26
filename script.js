
// Images from other sites can hang when the host is down. The tab spinner
// then never stops. After 30 seconds, cancel every image that has not loaded.
const IMAGE_TIMEOUT_MS = 30000;
setTimeout(() => {
  document.querySelectorAll('img').forEach(img => {
    if (img.complete || img.loading === 'lazy') return;
    img.removeAttribute('srcset');
    img.removeAttribute('src');
    img.hidden = true;
    console.warn('Image skipped after timeout:', img.alt || '(no alt)');
  });
}, IMAGE_TIMEOUT_MS);

async function loadThemesAndApplySaved() {
  try {
    const res = await fetch('themes.json');
    const themes = await res.json();

    document.getElementById("themeSelect").addEventListener("change", e => {
      const name = e.target.value;
      if (!themes[name]) return;
      applyTheme(themes[name]);
      localStorage.setItem('theme', name);
    });

    // Get saved theme name from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme || !themes[savedTheme]) {
      console.warn("No saved theme found. Applying default.");
      return; 
    }
    document.getElementById("themeSelect").value = savedTheme;

    const selectedTheme = themes[savedTheme];
    applyTheme(selectedTheme);
    console.log("Selected: ", selectedTheme)
  } catch (err) {
    console.error('Could not load themes:', err);
  }
}

function applyTheme(themeVars) {
  const style = document.documentElement.style;
  const toRemove = [];
  for (let i = 0; i < style.length; i++) {
    if (style[i].startsWith('--')) toRemove.push(style[i]);
  }
  toRemove.forEach(prop => style.removeProperty(prop));

  for (const [key, value] of Object.entries(themeVars.colors)) {
    style.setProperty(key, value);
  }
  
  const header = document.querySelector('header');
  if (themeVars.header) {
    header.style.background = themeVars.header.background;
    header.querySelector('h1 a').style.color = themeVars.header.textColor;

    if (themeVars.header.borderBottom) {
      const borderColor = typeof themeVars.header.borderBottom === 'string'
        ? themeVars.header.borderBottom
        : 'currentColor';
      header.style.borderBottom = `2px solid ${borderColor}`;
    } else {
      header.style.borderBottom = 'none';
    }

    if (themeVars.header.rounded === "bottom-right") {
      header.style.borderRadius = "0 0 1rem 0";
    } else if (themeVars.header.rounded) {
      header.style.borderRadius = "0 0 1rem 1rem";
    } else {
      header.style.borderRadius = "0";
    }
  }

  const sectionHeader = document.querySelector(".sectionHeader");
  if (themeVars.sectionHeader) {
    sectionHeader.style.background = themeVars.sectionHeader.background;
    sectionHeader.querySelector('.headerImg').innerHTML = themeVars.sectionHeader.icon;
  }

  const footer = document.querySelector('footer');
  if (themeVars.footer) {
    footer.style.background = themeVars.footer.background;
    footer.style.color = themeVars.footer.color;
  }
}

// "AD" SETUP BEGIN
const gifList = [
  "https://dl.glitter-graphics.com/pub/543/543735ehvlz7xadn.gif",
  "https://dl.glitter-graphics.com/pub/984/984757z6pg4s804m.gif",
  "https://dl.glitter-graphics.com/pub/58/58026gx8rctx713.jpg",
  "https://dl.glitter-graphics.com/pub/341/341081zoj4poutto.gif"
];

function getRandomGif() {
  const randomIndex = Math.floor(Math.random() * gifList.length);
  return gifList[randomIndex];
}

function renderNavigation() {

  const img = document.getElementById("ad-gif");
  if (img) {
    img.src = getRandomGif();
    img.style.maxWidth = "100%";
    img.style.height = "auto";

  }

  // "AD" SETUP END

  // NAVIGATION SETUP BEGIN
  const navItems = [
    { name: "Начало", url: "/" },
    { name: "Дневник", url: "diary" },
    { name: "Библиотека", url: "library" },
    { name: "Галерия", url: "gallery" },
    { name: "Защо Глогинка?", url: "why" },
    { name: "Моите линкове", url: "links" },
    { name: "Видеа", url: "video" },
    { name: "Музика", url: "mp3" },
    { name: "Файлове", url: "files" },
    { name: "Новини", url: "news" },
    { name: "Глогинки", url: "members" },
    { name: "Минута мълчание ;(", url: "silence" },
    { name: "Календар", url: "calendar" },
    { name: "Чатче", url: "chat" }
    // Add or remove entries as needed
  ];

  const navContainer = document.querySelector("nav#mainNav");
  const ul = document.createElement("ul");

  navItems.forEach(item => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = item.url;
    a.textContent = item.name;
    li.appendChild(a);
    ul.appendChild(li);
  });

  navContainer.appendChild(ul);
  //NAVIGATION SETUP END
}

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

function generateCalendar(month = currentMonth, year = currentYear) {
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;

  const monthNames = ["Януари", "Февруари", "Март", "Април", "Май", "Юни", "Юли", "Август", "Септември", "Октомври", "Ноември", "Декември"];
  const dayNames = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;

  let html = `<table class="centered"><thead>
  <tr class="month">
    <th colspan="7">
      <button onclick="changeMonth(-1)" style="float:left;">←</button>
      ${monthNames[month]} ${year}
      <button onclick="changeMonth(1)" style="float:right;">→</button>
    </th>
  </tr>
  <tr class="weekdays">`;
  for (let d of dayNames) html += `<th>${d}</th>`;
  html += `</tr></thead><tbody><tr>`;

  let day = 1;

  // Empty cells before first day
  for (let i = 0; i < startDay; i++) html += `<td></td>`;

  for (let i = startDay; i < 7; i++) {
    const isToday = isCurrentMonth && day === today.getDate();
    html += `<td class="${isToday ? 'today' : ''}">${day++}</td>`;
  }
  html += `</tr>`;

  while (day <= daysInMonth) {
    html += `<tr>`;
    for (let i = 0; i < 7; i++) {
      if (day <= daysInMonth) {
        const isToday = isCurrentMonth && day === today.getDate();
        html += `<td class="${isToday ? 'today' : ''}">${day++}</td>`;
      } else {
        html += `<td></td>`;
      }
    }
    html += `</tr>`;
  }

  html += `</tbody></table>`;
  document.getElementById("calendar").innerHTML = html;
}

function changeMonth(offset) {
  currentMonth += offset;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  } else if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  generateCalendar(currentMonth, currentYear);
}

document.addEventListener("DOMContentLoaded", async function () {
  await includeHTML();

  renderPrebarDate();
  renderPrebarWeather();
  generateCalendar();
  renderRatingControls();
  renderNavigation();
  loadThemesAndApplySaved();
  renderVisitCounter();
  initComments();
  initChatToggle();

});

// ---------- Backend (Cloudflare Worker, see worker/) ----------

const API = 'https://gloginkabg.nickelfront.workers.dev';

async function api(path, body) {
  const options = body === undefined ? {} : {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
  const res = await fetch(API + path, options);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// Footer "Брой посещения". The server counts each visitor once per day.
async function renderVisitCounter() {
  const totalEl = document.getElementById('visits-total');
  const yesterdayEl = document.getElementById('visits-yesterday');
  if (!totalEl || !yesterdayEl) return;

  let stats = JSON.parse(sessionStorage.getItem('glog-visits') || 'null');
  if (!stats) {
    try {
      const res = await api('/visit', {});
      if (!res.ok) return;
      stats = res.data;
      sessionStorage.setItem('glog-visits', JSON.stringify(stats));
    } catch (err) {
      console.warn('Visit counter failed:', err);
      return;
    }
  }
  totalEl.textContent = stats.total.toLocaleString('bg-BG');
  yesterdayEl.textContent = stats.yesterday.toLocaleString('bg-BG');
}

// Comments. A <section class="comments" data-comments="diary"> gets the list.
// Optional data-comments-limit="3" shows only the newest comments.
// A <form data-comments-form="diary"> posts new comments.
const COMMENT_ERRORS = {
  name: 'Моля, напиши име (до 40 знака).',
  text: 'Моля, напиши коментар (до 2000 знака).',
  captcha: 'Грешен код от картинката.',
  rate: 'Твърде много коментари наведнъж. Опитай пак след малко.',
};

function formatCommentTime(iso) {
  const d = new Date(iso);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('bg-BG', {
      timeZone: 'Europe/Sofia', day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(d).map(p => [p.type, p.value])
  );
  return { date: `${parts.day}.${parts.month}.${parts.year}`, time: `${parts.hour}:${parts.minute}` };
}

function buildComment(comment, number, link) {
  const article = document.createElement('article');
  article.className = 'comment';

  const commenter = document.createElement('div');
  commenter.className = 'commenter';
  const strong = document.createElement('strong');
  strong.textContent = `${number}. ${comment.name}`;
  const time = document.createElement('time');
  time.dateTime = comment.created_at;
  const { date, time: clock } = formatCommentTime(comment.created_at);
  time.append(date, document.createElement('br'), clock);
  commenter.append(strong, time);

  const content = document.createElement('div');
  content.className = 'commentContent';
  content.textContent = comment.text;
  if (link) {
    const a = document.createElement('a');
    a.href = link;
    a.textContent = '»';
    content.append(' ', a);
  }

  article.append(commenter, content);
  return article;
}

async function loadComments(section) {
  const page = section.dataset.comments;
  const limit = parseInt(section.dataset.commentsLimit || '0');
  const link = section.dataset.commentsLink || '';

  let comments = [];
  try {
    const res = await api(`/comments?page=${encodeURIComponent(page)}`);
    comments = res.data.comments || [];
  } catch (err) {
    console.warn('Comments failed:', err);
    section.querySelector('.comments-status')?.replaceChildren('Коментарите не могат да се заредят в момента.');
    return;
  }

  section.querySelectorAll('article.comment, .comments-status').forEach(el => el.remove());
  const start = limit ? Math.max(0, comments.length - limit) : 0;
  comments.slice(start).forEach((c, i) => section.append(buildComment(c, start + i + 1, link)));

  if (!comments.length && !limit) {
    const empty = document.createElement('p');
    empty.className = 'comments-status centered';
    empty.textContent = 'Все още няма коментари. Бъди първи!';
    section.append(empty);
  }

  document.querySelectorAll(`[data-comments-count="${page}"]`)
    .forEach(el => { el.textContent = `Коментари (${comments.length})`; });
}

function initComments() {
  document.querySelectorAll('[data-comments]').forEach(loadComments);

  document.querySelectorAll('form[data-comments-form]').forEach(form => {
    const page = form.dataset.commentsForm;
    const button = form.querySelector('button');
    const message = form.querySelector('.form-message');

    const submit = async () => {
      const body = {
        page,
        name: form.elements.from.value.trim(),
        text: form.elements.comment.value.trim(),
        captcha: form.elements.keystring.value.trim(),
        website: form.elements.website.value,
      };

      // Check in the browser first, so people get the message at once.
      let error = null;
      if (!body.name || body.name.length > 40) error = 'name';
      else if (!body.text || body.text.length > 2000) error = 'text';
      else if (body.captcha.toLowerCase() !== 'abvau') error = 'captcha';
      if (error) { message.textContent = COMMENT_ERRORS[error]; return; }

      button.disabled = true;
      message.textContent = 'Изпращане...';
      try {
        const res = await api('/comments', body);
        if (!res.ok) {
          message.textContent = COMMENT_ERRORS[res.data.error] || 'Нещо се обърка. Опитай пак по-късно.';
          return;
        }
        form.elements.comment.value = '';
        form.elements.keystring.value = '';
        message.textContent = 'Благодаря за коментара!';
        document.querySelectorAll(`[data-comments="${page}"]`).forEach(loadComments);
      } catch (err) {
        console.warn('Comment post failed:', err);
        message.textContent = 'Нещо се обърка. Опитай пак по-късно.';
      } finally {
        button.disabled = false;
      }
    };

    button.addEventListener('click', submit);
    form.addEventListener('submit', e => { e.preventDefault(); submit(); });
  });
}

// Chat page: turn the xat chat (and its radio) off and on.
// The choice is remembered, so the radio stays off on the next visit.
function initChatToggle() {
  const button = document.getElementById('chatToggle');
  const frame = document.getElementById('chatFrame');
  const off = document.getElementById('chatOff');
  if (!button || !frame || !off) return;

  const apply = (enabled) => {
    frame.src = enabled ? frame.dataset.src : 'about:blank';
    frame.hidden = !enabled;
    off.hidden = enabled;
    button.textContent = enabled ? '🔇 Спри чата и радиото' : '🔊 Пусни чата и радиото';
    localStorage.setItem('glog-chat', enabled ? 'on' : 'off');
  };

  apply(localStorage.getItem('glog-chat') !== 'off');
  button.addEventListener('click', () => apply(frame.hidden));
}

function renderPrebarDate() {
  const el = document.getElementById('prebar-date');
  if (!el) return;
  const now = new Date();
  const days = ['неделя', 'понеделник', 'вторник', 'сряда', 'четвъртък', 'петък', 'събота'];
  const months = ['януари', 'февруари', 'март', 'април', 'май', 'юни', 'юли', 'август', 'септември', 'октомври', 'ноември', 'декември'];
  el.textContent = `📅 ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${days[now.getDay()]}`;
}

// WMO weather codes from Open-Meteo, grouped into a few retro labels.
function weatherLabel(code) {
  if (code === 0) return '☀️ Слънчево';
  if (code <= 2) return '🌤️ Предимно слънчево';
  if (code === 3) return '☁️ Облачно';
  if (code <= 48) return '🌫️ Мъгла';
  if (code <= 67 || (code >= 80 && code <= 82)) return '🌧️ Дъжд';
  if (code <= 77 || code === 85 || code === 86) return '❄️ Сняг';
  return '⛈️ Гръмотевици';
}

function renderPrebarWeather() {
  const el = document.getElementById('prebar-weather');
  if (!el) return;
  const show = w => { el.textContent = `${weatherLabel(w.code)}, ${w.temp}°C в София`; };

  const cached = sessionStorage.getItem('glog-weather');
  if (cached) return show(JSON.parse(cached));

  fetch(`${API}/weather`)
    .then(res => res.ok ? res.json() : Promise.reject(res.status))
    .then(w => {
      sessionStorage.setItem('glog-weather', JSON.stringify(w));
      show(w);
    })
    .catch(err => console.warn('Weather failed:', err));
}

function renderRatingControls() {
  const section = document.getElementById("rating");
  if (!section) return;
  section.innerHTML = '';

  let voted = parseInt(localStorage.getItem('glog-rating') || '0');

  const heading = document.createElement('h4');
  heading.innerHTML = '<strong>Рейтинг: –</strong>';
  section.appendChild(heading);

  let votes = 0;
  const showRating = (data) => {
    votes = data.votes;
    heading.firstChild.textContent = `Рейтинг: ${data.average === null ? '–' : data.average.toFixed(1)}`;
    if (!voted) countEl.textContent = `(${votes})`;
  };

  const wrapper = document.createElement('div');
  wrapper.classList.add('thumbs');

  const path = `M394.854,205.444c9.218-15.461,19.102-30.181,14.258-49.527c-2.951-11.632-10.965-21.126-23.882-28.255c3.26-7.982,7.421-22.76,2.008-37.27c-4.893-13.054-16.298-21.663-28.881-26.686c-2.78-16.826-10.323-33.823-23.613-44.935C292.987-16.133,183.129,5.367,138.43,21.437C96.934,36.369,69.053,41.198,24.89,41.198c0,63.444,0,127.334,0,190.761l61.525,0.122c29.336,18.175,52.641,43.992,81.286,63.354c16.981,11.518,51.218,33.62,63.045,119.238c1.439,10.461,5.154,17.55,11.9,21.02c8.714,4.511,19.143,1.211,27.011-3.219c57.615-32.327,1.975-88.536,21.947-132.569c17.168-37.822,53.25-15.054,84.789-22.476c30.425-7.169,36.684-23.459,36.562-35.855C412.843,226.163,402.511,211.451,394.854,205.444z`;

  const countEl = document.createElement('small');
  countEl.textContent = voted ? `Гласувахте: ${voted}/5` : '';

  const spans = [];

  function setColors(n) {
    spans.forEach((s, idx) => s.style.color = idx < n ? '#FFD700' : '#ccc');
  }

  for (let i = 1; i <= 5; i++) {
    const span = document.createElement('span');
    span.style.color = i <= voted ? '#FFD700' : '#ccc';
    span.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 437.85 437.85" style="transform:rotate(180deg);"><path fill="currentColor" d="${path}"/></svg>`;
    span.addEventListener('mouseover', () => setColors(i));
    span.addEventListener('mouseout', () => setColors(voted));
    span.addEventListener('click', () => {
      voted = i;
      localStorage.setItem('glog-rating', i);
      setColors(i);
      countEl.textContent = `Гласувахте: ${i}/5`;
      api('/rating', { value: i })
        .then(res => res.ok && showRating(res.data))
        .catch(err => console.warn('Rating vote failed:', err));
    });
    spans.push(span);
    wrapper.appendChild(span);
  }

  section.appendChild(wrapper);
  section.appendChild(countEl);

  api('/rating')
    .then(res => res.ok && showRating(res.data))
    .catch(err => console.warn('Rating failed:', err));
}

async function includeHTML() {
  const includes = document.querySelectorAll('include-html');
  for (const el of includes) {
    const src = el.getAttribute('src');
    if (!src) continue;

    try {
      const res = await fetch(src);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();

      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;

      // Replace <include-html> tag with the actual content
      while (wrapper.firstChild) {
        el.parentNode.insertBefore(wrapper.firstChild, el);
      }
      el.remove();
    } catch (err) {
      console.warn(`Failed to load ${src}:`, err);
    }
  }
}

function appendHTMLString(target, htmlString) {
  const temp = document.createElement('div');
  temp.innerHTML = htmlString;
  while (temp.firstChild) {
    target.appendChild(temp.firstChild);
  }
}