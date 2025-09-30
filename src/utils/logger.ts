// Console log filtering utility
// This helps reduce console noise in development

const isDevelopment = import.meta.env.DEV;

// Define which log types to suppress
const suppressedLogs = {
  useRolePermissions: !isDevelopment, // Only show in production if needed
  universalContentEditor: !isDevelopment,
  directusService: false, // Keep these always
  authentication: false, // Keep auth logs
};

export const createLogger = (namespace: string) => {
  const shouldSuppress = suppressedLogs[namespace as keyof typeof suppressedLogs];

  return {
    log: (...args: unknown[]) => {
      if (!shouldSuppress) {
        console.log(`[${namespace}]`, ...args);
      }
    },
    warn: (...args: unknown[]) => {
      if (!shouldSuppress) {
        console.warn(`[${namespace}]`, ...args);
      }
    },
    error: (...args: unknown[]) => {
      // Always show errors
      console.error(`[${namespace}]`, ...args);
    },
    info: (...args: unknown[]) => {
      if (!shouldSuppress) {
        console.info(`[${namespace}]`, ...args);
      }
    },
  };
};
