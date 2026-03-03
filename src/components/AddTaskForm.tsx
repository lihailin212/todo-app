import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTodoStore } from '../store/todoStore'

export function AddTaskForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<1 | 2 | 3>(2)
  const [dueDate, setDueDate] = useState('')
  const [categoryId, setCategoryId] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [isButtonEnabled, setIsButtonEnabled] = useState(false)
  const { addTask, loading, categories, fetchCategories, checkReminders } = useTodoStore()

  // 添加调试函数来手动测试
  const debugSetTitle = (text: string) => {
    console.log('🔧 手动设置标题:', text)
    setTitle(text)
    setIsButtonEnabled(!!text.trim())
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value
    console.log('📝 输入事件触发，值:', `"${newTitle}"`)
    console.log('📝 输入事件对象:', {
      target: e.target,
      targetValue: e.target.value,
      currentTarget: e.currentTarget,
      currentTargetValue: e.currentTarget.value
    })
    setTitle(newTitle)
    setIsButtonEnabled(!!newTitle.trim())
  }


  console.log('AddTaskForm - 当前状态:', {
    title: title,
    titleTrimmed: title.trim(),
    titleEmpty: !title.trim(),
    isButtonEnabled: isButtonEnabled,
    description: description,
    categoryId: categoryId,
    loading: loading,
    categoriesCount: categories.length,
    categories: categories.map(cat => ({ id: cat.id, name: cat.name, color: cat.color }))
  })

  // 直接记录每个状态值
  console.log('按钮禁用状态:', !isButtonEnabled, '标题:', `"${title}"`, 'trim后:', `"${title.trim()}"`, 'isButtonEnabled:', isButtonEnabled)
  console.log('分类数据:', categories.length, '个分类:', categories)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('handleSubmit被调用，标题:', `"${title}"`, 'trim后:', `"${title.trim()}"`, '是否为空:', !title.trim())

    if (!title.trim()) {
      console.warn('标题为空，阻止提交')
      return
    }

    console.log('开始添加任务，参数:', {
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate || undefined,
      categoryId: categoryId || undefined
    })

    try {
      await addTask(title.trim(), description.trim(), priority, dueDate || undefined, categoryId || undefined)
      console.log('任务添加成功')
    } catch (error) {
      console.error('添加任务失败:', error)
    }

    // 重置表单
    setTitle('')
    setDescription('')
    setPriority(2)
    setDueDate('')
    setCategoryId('')
    setIsExpanded(false)
    setIsButtonEnabled(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-4 mb-6 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={title}
            onChange={handleInput}
            onInput={handleInput as any}
            placeholder="添加新任务...（必填）"
            className="w-full px-4 py-3 text-lg border-none focus:outline-none focus:ring-0 placeholder-gray-400"
            id="task-title-input"
          />
        </div>
        <button
          type="submit"
          disabled={!isButtonEnabled}
          className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          添加
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述（可选）
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="任务详细描述..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                优先级
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p as 1 | 2 | 3)}
                    className={`flex-1 px-4 py-2 rounded-md border text-sm font-medium
                      ${priority === p
                        ? p === 1
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : p === 2
                          ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                          : 'bg-green-100 text-green-800 border-green-300'
                        : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                  >
                    {p === 1 ? '高优先级' : p === 2 ? '中优先级' : '低优先级'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                截止日期（可选）
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              分类（可选）
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">无分类</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 调试区域 */}
      <div className="mt-4 pt-4 border-t border-dashed border-gray-300">
        <div className="text-xs text-gray-500 mb-2">调试区域（仅开发环境显示）</div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => debugSetTitle('测试任务1')}
            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
          >
            设置标题：测试任务1
          </button>
          <button
            type="button"
            onClick={() => debugSetTitle('测试任务2')}
            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
          >
            设置标题：测试任务2
          </button>
          <button
            type="button"
            onClick={() => debugSetTitle('')}
            className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
          >
            清空标题
          </button>
          <button
            type="button"
            onClick={() => console.log('当前状态:', { title, isButtonEnabled, description, categoryId })}
            className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200"
          >
            打印状态
          </button>
          <button
            type="button"
            onClick={async () => {
              console.log('🔄 手动重新加载分类...')
              await fetchCategories()
              console.log('分类重新加载完成，当前分类:', categories)
            }}
            className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200"
          >
            重新加载分类
          </button>
          <button
            type="button"
            onClick={() => {
              console.log('🔔 手动检查提醒...')
              checkReminders()
              console.log('提醒检查完成，查看控制台输出')
            }}
            className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded hover:bg-purple-200"
          >
            立即检查提醒
          </button>
          <button
            type="button"
            onClick={() => {
              console.log('🧪 运行提醒测试脚本...')
              // 在控制台提供测试脚本
              console.log(`
可以在浏览器控制台运行以下代码进行测试：

// 1. 获取当前store状态
const store = useTodoStore.getState()

// 2. 如果有任务，修改第一个任务的创建时间为24小时前（仅本地测试）
if (store.tasks.length > 0) {
  const task = store.tasks[0]
  const fakeCreatedAt = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  console.log('模拟修改任务创建时间:', task.title, '->', fakeCreatedAt)

  // 注意：这只是本地模拟，不会保存到数据库
  // 实际测试需要修改数据库中的created_at字段
}

// 3. 运行提醒检查
store.checkReminders()
`)
            }}
            className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded hover:bg-orange-200"
          >
            显示测试说明
          </button>
        </div>
      </div>
    </form>
  )
}