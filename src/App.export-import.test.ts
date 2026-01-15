/**
 * Simple integration tests for App.tsx export/import handlers
 *
 * TRUE TDD - RED PHASE: These tests will FAIL because:
 * 1. Export handler in App.tsx uses wrong RPC API
 * 2. Import handler doesn't exist in App.tsx yet
 */

import { describe, it, expect } from 'vitest';

describe('App.tsx Export/Import Integration (RED PHASE)', () => {
  describe('Export Handler Exists', () => {
    it('should be defined in App.tsx', async () => {
      // Read App.tsx to check for export handler
      const fs = await import('fs');
      const appSource = fs.readFileSync('./src/App.tsx', 'utf-8');

      // Should have handleExport or exportKeymap function
      expect(
        appSource.includes('handleExport') ||
        appSource.includes('exportKeymap') ||
        appSource.includes('onExport')
      ).toBe(true);
    });

    it('should use ExportService from ./export/ExportService', async () => {
      // Read App.tsx to check imports
      const fs = await import('fs');
      const appSource = fs.readFileSync('./src/App.tsx', 'utf-8');

      // Should import ExportService (App.tsx uses double quotes)
      expect(appSource).toContain('from "./export/ExportService"');
    });
  });

  describe('Import Handler Exists', () => {
    it('should be defined in App.tsx', async () => {
      const fs = await import('fs');
      const appSource = fs.readFileSync('./src/App.tsx', 'utf-8');

      // Should have handleImport or importKeymap function
      expect(
        appSource.includes('handleImport') ||
        appSource.includes('importKeymap') ||
        appSource.includes('onImport')
      ).toBe(true);
    });

    it('should use ImportService from ./import/ImportService', async () => {
      const fs = await import('fs');
      const appSource = fs.readFileSync('./src/App.tsx', 'utf-8');

      // Should import ImportService (App.tsx uses double quotes)
      expect(appSource).toContain('from "./import/ImportService"');
    });
  });

  describe('AppHeader Integration', () => {
    it('should pass onExport handler to AppHeader', async () => {
      const fs = await import('fs');
      const appSource = fs.readFileSync('./src/App.tsx', 'utf-8');

      // Should pass onExport prop
      expect(appSource).toContain('onExport={');
    });

    it('should pass onImport handler to AppHeader', async () => {
      const fs = await import('fs');
      const appSource = fs.readFileSync('./src/App.tsx', 'utf-8');

      // Should pass onImport prop
      expect(appSource).toContain('onImport={');
    });

    it('should pass isExporting state to AppHeader', async () => {
      const fs = await import('fs');
      const appSource = fs.readFileSync('./src/App.tsx', 'utf-8');

      // Should have isExporting state
      expect(
        appSource.includes('isExporting') ||
        appSource.includes('setIsExporting')
      ).toBe(true);
    });

    it('should pass isImporting state to AppHeader', async () => {
      const fs = await import('fs');
      const appSource = fs.readFileSync('./src/App.tsx', 'utf-8');

      // Should have isImporting state
      expect(
        appSource.includes('isImporting') ||
        appSource.includes('setIsImporting')
      ).toBe(true);
    });
  });

  describe('RPC Integration', () => {
    it('should NOT use getLayers (wrong API)', async () => {
      const fs = await import('fs');
      const appSource = fs.readFileSync('./src/App.tsx', 'utf-8');

      // Should NOT use getLayers (this is the bug!)
      expect(appSource).not.toContain('getLayers: true');
    });

    it('should NOT use getLayer (wrong API)', async () => {
      const fs = await import('fs');
      const appSource = fs.readFileSync('./src/App.tsx', 'utf-8');

      // Should NOT use getLayer (this is the bug!)
      expect(appSource).not.toContain('getLayer: {');
    });

    it('should use useConnectedDeviceData hook instead', async () => {
      const fs = await import('fs');
      const appSource = fs.readFileSync('./src/App.tsx', 'utf-8');

      // Should use useConnectedDeviceData for getting keymap
      const hasHook = appSource.includes('useConnectedDeviceData');
      const hasKeymapArg = appSource.includes('keymap');

      expect(hasHook && hasKeymapArg).toBe(true);
    });
  });
});
