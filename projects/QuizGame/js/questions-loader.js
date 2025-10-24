// js/questions-loader.js
import { Question } from './quiz.js';
import { getSavedQuestions, saveQuestions } from './storage.js';

export async function loadQuestions(defaultUrl = './data/questions.json') {
  // first try localStorage
  const saved = getSavedQuestions();
  if (Array.isArray(saved) && saved.length > 0) {
    return saved.map(q => new Question(q.text, q.choices, q.correct));
  }
  // else fetch external JSON
  try {
    const resp = await fetch(defaultUrl, {cache: "no-cache"});
    if (!resp.ok) throw new Error('Не удалось загрузить вопросы');
    const arr = await resp.json();
    // normalize and save to localStorage
    saveQuestions(arr);
    return arr.map(q => new Question(q.text, q.choices, q.correct));
  } catch (e) {
    console.error(e);
    // fallback: minimal in-code questions
    const fallback = [
      new Question("Fallback: Какой язык для разметки?", ["CSS","HTML","JS","SQL"], 1)
    ];
    return fallback;
  }
}

export function importQuestionsFromJsonObject(arr) {
  // validate array and save
  if (!Array.isArray(arr)) throw new Error("Некорректный формат");
  const normalized = arr.map(q => ({ text: String(q.text || ""), choices: q.choices || [], correct: Number(q.correct || 0) }));
  saveQuestions(normalized);
  return normalized.map(q => new Question(q.text, q.choices, q.correct));
}
