# 数据库迁移说明 - 添加提醒功能

## 新增功能
已为todo-app添加了基于优先级和创建时间的提醒功能，需要更新数据库结构。

## 需要执行的数据库迁移

### 迁移文件位置
```
supabase/migrations/0003_add_last_reminded_at.sql
```

### 迁移SQL内容
```sql
-- 添加上次提醒时间列到tasks表
alter table tasks add column last_reminded_at timestamptz;

-- 更新现有任务的last_reminded_at为null
update tasks set last_reminded_at = null where last_reminded_at is not null;

-- 添加注释
comment on column tasks.last_reminded_at is '上次提醒时间，用于循环提醒功能';
```

## 如何执行迁移

### 方法1：Supabase控制台（推荐）
1. 登录到您的Supabase控制台
2. 选择您的项目
3. 进入 **SQL Editor**
4. 复制上面的SQL内容
5. 点击 **Run** 执行

### 方法2：使用Supabase CLI（如果已安装）
```bash
# 在项目根目录运行
supabase db push
```

## 提醒功能说明

### 提醒规则
- **高优先级任务**：创建24小时后提醒，之后每24小时提醒一次
- **中优先级任务**：创建48小时后提醒，之后每24小时提醒一次
- **低优先级任务**：创建72小时后提醒，之后每24小时提醒一次

### 提醒流程
1. 应用每5分钟检查一次需要提醒的任务
2. 满足提醒条件的任务会弹出对话框
3. 用户可以选择"稍后提醒"（24小时后再次提醒）或"标记为已完成"
4. 任务完成后不再提醒

### 技术实现
- 新增 `last_reminded_at` 字段到 `tasks` 表
- 在 `todoStore` 中添加提醒检查逻辑
- 新增 `ReminderDialog` 组件用于显示提醒
- 应用启动后每5分钟自动检查提醒

## 测试提醒功能

### 快速测试方法
1. 创建一个新任务（设置优先级）
2. 修改系统时间到未来（用于测试）：
   - 高优先级：24小时后
   - 中优先级：48小时后
   - 低优先级：72小时后
3. 刷新页面，应该看到提醒对话框

### 正常使用
应用会自动在后台检查，无需手动操作。

## 注意事项
1. 迁移需要在应用部署前执行
2. 现有任务不会立即收到提醒，需要等待相应时间
3. 提醒功能依赖于浏览器标签页保持打开状态
4. 如果浏览器关闭，提醒将在下次打开应用时检查