// Tipos compartilhados da Academia de IA BioPar

export type UserRole = 'student' | 'admin'
export type ModuleStatus = 'not_started' | 'in_progress' | 'completed'
export type ActivityType = 'content' | 'ai_practice' | 'quiz'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: UserRole
  department: string | null
  created_at: string
}

export interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  active: boolean
  created_at: string
}

export interface Module {
  id: string
  course_id: string
  number: number
  title: string
  description: string | null
  estimated_minutes: number
  content: ModuleContent | null
  active: boolean
}

export interface ModuleContent {
  objective: string
  steps: ModuleStep[]
}

export type ModuleStep =
  | ContentStep
  | LimitationsStep
  | AIPracticeStep
  | QuizStep

export interface ContentStep {
  type: 'content'
  title: string
  body: string
  highlight?: string
  cta: string
}

export interface LimitationsStep {
  type: 'limitations'
  title: string
  cards: { icon: 'warning' | 'success'; text: string }[]
  cta: string
}

export interface AIPracticeStep {
  type: 'ai_practice'
  title: string
  instructions: string
  hints: string[]
  placeholder: string
}

export interface QuizStep {
  type: 'quiz'
  title: string
  question: string
  options: { id: string; text: string }[]
  correct: string
  explanation: string
}

export interface Activity {
  id: string
  module_id: string
  activity_type: ActivityType
  title: string
  instructions: string | null
  content: Record<string, unknown> | null
  sequence: number
}

export interface UserProgress {
  id: string
  user_id: string
  course_id: string
  module_id: string
  status: ModuleStatus
  started_at: string | null
  completed_at: string | null
  score: number | null
}

export interface ActivityAttempt {
  id: string
  user_id: string
  activity_id: string
  answer: string | null
  score: number | null
  feedback: string | null
  attempt_number: number
  created_at: string
}

// Resposta estruturada do Tutor IA
export interface TutorEvaluation {
  objective: boolean
  context: boolean
  sources: boolean
  output_format: boolean
  score: number
  feedback: string
  missing: string[]
  can_continue: boolean
}
