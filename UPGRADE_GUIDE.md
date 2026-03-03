# todo-app 提醒功能升级指南

## 📋 升级概览

本次更新为todo-app添加了基于优先级和创建时间的提醒功能。升级需要两个步骤：
1. **更新前端代码** - 替换或更新源代码文件
2. **更新数据库结构** - 执行数据库迁移脚本

## 🔍 检查当前版本

在升级前，请先确认公司电脑上的当前版本：

1. **检查是否有源代码**：
   ```bash
   # 查看是否有以下目录结构
   ls -la
   # 应该有 src/, package.json, vite.config.ts 等文件
   ```

2. **检查是否有dist文件夹**：
   ```bash
   # 查看dist文件夹是否存在
   ls -la dist/
   ```

3. **检查数据库字段**（可选）：
   ```sql
   -- 在Supabase控制台运行
   SELECT column_name
   FROM information_schema.columns
   WHERE table_name = 'tasks' AND column_name = 'last_reminded_at';
   ```

## 🚀 升级步骤

### 情况A：公司电脑有完整源代码（推荐）

如果公司电脑有完整的源代码和开发环境（Node.js、npm）：

#### 步骤1：备份现有代码
```bash
# 建议先备份当前代码
cp -r todo-app todo-app-backup-$(date +%Y%m%d)
```

#### 步骤2：获取最新代码
**方法1：使用git（如果有）**
```bash
git pull origin main
# 或
git fetch origin
git merge origin/main
```

**方法2：手动复制文件**
从最新版本的电脑复制以下文件/文件夹到公司电脑：

```
必需的文件/文件夹：
1. src/types/todo.ts                    # 更新Task接口
2. src/store/todoStore.ts              # 添加提醒状态管理
3. src/components/ReminderDialog.tsx   # 新增提醒对话框组件
4. src/App.tsx                         # 集成提醒功能
5. src/components/AddTaskForm.tsx      # 添加调试按钮

新增的文件：
1. supabase/migrations/0003_add_last_reminded_at.sql  # 数据库迁移
2. REMINDER_FEATURE_SETUP.md           # 功能说明文档
```

#### 步骤3：安装依赖
```bash
# 确保依赖是最新的
npm install
```

#### 步骤4：重新构建应用
```bash
# 构建生产版本
npm run build
```

#### 步骤5：运行数据库迁移
```sql
-- 在Supabase控制台运行以下SQL
-- 文件位置：supabase/migrations/0003_add_last_reminded_at.sql

-- 添加上次提醒时间列到tasks表
alter table tasks add column last_reminded_at timestamptz;

-- 更新现有任务的last_reminded_at为null
update tasks set last_reminded_at = null where last_reminded_at is not null;

-- 添加注释
comment on column tasks.last_reminded_at is '上次提醒时间，用于循环提醒功能';
```

#### 步骤6：重启应用
```bash
# Windows
start.bat

# macOS/Linux
./start.sh
```

### 情况B：公司电脑只有dist文件夹（生产环境）

如果公司电脑只有编译后的dist文件夹，没有源代码：

#### 步骤1：在开发电脑上构建
在已经有最新代码的电脑上：

```bash
# 1. 确保代码是最新的
cd todo-app

# 2. 安装依赖（如果需要）
npm install

# 3. 构建生产版本
npm run build

# 4. dist文件夹现在包含最新代码
```

#### 步骤2：复制dist文件夹
将开发电脑上的 `dist/` 文件夹复制到公司电脑，替换原有的dist文件夹。

#### 步骤3：运行数据库迁移（同上）
在Supabase控制台运行迁移SQL。

#### 步骤4：重启应用
```bash
# 重新启动HTTP服务器
# Windows: 双击 start.bat
# macOS/Linux: ./start.sh
```

### 情况C：使用自动化部署

如果使用自动化部署工具（如GitHub Actions、CI/CD）：

1. **更新部署脚本**，确保包含构建步骤
2. **添加数据库迁移步骤**到部署流程
3. **触发重新部署**

## 🔧 数据库迁移详细说明

### 为什么需要数据库迁移？
新功能需要 `last_reminded_at` 字段来记录上次提醒时间，实现循环提醒。

### 迁移执行方法

#### 方法1：Supabase控制台（推荐）
1. 登录 [Supabase控制台](https://app.supabase.com)
2. 选择您的项目
3. 进入 **SQL Editor**
4. 粘贴迁移SQL内容
5. 点击 **Run** 执行

#### 方法2：使用Supabase CLI
```bash
# 安装Supabase CLI（如果还没有）
npm install -g supabase

# 登录
supabase login

# 运行迁移
supabase db push
```

### 验证迁移成功
```sql
-- 检查字段是否添加成功
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'tasks'
  AND column_name = 'last_reminded_at';
```

## 🧪 升级后测试

升级完成后，请测试以下功能：

### 测试1：基本功能
1. ✅ 应用能正常启动
2. ✅ 能登录/注册
3. ✅ 能创建、编辑、删除任务

### 测试2：提醒功能
1. **创建测试任务**：
   - 创建一个高优先级任务
   - 创建时间会自动记录

2. **测试提醒检查**：
   - 登录后打开浏览器控制台（F12）
   - 运行：`useTodoStore.getState().checkReminders()`
   - 查看控制台输出

3. **测试提醒对话框**（需要模拟时间）：
   ```javascript
   // 在控制台运行测试脚本
   const store = useTodoStore.getState()

   // 如果有任务，可以模拟修改创建时间（仅测试）
   if (store.tasks.length > 0) {
     const task = store.tasks[0]
     console.log('任务信息:', {
       标题: task.title,
       优先级: task.priority,
       创建时间: task.created_at,
       是否完成: task.completed
     })
   }

   // 手动触发提醒检查
   store.checkReminders()
   console.log('需要提醒的任务数:', store.reminders.length)
   ```

### 测试3：调试按钮
在添加任务表单底部找到"调试区域"，测试：
- ✅ "立即检查提醒" 按钮
- ✅ "显示测试说明" 按钮

## ⚠️ 注意事项

### 1. 数据库兼容性
- 迁移脚本是幂等的，可以安全地多次运行
- 现有数据不会丢失，新字段默认值为NULL
- 现有任务不会立即收到提醒，需要等待相应时间

### 2. 浏览器缓存
升级后，用户可能需要**清除浏览器缓存**或**强制刷新**（Ctrl+F5）才能加载最新代码。

### 3. 定时器行为
- 提醒功能每5分钟检查一次
- 需要浏览器标签页保持打开状态
- 如果浏览器关闭，下次打开时会检查

### 4. 多设备同步
- 提醒状态（last_reminded_at）存储在数据库中
- 多设备登录时会同步提醒状态
- 在一台设备上标记"稍后提醒"，其他设备也会看到更新

## 🔄 回滚方案

如果升级后发现问题，可以回滚：

### 回滚前端代码
```bash
# 恢复备份的代码
rm -rf todo-app
cp -r todo-app-backup-20260302 todo-app
```

### 回滚数据库（如果需要）
```sql
-- 移除新增的字段
ALTER TABLE tasks DROP COLUMN last_reminded_at;
```

## 📞 故障排除

### 问题1：应用启动失败
**可能原因**：依赖版本不匹配
**解决方案**：
```bash
# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 问题2：数据库迁移失败
**可能原因**：字段已存在
**解决方案**：
```sql
-- 先检查字段是否存在，如果存在则跳过
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'last_reminded_at'
  ) THEN
    ALTER TABLE tasks ADD COLUMN last_reminded_at timestamptz;
  END IF;
END $$;
```

### 问题3：提醒功能不工作
**检查步骤**：
1. 确认数据库迁移已执行
2. 检查浏览器控制台是否有错误
3. 运行 `useTodoStore.getState().checkReminders()` 查看输出
4. 确认任务未完成且创建时间足够久

### 问题4：界面显示异常
**解决方案**：
1. 清除浏览器缓存：Ctrl+Shift+Delete
2. 强制刷新页面：Ctrl+F5
3. 检查控制台错误信息

## 📊 版本变更记录

### v1.1 - 提醒功能
**新增**：
- 基于优先级和创建时间的提醒功能
- 高优先级：24小时后提醒
- 中优先级：48小时后提醒
- 低优先级：72小时后提醒
- 循环提醒直到任务完成
- 提醒对话框组件
- 调试和测试工具

**修改的文件**：
- src/types/todo.ts
- src/store/todoStore.ts
- src/App.tsx
- src/components/AddTaskForm.tsx
- 新增：src/components/ReminderDialog.tsx
- 新增：supabase/migrations/0003_add_last_reminded_at.sql
- 新增：REMINDER_FEATURE_SETUP.md

**数据库变更**：
- tasks表新增 last_reminded_at 字段

## 🎯 升级完成确认清单

- [ ] 前端代码已更新
- [ ] 应用成功构建（npm run build 无错误）
- [ ] 数据库迁移已执行
- [ ] 应用能正常启动
- [ ] 基本功能测试通过
- [ ] 提醒功能测试通过
- [ ] 调试按钮正常工作

升级完成后，用户将在任务超过指定时间后收到弹出对话框提醒，确保重要任务不会被遗忘。

**升级时间估计**：15-30分钟（取决于网络速度和经验）