# ZMK Studio Export Feature

Export your keyboard keymap configurations to `.keymap` files in DeviceTree format for compilation with ZMK firmware builder.

## Features

- ✅ **One-Click Export** - Export current keymap configuration with a single button click
- ✅ **DeviceTree Format** - Generates valid ZMK firmware `.keymap` files
- ✅ **All Behaviors Supported** - Handles key press, mod-tap, layer-tap, momentary layer, toggle layer, bluetooth, and transparent bindings
- ✅ **Human-Readable Output** - Generated files are formatted and commented for manual editing
- ✅ **Automatic Filename** - Files named with device name and current date (`corne-2025-11-09.keymap`)
- ✅ **Error Handling** - Clear error messages guide you to successful export

## Usage

### Quick Export

1. Connect your ZMK keyboard to ZMK Studio
2. Configure your layers and bindings in the visual editor
3. Click the **Export** button (download icon) in the toolbar
4. Your `.keymap` file downloads automatically

### Using Exported Files

1. **Copy to ZMK Config**:
   ```bash
   cp ~/Downloads/corne-2025-11-09.keymap ~/zmk-config/config/corne.keymap
   ```

2. **Commit and Push**:
   ```bash
   cd ~/zmk-config
   git add config/corne.keymap
   git commit -m "Update keymap from ZMK Studio"
   git push
   ```

3. **Build and Flash**:
   - GitHub Actions automatically builds firmware
   - Download `.uf2` files from Actions tab
   - Flash to your keyboard

## Supported Behaviors

| Behavior | Code | Parameters | Example |
|----------|------|------------|---------|
| Key Press | `&kp` | Key name | `&kp A` |
| Mod-Tap | `&mt` | Modifier, Key | `&mt LCTRL A` |
| Layer-Tap | `&lt` | Layer, Key | `&lt 1 TAB` |
| Momentary Layer | `&mo` | Layer number | `&mo 1` |
| Toggle Layer | `&tog` | Layer number | `&tog 2` |
| Bluetooth | `&bt` | Command | `&bt BT_CLR` |
| Transparent | `&trans` | None | `&trans` |

## File Format

Generated `.keymap` files follow this structure:

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
  };
};

/*
 * NOTE: This export does not include:
 * - Combos (add them manually if needed)
 * - Macros (add them manually if needed)
 * - Custom behaviors
 *
 * To use this file:
 * 1. Copy to your ZMK config repository (config/your-keyboard.keymap)
 * 2. Commit and push to trigger firmware build
 * 3. Download and flash the compiled firmware
 */
```

## Limitations

**Not Exported:**
- Combos (key combinations)
- Macros (custom key sequences)
- Custom behavior definitions
- Conditional layers

**Workaround**: Add these features manually to the exported `.keymap` file or maintain them in your ZMK config repository.

## Architecture

### Components

- **ExportService** - Orchestrates export operation, fetches data from keyboard via RPC
- **KeymapGenerator** - Generates DeviceTree `.keymap` file content
- **BehaviorMapper** - Maps behavior IDs to ZMK behavior codes
- **HidMapper** - Converts HID usage codes to ZMK key names
- **ExportButton** - UI component in toolbar

### Data Flow

```
User Click → ExportButton
              ↓
          App.exportKeymap()
              ↓
     RPC: Fetch Layers & Bindings
              ↓
     ExportService.exportKeymap()
              ↓
     KeymapGenerator.generate()
              ↓
     Browser Download (.keymap file)
```

## Development

### Running Storybook

```bash
cd ~/zmk-studio
bun run storybook
```

Stories available:
- `Export/ExportButton` - Button component states
- `Export/KeymapGenerator` - File generation with sample keymaps
- `Export/BehaviorMapper` - Behavior ID mapping examples

### Testing

**Unit Testing** (via Storybook):
1. Open Storybook at http://localhost:6006
2. Navigate to Export stories
3. Verify component rendering and behavior mapping

**Integration Testing** (with real keyboard):
1. Connect keyboard
2. Configure layers
3. Export keymap
4. Compile with ZMK builder
5. Flash and test on hardware

### Adding New Behaviors

To support a new ZMK behavior:

1. **Update BehaviorMapper.ts**:
   ```typescript
   const BEHAVIORS: Map<number, Behavior> = new Map([
     // ... existing behaviors
     [7, { id: 7, code: 'sk', displayName: 'Sticky Key', paramCount: 1, description: 'Sticky modifier' }],
   ]);
   ```

2. **Update formatParam()** if needed for parameter formatting

3. **Add Storybook story** in `BehaviorMapper.stories.tsx`

4. **Test** with real keyboard to validate behavior ID

## Troubleshooting

### Export Button Disabled

**Cause**: No keyboard connected

**Solution**: Connect a ZMK-compatible keyboard and ensure it appears in the device dropdown

### Unknown Behavior Warnings

**Cause**: Keyboard uses behavior IDs not in the BEHAVIORS map

**Solution**:
1. Open browser DevTools console
2. Export keymap
3. Check console for behavior IDs
4. Update `BehaviorMapper.ts` with new mappings
5. File an issue at https://github.com/zmkfirmware/zmk-studio

### Compile Errors

**Cause**: Generated `.keymap` file has invalid syntax

**Solution**:
1. Check ZMK firmware logs for error line number
2. Manually fix syntax in exported file
3. Report issue with exported file sample

### Missing Keys After Flash

**Cause**: HID usage code mapped incorrectly

**Solution**:
1. Check `HidMapper.ts` for key name mappings
2. Update KEY_NAME_OVERRIDES if needed
3. Test with `HidMapper` Storybook story

## Contributing

This feature was implemented following strict TDD with Storybook. When contributing:

1. Write Storybook story first (RED phase)
2. Implement feature (GREEN phase)
3. Refactor and optimize
4. Test with real hardware
5. Update documentation

## References

- [ZMK Firmware Documentation](https://zmk.dev/docs)
- [ZMK Studio Issue #124](https://github.com/zmkfirmware/zmk-studio/issues/124)
- [DeviceTree Specification](https://devicetree-specification.readthedocs.io/)
- [HID Usage Tables 1.5](https://usb.org/sites/default/files/hut1_5.pdf)

## License

Part of ZMK Studio - see main LICENSE file
