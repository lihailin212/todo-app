-- 添加完成时间列到tasks表
ALTER TABLE tasks ADD COLUMN completed_at timestamptz;

-- 添加注释
COMMENT ON COLUMN tasks.completed_at IS '任务完成时间，用于历史记录查询';
