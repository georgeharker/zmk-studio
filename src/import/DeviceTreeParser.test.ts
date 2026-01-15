/**
 * Unit tests for DeviceTreeParser
 *
 * TRUE TDD: Write tests FIRST, watch them FAIL, then implement
 */

import { describe, it, expect } from 'vitest';
import { DeviceTreeParser } from './DeviceTreeParser';
import { ParseErrorCode } from './types';

describe('DeviceTreeParser', () => {
  describe('parse - basic functionality', () => {
    it('should parse simple keymap with one layer', () => {
      const input = `
/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
      label = "Default";
      bindings = <
        &kp A &kp B &kp C
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.layers).toHaveLength(1);
      expect(result.layers![0].label).toBe('Default');
      expect(result.layers![0].bindings).toEqual(['&kp A', '&kp B', '&kp C']);
    });

    it('should parse keymap with multiple layers', () => {
      const input = `
/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
      label = "Default";
      bindings = <
        &kp Q &kp W
      >;
    };

    lower_layer {
      label = "Lower";
      bindings = <
        &kp N1 &kp N2
      >;
    };

    raise_layer {
      label = "Raise";
      bindings = <
        &trans &trans
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.layers).toHaveLength(3);
      expect(result.layers![0].label).toBe('Default');
      expect(result.layers![1].label).toBe('Lower');
      expect(result.layers![2].label).toBe('Raise');
    });

    it('should parse complex bindings with multiple parameters', () => {
      const input = `
/ {
  keymap {
    compatible = "zmk,keymap";

    test_layer {
      label = "Test";
      bindings = <
        &mt LCTRL A
        &lt 1 TAB
        &mo 2
        &tog 3
        &bt BT_CLR
        &bt BT_SEL 0
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.layers![0].bindings).toEqual([
        '&mt LCTRL A',
        '&lt 1 TAB',
        '&mo 2',
        '&tog 3',
        '&bt BT_CLR',
        '&bt BT_SEL 0',
      ]);
    });
  });

  describe('parse - whitespace handling', () => {
    it('should handle multiple spaces between bindings', () => {
      const input = `
/ {
  keymap {
    compatible = "zmk,keymap";

    test_layer {
      label = "Test";
      bindings = <
        &kp A    &kp B     &kp C
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.layers![0].bindings).toEqual(['&kp A', '&kp B', '&kp C']);
    });

    it('should handle newlines in bindings', () => {
      const input = `
/ {
  keymap {
    compatible = "zmk,keymap";

    test_layer {
      label = "Test";
      bindings = <
        &kp Q &kp W &kp E
        &kp R &kp T &kp Y
        &kp U &kp I &kp O
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.layers![0].bindings).toHaveLength(9);
    });

    it('should handle mixed whitespace', () => {
      const input = `
/ {
  keymap {
    compatible = "zmk,keymap";

    test_layer {
      label = "Test";
      bindings = <
        &kp A
        &kp B    &kp C
          &kp D
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.layers![0].bindings).toEqual(['&kp A', '&kp B', '&kp C', '&kp D']);
    });
  });

  describe('parse - comments', () => {
    it('should ignore C-style comments', () => {
      const input = `
/* Header comment */
/ {
  keymap {
    compatible = "zmk,keymap";

    /* Layer comment */
    default_layer {
      label = "Default";
      bindings = <
        &kp A /* inline comment */ &kp B
        /* full line comment */
        &kp C
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.layers![0].bindings).toEqual(['&kp A', '&kp B', '&kp C']);
    });

    it('should ignore C++-style comments', () => {
      const input = `
// Header comment
/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
      label = "Default";
      bindings = <
        &kp A // inline comment
        &kp B
        // full line comment
        &kp C
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.layers![0].bindings).toEqual(['&kp A', '&kp B', '&kp C']);
    });
  });

  describe('parse - preprocessor directives', () => {
    it('should ignore #include directives', () => {
      const input = `
#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>
#include <dt-bindings/zmk/bt.h>

/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
      label = "Default";
      bindings = <
        &kp A
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.layers).toHaveLength(1);
    });

    it('should ignore #define directives', () => {
      const input = `
#define DEFAULT 0
#define LOWER 1
#define RAISE 2

/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
      label = "Default";
      bindings = <
        &kp A
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.layers).toHaveLength(1);
    });
  });

  describe('parse - metadata extraction', () => {
    it('should extract metadata from header comment', () => {
      const input = `
/*
 * Exported from ZMK Studio
 * Date: 2025-11-09T10:00:00Z
 * Device: corne
 * Version: 1.0.0
 * Layers: 3
 */

/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
      label = "Default";
      bindings = <
        &kp A
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.device).toBe('corne');
      expect(result.metadata!.date).toBe('2025-11-09T10:00:00Z');
      expect(result.metadata!.version).toBe('1.0.0');
      expect(result.metadata!.layerCount).toBe(3);
    });

    it('should handle missing metadata gracefully', () => {
      const input = `
/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
      label = "Default";
      bindings = <
        &kp A
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.metadata).toBeDefined();
      expect(result.metadata!.device).toBeUndefined();
    });
  });

  describe('parse - edge cases', () => {
    it('should handle empty bindings', () => {
      const input = `
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

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.layers![0].bindings).toEqual([]);
    });

    it('should handle layer with no label', () => {
      const input = `
/ {
  keymap {
    compatible = "zmk,keymap";

    unnamed_layer {
      bindings = <
        &kp A
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.layers![0].label).toBe('');
    });

    it('should handle single binding', () => {
      const input = `
/ {
  keymap {
    compatible = "zmk,keymap";

    single_layer {
      label = "Single";
      bindings = <
        &trans
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.layers![0].bindings).toEqual(['&trans']);
    });

    it('should handle bindings with underscores', () => {
      const input = `
/ {
  keymap {
    compatible = "zmk,keymap";

    test_layer {
      label = "Test";
      bindings = <
        &kp LC_LEFT &kp RC_RIGHT
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(true);
      expect(result.layers![0].bindings).toContain('&kp LC_LEFT');
      expect(result.layers![0].bindings).toContain('&kp RC_RIGHT');
    });
  });

  describe('parse - error handling', () => {
    it('should return error for empty input', () => {
      const result = DeviceTreeParser.parse('');

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.code).toBe(ParseErrorCode.INVALID_FORMAT);
    });

    it('should return error for missing keymap structure', () => {
      const input = `
/ {
  /* No keymap here */
};
`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.code).toBe(ParseErrorCode.MISSING_KEYMAP);
    });

    it('should return error for invalid format', () => {
      const input = `This is not a valid keymap file`;

      const result = DeviceTreeParser.parse(input);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle malformed bindings with warning', () => {
      const input = `
/ {
  keymap {
    compatible = "zmk,keymap";

    test_layer {
      label = "Test";
      bindings = <
        &kp A
        &invalid_behavior
        &kp B
      >;
    };
  };
};
`;

      const result = DeviceTreeParser.parse(input);

      // Should succeed but with warnings
      expect(result.success).toBe(true);
      expect(result.warnings).toBeDefined();
      expect(result.warnings!.length).toBeGreaterThan(0);
      expect(result.layers![0].bindings).toContain('&invalid_behavior');
    });
  });

  describe('parseBinding', () => {
    it('should parse single parameter binding', () => {
      const binding = DeviceTreeParser.parseBinding('&kp A');

      expect(binding).toEqual({
        behavior: 'kp',
        params: ['A'],
      });
    });

    it('should parse two parameter binding', () => {
      const binding = DeviceTreeParser.parseBinding('&mt LCTRL A');

      expect(binding).toEqual({
        behavior: 'mt',
        params: ['LCTRL', 'A'],
      });
    });

    it('should parse no parameter binding', () => {
      const binding = DeviceTreeParser.parseBinding('&trans');

      expect(binding).toEqual({
        behavior: 'trans',
        params: [],
      });
    });

    it('should handle numeric parameters', () => {
      const binding = DeviceTreeParser.parseBinding('&mo 1');

      expect(binding).toEqual({
        behavior: 'mo',
        params: ['1'],
      });
    });
  });
});
