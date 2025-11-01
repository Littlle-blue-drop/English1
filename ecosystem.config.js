module.exports = {
  apps: [{
    name: "voice-evaluation-app",
    script: "npm",
    args: "start",
    instances: 1,
    exec_mode: "fork",
    env: {
      NODE_ENV: "production",
      PORT: 3000
    },
    error_file: "./logs/pm2-error.log",
    out_file: "./logs/pm2-out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    merge_logs: true,
    max_memory_restart: "500M",
    min_uptime: "10s",
    max_restarts: 10,
    autorestart: true,
    watch: false,
    ignore_watch: [
      "node_modules",
      ".next",
      "logs",
      ".git"
    ]
  }]
}

