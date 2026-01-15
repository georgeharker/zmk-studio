/**
 * Unit tests for KeymapGenerator
 *
 * Tests DeviceTree .keymap file generation
 */

import { describe, it, expect } from 'vitest';
import { KeymapGenerator } from './KeymapGenerator';
import type { Keymap, Layer } from './types';

describe('KeymapGenerator', () => {
  // Sample test data
  const sampleLayers: Layer[] = [
    {
      id: 0,
      label: 'Default',
      bindings: [
        { behaviorId: 1, param1: (0x07 << 16) + 0x04, param2: null, position: 0 }, // &kp A
        { behaviorId: 1, param1: (0x07 << 16) + 0x05, param2: null, position: 1 }, // &kp B
        { behaviorId: 0, param1: 0, param2: null, position: 2 }, // &trans
      ],
    },
    {
      id: 1,
      label: 'Lower',
      bindings: [
        { behaviorId: 1, param1: (0x07 << 16) + 0x1E, param2: null, position: 0 }, // &kp N1
        { behaviorId: 1, param1: (0x07 << 16) + 0x1F, param2: null, position: 1 }, // &kp N2
        { behaviorId: 4, param1: 0, param2: null, position: 2 }, // &mo 0
      ],
    },
  ];

  const sampleKeymap: Keymap = {
    layers: sampleLayers,
    deviceName: 'test-keyboard',
    timestamp: new Date('2025-11-09T10:00:00Z'),
    version: '1.0.0',
    totalBindings: 6,
  };

  describe('generate', () => {
    it('should generate complete .keymap file', () => {
      const result = KeymapGenerator.generate(sampleKeymap);

      // Should contain metadata
      expect(result).toContain('Exported from ZMK Studio');
      expect(result).toContain('Date: 2025-11-09T10:00:00.000Z');
      expect(result).toContain('Device: test-keyboard');
      expect(result).toContain('Version: 1.0.0');
      expect(result).toContain('Layers: 2');

      // Should contain includes
      expect(result).toContain('#include <behaviors.dtsi>');
      expect(result).toContain('#include <dt-bindings/zmk/keys.h>');
      expect(result).toContain('#include <dt-bindings/zmk/bt.h>');

      // Should contain layer constants
      expect(result).toContain('#define DEFAULT 0');
      expect(result).toContain('#define LOWER 1');

      // Should contain keymap structure
      expect(result).toContain('/ {');
      expect(result).toContain('keymap {');
      expect(result).toContain('compatible = "zmk,keymap";');

      // Should contain layer definitions
      expect(result).toContain('default_layer {');
      expect(result).toContain('label = "Default";');
      expect(result).toContain('lower_layer {');
      expect(result).toContain('label = "Lower";');

      // Should contain footer
      expect(result).toContain('This export does not include:');
      expect(result).toContain('Combos');
      expect(result).toContain('Macros');
    });

    it('should generate valid DeviceTree syntax', () => {
      const result = KeymapGenerator.generate(sampleKeymap);

      // Check for proper structure
      expect(result).toMatch(/\/ \{[\s\S]*keymap \{[\s\S]*\};\s*\};/);
    });
  });

  describe('generateMetadata', () => {
    it('should generate metadata comment block', () => {
      const metadata = {
        timestamp: '2025-11-09T10:00:00.000Z',
        deviceName: 'corne',
        version: '1.0.0',
        layerCount: 3,
      };

      const result = KeymapGenerator.generateMetadata(metadata);

      expect(result).toContain('/*');
      expect(result).toContain('*/');
      expect(result).toContain('Exported from ZMK Studio');
      expect(result).toContain('Date: 2025-11-09T10:00:00.000Z');
      expect(result).toContain('Device: corne');
      expect(result).toContain('Version: 1.0.0');
      expect(result).toContain('Layers: 3');
    });
  });

  describe('generateIncludes', () => {
    it('should generate standard ZMK include directives', () => {
      const result = KeymapGenerator.generateIncludes();

      expect(result).toContain('#include <behaviors.dtsi>');
      expect(result).toContain('#include <dt-bindings/zmk/keys.h>');
      expect(result).toContain('#include <dt-bindings/zmk/bt.h>');
    });
  });

  describe('generateLayerConstants', () => {
    it('should generate #define statements for layers', () => {
      const result = KeymapGenerator.generateLayerConstants(sampleLayers);

      expect(result).toContain('#define DEFAULT 0');
      expect(result).toContain('#define LOWER 1');
    });

    it('should handle layer labels with spaces and special characters', () => {
      const layers: Layer[] = [
        { id: 0, label: 'Default Layer', bindings: [] },
        { id: 1, label: 'Symbols & Numbers', bindings: [] },
        { id: 2, label: 'NAV/Media', bindings: [] },
      ];

      const result = KeymapGenerator.generateLayerConstants(layers);

      expect(result).toContain('#define DEFAULT_LAYER 0');
      expect(result).toContain('#define SYMBOLS_NUMBERS 1');
      expect(result).toContain('#define NAV_MEDIA 2');
    });

    it('should handle empty layer list', () => {
      const result = KeymapGenerator.generateLayerConstants([]);

      expect(result).toBe('');
    });
  });

  describe('generateKeymap', () => {
    it('should generate keymap DeviceTree structure', () => {
      const result = KeymapGenerator.generateKeymap(sampleLayers);

      expect(result).toContain('/ {');
      expect(result).toContain('keymap {');
      expect(result).toContain('compatible = "zmk,keymap";');
      expect(result).toContain('default_layer {');
      expect(result).toContain('lower_layer {');
      expect(result).toContain('};');
    });
  });

  describe('generateLayer', () => {
    it('should generate layer with label and bindings', () => {
      const layer: Layer = {
        id: 0,
        label: 'Test',
        bindings: [
          { behaviorId: 1, param1: (0x07 << 16) + 0x04, param2: null, position: 0 }, // &kp A
          { behaviorId: 0, param1: 0, param2: null, position: 1 }, // &trans
        ],
      };

      const result = KeymapGenerator.generateLayer(layer);

      expect(result).toContain('test_layer {');
      expect(result).toContain('label = "Test";');
      expect(result).toContain('bindings = <');
      expect(result).toContain('&kp A');
      expect(result).toContain('&trans');
      expect(result).toContain('>;');
    });

    it('should format bindings in rows', () => {
      const layer: Layer = {
        id: 0,
        label: 'Full',
        bindings: Array.from({ length: 12 }, (_, i) => ({
          behaviorId: 0,
          param1: 0,
          param2: null,
          position: i,
        })),
      };

      const result = KeymapGenerator.generateLayer(layer);

      // Should have multiple rows (6 bindings per row)
      const bindingLines = result.split('\n').filter(line => line.includes('&trans'));
      expect(bindingLines.length).toBe(2); // 12 bindings / 6 per row = 2 rows
    });

    it('should handle layer labels with special characters', () => {
      const layer: Layer = {
        id: 0,
        label: 'Navigation & Media',
        bindings: [{ behaviorId: 0, param1: 0, param2: null, position: 0 }],
      };

      const result = KeymapGenerator.generateLayer(layer);

      expect(result).toContain('navigation_media_layer {');
      expect(result).toContain('label = "Navigation & Media";');
    });
  });

  describe('generateFooter', () => {
    it('should generate footer with limitation notes', () => {
      const result = KeymapGenerator.generateFooter();

      expect(result).toContain('/*');
      expect(result).toContain('*/');
      expect(result).toContain('This export does not include:');
      expect(result).toContain('Combos');
      expect(result).toContain('Macros');
      expect(result).toContain('Custom behaviors');
      expect(result).toContain('To use this file:');
    });
  });

  describe('layer name formatting', () => {
    it('should convert labels to proper constant names', () => {
      // Test via generateLayerConstants
      const layers: Layer[] = [
        { id: 0, label: 'lower', bindings: [] },
        { id: 1, label: 'UPPER', bindings: [] },
        { id: 2, label: 'MixedCase', bindings: [] },
      ];

      const result = KeymapGenerator.generateLayerConstants(layers);

      expect(result).toContain('#define LOWER 0');
      expect(result).toContain('#define UPPER 1');
      expect(result).toContain('#define MIXEDCASE 2');
    });

    it('should convert labels to proper layer node names', () => {
      // Test via generateLayer
      const layer: Layer = {
        id: 0,
        label: 'UPPER Case',
        bindings: [{ behaviorId: 0, param1: 0, param2: null, position: 0 }],
      };

      const result = KeymapGenerator.generateLayer(layer);

      expect(result).toContain('upper_case_layer {');
    });
  });
});
