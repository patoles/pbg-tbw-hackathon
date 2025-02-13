const config = {
	apps: [
		{
			name: 'game-app',
			script: 'dist/server/index.js',
			wait_ready: true,
			shutdown_with_message: true,
			listen_timeout: 10000,
			kill_timeout: 3600000,
			instances: 1,
			exec_mode: 'cluster',
			env: {
				NODE_ENV: 'production',
				PORT: 3000,
			},
			max_memory_restart: '1G',
			error_file: 'logs/err.log',
			out_file: 'logs/out.log',
			merge_logs: true,
			time: true,
		},
	],
};

module.exports = config;
