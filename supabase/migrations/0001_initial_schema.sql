-- 待办事项应用初始数据库结构
-- 在Supabase SQL编辑器中运行此脚本

-- 启用UUID扩展
create extension if not exists "uuid-ossp";

-- 任务表
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  description text,
  completed boolean default false,
  priority integer default 2 check (priority between 1 and 3), -- 1:高, 2:中, 3:低
  due_date timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 自动更新updated_at字段
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_tasks_updated_at
  before update on tasks
  for each row
  execute function update_updated_at_column();

-- 行级安全策略
alter table tasks enable row level security;

-- 用户只能访问自己的任务
create policy "用户只能访问自己的任务"
  on tasks for all
  using (auth.uid() = user_id);

-- 创建索引以提高查询性能
create index tasks_user_id_idx on tasks(user_id);
create index tasks_completed_idx on tasks(completed);
create index tasks_priority_idx on tasks(priority);
create index tasks_due_date_idx on tasks(due_date);

-- 类别表（可选功能）
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

-- 为任务添加类别外键（可选）
alter table tasks add column category_id uuid references categories(id) on delete set null;

-- 创建任务统计视图（可选）
create view task_stats as
select
  user_id,
  count(*) as total_tasks,
  count(*) filter (where completed = true) as completed_tasks,
  count(*) filter (where completed = false) as pending_tasks,
  count(*) filter (where completed = false and priority = 1) as high_priority_pending,
  count(*) filter (where completed = false and due_date < now()) as overdue_tasks
from tasks
group by user_id;

-- 添加注释
comment on table tasks is '用户任务表';
comment on column tasks.priority is '优先级: 1=高, 2=中, 3=低';
comment on column tasks.due_date is '截止日期';