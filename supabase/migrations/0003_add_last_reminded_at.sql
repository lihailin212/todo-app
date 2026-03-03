-- 添加上次提醒时间列到tasks表
alter table tasks add column last_reminded_at timestamptz;

-- 更新现有任务的last_reminded_at为null
update tasks set last_reminded_at = null where last_reminded_at is not null;

-- 添加注释
comment on column tasks.last_reminded_at is '上次提醒时间，用于循环提醒功能';
