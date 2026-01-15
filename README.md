# ZMK Studio

A visual keyboard configuration tool for ZMK firmware.

## Features

- **Visual Keymap Editor** - Configure your keyboard layout with a graphical interface
- **Keymap Export** ✨ **NEW** - Export your configuration to `.keymap` files for ZMK firmware
- **Layer Management** - Create, edit, and organize multiple keyboard layers
- **Real-time Sync** - Changes are synced to your keyboard instantly
- **Undo/Redo** - Easily revert or reapply changes

## Export Feature

ZMK Studio now supports exporting your keyboard configuration to `.keymap` files in DeviceTree format:

- 🚀 One-click export button in toolbar
- 📝 Generates valid ZMK firmware files
- 🎯 Supports all behaviors (kp, mt, lt, mo, tog, bt, trans)
- 📦 Automatic filename with device name and date
- ✅ Human-readable output for manual editing

See [Export Feature Documentation](src/export/README.md) for details.

### Quick Export

1. Connect your ZMK keyboard
2. Configure your layers and bindings
3. Click the Export button (download icon)
4. Use the generated `.keymap` file in your ZMK config repository

## Development

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Run Storybook for component testing
bun run storybook

# Build for production
bun run build

# Run Tauri desktop app
bun run tauri dev
```

## Project Structure

- `src/export/` - Keymap export functionality
- `src/keyboard/` - Visual keyboard editor
- `src/rpc/` - RPC communication with keyboard
- `src/` - Main application code

## Contributing

This project follows strict TDD with Storybook. When adding features:

1. Write Storybook story first (RED phase)
2. Implement feature (GREEN phase)
3. Refactor and optimize
4. Test with real hardware

## License

See LICENSE file for details.
