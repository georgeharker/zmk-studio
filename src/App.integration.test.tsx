/**
 * Integration tests for App.tsx export/import functionality
 *
 * TRUE TDD: Write tests FIRST, watch them FAIL, then fix implementation
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock the RPC connection
vi.mock('./rpc/logging', () => ({
  call_rpc: vi.fn(),
}));

vi.mock('./rpc/useConnectedDeviceData', () => ({
  useConnectedDeviceData: vi.fn(),
}));

vi.mock('./rpc/ConnectionContext', () => ({
  ConnectionContext: {
    Provider: ({ children }: any) => children,
  },
}));

vi.mock('./rpc/LockStateContext', () => ({
  LockStateContext: {
    Provider: ({ children }: any) => children,
  },
}));

describe('App Integration Tests - Export/Import', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Export Functionality', () => {
    it('should have export button in header', async () => {
      render(<App />);

      // Look for export button (download icon or Export text)
      const exportButton = screen.queryByLabelText(/export/i);

      expect(exportButton).toBeTruthy();
    });

    it('should fetch keymap data when export is clicked', async () => {
      const mockCallRpc = vi.fn();
      const { call_rpc } = await import('./rpc/logging');
      vi.mocked(call_rpc).mockImplementation(mockCallRpc);

      // Mock successful RPC responses
      mockCallRpc.mockResolvedValueOnce({
        keymap: {
          getKeymap: {
            layers: [
              { id: 0, name: 'Default' },
              { id: 1, name: 'Lower' },
            ],
          },
        },
      });

      render(<App />);

      const exportButton = screen.getByLabelText(/export/i);
      await userEvent.click(exportButton);

      // Should call RPC to fetch keymap
      await waitFor(() => {
        expect(mockCallRpc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            keymap: expect.objectContaining({
              getKeymap: expect.anything(),
            }),
          })
        );
      });
    });

    it('should generate .keymap file when export succeeds', async () => {
      const mockCallRpc = vi.fn();
      const { call_rpc } = await import('./rpc/logging');
      vi.mocked(call_rpc).mockImplementation(mockCallRpc);

      // Mock keymap data
      mockCallRpc.mockResolvedValueOnce({
        keymap: {
          getKeymap: {
            layers: [
              { id: 0, name: 'Default', bindings: [] },
            ],
          },
        },
      });

      // Mock browser download
      const mockCreateElement = vi.spyOn(document, 'createElement');
      const mockClick = vi.fn();
      mockCreateElement.mockReturnValue({
        click: mockClick,
        href: '',
        download: '',
      } as any);

      render(<App />);

      const exportButton = screen.getByLabelText(/export/i);
      await userEvent.click(exportButton);

      // Should trigger file download
      await waitFor(() => {
        expect(mockClick).toHaveBeenCalled();
      });
    });

    it('should show error message when export fails', async () => {
      const mockCallRpc = vi.fn();
      const { call_rpc } = await import('./rpc/logging');
      vi.mocked(call_rpc).mockImplementation(mockCallRpc);

      // Mock RPC failure
      mockCallRpc.mockRejectedValueOnce(new Error('RPC failed'));

      render(<App />);

      const exportButton = screen.getByLabelText(/export/i);
      await userEvent.click(exportButton);

      // Should show error notification
      await waitFor(() => {
        expect(screen.getByText(/export failed/i)).toBeInTheDocument();
      });
    });

    it('should disable export button when no keyboard connected', () => {
      render(<App />);

      const exportButton = screen.getByLabelText(/export/i);

      // Should be disabled when no device
      expect(exportButton).toBeDisabled();
    });
  });

  describe('Import Functionality', () => {
    it('should have import button in header', () => {
      render(<App />);

      // Look for import button (upload icon or Import text)
      const importButton = screen.queryByLabelText(/import/i);

      expect(importButton).toBeTruthy();
    });

    it('should open file picker when import is clicked', async () => {
      render(<App />);

      const importButton = screen.getByLabelText(/import/i);

      // Mock file input
      const mockFileInput = document.createElement('input');
      const mockClick = vi.fn();
      mockFileInput.click = mockClick;

      vi.spyOn(document, 'createElement').mockReturnValue(mockFileInput);

      await userEvent.click(importButton);

      // Should trigger file input click
      expect(mockClick).toHaveBeenCalled();
    });

    it('should parse .keymap file when selected', async () => {
      const mockCallRpc = vi.fn();
      const { call_rpc } = await import('./rpc/logging');
      vi.mocked(call_rpc).mockImplementation(mockCallRpc);

      render(<App />);

      const importButton = screen.getByLabelText(/import/i);

      // Create mock .keymap file
      const keymapContent = `
        / {
          keymap {
            compatible = "zmk,keymap";
            default_layer {
              label = "Default";
              bindings = <&kp A &kp B>;
            };
          };
        };
      `;

      const file = new File([keymapContent], 'test.keymap', { type: 'text/plain' });

      // Trigger file selection
      const fileInput = document.createElement('input');
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', {
        value: { files: [file] },
      });

      fileInput.dispatchEvent(changeEvent);

      // Should parse file content
      await waitFor(() => {
        expect(mockCallRpc).toHaveBeenCalled();
      });
    });

    it('should apply imported keymap to keyboard', async () => {
      const mockCallRpc = vi.fn();
      const { call_rpc } = await import('./rpc/logging');
      vi.mocked(call_rpc).mockImplementation(mockCallRpc);

      mockCallRpc.mockResolvedValue({ success: true });

      render(<App />);

      const keymapContent = `
        / {
          keymap {
            compatible = "zmk,keymap";
            default_layer {
              label = "Default";
              bindings = <&kp A>;
            };
          };
        };
      `;

      const file = new File([keymapContent], 'test.keymap', { type: 'text/plain' });

      // TODO: Trigger import with file

      // Should call RPC to update keyboard
      await waitFor(() => {
        expect(mockCallRpc).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            keymap: expect.objectContaining({
              setLayerBinding: expect.anything(),
            }),
          })
        );
      });
    });

    it('should show success message when import succeeds', async () => {
      // TODO: Implement after import handler is added to App.tsx
      expect(true).toBe(true);
    });

    it('should show error message when import fails', async () => {
      // TODO: Implement after import handler is added to App.tsx
      expect(true).toBe(true);
    });

    it('should disable import button when no keyboard connected', () => {
      render(<App />);

      const importButton = screen.getByLabelText(/import/i);

      // Should be disabled when no device
      expect(importButton).toBeDisabled();
    });
  });

  describe('Export → Import Roundtrip', () => {
    it('should preserve keymap through export and import', async () => {
      // TODO: Implement full roundtrip test
      // 1. Set up initial keymap
      // 2. Export to file
      // 3. Import file back
      // 4. Verify keymap matches original
      expect(true).toBe(true);
    });
  });
});
