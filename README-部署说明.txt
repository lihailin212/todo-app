todo-app 部署说明
====================

这个 todo-app 是一个使用 React + Vite 构建的待办事项应用，数据存储在 Supabase 云端。

部署到其他电脑的步骤：

1. 复制整个文件夹
   - 将整个 "todo-app" 文件夹复制到目标电脑

2. 运行应用
   - Windows 用户: 双击运行 `start.bat`
   - macOS/Linux 用户: 在终端中运行 `./start.sh` (可能需要执行权限: `chmod +x start.sh`)

3. 访问应用
   - 打开浏览器，访问: http://localhost:8000
   - 按 Ctrl+C 停止服务器

系统要求：
- 方法一: Python 3.x (推荐，大多数系统已预装)
- 方法二: Node.js 14+ (需要安装)

如果无法启动：
- 检查是否安装了 Python 或 Node.js
- 打开命令提示符/终端，输入 `python --version` 或 `node --version`
- 如果没有安装，请从以下地址下载：
  * Python: https://www.python.org/downloads/
  * Node.js: https://nodejs.org/

注意事项：
1. 应用需要网络连接，因为数据存储在 Supabase 云端
2. 首次运行可能需要安装依赖 (Node.js 方式会自动安装 serve)
3. 确保防火墙允许端口 8000
4. 如果要修改端口，编辑启动脚本中的端口号 (8000)

文件夹结构：
- dist/           - 编译后的静态文件 (不要修改)
- start.bat      - Windows 启动脚本
- start.sh       - macOS/Linux 启动脚本
- README-部署说明.txt - 本文件

高级选项：
1. 使用其他静态服务器：
   - 安装 Node.js 后: `npm install -g serve` 然后 `serve dist -p 8000`
   - 安装 Python 后: `python -m http.server 8000` (在 dist 目录中)

2. 部署到 Web 服务器：
   - 将 dist 文件夹中的内容上传到任何静态网站托管服务
   - 例如: GitHub Pages, Netlify, Vercel 等

联系支持：
如有问题，请检查控制台错误信息或联系开发者。

版本: 1.0
更新日期: 2026-03-01