/**
 * ExportNotifications: User-friendly error and success messages
 *
 * Provides clear, actionable feedback for export operations
 */

import { ExportResult, ExportErrorCode } from './types';

export class ExportNotifications {
  /**
   * Get user-friendly error message based on error code
   *
   * @param result - Export result with error details
   * @returns User-friendly error message
   */
  static getErrorMessage(result: ExportResult): string {
    if (!result.error) {
      return 'Unknown error occurred';
    }

    switch (result.error.code) {
      case ExportErrorCode.NO_KEYBOARD:
        return 'No keyboard connected. Please connect a ZMK Studio-compatible keyboard and try again.';

      case ExportErrorCode.RPC_FAILURE:
        return 'Failed to communicate with keyboard. Please check the connection and try again.';

      case ExportErrorCode.UNKNOWN_BEHAVIOR:
        return `Export completed with warnings. Some behaviors could not be recognized and were marked with comments. The file was generated but should be reviewed manually before compiling.`;

      case ExportErrorCode.INVALID_LAYER:
        return 'Invalid layer configuration. Please ensure your keyboard has at least one configured layer.';

      case ExportErrorCode.GENERATION_FAILED:
        return `File generation failed: ${result.error.message}. Please try again or report this issue.`;

      default:
        return `Export failed: ${result.error.message}`;
    }
  }

  /**
   * Get success message with filename
   *
   * @param filename - Generated filename
   * @returns Success message
   */
  static getSuccessMessage(filename: string): string {
    return `Keymap exported successfully as "${filename}". You can now compile this file with ZMK firmware builder.`;
  }

  /**
   * Get warning message for partial success
   *
   * @param warnings - Array of warning messages
   * @returns Warning message
   */
  static getWarningMessage(warnings: string[]): string {
    if (warnings.length === 0) {
      return '';
    }

    return `Export completed with ${warnings.length} warning(s):\n${warnings.join('\n')}`;
  }

  /**
   * Log error to console with context
   *
   * @param result - Export result
   */
  static logError(result: ExportResult): void {
    if (result.error) {
      console.error('[Export Error]', {
        code: result.error.code,
        message: result.error.message,
        context: result.error.context,
      });
    }
  }

  /**
   * Log success to console
   *
   * @param result - Export result
   */
  static logSuccess(result: ExportResult): void {
    console.log('[Export Success]', {
      filename: result.filename,
      contentLength: result.content?.length,
    });
  }
}
