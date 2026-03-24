const isDev = process.env.NODE_ENV === "development";

/**
 * Centralized logging utility
 *
 * Provides consistent logging across the application with environment-aware behavior:
 * - Development: Logs to browser console
 * - Production: Silent (ready for external error tracking integration)
 *
 * Benefits:
 * - Clean production console (no debug noise)
 * - Single place to integrate Sentry, LogRocket, etc.
 * - Type-safe logging with structured data
 *
 * @example
 * ```ts
 * import { logger } from "@/lib/utils/logger";
 *
 * // Error logging
 * logger.error("Failed to load course", error);
 *
 * // Warning logging
 * logger.warn("Missing translation key", { key: "map.title" });
 *
 * // Info logging (development only)
 * logger.info("User clicked marker", { courseId: 123 });
 * ```
 */
export const logger = {
  /**
   * Log an error
   * @param message - Human-readable error description
   * @param error - Optional error object or additional data
   */
  error: (message: string, error?: unknown) => {
    if (isDev) {
      console.error(message, error);
    }
    // TODO: In production, send to error tracking service
    // Example: Sentry.captureException(error, { tags: { message } });
  },

  warn: (message: string, data?: unknown) => {
    if (isDev) {
      console.warn(message, data);
    }
    // TODO: In production, optionally send warnings to tracking
  },

  info: (message: string, data?: unknown) => {
    if (isDev) {
      console.info(message, data);
    }
  },

  debug: (message: string, data?: unknown) => {
    if (isDev) {
      console.debug(message, data);
    }
  },
};
