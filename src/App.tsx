import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'
import { AddTaskForm } from './components/AddTaskForm'
import { TaskList } from './components/TaskList'
import { CategoryManager } from './components/CategoryManager'
import { ReminderDialog } from './components/ReminderDialog'
import { History } from './components/History'
import { LogOut, User, Tag, ListFilter, Clock } from 'lucide-react'
import { useTodoStore } from './store/todoStore'
import './App.css'

type TabType = 'tasks' | 'history'

function App() {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showCategoryManager, setShowCategoryManager] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('tasks')
  const { tasks, realtimeConnected, fetchTasks, fetchCategories, setupRealtimeSubscription, cleanupRealtimeSubscription, reminderDialogVisible, currentReminderTask, checkReminders } = useTodoStore()

  useEffect(() => {
    // 检查当前会话
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // 当session变化时，初始化数据和实时订阅
  useEffect(() => {
    if (session) {
      // 初始化时获取数据和建立实时连接
      fetchTasks()
      fetchCategories()
      setupRealtimeSubscription()
    }

    return () => {
      if (session) {
        cleanupRealtimeSubscription()
      }
    }
  }, [session])

  // 定时检查提醒
  useEffect(() => {
    if (!session) return

    // 设置每5分钟检查一次提醒
    const intervalId = setInterval(() => {
      checkReminders()
    }, 5 * 60 * 1000) // 5分钟

    // 立即检查一次
    checkReminders()

    return () => {
      clearInterval(intervalId)
    }
  }, [session, checkReminders])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">✓</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">待办事项助手</h1>
                <p className="text-sm text-gray-500">高效管理你的任务</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">{session.user.email}</span>
                {realtimeConnected ? (
                  <span className="text-xs text-green-500" title="实时同步已连接">●</span>
                ) : (
                  <span className="text-xs text-yellow-500" title="离线模式">●</span>
                )}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>退出</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            欢迎回来，{session.user.email?.split('@')[0]}！
          </h2>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              今天你有 {tasks.filter(task => !task.completed).length} 个待完成任务。保持高效！
            </p>
            <button
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="flex items-center space-x-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Tag className="w-4 h-4" />
              <span>{showCategoryManager ? '隐藏分类管理' : '管理分类'}</span>
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span>当前任务</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>历史记录</span>
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {showCategoryManager && <CategoryManager />}
          {activeTab === 'tasks' && (
            <>
              <AddTaskForm />
              <TaskList />
            </>
          )}
          {activeTab === 'history' && <History />}
        </div>
      </main>

      {/* 提醒对话框 */}
      {reminderDialogVisible && currentReminderTask && (
        <ReminderDialog task={currentReminderTask} />
      )}

      {/* 页脚 */}
      <footer className="mt-12 border-t pt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>待办事项助手 © {new Date().getFullYear()} - 跨平台任务管理工具</p>
          <p className="mt-2">
            支持PWA安装：在浏览器中点击"添加到主屏幕"即可在桌面和手机端使用
          </p>
          <div className="mt-4 flex items-center justify-center space-x-6">
            <a href="#" className="text-blue-500 hover:text-blue-600">帮助</a>
            <a href="#" className="text-blue-500 hover:text-blue-600">反馈</a>
            <a href="#" className="text-blue-500 hover:text-blue-600">隐私政策</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
