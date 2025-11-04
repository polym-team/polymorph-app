const info = (message: string, data?: Record<string, unknown>) => {
  console.log(
    `ℹ️ [INFO] ${message}\n\n💾data:\n${JSON.stringify(data, null, 2)}`
  );
};

const warn = (message: string, data?: Record<string, unknown>) => {
  console.warn(
    `⚠️ [WARN] ${message}\n\n💾data:\n${JSON.stringify(data, null, 2)}`
  );
};

const error = (message: string, data?: Record<string, unknown>) => {
  console.error(
    `❌ [ERROR] ${message}\n\n💾data:\n${JSON.stringify(data, null, 2)}`
  );
};

export const logger = {
  info,
  warn,
  error,
} as const;
