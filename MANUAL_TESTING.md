# Manual Testing Guide - ZMK Studio Export Feature

## Prerequisites
- ZMK-compatible keyboard with Studio support
- OR mock/simulated keyboard for testing

## Test Procedure

### 1. Start ZMK Studio
```bash
cd ~/zmk-studio
bun run dev
```
Open browser to http://localhost:5173

### 2. Connect Keyboard
- Plug in ZMK keyboard with Studio support
- Verify device appears in connection dropdown
- Select and connect

### 3. Configure Test Layers
Create a test configuration:
- **Layer 0 (Default)**: Basic letters (Q, W, E, R, T, Y...)
- **Layer 1 (Lower)**: Numbers (1, 2, 3, 4, 5...)
- **Layer 2 (Raise)**: Symbols, layer switches

Add some complex bindings:
- Mod-tap: Hold Ctrl, tap A
- Layer-tap: Hold for Layer 1, tap TAB
- Momentary layer: &mo 1
- Toggle layer: &tog 2

### 4. Export Keymap
- Click **Export** button (download icon in toolbar)
- File downloads: `{device-name}-YYYY-MM-DD.keymap`

### 5. Manual Inspection

#### Check File Structure
Open the .keymap file in text editor:

✅ **Metadata Header**
```c
/*
 * Exported from ZMK Studio
 * Date: 2025-11-09T...
 * Device: {your-keyboard}
 * Version: 1.0.0
 * Layers: {count}
 */
```

✅ **Includes Present**
```c
#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>
#include <dt-bindings/zmk/bt.h>
```

✅ **Layer Constants**
```c
#define DEFAULT 0
#define LOWER 1
#define RAISE 2
```

✅ **Keymap Structure**
```c
/ {
  keymap {
    compatible = "zmk,keymap";

    default_layer {
      label = "Default";
      bindings = <
        &kp Q &kp W &kp E
        // ... more bindings
      >;
    };
  };
};
```

#### Verify Bindings Match Configuration

Compare exported bindings with what you configured:

| What You Configured | Expected Output |
|---------------------|-----------------|
| Key press: A | `&kp A` |
| Mod-tap: Ctrl+A | `&mt LCTRL A` |
| Layer-tap: Layer 1, TAB | `&lt 1 TAB` |
| Momentary layer 1 | `&mo 1` |
| Toggle layer 2 | `&tog 2` |
| Transparent | `&trans` |
| Bluetooth clear | `&bt BT_CLR` |

### 6. Syntax Validation with ZMK

#### Option A: Use ZMK Config Repo
```bash
cd ~/zmk-config
cp ~/Downloads/{keyboard}-{date}.keymap config/{keyboard}.keymap
git add config/{keyboard}.keymap
git commit -m "Test export from ZMK Studio"
git push
```

Watch GitHub Actions build:
- ✅ Build succeeds = Valid syntax
- ❌ Build fails = Syntax error (check logs)

#### Option B: Local ZMK Build
```bash
cd ~/zmk
west build -b nice_nano_v2 -- -DSHIELD=corne_left -DKEYMAP_FILE=/path/to/exported.keymap
```

### 7. Flash and Test (Ultimate Verification)

If syntax validation passes:

1. **Download firmware** from GitHub Actions
2. **Flash to keyboard**:
   - Enter bootloader mode
   - Copy .uf2 file to USB drive
3. **Test key presses**:
   - Type on each layer
   - Verify mod-tap works (hold vs tap)
   - Verify layer switching
   - Check special behaviors (bluetooth, etc.)

### 8. Edge Case Testing

Test problematic scenarios:

#### Test 1: Empty Layer
- Create layer with no bindings
- Export should succeed
- Bindings section should be empty but valid

#### Test 2: Unknown Behavior
- If keyboard has custom behavior
- Export should add comment: `/* Unknown behavior ID: X */`
- File should still be syntactically valid

#### Test 3: Special Characters in Device Name
- Device name: "My@Awesome#Keyboard!!!"
- Filename should sanitize: `my-awesome-keyboard-YYYY-MM-DD.keymap`

#### Test 4: Many Layers
- Create 5+ layers
- Export should handle all layers
- Constants should increment: DEFAULT, LOWER, RAISE, LAYER_3, LAYER_4...

### 9. Console Logging

Check browser DevTools console for:

✅ **Success Log**
```
[Export Success] {
  filename: "corne-2025-11-09.keymap",
  contentLength: 1234
}
```

❌ **Error Log** (if something fails)
```
[Export Error] {
  code: "NO_KEYBOARD",
  message: "No keyboard connected",
  context: {...}
}
```

### 10. Comparison Method (Advanced)

If you have a working .keymap file from manual editing:

1. Export from ZMK Studio
2. Compare side-by-side with manual version
3. Check:
   - Same number of layers
   - Same bindings in same positions
   - Equivalent behaviors (may differ in formatting)

## Expected Results

✅ **PASS Criteria:**
- File downloads successfully
- Valid DeviceTree syntax (no compile errors)
- Bindings match configured layout
- Firmware builds successfully
- Keys work as expected on hardware

❌ **FAIL Criteria:**
- Export button disabled (no keyboard)
- Download fails
- Syntax errors in generated file
- Bindings don't match configuration
- Firmware build fails
- Keys behave incorrectly

## Known Limitations

The export does NOT include:
- Combos (add manually)
- Macros (add manually)
- Custom behavior definitions
- Conditional layers

These must be added manually to the exported file if needed.

## Troubleshooting

### Export Button Disabled
- **Cause**: No keyboard connected
- **Fix**: Connect ZMK keyboard with Studio support

### Unknown Behavior Warnings
- **Cause**: Custom/new behavior not in mapper
- **Fix**: File exports with comments, add mapping to BehaviorMapper.ts

### Compile Errors
- **Cause**: Invalid generated syntax
- **Fix**: Check DeviceTree syntax, report issue with sample file

### Wrong Key Names
- **Cause**: HID mapping incorrect
- **Fix**: Update HidMapper.ts KEY_NAME_OVERRIDES

## Automation Alternative

If you don't have physical hardware, you can test with mock data:

```typescript
// In browser DevTools console:
const mockLayers = [
  {
    id: 0,
    label: 'Default',
    bindings: [
      { behaviorId: 1, param1: 0x04, param2: null, position: 0 }, // &kp A
      { behaviorId: 1, param1: 0x05, param2: null, position: 1 }, // &kp B
    ]
  }
];

await ExportService.exportKeymap('test-keyboard', mockLayers);
```

This bypasses RPC and tests generation directly.
