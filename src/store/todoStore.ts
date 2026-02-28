import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { type Task, type Category, DEFAULT_CATEGORIES } from '../types/todo'
import type { RealtimePostgresChangesPayload, RealtimeChannel } from '@supabase/supabase-js'

let realtimeChannel: RealtimeChannel | null = null

interface TodoStore {
  tasks: Task[]
  categories: Category[]  // 新增
  loading: boolean
  error: string | null
  realtimeConnected: boolean  // 新增：实时连接状态

  fetchTasks: () => Promise<void>
  addTask: (title: string, description?: string, priority?: number, dueDate?: string, categoryId?: string) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTask: (id: string) => Promise<void>

  // 分类方法
  fetchCategories: () => Promise<void>
  addCategory: (name: string, color?: string) => Promise<void>
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>
  deleteCategory: (id: string) => Promise<void>

  // 实时订阅方法
  setupRealtimeSubscription: () => Promise<void>
  cleanupRealtimeSubscription: () => void
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  tasks: [],
  categories: [],  // 新增
  loading: false,
  error: null,
  realtimeConnected: false,  // 新增

  fetchTasks: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      set({ tasks: data || [] })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  addTask: async (title, description, priority = 2, dueDate, categoryId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      const taskData: any = {
        title,
        description,
        priority,
        due_date: dueDate,
        user_id: user.id,
        completed: false
      }

      // 只在categoryId存在时才添加，避免列不存在错误
      if (categoryId) {
        taskData.category_id = categoryId
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single()

      if (error) {
        // 检查是否是"列不存在"错误
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          console.warn('数据库结构不完整，category_id列可能不存在')
          // 重试插入，不带category_id
          const { data: retryData, error: retryError } = await supabase
            .from('tasks')
            .insert({
              title,
              description,
              priority,
              due_date: dueDate,
              user_id: user.id,
              completed: false
            })
            .select()
            .single()

          if (retryError) throw retryError
          if (retryData) {
            set((state) => ({ tasks: [retryData, ...state.tasks] }))
          }
          return
        }
        throw error
      }
      if (data) {
        set((state) => ({ tasks: [data, ...state.tasks] }))
      }
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  updateTask: async (id, updates) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)

      if (error) {
        // 检查是否是"列不存在"错误（特别是category_id）
        if (error.message.includes('column') && error.message.includes('does not exist') && updates.category_id !== undefined) {
          console.warn('数据库结构不完整，category_id列可能不存在')
          // 移除category_id后重试
          const { category_id, ...updatesWithoutCategory } = updates
          const { error: retryError } = await supabase
            .from('tasks')
            .update(updatesWithoutCategory)
            .eq('id', id)

          if (retryError) throw retryError
        } else {
          throw error
        }
      }

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        )
      }))
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  deleteTask: async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error

      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id)
      }))
    } catch (error: any) {
      set({ error: error.message })
    }
  },

  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id)
    if (!task) return

    await get().updateTask(id, { completed: !task.completed })
  },

  // 分类方法
  fetchCategories: async () => {
    set({ loading: true, error: null })
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // 检查是否是"表不存在"错误
        if (error.message.includes('Could not find the table') || error.message.includes('schema cache')) {
          console.warn('categories表不存在，请运行数据库迁移脚本')
          // 设置空分类列表，避免应用崩溃
          set({ categories: [] })
          return
        }
        throw error
      }

      // 如果没有分类，为用户创建默认分类
      if (!data || data.length === 0) {
        // 先创建默认分类
        const defaultCategories = DEFAULT_CATEGORIES.map(cat => ({
          name: cat.name,
          color: cat.color,
          user_id: user.id
        }))

        const { data: createdData, error: createError } = await supabase
          .from('categories')
          .insert(defaultCategories)
          .select()

        if (createError) {
          // 如果插入失败（可能表不存在），静默处理
          if (createError.message.includes('Could not find the table') || createError.message.includes('schema cache')) {
            console.warn('categories表不存在，无法创建默认分类')
            set({ categories: [] })
            return
          }
          throw createError
        }
        set({ categories: createdData || [] })
      } else {
        set({ categories: data || [] })
      }
    } catch (error: any) {
      // 检查是否是"表不存在"错误
      if (error.message && (error.message.includes('Could not find the table') || error.message.includes('schema cache'))) {
        console.warn('categories表不存在，请运行数据库迁移脚本')
        set({ categories: [] })
      } else {
        set({ error: error.message })
      }
    } finally {
      set({ loading: false })
    }
  },

  addCategory: async (name: string, color?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('未登录')

      const { data, error } = await supabase
        .from('categories')
        .insert({
          name,
          color: color || '#3b82f6',
          user_id: user.id
        })
        .select()
        .single()

      if (error) {
        if (error.message.includes('Could not find the table') || error.message.includes('schema cache')) {
          console.warn('categories表不存在，请运行数据库迁移脚本')
          return
        }
        throw error
      }
      if (data) {
        set((state) => ({ categories: [data, ...state.categories] }))
      }
    } catch (error: any) {
      if (error.message && (error.message.includes('Could not find the table') || error.message.includes('schema cache'))) {
        console.warn('categories表不存在，请运行数据库迁移脚本')
      } else {
        set({ error: error.message })
      }
    }
  },

  updateCategory: async (id: string, updates: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)

      if (error) {
        if (error.message.includes('Could not find the table') || error.message.includes('schema cache')) {
          console.warn('categories表不存在，请运行数据库迁移脚本')
          return
        }
        throw error
      }

      set((state) => ({
        categories: state.categories.map((category) =>
          category.id === id ? { ...category, ...updates } : category
        )
      }))
    } catch (error: any) {
      if (error.message && (error.message.includes('Could not find the table') || error.message.includes('schema cache'))) {
        console.warn('categories表不存在，请运行数据库迁移脚本')
      } else {
        set({ error: error.message })
      }
    }
  },

  deleteCategory: async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)

      if (error) {
        if (error.message.includes('Could not find the table') || error.message.includes('schema cache')) {
          console.warn('categories表不存在，请运行数据库迁移脚本')
          return
        }
        throw error
      }

      // 同时更新相关任务的category_id为null
      try {
        await supabase
          .from('tasks')
          .update({ category_id: null })
          .eq('category_id', id)
      } catch (taskError) {
        // 如果tasks表没有category_id列，忽略错误
        console.warn('更新任务分类时出错，可能数据库结构不完整:', taskError)
      }

      set((state) => ({
        categories: state.categories.filter((category) => category.id !== id)
      }))
    } catch (error: any) {
      if (error.message && (error.message.includes('Could not find the table') || error.message.includes('schema cache'))) {
        console.warn('categories表不存在，请运行数据库迁移脚本')
      } else {
        set({ error: error.message })
      }
    }
  },

  // 实时订阅方法
  setupRealtimeSubscription: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    realtimeChannel = supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<Task>) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          if (eventType === 'INSERT') {
            set((state) => ({ tasks: [newRecord, ...state.tasks] }))
          } else if (eventType === 'UPDATE') {
            set((state) => ({
              tasks: state.tasks.map((task) =>
                task.id === newRecord.id ? { ...task, ...newRecord } : task
              )
            }))
          } else if (eventType === 'DELETE') {
            set((state) => ({
              tasks: state.tasks.filter((task) => task.id !== oldRecord.id)
            }))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${user.id}`
        },
        (payload: RealtimePostgresChangesPayload<Category>) => {
          const { eventType, new: newRecord, old: oldRecord } = payload

          if (eventType === 'INSERT') {
            set((state) => ({ categories: [newRecord, ...state.categories] }))
          } else if (eventType === 'UPDATE') {
            set((state) => ({
              categories: state.categories.map((category) =>
                category.id === newRecord.id ? { ...category, ...newRecord } : category
              )
            }))
          } else if (eventType === 'DELETE') {
            set((state) => ({
              categories: state.categories.filter((category) => category.id !== oldRecord.id)
            }))
          }
        }
      )
      .subscribe((status, err) => {
        set({ realtimeConnected: status === 'SUBSCRIBED' })

        // 如果订阅失败，检查是否是表不存在错误
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error('实时连接失败:', status, err)
          if (err && (err.message.includes('Could not find the table') || err.message.includes('schema cache'))) {
            console.warn('categories表不存在，实时订阅部分功能受限')
          }
          // 如果订阅失败，5秒后重试
          setTimeout(() => get().setupRealtimeSubscription(), 5000)
        }
      })
  },

  cleanupRealtimeSubscription: () => {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }
}))