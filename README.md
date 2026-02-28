# 待办事项助手 - 跨平台PWA应用

一个基于React + Supabase + PWA的现代化待办事项管理应用，支持电脑端和手机端使用，零维护成本。

## ✨ 功能特点

- ✅ **多平台支持**：Web、桌面PWA、手机PWA一套代码
- ✅ **实时同步**：Supabase实时数据库，多设备自动同步
- ✅ **离线使用**：PWA支持离线操作，网络恢复后自动同步
- ✅ **用户认证**：邮箱/密码注册登录，安全可靠
- ✅ **任务管理**：增删改查、优先级、截止日期、分类
- ✅ **零维护成本**：全部使用托管服务，无服务器运维

## 🚀 快速开始

### 1. 环境要求

- Node.js 18+
- npm 或 yarn
- Supabase账号（免费）
- Vercel账号（免费）

### 2. 本地开发

```bash
# 克隆项目
git clone <项目地址>
cd todo-app

# 安装依赖
npm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 填写你的Supabase凭证

# 启动开发服务器
npm run dev
```

### 3. Supabase设置

1. 访问 [supabase.com](https://supabase.com) 注册免费账号
2. 创建新项目，获取以下信息：
   - Project URL → `VITE_SUPABASE_URL`
   - Project API Keys → `anon public` → `VITE_SUPABASE_ANON_KEY`
3. 在Supabase SQL编辑器中运行 `supabase/migrations/0001_initial_schema.sql`

### 4. 部署到Vercel

#### 方式一：GitHub集成（推荐）
1. 将代码推送到GitHub仓库
2. 访问 [vercel.com](https://vercel.com) 登录
3. 点击"New Project"，导入你的GitHub仓库
4. 在环境变量设置中添加：
   - `VITE_SUPABASE_URL` = 你的Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = 你的Supabase Anon Key
5. 点击部署，Vercel会自动构建和部署

#### 方式二：Vercel CLI
```bash
# 全局安装Vercel CLI
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

## 📱 安装为PWA应用

### 桌面端（Windows/macOS）
1. 用Chrome/Edge/Safari打开部署的网站
2. 点击地址栏的"安装"图标（📥）
3. 应用会出现在开始菜单/应用程序文件夹

### 手机端（iOS/Android）
1. 用Safari/Chrome打开部署的网站
2. 点击分享按钮 → "添加到主屏幕"
3. 图标出现在手机桌面，体验接近原生应用

## 🗄️ 数据库结构

```sql
-- 主要表结构
tasks (任务表)
├── id (UUID, 主键)
├── user_id (用户ID, 外键)
├── title (标题)
├── description (描述)
├── completed (完成状态)
├── priority (优先级: 1=高, 2=中, 3=低)
├── due_date (截止日期)
├── created_at (创建时间)
└── updated_at (更新时间)

categories (分类表 - 可选)
├── id (UUID, 主键)
├── user_id (用户ID, 外键)
├── name (分类名称)
└── color (颜色代码)
```

## 🔧 技术栈

| 技术 | 用途 | 说明 |
|------|------|------|
| **React 19** | 前端框架 | 现代化的React生态 |
| **TypeScript** | 类型安全 | 提高代码质量和开发体验 |
| **Tailwind CSS** | UI样式 | 实用优先的CSS框架 |
| **Vite** | 构建工具 | 快速开发服务器和打包 |
| **Supabase** | 后端即服务 | 数据库、认证、实时订阅 |
| **Zustand** | 状态管理 | 轻量级状态管理库 |
| **PWA** | 应用形态 | 渐进式Web应用，可安装 |
| **Vercel** | 托管部署 | 自动部署、CDN、HTTPS |

## 💰 成本估算

| 服务 | 免费额度 | 月成本 |
|------|----------|--------|
| **Supabase** | 500MB数据库，50K月活跃用户 | $0（个人使用） |
| **Vercel** | 100GB带宽，无限制请求 | $0（个人使用） |
| **总计** | - | **$0/月** |

## 🛠️ 开发脚本

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 预览生产版本
npm run preview

# 代码检查
npm run lint
```

## 📁 项目结构

```
todo-app/
├── src/
│   ├── components/     # React组件
│   │   ├── Auth.tsx    # 认证组件
│   │   ├── AddTaskForm.tsx  # 添加任务表单
│   │   ├── TaskItem.tsx     # 任务项组件
│   │   └── TaskList.tsx     # 任务列表组件
│   ├── lib/
│   │   └── supabase.ts # Supabase客户端
│   ├── store/
│   │   └── todoStore.ts # Zustand状态管理
│   ├── types/
│   │   └── todo.ts     # TypeScript类型定义
│   ├── App.tsx         # 主应用组件
│   ├── main.tsx        # 应用入口
│   └── index.css       # 全局样式
├── supabase/
│   └── migrations/     # 数据库迁移文件
├── public/             # 静态资源
├── vite.config.ts      # Vite配置
├── tailwind.config.js  # Tailwind配置
├── package.json        # 依赖配置
└── README.md           # 项目说明
```

## 🔒 安全特性

- **行级安全策略**：用户只能访问自己的数据
- **JWT认证**：Supabase Auth处理用户认证
- **HTTPS强制**：Vercel自动提供SSL证书
- **密码哈希**：Supabase使用bcrypt哈希密码
- **CORS配置**：仅允许信任的源访问API

## 📈 扩展功能建议

1. **团队协作**：共享任务列表，成员权限管理
2. **日历视图**：集成日历，拖拽安排任务
3. **提醒通知**：浏览器推送通知，邮件提醒
4. **文件附件**：支持上传图片、文档到任务
5. **数据导出**：导出为Excel、PDF、CSV格式
6. **标签系统**：多标签分类，智能筛选
7. **统计报表**：任务完成统计，效率分析

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🙏 致谢

- [Vite](https://vitejs.dev/) - 快速的前端构建工具
- [Supabase](https://supabase.com/) - 开源Firebase替代品
- [Tailwind CSS](https://tailwindcss.com/) - 实用的CSS框架
- [Vercel](https://vercel.com/) - 优秀的部署平台

---

**开始使用**：按照上述步骤配置Supabase和Vercel，即可获得一个完全免费、功能完整的待办事项应用！