// js/ui.js
import { getLeaderboard, saveScore, getSavedQuestions, saveQuestions } from './storage.js';

const START = document.getElementById("start-block");
const QUIZ = document.getElementById("quiz-block");
const RESULT = document.getElementById("result-block");
const EDITOR = document.getElementById("editor-block");

const startBtn = document.getElementById("start-btn");
const nicknameInput = document.getElementById("nickname");
const leaderboardPreview = document.getElementById("leaderboard-list");
const manageQuestionsBtn = document.getElementById("manage-questions-btn");
const importBtn = document.getElementById("import-btn");

const playerNameEl = document.getElementById("player-name");
const questionText = document.getElementById("question-text");
const answersWrap = document.getElementById("answers");
const currentIndexEl = document.getElementById("current-index");
const totalCountEl = document.getElementById("total-count");
const timerEl = document.getElementById("timer");
const timerBar = document.getElementById("timer-bar");
const nextBtn = document.getElementById("next-btn");
const quitBtn = document.getElementById("quit-btn");
const timeBonusEl = document.getElementById("time-bonus");
const liveScoreEl = document.getElementById("live-score");

const scoreEl = document.getElementById("score");
const correctCountEl = document.getElementById("correct-count");
const restartBtn = document.getElementById("restart-btn");
const toStartBtn = document.getElementById("to-start-btn");
const leaderboardTableBody = document.querySelector("#leaderboard-table tbody");

const addQBtn = document.getElementById("add-q-btn");
const editorList = document.getElementById("editor-list");
const backToStartBtn = document.getElementById("back-to-start-btn");
const resetDefaultBtn = document.getElementById("reset-default-btn");

let timerInterval = null;
let timerStart = null;
let timeLimit = 30;
let presentAnswerHandler = null;

function showPanel(panelEl) {
  // simple animation: add exit class to all visible, then show the target
  const panels = [START, QUIZ, RESULT, EDITOR];
  panels.forEach(p => {
    if (p === panelEl) return;
    if (p.classList.contains('visible')) {
      p.classList.remove('visible');
      p.classList.add('hidden-exit');
      setTimeout(()=>p.classList.remove('hidden-exit'), 420);
    }
  });
  panelEl.classList.add('visible');
}

export function initUIState() {
  renderLeaderboardPreview();
  renderLeaderboardFull();
  showPanel(START);
}

export function bindCallbacks(cb) {
  startBtn.addEventListener("click", () => {
    const nick = nicknameInput.value.trim() || "Игрок";
    cb.onStart && cb.onStart(nick);
  });

  nextBtn.addEventListener("click", () => cb.onNext && cb.onNext());
  quitBtn.addEventListener("click", () => cb.onQuit && cb.onQuit());
  restartBtn.addEventListener("click", () => cb.onRestart && cb.onRestart());
  toStartBtn.addEventListener("click", () => showPanel(START));

  manageQuestionsBtn.addEventListener("click", () => {
    renderEditor();
    showPanel(EDITOR);
  });

  backToStartBtn.addEventListener("click", () => showPanel(START));

  addQBtn.addEventListener("click", () => addEditorItem());
  resetDefaultBtn.addEventListener("click", () => {
    saveQuestions([]);
    location.reload();
  });

  importBtn.addEventListener("click", () => {
    // prompt for JSON paste
    const raw = prompt("Вставьте JSON-массив вопросов (или отмена):");
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      // delegate import handling if provided
      cb.onImport && cb.onImport(parsed);
    } catch (e) {
      alert("Некорректный JSON");
    }
  });
}

function renderLeaderboardPreview() {
  const list = getLeaderboard().slice(0,5);
  leaderboardPreview.innerHTML = "";
  if (list.length === 0) {
    leaderboardPreview.innerHTML = "<li>Пока нет данных</li>";
    return;
  }
  for (const l of list) {
    const li = document.createElement("li");
    li.textContent = `${l.nick} — ${l.score}`;
    leaderboardPreview.appendChild(li);
  }
}

export function renderLeaderboardFull() {
  const list = getLeaderboard();
  leaderboardTableBody.innerHTML = "";
  if (list.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="3">Пока нет данных</td>`;
    leaderboardTableBody.appendChild(tr);
    return;
  }
  list.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>#${idx+1}</td><td>${escapeHtml(row.nick)}</td><td>${row.score}</td>`;
    leaderboardTableBody.appendChild(tr);
  });
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function(m){ return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m];});
}

export function showQuiz(nick, totalCount) {
  playerNameEl.textContent = nick;
  totalCountEl.textContent = String(totalCount);
  liveScoreEl.textContent = "0";
  showPanel(QUIZ);
}

export function showResult(score, correctCount) {
  scoreEl.textContent = String(score);
  correctCountEl.textContent = String(correctCount);
  renderLeaderboardFull();
  showPanel(RESULT);
}

export function presentQuestion(questionObj, index, total, opts = {}) {
  timeLimit = opts.time || 30;
  currentIndexEl.textContent = String(index+1);
  questionText.innerHTML = escapeHtml(questionObj.text);
  answersWrap.innerHTML = "";
  questionObj.choices.forEach((choice, idx) => {
    const btn = document.createElement("button");
    btn.className = "answer-btn";
    btn.type = "button";
    btn.dataset.index = String(idx);
    btn.innerHTML = escapeHtml(choice);
    btn.addEventListener("click", () => {
      // compute timeTaken
      const timeTaken = Math.floor((Date.now() - timerStart) / 1000);
      stopTimer();
      disableAnswerButtons();
      if (presentAnswerHandler) presentAnswerHandler(idx, timeTaken);
    });
    answersWrap.appendChild(btn);
  });
  nextBtn.hidden = true;
  timeBonusEl.textContent = "0";
  startTimer(timeLimit, (left) => {
    const percent = Math.max(0, (left / timeLimit) * 100);
    timerBar.style.width = percent + "%";
    timerEl.textContent = String(left);
  }, () => {
    // time end handler
    disableAnswerButtons();
    if (presentAnswerHandler) presentAnswerHandler(-1, timeLimit); // treat as wrong, full timeTaken
  });
}

function disableAnswerButtons() {
  const btns = answersWrap.querySelectorAll("button");
  btns.forEach(b => { b.classList.add("disabled"); b.disabled = true; });
}

export function markAnswer(choiceIndex, correctIndex, bonus) {
  const btns = answersWrap.querySelectorAll("button");
  btns.forEach(b => {
    const idx = Number(b.dataset.index);
    b.classList.add("disabled");
    b.disabled = true;
    if (idx === correctIndex) b.classList.add("correct");
    if (choiceIndex === idx && choiceIndex !== correctIndex) b.classList.add("wrong");
  });
  if (bonus && bonus > 0) timeBonusEl.textContent = `+${bonus}`;
  nextBtn.hidden = false;
}

export function updateLiveScore(score) {
  liveScoreEl.textContent = String(score);
}

function startTimer(seconds, onTick, onEnd) {
  stopTimer();
  timerStart = Date.now();
  timerEl.textContent = String(seconds);
  timerBar.style.width = "100%";
  let left = seconds;
  timerInterval = setInterval(()=> {
    left -= 1;
    if (left < 0) left = 0;
    onTick && onTick(left);
    if (left <= 0) {
      stopTimer();
      onEnd && onEnd();
    }
  },1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

export function setPresentOnAnswer(fn) { presentAnswerHandler = fn; }

export function setNextHandler(fn) { nextBtn.onclick = fn; }

export function saveScoreAndRefreshLeaderboard(nick, score) {
  saveScore(nick, score);
  renderLeaderboardPreview();
  renderLeaderboardFull();
}

function renderEditor() {
  const saved = getSavedQuestions() || [];
  editorList.innerHTML = "";
  if (saved.length === 0) {
    const note = document.createElement("div");
    note.className = "editor-note";
    note.textContent = "Вопросов пока нет. Нажмите Добавить вопрос.";
    editorList.appendChild(note);
    return;
  }
  saved.forEach((q, idx) => {
    const item = document.createElement("div");
    item.className = "editor-item";
    item.innerHTML = `
      <div class="row">
        <input class="q-text" value="${escapeHtml(q.text)}" />
      </div>
      <div class="row">
        <input class="c0" placeholder="Ответ 1" value="${escapeHtml(q.choices[0]||'')}" />
        <input class="c1" placeholder="Ответ 2" value="${escapeHtml(q.choices[1]||'')}" />
      </div>
      <div class="row">
        <input class="c2" placeholder="Ответ 3" value="${escapeHtml(q.choices[2]||'')}" />
        <input class="c3" placeholder="Ответ 4" value="${escapeHtml(q.choices[3]||'')}" />
      </div>
      <div class="row">
        <label>Правильный (0-3)</label>
        <input class="correct" type="number" min="0" max="3" value="${Number(q.correct||0)}" style="width:80px" />
        <div style="flex:1"></div>
        <button class="save-btn btn primary">Сохранить</button>
        <button class="delete-btn btn ghost">Удалить</button>
      </div>
    `;
    editorList.appendChild(item);

    const saveBtn = item.querySelector('.save-btn');
    const deleteBtn = item.querySelector('.delete-btn');

    saveBtn.addEventListener('click', () => {
      const text = item.querySelector('.q-text').value.trim();
      const choices = [item.querySelector('.c0').value, item.querySelector('.c1').value, item.querySelector('.c2').value, item.querySelector('.c3').value].map(s=>s||'');
      let correct = Number(item.querySelector('.correct').value || 0);
      if (!text || choices.every(c=>!c)) { alert('Вопрос или ответы пустые'); return; }
      if (correct < 0 || correct > 3) correct = 0;
      saved[idx] = { text, choices, correct };
      saveQuestions(saved);
      alert('Сохранено');
    });

    deleteBtn.addEventListener('click', () => {
      if (!confirm('Удалить вопрос?')) return;
      saved.splice(idx,1);
      saveQuestions(saved);
      renderEditor();
    });
  });
}

function addEditorItem() {
  const saved = getSavedQuestions() || [];
  saved.push({ text: "Новый вопрос", choices: ["Ответ 1","Ответ 2","Ответ 3","Ответ 4"], correct: 0 });
  saveQuestions(saved);
  renderEditor();
}
