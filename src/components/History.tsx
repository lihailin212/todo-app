import { useState, useMemo } from 'react'
import { useTodoStore } from '../store/todoStore'
import { TaskItem } from './TaskItem'
import { Search, Filter, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { startOfDay, endOfDay, subDays, isWithinInterval } from 'date-fns'

type SortOrder = 'newest' | 'oldest'

export function History() {
  const { tasks, categories } = useTodoStore()
  const [searchText, setSearchText] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const completedTasks = tasks.filter(task => task.completed)

  const filteredTasks = useMemo(() => {
    let result = [...completedTasks]

    if (searchText) {
      const search = searchText.toLowerCase()
      result = result.filter(task => 
        task.title.toLowerCase().includes(search) ||
        (task.description && task.description.toLowerCase().includes(search))
      )
    }

    if (selectedCategory !== 'all') {
      result = result.filter(task => task.category_id === selectedCategory)
    }

    const now = new Date()
    if (dateRange !== 'all') {
      const rangeMap: Record<string, { start: Date; end: Date }> = {
        'today': { start: startOfDay(now), end: endOfDay(now) },
        'week': { start: subDays(now, 7), end: now },
        'month': { start: subDays(now, 30), end: now },
        '3months': { start: subDays(now, 90), end: now }
      }
      const range = rangeMap[dateRange]
      if (range) {
        result = result.filter(task => {
          const completedAt = task.completed_at ? new Date(task.completed_at) : null
          return completedAt && isWithinInterval(completedAt, { start: range.start, end: range.end })
        })
      }
    }

    result.sort((a, b) => {
      const dateA = a.completed_at ? new Date(a.completed_at).getTime() : 0
      const dateB = b.completed_at ? new Date(b.completed_at).getTime() : 0
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB
    })

    return result
  }, [completedTasks, searchText, selectedCategory, dateRange, sortOrder])

  const stats = useMemo(() => ({
    total: completedTasks.length,
    thisWeek: completedTasks.filter(task => {
      const completedAt = task.completed_at ? new Date(task.completed_at) : null
      return completedAt && isWithinInterval(completedAt, { 
        start: subDays(new Date(), 7), 
        end: new Date() 
      })
    }).length,
    thisMonth: completedTasks.filter(task => {
      const completedAt = task.completed_at ? new Date(task.completed_at) : null
      return completedAt && isWithinInterval(completedAt, { 
        start: subDays(new Date(), 30), 
        end: new Date() 
      })
    }).length
  }), [completedTasks])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">历史记录</h2>
          <p className="text-sm text-gray-500 mt-1">查看已完成的任务</p>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-500">总计: <span className="font-medium text-gray-700">{stats.total}</span> 项</span>
          <span className="text-gray-500">本周: <span className="font-medium text-gray-700">{stats.thisWeek}</span> 项</span>
          <span className="text-gray-500">本月: <span className="font-medium text-gray-700">{stats.thisMonth}</span> 项</span>
        </div>
      </div>

      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索已完成的任务..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center space-x-2 px-4 py-2 border rounded-lg transition-colors ${
                isFilterOpen ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>筛选</span>
              {isFilterOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {isFilterOpen && (
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">分类:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">所有分类</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">全部时间</option>
                  <option value="today">今天</option>
                  <option value="week">最近7天</option>
                  <option value="month">最近30天</option>
                  <option value="3months">最近90天</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">排序:</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                  className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="newest">最新完成</option>
                  <option value="oldest">最早完成</option>
                </select>
              </div>

              {(searchText || selectedCategory !== 'all' || dateRange !== 'all') && (
                <button
                  onClick={() => {
                    setSearchText('')
                    setSelectedCategory('all')
                    setDateRange('all')
                  }}
                  className="text-sm text-blue-500 hover:text-blue-600"
                >
                  清除筛选
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-4">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {completedTasks.length === 0 
                  ? '暂无已完成的任务' 
                  : '没有找到匹配的任务'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {filteredTasks.length > 0 && (
          <div className="px-4 py-3 border-t bg-gray-50 text-sm text-gray-500 text-center">
            显示 {filteredTasks.length} 项任务
          </div>
        )}
      </div>
    </div>
  )
}
