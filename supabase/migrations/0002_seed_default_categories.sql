-- 为现有用户创建默认分类
-- 在Supabase SQL编辑器中运行此脚本

-- 插入默认分类（如果用户还没有这些分类）
INSERT INTO categories (user_id, name, color)
SELECT
  id as user_id,
  '工作' as name,
  '#3b82f6' as color
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE categories.user_id = auth.users.id AND categories.name = '工作'
)
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color)
SELECT
  id as user_id,
  '个人' as name,
  '#10b981' as color
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE categories.user_id = auth.users.id AND categories.name = '个人'
)
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color)
SELECT
  id as user_id,
  '学习' as name,
  '#8b5cf6' as color
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE categories.user_id = auth.users.id AND categories.name = '学习'
)
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color)
SELECT
  id as user_id,
  '购物' as name,
  '#f59e0b' as color
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE categories.user_id = auth.users.id AND categories.name = '购物'
)
ON CONFLICT (user_id, name) DO NOTHING;

INSERT INTO categories (user_id, name, color)
SELECT
  id as user_id,
  '健康' as name,
  '#ef4444' as color
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM categories
  WHERE categories.user_id = auth.users.id AND categories.name = '健康'
)
ON CONFLICT (user_id, name) DO NOTHING;

-- 更新统计信息
COMMENT ON TABLE categories IS '任务分类表，用户可自定义分类来组织任务';
COMMENT ON COLUMN categories.color IS '分类颜色，用于UI显示';