/**
 * KeymapGenerator: Generates .keymap files in DeviceTree format
 *
 * Converts keyboard configuration data to ZMK firmware DeviceTree syntax
 * for compilation with the ZMK firmware builder.
 */

import { Keymap, ExportedKeymap, ExportMetadata, Layer } from './types';
import { BehaviorMapper } from './BehaviorMapper';
import { HidMapper } from './HidMapper';

export class KeymapGenerator {
  /**
   * Generate complete .keymap file content
   *
   * @param keymap - Complete keymap configuration
   * @returns DeviceTree-formatted .keymap file content
   */
  static generate(keymap: Keymap): string {
    const parts = [
      this.generateMetadata({
        timestamp: keymap.timestamp.toISOString(),
        deviceName: keymap.deviceName,
        version: keymap.version,
        layerCount: keymap.layers.length,
      }),
      this.generateIncludes(),
      this.generateLayerConstants(keymap.layers),
      this.generateKeymap(keymap.layers),
      this.generateFooter(),
    ];

    return parts.join('\n\n');
  }

  /**
   * Generate metadata comment block
   *
   * @param metadata - Export metadata
   * @returns Comment block with export information
   */
  static generateMetadata(metadata: ExportMetadata): string {
    return `/*
 * Exported from ZMK Studio
 * Date: ${metadata.timestamp}
 * Device: ${metadata.deviceName}
 * Version: ${metadata.version}
 * Layers: ${metadata.layerCount}
 */`;
  }

  /**
   * Generate #include statements
   *
   * @returns Standard ZMK include directives
   */
  static generateIncludes(): string {
    return `#include <behaviors.dtsi>
#include <dt-bindings/zmk/keys.h>
#include <dt-bindings/zmk/bt.h>`;
  }

  /**
   * Generate layer number constants
   *
   * Converts layer labels to #define constants (e.g., #define DEF 0)
   *
   * @param layers - Array of layers
   * @returns #define statements for layer numbers
   */
  static generateLayerConstants(layers: Layer[]): string {
    return layers
      .map((layer, index) => {
        const constantName = this.toConstantName(layer.label);
        return `#define ${constantName} ${index}`;
      })
      .join('\n');
  }

  /**
   * Generate keymap DeviceTree structure
   *
   * @param layers - Array of layers
   * @returns Complete keymap block with all layers
   */
  static generateKeymap(layers: Layer[]): string {
    const layerDefs = layers
      .map(layer => this.generateLayer(layer))
      .join('\n\n');

    return `/ {
  keymap {
    compatible = "zmk,keymap";

${layerDefs}
  };
};`;
  }

  /**
   * Generate a single layer definition
   *
   * @param layer - Layer configuration
   * @returns DeviceTree layer block
   */
  static generateLayer(layer: Layer): string {
    // Format bindings with proper indentation
    const bindingsPerRow = 6; // Adjust based on keyboard layout
    const bindingStrings = layer.bindings.map(binding =>
      BehaviorMapper.formatBinding(binding, HidMapper.getZmkKeyName.bind(HidMapper))
    );

    // Group bindings into rows for readability
    const rows: string[] = [];
    for (let i = 0; i < bindingStrings.length; i += bindingsPerRow) {
      rows.push(bindingStrings.slice(i, i + bindingsPerRow).join(' '));
    }

    const bindingsFormatted = rows
      .map(row => `        ${row}`)
      .join('\n');

    const layerName = this.toLayerName(layer.label);

    return `    ${layerName} {
      label = "${layer.label}";
      bindings = <
${bindingsFormatted}
      >;
    };`;
  }

  /**
   * Generate footer with limitation notes
   *
   * @returns Comment block explaining export limitations
   */
  static generateFooter(): string {
    return `/*
 * NOTE: This export does not include:
 * - Combos (add them manually if needed)
 * - Macros (add them manually if needed)
 * - Custom behaviors
 *
 * To use this file:
 * 1. Copy to your ZMK config repository (config/your-keyboard.keymap)
 * 2. Commit and push to trigger firmware build
 * 3. Download and flash the compiled firmware
 */`;
  }

  /**
   * Convert layer label to constant name (uppercase, alphanumeric + underscore)
   *
   * Examples:
   * - "Default" → "DEFAULT"
   * - "Lower Layer" → "LOWER_LAYER"
   * - "Symbols & Numbers" → "SYMBOLS_NUMBERS"
   *
   * @param label - Layer display label
   * @returns Constant-safe name
   */
  private static toConstantName(label: string): string {
    return label
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
  }

  /**
   * Convert layer label to DeviceTree node name (lowercase, alphanumeric + underscore)
   *
   * Examples:
   * - "Default" → "default_layer"
   * - "Lower Layer" → "lower_layer_layer"
   * - "NUM" → "num_layer"
   *
   * @param label - Layer display label
   * @returns DeviceTree node name
   */
  private static toLayerName(label: string): string {
    const baseName = label
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    return `${baseName}_layer`;
  }
}
