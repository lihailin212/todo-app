# 数据库设置指南

## 问题描述
登录后出现错误：`Could not find the table 'public.categories' in the schema cache`

这个错误表示Supabase数据库中缺少必要的表结构。

## 解决方案

### 方法1：通过Supabase Dashboard运行SQL（推荐）

1. 登录 [Supabase Dashboard](https://app.supabase.com)
2. 选择你的项目（URL: `https://wjaqkmmauwcixzatydgy.supabase.co`）
3. 在左侧菜单中选择 **SQL Editor**
4. 点击 **New query** 创建新查询
5. 复制以下SQL代码并运行：

```sql
-- 启用UUID扩展
create extension if not exists "uuid-ossp";

-- 类别表
create table categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  color text default '#3b82f6',
  created_at timestamptz default now(),
  unique(user_id, name)
);

alter table categories enable row level security;

create policy "用户只能访问自己的类别"
  on categories for all
  using (auth.uid() = user_id);

-- 为任务添加类别外键
alter table tasks add column category_id uuid references categories(id) on delete set null;
```

6. 运行成功后，可以继续运行默认分类数据：

```sql
-- 为现有用户创建默认分类
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

-- 重复上述语句为其他默认分类：个人、学习、购物、健康
```

### 方法2：使用Supabase CLI

如果你安装了Supabase CLI：

```bash
# 确保在项目根目录
cd /c/Users/lihailin/todo-app

# 链接到你的Supabase项目
supabase link --project-ref wjaqkmmauwcixzatydgy

# 推送迁移文件
supabase db push
```

### 方法3：直接运行完整的初始迁移

在SQL Editor中运行 `supabase/migrations/0001_initial_schema.sql` 文件的全部内容。

## 验证数据库结构

运行以下SQL验证表是否创建成功：

```sql
-- 检查表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('categories', 'tasks');

-- 检查tasks表是否有category_id列
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'tasks'
  AND column_name = 'category_id';
```

## 临时解决方案

如果你暂时不想运行数据库迁移，应用已经添加了错误处理：
- 分类功能将显示为空
- 创建任务时不能选择分类
- 其他基本功能正常

错误信息会在浏览器控制台中显示：`categories表不存在，请运行数据库迁移脚本`

## 注意事项

1. **数据安全**：运行SQL前请备份重要数据
2. **权限**：确保Supabase项目有正确的权限设置
3. **网络**：确保能正常访问Supabase服务

## 帮助

如果遇到问题：
1. 检查Supabase项目是否正确配置
2. 确认环境变量 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 正确
3. 查看浏览器控制台的详细错误信息
4. 检查Supabase Dashboard中的表结构

迁移完成后，刷新页面即可使用完整的分类功能和实时同步功能。