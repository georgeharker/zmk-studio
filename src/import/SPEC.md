# ZMK Studio Import Feature Specification

## Overview

Parse `.keymap` files (DeviceTree format) and load them back into ZMK Studio, reversing the export process.

## User Story

**As a** ZMK keyboard user
**I want to** import existing `.keymap` files into ZMK Studio
**So that** I can edit configurations created manually or from other sources

## Requirements

### Functional Requirements

#### FR-001: File Upload
- User can click "Import" button in toolbar
- File picker allows selecting `.keymap` files
- File is read as text

#### FR-002: DeviceTree Parsing
- Parse C-style comments (/* ... */)
- Parse preprocessor directives (#include, #define)
- Parse devicetree structure (/ { keymap { ... } })
- Extract layer definitions
- Extract bindings from each layer

#### FR-003: Reverse Behavior Mapping
- Convert ZMK codes to behavior IDs:
  - `&trans` → 0
  - `&kp` → 1
  - `&mt` → 2
  - `&lt` → 3
  - `&mo` → 4
  - `&tog` → 5
  - `&bt` → 6

#### FR-004: Reverse Key Name Mapping
- Convert ZMK key names to HID usage codes:
  - `A` → 0x070004
  - `LCTRL` → 0x0700E0
  - `SPACE` → 0x07002C
  - `N1` → 0x07001E
  - etc.

#### FR-005: Layer Reconstruction
- Create Layer objects with:
  - `id`: Sequential (0, 1, 2, ...)
  - `label`: From layer definition
  - `bindings`: Array of Binding objects

#### FR-006: Validation
- Verify file is valid .keymap format
- Check for required includes
- Validate layer structure
- Warn about unsupported features (combos, macros)
- Handle parse errors gracefully

#### FR-007: Error Handling
- Invalid file format → Show error message
- Unknown behaviors → Warn user, use placeholder
- Unknown key names → Warn user, use placeholder
- Parse errors → Show line number and context

#### FR-008: Apply to Keyboard
- Show preview of imported layers before applying
- User confirms import
- Send bindings to keyboard via RPC
- Update UI with imported configuration

### Non-Functional Requirements

#### NFR-001: Performance
- Parse files up to 10KB in < 100ms
- Large files (100KB) in < 1s

#### NFR-002: Test Coverage
- 94%+ code coverage
- TRUE TDD methodology (RED-GREEN-REFACTOR)
- Find and fix real bugs through testing

#### NFR-003: Compatibility
- Support ZMK firmware v3.0+ keymap format
- Handle both old and new syntax variations
- Gracefully ignore unknown directives

## Architecture

### Components

```
ImportButton (UI)
    ↓
ImportService (Orchestration)
    ↓
DeviceTreeParser (Parsing)
    ↓
ReverseBehaviorMapper (ZMK → Behavior ID)
    ↓
ReverseHidMapper (Key Name → HID Code)
    ↓
LayerReconstructor (Build Layer objects)
    ↓
ImportValidator (Validation)
    ↓
RPC: Write to Keyboard
```

### Data Flow

```
1. User selects .keymap file
2. File read as text
3. Parse DeviceTree structure
4. Extract layers and bindings
5. Reverse map ZMK codes → Behavior IDs
6. Reverse map key names → HID codes
7. Reconstruct Layer objects
8. Validate and warn about issues
9. Show preview to user
10. User confirms
11. Write to keyboard via RPC
12. Update UI
```

### File Format Example

```c
/*
 * Exported from ZMK Studio
 * Date: 2025-11-09T10:00:00Z
 * Device: corne
 * Version: 1.0.0
 * Layers: 3
 */

#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>
#include <dt-bindings/zmk/bt.h>

#define DEFAULT 0
#define LOWER 1
#define RAISE 2

/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
      label = "Default";
      bindings = <
        &kp Q &kp W &kp E &kp R &kp T
        &kp Y &kp U &kp I &kp O &kp P
      >;
    };

    lower_layer {
      label = "Lower";
      bindings = <
        &kp N1 &kp N2 &kp N3 &kp N4 &kp N5
        &kp N6 &kp N7 &kp N8 &kp N9 &kp N0
      >;
    };

    raise_layer {
      label = "Raise";
      bindings = <
        &mt LCTRL A &lt 1 TAB &mo 2 &tog 1 &trans
        &bt BT_CLR &bt BT_SEL 0 &trans &trans &trans
      >;
    };
  };
};
```

### Parsing Strategy

1. **Tokenize**: Split into tokens (identifiers, symbols, strings)
2. **Extract Layers**: Find layer definitions by pattern matching
3. **Extract Bindings**: Parse bindings within `< ... >` delimiters
4. **Reverse Map**: Convert each binding to internal format

### Edge Cases

- Empty layers → Import as Layer with empty bindings
- Unknown behaviors → Use placeholder, show warning
- Unknown key names → Use placeholder, show warning
- Combos/macros → Ignore with warning
- Invalid syntax → Show error, highlight line
- Missing includes → Warn but continue
- Custom behaviors → Warn, use comment fallback

## Test Plan

### Unit Tests (Following TDD)

1. **DeviceTreeParser.test.ts** (~30 tests)
   - Parse layer definitions
   - Parse bindings
   - Handle comments
   - Handle defines
   - Handle whitespace variations
   - Parse errors

2. **ReverseBehaviorMapper.test.ts** (~25 tests)
   - All behavior codes (kp, mt, lt, mo, tog, bt, trans)
   - Parameter extraction
   - Unknown behaviors
   - Edge cases

3. **ReverseHidMapper.test.ts** (~25 tests)
   - All key names (letters, numbers, modifiers, special)
   - Modifier detection (LCTRL vs RCTRL)
   - Unknown key names
   - Edge cases

4. **LayerReconstructor.test.ts** (~15 tests)
   - Build Layer objects
   - Position assignment
   - Multiple layers
   - Empty layers

5. **ImportValidator.test.ts** (~20 tests)
   - Valid files
   - Invalid syntax
   - Missing structure
   - Warning generation

6. **ImportService.test.ts** (~20 tests)
   - Full import flow
   - Error handling
   - File reading
   - RPC integration (mocked)

**Total: ~135 tests** (more than export's 98 due to parsing complexity)

### Integration Tests

- Export → Import roundtrip (should match original)
- Import manually created .keymap
- Import from ZMK examples repository
- Error handling with malformed files

### Manual Tests

- Import with real keyboard
- Verify bindings applied correctly
- Test with various keymap complexities

## Success Criteria

- ✅ Can import .keymap files generated by export feature
- ✅ Can import manually created .keymap files
- ✅ Bindings correctly applied to keyboard
- ✅ Clear error messages for invalid files
- ✅ Warnings for unsupported features
- ✅ 94%+ test coverage with TRUE TDD
- ✅ Find and fix at least 2 real bugs through TDD
- ✅ Performance: Parse 10KB file in < 100ms

## Out of Scope

- Combos (show warning, don't import)
- Macros (show warning, don't import)
- Custom behaviors (show warning, use comment)
- Conditional layers (not supported by firmware)
- Editing .keymap in UI (just import/export)

## Dependencies

- Existing export infrastructure (BehaviorMapper, HidMapper)
- RPC system for writing to keyboard
- File reading APIs (browser File API)
- Test framework (Vitest)

## Timeline Estimate

- Specification: 30 min ✅
- Parser implementation + tests: 3-4 hours
- Reverse mappers + tests: 2 hours
- Service + validation + tests: 2 hours
- UI component: 1 hour
- Integration + documentation: 1 hour
- **Total: 9-10 hours** (full day of focused work)

## Risk Mitigation

**Risk**: DeviceTree parsing is complex
**Mitigation**: Start with simple regex-based parser, expand as needed

**Risk**: Unknown behaviors/keys in imported files
**Mitigation**: Use placeholder values, show warnings, allow user to fix manually

**Risk**: File format variations
**Mitigation**: Test with multiple .keymap examples, handle variations gracefully

**Risk**: Performance with large files
**Mitigation**: Optimize parser, add progress indicator for large files

## Future Enhancements

- Combo import (Phase 8)
- Macro import (Phase 9)
- Custom behavior import (Phase 10)
- Merge import (combine with existing config)
- Import from URL (fetch from GitHub)
- Import validation with ZMK compiler API
