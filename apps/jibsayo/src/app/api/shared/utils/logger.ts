const info = (message: string, data?: Record<string, unknown>) => {
  console.log(`ℹ️ [INFO] ${message}`, data);
};

const warn = (message: string, data?: Record<string, unknown>) => {
  console.warn(`⚠️ [WARN] ${message}`, data);
};

const error = (message: string, data?: Record<string, unknown>) => {
  console.error(`❌ [ERROR] ${message}`, data);
};

export const logger = {
  info,
  warn,
  error,
} as const;
