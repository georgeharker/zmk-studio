/**
 * Import Service
 *
 * Orchestrates the keymap import process
 */

import { DeviceTreeParser } from './DeviceTreeParser';
import { ReverseBehaviorMapper } from './ReverseBehaviorMapper';
import { ReverseHidMapper } from './ReverseHidMapper';
import type { ImportResult, ImportError, ConvertedBinding, ValidationResult } from './types';
import { ImportErrorCode } from './types';

export class ImportService {
  /**
   * Import keymap from string content
   */
  static async importFromString(content: string): Promise<ImportResult> {
    try {
      // Parse DeviceTree structure
      const parseResult = DeviceTreeParser.parse(content);

      if (!parseResult.success || !parseResult.layers) {
        return {
          success: false,
          error: {
            code: ImportErrorCode.PARSE_ERROR,
            message: parseResult.error?.message || 'Failed to parse keymap',
            context: parseResult.error,
          },
        };
      }

      // Convert parsed layers to internal format
      const layers = parseResult.layers.map((parsedLayer, index) => {
        const bindings: ConvertedBinding[] = [];

        parsedLayer.bindings.forEach((bindingStr, position) => {
          // Parse binding
          const parsed = DeviceTreeParser.parseBinding(bindingStr);

          // Convert to internal format
          const converted = ReverseBehaviorMapper.convertBinding(
            parsed,
            (keyName) => ReverseHidMapper.getHidCode(keyName)
          );

          if (converted) {
            bindings.push({
              ...converted,
              position,
            });
          } else {
            // Unknown behavior - add placeholder with null behavior ID
            bindings.push({
              behaviorId: 0, // Use trans as placeholder
              param1: null,
              param2: null,
              position,
            });
          }
        });

        return {
          id: index,
          label: parsedLayer.label,
          bindings,
        };
      });

      return {
        success: true,
        layers,
        warnings: parseResult.warnings,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ImportErrorCode.PARSE_ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
          context: error,
        },
      };
    }
  }

  /**
   * Import keymap from File object
   */
  static async importFromFile(file: File): Promise<ImportResult> {
    try {
      // Read file content
      const content = await this.readFileAsText(file);

      // Import from string
      return await this.importFromString(content);
    } catch (error) {
      return {
        success: false,
        error: {
          code: ImportErrorCode.FILE_READ_ERROR,
          message: error instanceof Error ? error.message : 'Failed to read file',
          context: error,
        },
      };
    }
  }

  /**
   * Read file as text
   */
  private static readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        if (event.target?.result) {
          resolve(event.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('File read error'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Validate import result
   */
  static validateImport(result: ImportResult): ValidationResult {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check if import was successful
    if (!result.success) {
      errors.push('Import failed');
      return { valid: false, warnings, errors };
    }

    // Check if layers exist
    if (!result.layers || result.layers.length === 0) {
      errors.push('No layers found in keymap');
      return { valid: false, warnings, errors };
    }

    // Validate each layer
    result.layers.forEach((layer, index) => {
      // Warn about empty layers
      if (layer.bindings.length === 0) {
        warnings.push(`Layer ${index} (${layer.label}) has no bindings`);
      }

      // Warn about large number of bindings
      if (layer.bindings.length > 50) {
        warnings.push(
          `Layer ${index} (${layer.label}) has many bindings (${layer.bindings.length})`
        );
      }

      // Validate behavior IDs
      layer.bindings.forEach((binding) => {
        if (binding.behaviorId < 0 || binding.behaviorId > 6) {
          warnings.push(
            `Invalid behavior ID ${binding.behaviorId} at position ${binding.position} in layer ${index}`
          );
        }
      });
    });

    return {
      valid: errors.length === 0,
      warnings,
      errors,
    };
  }
}
