// js/quiz.js
export class Question {
    constructor(text, choices = [], correctIndex = 0) {
      this.text = text;
      this.choices = choices;
      this.correctIndex = correctIndex;
    }
  
    isCorrect(choiceIndex) {
      return choiceIndex === this.correctIndex;
    }
  }
  
  export class Quiz {
    constructor(questions = []) {
      this.questions = questions.slice();
      this.current = 0;
      this.correctCount = 0;
      this.score = 0;
      this.answered = Array(this.questions.length).fill(false);
    }
  
    get length() { return this.questions.length; }
  
    getCurrentQuestion() {
      return this.questions[this.current] || null;
    }
  
    answer(choiceIndex, timeTaken = 0, timeLimit = 30) {
      if (this.answered[this.current]) return { accepted: false, correct: false, bonus: 0 };
      const q = this.getCurrentQuestion();
      const correct = q.isCorrect(choiceIndex);
      this.answered[this.current] = true;
      let bonus = 0;
      if (correct) {
        this.correctCount += 1;
        // базовое очко + бонус за скорость: бонус = Math.round( (timeLeft / timeLimit) * 5 )
        const timeLeft = Math.max(0, timeLimit - timeTaken);
        bonus = Math.round((timeLeft / timeLimit) * 5);
        this.score += 1 + bonus;
      }
      return { accepted: true, correct, bonus };
    }
  
    next() {
      if (this.current < this.questions.length - 1) {
        this.current += 1;
        return true;
      }
      return false;
    }
  
    reset() {
      this.current = 0;
      this.correctCount = 0;
      this.score = 0;
      this.answered = Array(this.questions.length).fill(false);
    }
  
    replaceQuestions(newQuestions = []) {
      this.questions = newQuestions.slice();
      this.answered = Array(this.questions.length).fill(false);
      this.reset();
    }
  }
  