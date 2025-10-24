// js/storage.js
const LS_KEY = "quiz_game_leaderboard_v1";
const LS_QS = "quiz_game_questions_v1";

export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export function saveScore(nick, score) {
  const list = getLeaderboard();
  list.push({ nick: nick || "Игрок", score: Number(score) || 0, date: Date.now() });
  list.sort((a,b) => b.score - a.score || a.date - b.date);
  const sliced = list.slice(0, 50);
  localStorage.setItem(LS_KEY, JSON.stringify(sliced));
  return sliced;
}

export function getSavedQuestions() {
  try {
    const raw = localStorage.getItem(LS_QS);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export function saveQuestions(arr) {
  try {
    localStorage.setItem(LS_QS, JSON.stringify(arr));
    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}

export function resetQuestions() {
  localStorage.removeItem(LS_QS);
}
