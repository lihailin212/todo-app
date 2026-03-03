# todo-app 快速升级指南（针对公司电脑）

## 🎯 最简单升级方法

如果公司电脑**只有dist文件夹**（最常见的情况），按照以下步骤升级：

### 步骤1：在开发电脑上准备新版应用

在**已经有最新代码的电脑**上操作：

1. **打开命令提示符/终端**，进入todo-app目录：
   ```bash
   cd C:\Users\lihailin\todo-app
   ```

2. **确保代码是最新版本**（如果使用git）：
   ```bash
   git pull
   ```

3. **安装依赖**（如果需要）：
   ```bash
   npm install
   ```

4. **构建生产版本**：
   ```bash
   npm run build
   ```

5. **验证构建成功**：
   - 应该看到 `✓ built in X.XXs` 消息
   - 没有红色错误信息

### 步骤2：复制文件到公司电脑

**方法A：使用U盘/移动硬盘**
1. 将开发电脑上 `todo-app/dist/` 整个文件夹复制到U盘
2. 在公司电脑上，备份旧的dist文件夹：
   ```
   # 建议重命名而不是删除
   将 dist 改名为 dist_backup_旧版本
   ```
3. 将U盘中的新dist文件夹复制到公司电脑的todo-app目录

**方法B：使用网络共享/云盘**
1. 将dist文件夹压缩为ZIP文件
2. 上传到云盘（百度网盘、Google Drive等）或通过局域网共享
3. 在公司电脑下载并解压，替换原有dist文件夹

### 步骤3：执行数据库迁移

**必须在浏览器中操作**（任何电脑都可以）：

1. **打开Supabase控制台**：
   - 访问 https://app.supabase.com
   - 登录您的账户
   - 选择todo-app对应的项目

2. **运行SQL迁移**：
   - 点击左侧菜单的 **SQL Editor**
   - 在编辑器中粘贴以下代码：

```sql
-- 添加提醒功能所需的字段
alter table tasks add column last_reminded_at timestamptz;

-- 清理可能存在的旧数据
update tasks set last_reminded_at = null where last_reminded_at is not null;

-- 添加字段说明
comment on column tasks.last_reminded_at is '上次提醒时间，用于循环提醒功能';
```

3. **点击 Run 按钮**执行SQL
4. **验证成功**：应该看到 "Success. No rows returned" 消息

### 步骤4：重启应用

在公司电脑上：

1. **停止正在运行的应用**（如果正在运行）：
   - 在命令提示符窗口中按 **Ctrl+C**
   - 或直接关闭命令提示符窗口

2. **重新启动应用**：
   - **Windows用户**：双击 `start.bat`
   - **macOS/Linux用户**：在终端运行 `./start.sh`

3. **验证启动成功**：
   - 应该看到 "应用地址: http://localhost:8000"
   - 打开浏览器访问 http://localhost:8000

### 步骤5：清除浏览器缓存

**重要**：用户可能需要清除浏览器缓存才能看到新功能：

1. **打开Chrome/Firefox/Edge浏览器**
2. 访问 http://localhost:8000
3. 按 **Ctrl+Shift+Delete** 打开清除浏览数据窗口
4. 选择 "缓存的图片和文件"
5. 点击 "清除数据"
6. 按 **Ctrl+F5** 强制刷新页面

## 📁 需要更新的文件清单

如果公司电脑有完整源代码，需要更新以下文件：

### 必须更新的核心文件：
```
src/types/todo.ts                    # 添加 last_reminded_at 字段
src/store/todoStore.ts              # 添加提醒逻辑
src/components/ReminderDialog.tsx   # 新增提醒对话框
src/App.tsx                         # 集成提醒功能
src/components/AddTaskForm.tsx      # 添加调试按钮
```

### 新增的文件：
```
supabase/migrations/0003_add_last_reminded_at.sql  # 数据库迁移
REMINDER_FEATURE_SETUP.md           # 功能说明文档
UPGRADE_GUIDE.md                    # 升级指南（本文件）
```

### 构建输出文件（dist/）：
```
dist/index.html
dist/assets/index-*.js
dist/assets/index-*.css
dist/sw.js
dist/workbox-*.js
```

## ⏱️ 升级时间估计

| 步骤 | 时间 | 难度 |
|------|------|------|
| 1. 构建新版应用 | 2-5分钟 | 简单 |
| 2. 复制文件 | 1-3分钟 | 简单 |
| 3. 数据库迁移 | 1-2分钟 | 中等 |
| 4. 重启应用 | 1分钟 | 简单 |
| 5. 测试功能 | 2-5分钟 | 简单 |
| **总计** | **7-16分钟** | **简单** |

## 🧪 快速测试验证

升级完成后，请快速测试：

### 测试1：应用基本功能
1. 打开 http://localhost:8000
2. 登录/注册账户 ✓
3. 创建一个新任务 ✓
4. 标记任务为完成 ✓

### 测试2：提醒功能（快速验证）
1. 在浏览器按 **F12** 打开开发者工具
2. 切换到 **Console** 标签页
3. 粘贴以下代码并按回车：

```javascript
// 检查提醒功能是否加载
const store = useTodoStore.getState();
console.log("✅ 提醒功能状态检查：");
console.log("- 任务数量:", store.tasks.length);
console.log("- checkReminders函数:", typeof store.checkReminders);
console.log("- 提醒对话框组件:", typeof ReminderDialog);

// 手动运行提醒检查
store.checkReminders();
console.log("- 需要提醒的任务:", store.reminders.length);
console.log("- 对话框是否可见:", store.reminderDialogVisible);
```

4. 应该看到类似输出：
   ```
   ✅ 提醒功能状态检查：
   - 任务数量: 3
   - checkReminders函数: function
   - 提醒对话框组件: function
   - 需要提醒的任务: 0
   - 对话框是否可见: false
   ```

### 测试3：界面调试按钮
1. 在添加任务表单底部找到 **"调试区域"**
2. 点击 **"立即检查提醒"** 按钮
3. 控制台应该显示 "🔔 手动检查提醒..."
4. 点击 **"显示测试说明"** 按钮
5. 控制台应该显示测试脚本

## 🔧 常见问题解决

### 问题1：应用启动失败，显示"端口被占用"
**解决**：
1. 关闭所有命令提示符窗口
2. 打开任务管理器，结束所有 `python` 或 `node` 进程
3. 重新运行 `start.bat`

### 问题2：页面显示空白或旧版本
**解决**：
1. 按 **Ctrl+F5** 强制刷新
2. 清除浏览器缓存（Ctrl+Shift+Delete）
3. 重启浏览器

### 问题3：数据库迁移失败，显示"column already exists"
**解决**：
- 这表示字段已经存在，可以忽略此错误
- 应用可以正常使用提醒功能

### 问题4：提醒对话框不弹出
**解决**：
1. 确认数据库迁移已执行
2. 创建高优先级任务，等待24小时（真实测试）
3. 或使用控制台测试脚本模拟

## 📞 获取帮助

如果升级遇到问题：

1. **查看详细文档**：
   - `REMINDER_FEATURE_SETUP.md` - 功能详细说明
   - `UPGRADE_GUIDE.md` - 完整升级指南

2. **检查控制台错误**：
   - 按F12打开开发者工具
   - 查看Console标签页的红色错误信息

3. **验证数据库字段**：
   ```sql
   -- 在Supabase SQL Editor中运行
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'tasks';
   -- 应该看到 last_reminded_at 字段
   ```

## ✅ 升级完成确认

完成以下检查项：

- [ ] dist文件夹已更新（文件日期为最新）
- [ ] 数据库迁移已执行（SQL运行成功）
- [ ] 应用能正常启动（显示端口8000）
- [ ] 能正常登录和使用基本功能
- [ ] 控制台检查脚本运行正常
- [ ] 调试按钮可见并正常工作

**恭喜！** 🎉 提醒功能升级完成。用户现在可以为任务设置优先级，并会在指定时间后收到提醒。

> **注意**：提醒功能需要真实时间流逝才会触发（高优先级24小时，中优先级48小时，低优先级72小时）。创建测试任务后，需要等待相应时间才能看到提醒对话框。