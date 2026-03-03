module.exports = {
  apps: [{
    name: 'todo-app',
    script: 'node_modules/vite/bin/vite.js',
    args: '--port 5173',
    cwd: process.cwd(),
    env: {
      NODE_ENV: 'development',
      // 加载.env.local文件中的环境变量
      // PM2会自动加载当前目录下的.env文件
    },
    env_production: {
      NODE_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/error.log',
    out_file: './logs/output.log',
    log_file: './logs/combined.log',
    time: true,
    interpreter: 'node'
  }]
};