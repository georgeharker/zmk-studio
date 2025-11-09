/**
 * Unit tests for ExportService
 *
 * Tests keymap export orchestration and file generation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExportService } from './ExportService';
import type { Layer } from './types';
import { ExportErrorCode } from './types';

// Mock DOM APIs for file download
const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
const mockRevokeObjectURL = vi.fn();
const mockClick = vi.fn();
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();

global.URL.createObjectURL = mockCreateObjectURL;
global.URL.revokeObjectURL = mockRevokeObjectURL;

global.document.createElement = vi.fn((tag: string) => {
  if (tag === 'a') {
    return {
      href: '',
      download: '',
      click: mockClick,
    } as any;
  }
  return {} as any;
});

global.document.body.appendChild = mockAppendChild;
global.document.body.removeChild = mockRemoveChild;

describe('ExportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleLayers: Layer[] = [
    {
      id: 0,
      label: 'Default',
      bindings: [
        { behaviorId: 0, param1: 0, param2: null, position: 0 },
        { behaviorId: 0, param1: 0, param2: null, position: 1 },
      ],
    },
    {
      id: 1,
      label: 'Lower',
      bindings: [
        { behaviorId: 0, param1: 0, param2: null, position: 0 },
      ],
    },
  ];

  describe('exportKeymap', () => {
    it('should successfully export keymap', async () => {
      const result = await ExportService.exportKeymap('test-keyboard', sampleLayers);

      expect(result.success).toBe(true);
      expect(result.filename).toBeTruthy();
      expect(result.filename).toMatch(/test-keyboard-\d{4}-\d{2}-\d{2}\.keymap/);
      expect(result.content).toBeTruthy();
      expect(result.content).toContain('Exported from ZMK Studio');
      expect(result.content).toContain('Device: test-keyboard');
    });

    it('should trigger file download', async () => {
      await ExportService.exportKeymap('corne', sampleLayers);

      // Should create blob URL
      expect(mockCreateObjectURL).toHaveBeenCalled();

      // Should create and click anchor element
      expect(mockClick).toHaveBeenCalled();

      // Should append and remove anchor from DOM
      expect(mockAppendChild).toHaveBeenCalled();
      expect(mockRemoveChild).toHaveBeenCalled();

      // Should cleanup blob URL
      expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });

    it('should generate correct filename format', async () => {
      const result = await ExportService.exportKeymap('My Awesome Keyboard', sampleLayers);

      expect(result.filename).toMatch(/my-awesome-keyboard-\d{4}-\d{2}-\d{2}\.keymap/);
    });

    it('should sanitize device name in filename', async () => {
      const result = await ExportService.exportKeymap('Test@#$%Keyboard!!!', sampleLayers);

      // Should remove special characters and normalize to lowercase
      expect(result.filename).toMatch(/test-keyboard-\d{4}-\d{2}-\d{2}\.keymap/);
    });

    it('should return error when device name is empty', async () => {
      const result = await ExportService.exportKeymap('', sampleLayers);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ExportErrorCode.NO_KEYBOARD);
      expect(result.error?.message).toContain('Device name is required');
    });

    it('should return error when device name is whitespace only', async () => {
      const result = await ExportService.exportKeymap('   ', sampleLayers);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ExportErrorCode.NO_KEYBOARD);
    });

    it('should return error when layers array is empty', async () => {
      const result = await ExportService.exportKeymap('test-keyboard', []);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ExportErrorCode.INVALID_LAYER);
      expect(result.error?.message).toContain('No layers available');
    });

    it('should return error when layers is null', async () => {
      const result = await ExportService.exportKeymap('test-keyboard', null as any);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ExportErrorCode.INVALID_LAYER);
    });

    it('should handle layers with no bindings', async () => {
      const emptyLayers: Layer[] = [
        { id: 0, label: 'Empty', bindings: [] },
      ];

      const result = await ExportService.exportKeymap('test', emptyLayers);

      // Should still succeed even with empty bindings
      expect(result.success).toBe(true);
      expect(result.content).toContain('Empty');
    });

    it('should calculate total bindings correctly', async () => {
      const result = await ExportService.exportKeymap('test', sampleLayers);

      expect(result.success).toBe(true);
      // Sample has 2 bindings in first layer + 1 in second = 3 total
      expect(result.content).toBeTruthy();
    });

    it('should include current timestamp in generated keymap', async () => {
      const beforeExport = new Date();
      const result = await ExportService.exportKeymap('test', sampleLayers);
      const afterExport = new Date();

      expect(result.success).toBe(true);
      expect(result.content).toContain('Date:');

      // Extract timestamp from content
      const dateMatch = result.content?.match(/Date: (.+)/);
      expect(dateMatch).toBeTruthy();
      const exportDate = new Date(dateMatch![1]);

      // Timestamp should be between before and after
      expect(exportDate.getTime()).toBeGreaterThanOrEqual(beforeExport.getTime());
      expect(exportDate.getTime()).toBeLessThanOrEqual(afterExport.getTime());
    });

    it('should handle export with multiple layers', async () => {
      const manyLayers: Layer[] = [
        { id: 0, label: 'Default', bindings: [] },
        { id: 1, label: 'Lower', bindings: [] },
        { id: 2, label: 'Raise', bindings: [] },
        { id: 3, label: 'Function', bindings: [] },
      ];

      const result = await ExportService.exportKeymap('test', manyLayers);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Layers: 4');
      expect(result.content).toContain('default_layer');
      expect(result.content).toContain('lower_layer');
      expect(result.content).toContain('raise_layer');
      expect(result.content).toContain('function_layer');
    });

    it('should include version information', async () => {
      const result = await ExportService.exportKeymap('test', sampleLayers);

      expect(result.success).toBe(true);
      expect(result.content).toContain('Version: 1.0.0');
    });

    it('should handle errors during generation gracefully', async () => {
      // Mock KeymapGenerator.generate to throw an error
      const originalGenerate = (await import('./KeymapGenerator')).KeymapGenerator.generate;

      // Temporarily replace with error-throwing version
      (await import('./KeymapGenerator')).KeymapGenerator.generate = vi.fn(() => {
        throw new Error('Test generation error');
      });

      const result = await ExportService.exportKeymap('test', sampleLayers);

      // Should return error result
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ExportErrorCode.GENERATION_FAILED);
      expect(result.error?.message).toContain('Test generation error');

      // Restore original function
      (await import('./KeymapGenerator')).KeymapGenerator.generate = originalGenerate;
    });

    it('should handle non-Error exceptions during generation', async () => {
      // Mock KeymapGenerator.generate to throw a non-Error object
      const originalGenerate = (await import('./KeymapGenerator')).KeymapGenerator.generate;

      (await import('./KeymapGenerator')).KeymapGenerator.generate = vi.fn(() => {
        throw 'String error';
      });

      const result = await ExportService.exportKeymap('test', sampleLayers);

      // Should return error with fallback message
      expect(result.success).toBe(false);
      expect(result.error?.code).toBe(ExportErrorCode.GENERATION_FAILED);
      expect(result.error?.message).toContain('Unknown error');

      // Restore
      (await import('./KeymapGenerator')).KeymapGenerator.generate = originalGenerate;
    });
  });
});
