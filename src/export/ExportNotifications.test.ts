/**
 * Unit tests for ExportNotifications
 *
 * Tests user-friendly error messages and notifications
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ExportNotifications } from './ExportNotifications';
import { ExportResult, ExportErrorCode } from './types';

describe('ExportNotifications', () => {
  let consoleErrorSpy: any;
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  describe('getErrorMessage', () => {
    it('should return message for NO_KEYBOARD error', () => {
      const result: ExportResult = {
        success: false,
        filename: '',
        error: {
          code: ExportErrorCode.NO_KEYBOARD,
          message: 'No keyboard',
        },
      };

      const message = ExportNotifications.getErrorMessage(result);

      expect(message).toContain('No keyboard connected');
      expect(message).toContain('ZMK Studio-compatible');
    });

    it('should return message for RPC_FAILURE error', () => {
      const result: ExportResult = {
        success: false,
        filename: '',
        error: {
          code: ExportErrorCode.RPC_FAILURE,
          message: 'RPC failed',
        },
      };

      const message = ExportNotifications.getErrorMessage(result);

      expect(message).toContain('Failed to communicate');
      expect(message).toContain('check the connection');
    });

    it('should return message for UNKNOWN_BEHAVIOR error', () => {
      const result: ExportResult = {
        success: false,
        filename: '',
        error: {
          code: ExportErrorCode.UNKNOWN_BEHAVIOR,
          message: 'Unknown behavior',
        },
      };

      const message = ExportNotifications.getErrorMessage(result);

      expect(message).toContain('completed with warnings');
      expect(message).toContain('marked with comments');
      expect(message).toContain('reviewed manually');
    });

    it('should return message for INVALID_LAYER error', () => {
      const result: ExportResult = {
        success: false,
        filename: '',
        error: {
          code: ExportErrorCode.INVALID_LAYER,
          message: 'Invalid layer',
        },
      };

      const message = ExportNotifications.getErrorMessage(result);

      expect(message).toContain('Invalid layer configuration');
      expect(message).toContain('at least one configured layer');
    });

    it('should return message for GENERATION_FAILED error', () => {
      const result: ExportResult = {
        success: false,
        filename: '',
        error: {
          code: ExportErrorCode.GENERATION_FAILED,
          message: 'Generation error details',
        },
      };

      const message = ExportNotifications.getErrorMessage(result);

      expect(message).toContain('File generation failed');
      expect(message).toContain('Generation error details');
      expect(message).toContain('try again');
    });

    it('should return default message for unknown error code', () => {
      const result: ExportResult = {
        success: false,
        filename: '',
        error: {
          code: 999 as ExportErrorCode, // Unknown code
          message: 'Custom error message',
        },
      };

      const message = ExportNotifications.getErrorMessage(result);

      expect(message).toContain('Export failed');
      expect(message).toContain('Custom error message');
    });

    it('should return fallback message when error is missing', () => {
      const result: ExportResult = {
        success: false,
        filename: '',
      };

      const message = ExportNotifications.getErrorMessage(result);

      expect(message).toBe('Unknown error occurred');
    });
  });

  describe('getSuccessMessage', () => {
    it('should return success message with filename', () => {
      const message = ExportNotifications.getSuccessMessage('corne-2025-11-09.keymap');

      expect(message).toContain('exported successfully');
      expect(message).toContain('corne-2025-11-09.keymap');
      expect(message).toContain('compile');
      expect(message).toContain('ZMK firmware');
    });

    it('should handle different filenames', () => {
      const filenames = [
        'my-keyboard-2025-11-09.keymap',
        'test.keymap',
        'split-keyboard-backup.keymap',
      ];

      filenames.forEach(filename => {
        const message = ExportNotifications.getSuccessMessage(filename);
        expect(message).toContain(filename);
      });
    });
  });

  describe('getWarningMessage', () => {
    it('should return empty string for no warnings', () => {
      const message = ExportNotifications.getWarningMessage([]);

      expect(message).toBe('');
    });

    it('should return message for single warning', () => {
      const message = ExportNotifications.getWarningMessage([
        'Unknown behavior at position 5',
      ]);

      expect(message).toContain('1 warning');
      expect(message).toContain('Unknown behavior at position 5');
    });

    it('should return message for multiple warnings', () => {
      const warnings = [
        'Warning 1: Unknown behavior',
        'Warning 2: Missing key name',
        'Warning 3: Invalid parameter',
      ];

      const message = ExportNotifications.getWarningMessage(warnings);

      expect(message).toContain('3 warning(s)');
      warnings.forEach(warning => {
        expect(message).toContain(warning);
      });
    });

    it('should format warnings with newlines', () => {
      const warnings = ['Warning A', 'Warning B'];
      const message = ExportNotifications.getWarningMessage(warnings);

      expect(message).toContain('\n');
      expect(message.split('\n').length).toBeGreaterThan(1);
    });
  });

  describe('logError', () => {
    it('should log error to console with details', () => {
      const result: ExportResult = {
        success: false,
        filename: '',
        error: {
          code: ExportErrorCode.NO_KEYBOARD,
          message: 'Test error',
          context: { detail: 'additional info' },
        },
      };

      ExportNotifications.logError(result);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Export Error]',
        expect.objectContaining({
          code: ExportErrorCode.NO_KEYBOARD,
          message: 'Test error',
          context: expect.objectContaining({ detail: 'additional info' }),
        })
      );
    });

    it('should not log if no error present', () => {
      const result: ExportResult = {
        success: true,
        filename: 'test.keymap',
        content: 'content',
      };

      ExportNotifications.logError(result);

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle error without context', () => {
      const result: ExportResult = {
        success: false,
        filename: '',
        error: {
          code: ExportErrorCode.GENERATION_FAILED,
          message: 'Simple error',
        },
      };

      ExportNotifications.logError(result);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Export Error]',
        expect.objectContaining({
          code: ExportErrorCode.GENERATION_FAILED,
          message: 'Simple error',
          context: undefined,
        })
      );
    });
  });

  describe('logSuccess', () => {
    it('should log success to console with details', () => {
      const result: ExportResult = {
        success: true,
        filename: 'corne-2025-11-09.keymap',
        content: 'Generated content here',
      };

      ExportNotifications.logSuccess(result);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Export Success]',
        expect.objectContaining({
          filename: 'corne-2025-11-09.keymap',
          contentLength: 22, // Length of 'Generated content here'
        })
      );
    });

    it('should handle result without content', () => {
      const result: ExportResult = {
        success: true,
        filename: 'test.keymap',
      };

      ExportNotifications.logSuccess(result);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Export Success]',
        expect.objectContaining({
          filename: 'test.keymap',
          contentLength: undefined,
        })
      );
    });

    it('should handle empty content', () => {
      const result: ExportResult = {
        success: true,
        filename: 'empty.keymap',
        content: '',
      };

      ExportNotifications.logSuccess(result);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Export Success]',
        expect.objectContaining({
          contentLength: 0,
        })
      );
    });
  });
});
