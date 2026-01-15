/**
 * Unit tests for ImportService
 *
 * TRUE TDD: Tests FIRST, then implementation
 */

import { describe, it, expect, vi } from 'vitest';
import { ImportService } from './ImportService';
import { ImportErrorCode } from './types';

describe('ImportService', () => {
  const sampleKeymap = `
/*
 * Exported from ZMK Studio
 * Date: 2025-11-09T10:00:00Z
 * Device: test-keyboard
 * Version: 1.0.0
 * Layers: 2
 */

#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>

/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
      label = "Default";
      bindings = <
        &kp A &kp B &kp C
      >;
    };

    lower_layer {
      label = "Lower";
      bindings = <
        &kp N1 &kp N2 &trans
      >;
    };
  };
};
`;

  describe('importFromString', () => {
    it('should import valid keymap string', async () => {
      const result = await ImportService.importFromString(sampleKeymap);

      expect(result.success).toBe(true);
      expect(result.layers).toHaveLength(2);
      expect(result.layers![0].label).toBe('Default');
      expect(result.layers![0].bindings).toHaveLength(3);
      expect(result.layers![1].label).toBe('Lower');
      expect(result.layers![1].bindings).toHaveLength(3);
    });

    it('should assign layer IDs sequentially', async () => {
      const result = await ImportService.importFromString(sampleKeymap);

      expect(result.success).toBe(true);
      expect(result.layers![0].id).toBe(0);
      expect(result.layers![1].id).toBe(1);
    });

    it('should assign position to each binding', async () => {
      const result = await ImportService.importFromString(sampleKeymap);

      expect(result.success).toBe(true);

      // First layer bindings
      expect(result.layers![0].bindings[0].position).toBe(0);
      expect(result.layers![0].bindings[1].position).toBe(1);
      expect(result.layers![0].bindings[2].position).toBe(2);

      // Second layer bindings
      expect(result.layers![1].bindings[0].position).toBe(0);
      expect(result.layers![1].bindings[1].position).toBe(1);
      expect(result.layers![1].bindings[2].position).toBe(2);
    });

    it('should convert kp bindings to HID codes', async () => {
      const result = await ImportService.importFromString(sampleKeymap);

      expect(result.success).toBe(true);

      // &kp A -> behaviorId: 1, param1: 0x070004
      expect(result.layers![0].bindings[0].behaviorId).toBe(1);
      expect(result.layers![0].bindings[0].param1).toBe(0x070004);
      expect(result.layers![0].bindings[0].param2).toBeNull();
    });

    it('should convert trans bindings', async () => {
      const result = await ImportService.importFromString(sampleKeymap);

      expect(result.success).toBe(true);

      // &trans -> behaviorId: 0, param1: null, param2: null
      const transBinding = result.layers![1].bindings[2];
      expect(transBinding.behaviorId).toBe(0);
      expect(transBinding.param1).toBeNull();
      expect(transBinding.param2).toBeNull();
    });

    it('should handle complex bindings with multiple parameters', async () => {
      const complexKeymap = `
/ {
  keymap {
    compatible = "zmk,keymap";

    test_layer {
      label = "Test";
      bindings = <
        &mt LCTRL A
        &lt 1 TAB
        &mo 2
      >;
    };
  };
};
`;

      const result = await ImportService.importFromString(complexKeymap);

      expect(result.success).toBe(true);

      // &mt LCTRL A
      expect(result.layers![0].bindings[0].behaviorId).toBe(2);
      expect(result.layers![0].bindings[0].param1).toBe(0x0700E0); // LCTRL
      expect(result.layers![0].bindings[0].param2).toBe(0x070004); // A

      // &lt 1 TAB
      expect(result.layers![0].bindings[1].behaviorId).toBe(3);
      expect(result.layers![0].bindings[1].param1).toBe(1); // Layer number
      expect(result.layers![0].bindings[1].param2).toBe(0x07002B); // TAB

      // &mo 2
      expect(result.layers![0].bindings[2].behaviorId).toBe(4);
      expect(result.layers![0].bindings[2].param1).toBe(2); // Layer number
    });

    it('should return error for empty input', async () => {
      const result = await ImportService.importFromString('');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.code).toBe(ImportErrorCode.PARSE_ERROR);
    });

    it('should return error for invalid format', async () => {
      const result = await ImportService.importFromString('This is not a keymap file');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.code).toBe(ImportErrorCode.PARSE_ERROR);
    });

    it('should include warnings for unknown behaviors', async () => {
      const keymapWithUnknown = `
/ {
  keymap {
    compatible = "zmk,keymap";

    test_layer {
      label = "Test";
      bindings = <
        &kp A
        &unknown_behavior
        &kp B
      >;
    };
  };
};
`;

      const result = await ImportService.importFromString(keymapWithUnknown);

      // Should succeed with warnings
      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);
      expect(result.warnings!.some(w => w.includes('unknown_behavior'))).toBe(true);
    });

    it('should handle empty layers', async () => {
      const emptyLayerKeymap = `
/ {
  keymap {
    compatible = "zmk,keymap";

    empty_layer {
      label = "Empty";
      bindings = <
      >;
    };
  };
};
`;

      const result = await ImportService.importFromString(emptyLayerKeymap);

      expect(result.success).toBe(true);
      expect(result.layers![0].bindings).toEqual([]);
    });
  });

  describe('importFromFile', () => {
    it('should import from File object', async () => {
      // Create mock File
      const mockFile = new File([sampleKeymap], 'test.keymap', {
        type: 'text/plain',
      });

      const result = await ImportService.importFromFile(mockFile);

      expect(result.success).toBe(true);
      expect(result.layers).toHaveLength(2);
    });

    it('should handle file read errors', async () => {
      // Create mock File that will cause read error
      const mockFile = {} as File;

      const result = await ImportService.importFromFile(mockFile);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.code).toBe(ImportErrorCode.FILE_READ_ERROR);
    });
  });

  describe('validateImport', () => {
    it('should validate successful import', () => {
      const validation = ImportService.validateImport({
        success: true,
        layers: [
          {
            id: 0,
            label: 'Default',
            bindings: [
              { behaviorId: 1, param1: 0x04, param2: null, position: 0 },
            ],
          },
        ],
      });

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should detect missing layers', () => {
      const validation = ImportService.validateImport({
        success: true,
        layers: [],
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some(e => e.includes('No layers'))).toBe(true);
    });

    it('should warn about large number of bindings', () => {
      const largeBindings = Array.from({ length: 100 }, (_, i) => ({
        behaviorId: 1,
        param1: 0x04,
        param2: null,
        position: i,
      }));

      const validation = ImportService.validateImport({
        success: true,
        layers: [
          {
            id: 0,
            label: 'Default',
            bindings: largeBindings,
          },
        ],
      });

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some(w => w.includes('many bindings'))).toBe(true);
    });

    it('should detect invalid behavior IDs', () => {
      const validation = ImportService.validateImport({
        success: true,
        layers: [
          {
            id: 0,
            label: 'Default',
            bindings: [
              { behaviorId: 999, param1: null, param2: null, position: 0 },
            ],
          },
        ],
      });

      expect(validation.warnings.length).toBeGreaterThan(0);
      expect(validation.warnings.some(w => w.includes('Invalid behavior'))).toBe(true);
    });
  });
});
