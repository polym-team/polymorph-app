const info = (message: string, data?: Record<string, unknown>) => {
  console.log(`----- ℹ️ [INFO] ${message} -----`);
  console.log(`💾data:\n${JSON.stringify(data, null, 2)}`);
  console.log(`----- ℹ️ [INFO] ${message} -----`);
};

const warn = (message: string, data?: Record<string, unknown>) => {
  console.warn(`----- ⚠️ [WARN] ${message} -----`);
  console.warn(data);
  console.warn(`----- ⚠️ [WARN] ${message} -----`);
};

const error = (message: string, data?: Record<string, unknown>) => {
  console.error(`----- ❌ [ERROR] ${message} -----`);
  console.error(data);
  console.error(`----- ❌ [ERROR] ${message} -----`);
};

export const logger = {
  info,
  warn,
  error,
} as const;
