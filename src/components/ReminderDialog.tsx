import { AlertTriangle, X, CheckCircle, Clock } from 'lucide-react'
import { type Task, PRIORITY_LABELS, PRIORITY_COLORS } from '../types/todo'
import { useTodoStore } from '../store/todoStore'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface ReminderDialogProps {
  task: Task
}

export function ReminderDialog({ task }: ReminderDialogProps) {
  const { closeReminderDialog, markAsReminded, updateTask } = useTodoStore()

  const priorityClass = PRIORITY_COLORS[task.priority]
  const priorityLabel = PRIORITY_LABELS[task.priority]
  const createdAt = new Date(task.created_at)
  const lastRemindedAt = task.last_reminded_at ? new Date(task.last_reminded_at) : null

  // 计算任务存在时间
  const now = new Date()
  const timeSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

  // 根据优先级计算应该提醒的时间间隔
  const reminderIntervals: Record<1 | 2 | 3, number> = {
    1: 1, // 高优先级：1天
    2: 2, // 中优先级：2天
    3: 3  // 低优先级：3天
  }

  const expectedReminderDay = reminderIntervals[task.priority]

  const handleRemindLater = () => {
    // 标记为已提醒，24小时后会再次提醒
    markAsReminded(task.id)
  }

  const handleCompleteTask = async () => {
    await updateTask(task.id, { completed: true, completed_at: new Date().toISOString() })
    closeReminderDialog()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* 对话框头部 */}
        <div className="p-6 border-b">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">任务提醒</h2>
                <p className="text-sm text-gray-500">您有待完成的任务需要关注</p>
              </div>
            </div>
            <button
              onClick={closeReminderDialog}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 任务详情 */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
            {task.description && (
              <p className="text-gray-600 mb-4">{task.description}</p>
            )}

            {/* 任务信息 */}
            <div className="space-y-3">
              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-700 w-24">优先级:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityClass}`}>
                  {priorityLabel}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-700 w-24">创建时间:</span>
                <span className="text-gray-600">
                  {format(createdAt, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                </span>
              </div>

              {lastRemindedAt && (
                <div className="flex items-center text-sm">
                  <span className="font-medium text-gray-700 w-24">上次提醒:</span>
                  <span className="text-gray-600">
                    {format(lastRemindedAt, 'yyyy年MM月dd日 HH:mm', { locale: zhCN })}
                  </span>
                </div>
              )}

              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-700 w-24">已存在:</span>
                <span className="text-gray-600 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {timeSinceCreation}天
                </span>
              </div>

              <div className="flex items-center text-sm">
                <span className="font-medium text-gray-700 w-24">提醒规则:</span>
                <span className="text-gray-600">
                  每{expectedReminderDay}天提醒一次，直到完成
                </span>
              </div>
            </div>
          </div>

          {/* 提醒消息 */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-800">提醒通知</p>
                <p className="text-sm text-yellow-700 mt-1">
                  {task.priority === 1 ? (
                    <>此<b>高优先级</b>任务已创建{timeSinceCreation}天，请优先处理。</>
                  ) : task.priority === 2 ? (
                    <>此<b>中优先级</b>任务已创建{timeSinceCreation}天，请尽快处理。</>
                  ) : (
                    <>此<b>低优先级</b>任务已创建{timeSinceCreation}天，请记得处理。</>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-3">
            <button
              onClick={handleRemindLater}
              className="flex-1 px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <Clock className="w-5 h-5 mr-2" />
              稍后提醒（24小时后）
            </button>
            <button
              onClick={handleCompleteTask}
              className="flex-1 px-4 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              标记为已完成
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            此提醒将在24小时后再次出现，直到任务完成
          </p>
        </div>
      </div>
    </div>
  )
}