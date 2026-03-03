export interface Task {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 1 | 2 | 3 // 1:高, 2:中, 3:低
  due_date?: string
  created_at: string
  updated_at: string
  user_id: string
  category_id?: string  // 新增字段
  last_reminded_at?: string  // 上次提醒时间，用于循环提醒
}

export interface Category {
  id: string
  name: string
  color: string  // 改为必填字段
  user_id: string
  created_at: string
}

export type Priority = 1 | 2 | 3

export const PRIORITY_LABELS: Record<Priority, string> = {
  1: '高优先级',
  2: '中优先级',
  3: '低优先级'
}

export const PRIORITY_COLORS: Record<Priority, string> = {
  1: 'bg-red-100 text-red-800 border-red-200',
  2: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  3: 'bg-green-100 text-green-800 border-green-200'
}

// 分类相关常量
export const DEFAULT_CATEGORIES = [
  { name: '工作', color: '#3b82f6' },
  { name: '个人', color: '#10b981' },
  { name: '学习', color: '#8b5cf6' },
  { name: '购物', color: '#f59e0b' },
  { name: '健康', color: '#ef4444' }
]

export const CATEGORY_COLORS = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444',
  '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#84cc16'
]