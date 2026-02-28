import { Check, Clock, Trash2, Edit } from 'lucide-react'
import { type Task, PRIORITY_LABELS, PRIORITY_COLORS } from '../types/todo'
import { useTodoStore } from '../store/todoStore'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useState } from 'react'

interface TaskItemProps {
  task: Task
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTask, deleteTask, updateTask, categories } = useTodoStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDescription, setEditDescription] = useState(task.description || '')

  const handleSave = async () => {
    await updateTask(task.id, {
      title: editTitle,
      description: editDescription
    })
    setIsEditing(false)
  }

  const priorityClass = PRIORITY_COLORS[task.priority]
  const priorityLabel = PRIORITY_LABELS[task.priority]
  const taskCategory = categories.find(cat => cat.id === task.category_id)

  return (
    <div className="bg-white rounded-lg border p-4 mb-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={() => toggleTask(task.id)}
            className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
              ${task.completed
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 hover:border-green-400'
              }`}
          >
            {task.completed && (
              <Check className="w-3 h-3 text-white" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                  placeholder="添加描述（可选）"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditTitle(task.title)
                      setEditDescription(task.description || '')
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <h3 className={`text-lg font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${priorityClass}`}>
                    {priorityLabel}
                  </span>
                  {taskCategory && (
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: taskCategory.color + '20', color: taskCategory.color }}
                    >
                      {taskCategory.name}
                    </span>
                  )}
                </div>

                {task.description && (
                  <p className="mt-1 text-gray-600 text-sm">{task.description}</p>
                )}

                <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                  {task.due_date && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(task.due_date), 'yyyy-MM-dd', { locale: zhCN })}
                      </span>
                    </div>
                  )}
                  <span>
                    创建于 {format(new Date(task.created_at), 'MM-dd HH:mm', { locale: zhCN })}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50"
              title="编辑"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (window.confirm('确定要删除这个任务吗？')) {
                  deleteTask(task.id)
                }
              }}
              className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}