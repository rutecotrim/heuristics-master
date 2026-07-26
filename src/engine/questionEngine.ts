import questionsData from '../data/questions.json'
import type { Question } from '../types/game'

const QUESTIONS = questionsData as Question[]

export function getAllQuestions(): Question[] {
  return QUESTIONS
}

/** Pick a random unused question; reshuffle pool when exhausted. */
export function pickQuestion(usedIds: string[]): { question: Question; usedIds: string[] } {
  let pool = QUESTIONS.filter((q) => !usedIds.includes(q.id))
  let nextUsed = [...usedIds]

  if (pool.length === 0) {
    pool = [...QUESTIONS]
    nextUsed = []
  }

  const question = pool[Math.floor(Math.random() * pool.length)]
  return {
    question,
    usedIds: [...nextUsed, question.id],
  }
}

export function isCorrectAnswer(question: Question, answerIndex: number): boolean {
  return question.correctIndex === answerIndex
}
