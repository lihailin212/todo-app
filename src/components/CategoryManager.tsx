import { useState } from 'react'
import { Plus, Edit2, Trash2, Check, X, Tag } from 'lucide-react'
import { useTodoStore } from '../store/todoStore'
import { type Category, CATEGORY_COLORS } from '../types/todo'

export function CategoryManager() {
  const { categories, addCategory, updateCategory, deleteCategory, loading } = useTodoStore()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0])
  const [editCategoryName, setEditCategoryName] = useState('')
  const [editCategoryColor, setEditCategoryColor] = useState('')

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return

    await addCategory(newCategoryName.trim(), newCategoryColor)
    setNewCategoryName('')
    setNewCategoryColor(CATEGORY_COLORS[0])
    setIsAdding(false)
  }

  const startEdit = (category: Category) => {
    setEditingId(category.id)
    setEditCategoryName(category.name)
    setEditCategoryColor(category.color)
  }

  const saveEdit = async () => {
    if (!editingId || !editCategoryName.trim()) return

    await updateCategory(editingId, {
      name: editCategoryName.trim(),
      color: editCategoryColor
    })
    cancelEdit()
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditCategoryName('')
    setEditCategoryColor('')
  }

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`确定要删除分类"${name}"吗？相关的任务将变为无分类。`)) {
      await deleteCategory(id)
    }
  }

  return (
    <div className="bg-white rounded-lg border p-4 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Tag className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">分类管理</h3>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>添加分类</span>
        </button>
      </div>

      {isAdding && (
        <div className="mb-4 p-4 border rounded-md bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类名称
              </label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="例如：工作、学习..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                颜色
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategoryColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${newCategoryColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-end space-x-2">
              <button
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim() || loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                保存
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Tag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>还没有分类，点击"添加分类"创建一个</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
            >
              {editingId === category.id ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="text"
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-md"
                      autoFocus
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_COLORS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditCategoryColor(color)}
                          className={`w-6 h-6 rounded-full border ${editCategoryColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={saveEdit}
                      disabled={!editCategoryName.trim()}
                      className="p-2 text-green-600 hover:text-green-700"
                      title="保存"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-2 text-gray-600 hover:text-gray-700"
                      title="取消"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-medium">{category.name}</span>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{ backgroundColor: category.color + '20', color: category.color }}
                    >
                      示例标签
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(category)}
                      className="p-2 text-gray-400 hover:text-blue-500 rounded-full hover:bg-blue-50"
                      title="编辑"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      disabled={loading}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 pt-4 border-t text-sm text-gray-500">
        <p>提示：分类可以帮助你更好地组织任务。删除分类不会删除任务，只会将任务设为无分类。</p>
      </div>
    </div>
  )
}