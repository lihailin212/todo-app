import { Loader2, Inbox } from 'lucide-react'
import { useTodoStore } from '../store/todoStore'
import { TaskItem } from './TaskItem'
import { useEffect, useState } from 'react'

export function TaskList() {
  const { tasks, loading, error, fetchTasks, categories } = useTodoStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    fetchTasks()
  }, [])

  if (loading && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-500">加载任务中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        <p className="font-medium">加载失败</p>
        <p className="text-sm mt-1">{error}</p>
        <button
          onClick={fetchTasks}
          className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
        >
          重试
        </button>
      </div>
    )
  }

  // 根据选择的分类筛选任务
  const filteredTasks = selectedCategory === 'all'
    ? tasks
    : tasks.filter(task => task.category_id === selectedCategory)

  const completedTasks = filteredTasks.filter((task) => task.completed)
  const pendingTasks = filteredTasks.filter((task) => !task.completed)

  const sortedPendingTasks = [...pendingTasks].sort((a, b) => {
    // 按优先级排序（数字越小优先级越高）
    if (a.priority !== b.priority) return a.priority - b.priority
    // 按截止日期排序（无截止日期的排后面）
    if (a.due_date && b.due_date) return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    if (a.due_date && !b.due_date) return -1
    if (!a.due_date && b.due_date) return 1
    // 按创建时间排序（新的在前）
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })

  return (
    <div className="space-y-6">
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有任务</h3>
          <p className="text-gray-500 max-w-md">
            开始添加你的第一个待办事项吧！点击上方的"+"按钮创建新任务。
          </p>
        </div>
      ) : (
        <>
          {sortedPendingTasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    待完成任务 ({pendingTasks.length})
                  </h2>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">所有分类</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <span className="text-sm text-gray-500">
                  {completedTasks.length} 项已完成
                </span>
              </div>
              <div className="space-y-3">
                {sortedPendingTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="pt-6 border-t">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                已完成任务 ({completedTasks.length})
              </h2>
              <div className="space-y-3 opacity-75">
                {completedTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}