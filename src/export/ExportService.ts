/**
 * ExportService: Orchestrates keymap export operations
 *
 * Handles RPC communication with connected keyboard, generates .keymap files,
 * and triggers browser download.
 */

import { Keymap, Layer, Binding, ExportResult, ExportErrorCode } from './types';
import { KeymapGenerator } from './KeymapGenerator';

export class ExportService {
  /**
   * Export current keymap to .keymap file
   *
   * @param deviceName - Keyboard device name for filename
   * @param layers - Array of layer configurations from RPC
   * @returns Export result with success status and filename
   */
  static async exportKeymap(
    deviceName: string,
    layers: Layer[]
  ): Promise<ExportResult> {
    try {
      // Validate inputs
      if (!deviceName || deviceName.trim() === '') {
        return {
          success: false,
          filename: '',
          error: {
            code: ExportErrorCode.NO_KEYBOARD,
            message: 'Device name is required for export',
          },
        };
      }

      if (!layers || layers.length === 0) {
        return {
          success: false,
          filename: '',
          error: {
            code: ExportErrorCode.INVALID_LAYER,
            message: 'No layers available to export',
          },
        };
      }

      // Build keymap object
      const keymap: Keymap = {
        layers,
        deviceName,
        layoutName: 'default', // Could be extended to support multiple layouts
        timestamp: new Date(),
        version: '1.0.0',
        totalBindings: layers.reduce((sum, layer) => sum + layer.bindings.length, 0),
      };

      // Generate .keymap file content
      const content = KeymapGenerator.generate(keymap);

      // Generate filename
      const filename = this.generateFilename(deviceName);

      // Download file
      this.downloadFile(content, filename);

      return {
        success: true,
        filename,
        content,
      };
    } catch (error) {
      return {
        success: false,
        filename: '',
        error: {
          code: ExportErrorCode.GENERATION_FAILED,
          message: error instanceof Error ? error.message : 'Unknown error during export',
          context: { error },
        },
      };
    }
  }

  /**
   * Generate filename with device name and timestamp
   *
   * Format: keyboard-name-YYYY-MM-DD.keymap
   *
   * @param deviceName - Keyboard device name
   * @returns Filename string
   */
  private static generateFilename(deviceName: string): string {
    const dateStr = this.getDateString();
    const sanitizedName = deviceName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    return `${sanitizedName}-${dateStr}.keymap`;
  }

  /**
   * Get current date as YYYY-MM-DD string
   *
   * @returns Date string
   */
  private static getDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Trigger browser download of generated file
   *
   * Uses Blob API and URL.createObjectURL for client-side file download
   *
   * @param content - File content string
   * @param filename - Download filename
   */
  private static downloadFile(content: string, filename: string): void {
    // Create blob with UTF-8 encoding
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

    // Create temporary download link
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;

    // Trigger download
    document.body.appendChild(anchor);
    anchor.click();

    // Cleanup
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }
}
