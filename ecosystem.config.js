module.exports = {
    apps: [
        {
            name: "lt-booking-backend",
            cwd: "/var/www/LT-Booking-V3/backend",
            script: "dist/app.js",
            interpreter: "node",
            instances: 1,
            exec_mode: "fork",
            watch: false,
            autorestart: true,
            max_restarts: 10,
            restart_delay: 3000,
            env: {
                NODE_ENV: "production",
                PORT: 5000
            }
        },
        {
            name: "lt-booking-frontend",
            cwd: "/var/www/LT-Booking-V3/frontend",
            script: "npm",
            args: "start",
            interpreter: "none",
            instances: 1,
            exec_mode: "fork",
            watch: false,
            autorestart: true,
            max_restarts: 10,
            restart_delay: 3000,
            env: {
                NODE_ENV: "production",
                PORT: 3000
            }
        }
    ]
}