/**
 * DeviceTree Parser for .keymap files
 *
 * Parses ZMK firmware keymap files in DeviceTree format
 */

import type { ParseResult, ParsedLayer, KeymapMetadata, ParseError } from './types';
import { ParseErrorCode } from './types';

/**
 * Parsed binding structure
 */
export interface ParsedBinding {
  behavior: string;
  params: string[];
}

export class DeviceTreeParser {
  /**
   * Parse a .keymap file content
   */
  static parse(content: string): ParseResult {
    // Validate input
    if (!content || content.trim().length === 0) {
      return {
        success: false,
        error: {
          code: ParseErrorCode.INVALID_FORMAT,
          message: 'Empty file content',
        },
      };
    }

    // Remove comments
    const withoutComments = this.removeComments(content);

    // Extract metadata from original content (before comment removal)
    const metadata = this.extractMetadata(content);

    // Check for keymap structure
    if (!this.hasKeymapStructure(withoutComments)) {
      return {
        success: false,
        error: {
          code: ParseErrorCode.MISSING_KEYMAP,
          message: 'No keymap structure found in file',
        },
      };
    }

    // Parse layers
    try {
      const layers = this.parseLayers(withoutComments);
      const warnings: string[] = [];

      // Check for unknown behaviors
      layers.forEach((layer) => {
        layer.bindings.forEach((binding) => {
          const parsed = this.parseBinding(binding);
          const knownBehaviors = ['trans', 'kp', 'mt', 'lt', 'mo', 'tog', 'bt'];
          if (!knownBehaviors.includes(parsed.behavior)) {
            warnings.push(`Unknown behavior: ${parsed.behavior} in binding: ${binding}`);
          }
        });
      });

      return {
        success: true,
        layers,
        metadata,
        warnings: warnings.length > 0 ? warnings : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: ParseErrorCode.INVALID_FORMAT,
          message: error instanceof Error ? error.message : 'Parse error',
        },
      };
    }
  }

  /**
   * Parse a single binding string
   * Example: "&kp A" -> { behavior: "kp", params: ["A"] }
   */
  static parseBinding(binding: string): ParsedBinding {
    // Remove leading & and split by whitespace
    const cleaned = binding.trim().replace(/^&/, '');
    const parts = cleaned.split(/\s+/);

    return {
      behavior: parts[0],
      params: parts.slice(1),
    };
  }

  /**
   * Remove C-style and C++-style comments
   */
  private static removeComments(content: string): string {
    // Remove C-style comments /* ... */
    let result = content.replace(/\/\*[\s\S]*?\*\//g, ' ');

    // Remove C++-style comments // ...
    result = result.replace(/\/\/[^\n]*/g, ' ');

    return result;
  }

  /**
   * Extract metadata from header comment
   */
  private static extractMetadata(content: string): KeymapMetadata {
    const metadata: KeymapMetadata = {};

    // Find first block comment
    const commentMatch = content.match(/\/\*([\s\S]*?)\*\//);
    if (!commentMatch) {
      return metadata;
    }

    const comment = commentMatch[1];

    // Extract device
    const deviceMatch = comment.match(/Device:\s*(\S+)/);
    if (deviceMatch) {
      metadata.device = deviceMatch[1];
    }

    // Extract date
    const dateMatch = comment.match(/Date:\s*(\S+)/);
    if (dateMatch) {
      metadata.date = dateMatch[1];
    }

    // Extract version
    const versionMatch = comment.match(/Version:\s*(\S+)/);
    if (versionMatch) {
      metadata.version = versionMatch[1];
    }

    // Extract layer count
    const layerMatch = comment.match(/Layers:\s*(\d+)/);
    if (layerMatch) {
      metadata.layerCount = parseInt(layerMatch[1], 10);
    }

    return metadata;
  }

  /**
   * Check if content has keymap structure
   */
  private static hasKeymapStructure(content: string): boolean {
    return content.includes('keymap') && content.includes('{');
  }

  /**
   * Parse all layers from content
   */
  private static parseLayers(content: string): ParsedLayer[] {
    const layers: ParsedLayer[] = [];

    // Find all layer definitions
    // Pattern: layer_name { ... };
    const layerRegex = /(\w+_layer|\w+)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}\s*;/g;

    let match;
    while ((match = layerRegex.exec(content)) !== null) {
      const layerContent = match[2];

      // Check if this is actually a layer (has bindings)
      if (!layerContent.includes('bindings')) {
        continue;
      }

      // Extract label
      const labelMatch = layerContent.match(/label\s*=\s*"([^"]*)"/);
      const label = labelMatch ? labelMatch[1] : '';

      // Extract bindings
      const bindingsMatch = layerContent.match(/bindings\s*=\s*<([^>]*)>/);
      if (!bindingsMatch) {
        continue;
      }

      const bindingsText = bindingsMatch[1];
      const bindings = this.parseBindings(bindingsText);

      layers.push({
        label,
        bindings,
      });
    }

    return layers;
  }

  /**
   * Parse bindings text into array of binding strings
   */
  private static parseBindings(bindingsText: string): string[] {
    // Split by whitespace and filter out empty strings
    const tokens = bindingsText.trim().split(/\s+/).filter((t) => t.length > 0);

    const bindings: string[] = [];
    let i = 0;

    while (i < tokens.length) {
      const token = tokens[i];

      // If token starts with &, it's a behavior
      if (token.startsWith('&')) {
        const behavior = token.substring(1);

        // Determine how many parameters this behavior needs
        const paramCount = this.getParameterCount(behavior);

        // Collect parameters
        const params: string[] = [];
        for (let j = 0; j < paramCount && i + 1 + j < tokens.length; j++) {
          const nextToken = tokens[i + 1 + j];
          // Only add if it doesn't start with & (next behavior)
          if (!nextToken.startsWith('&')) {
            params.push(nextToken);
          } else {
            break;
          }
        }

        // Build binding string
        const binding = `&${behavior}${params.length > 0 ? ' ' + params.join(' ') : ''}`;
        bindings.push(binding);

        i += 1 + params.length;
      } else {
        // Skip non-behavior tokens (shouldn't happen in well-formed input)
        i++;
      }
    }

    return bindings;
  }

  /**
   * Get expected parameter count for a behavior
   */
  private static getParameterCount(behavior: string): number {
    const paramCounts: Record<string, number> = {
      trans: 0,
      kp: 1,
      mt: 2,
      lt: 2,
      mo: 1,
      tog: 1,
      bt: 1, // Can be 1 or 2, we'll handle both
    };

    // Check for bt with two params (BT_SEL takes an index)
    if (behavior === 'bt') {
      return 2; // Handle up to 2 params, parser will stop at next &
    }

    return paramCounts[behavior] ?? 1; // Default to 1 if unknown
  }
}
