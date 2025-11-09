/**
 * Type definitions for ZMK Studio Import Feature
 */

/**
 * Result of parsing a .keymap file
 */
export interface ParseResult {
  success: boolean;
  layers?: ParsedLayer[];
  metadata?: KeymapMetadata;
  warnings?: string[];
  error?: ParseError;
}

/**
 * A parsed layer from .keymap file
 */
export interface ParsedLayer {
  /** Layer label from definition */
  label: string;
  /** Parsed bindings as text (e.g., "&kp A", "&mt LCTRL B") */
  bindings: string[];
}

/**
 * Metadata extracted from .keymap comments
 */
export interface KeymapMetadata {
  /** Device name */
  device?: string;
  /** Export date */
  date?: string;
  /** Version */
  version?: string;
  /** Number of layers */
  layerCount?: number;
}

/**
 * Parse error information
 */
export interface ParseError {
  code: ParseErrorCode;
  message: string;
  line?: number;
  context?: any;
}

/**
 * Parse error codes
 */
export enum ParseErrorCode {
  INVALID_FORMAT = 'INVALID_FORMAT',
  MISSING_KEYMAP = 'MISSING_KEYMAP',
  INVALID_LAYER = 'INVALID_LAYER',
  INVALID_BINDING = 'INVALID_BINDING',
  UNKNOWN_BEHAVIOR = 'UNKNOWN_BEHAVIOR',
  UNKNOWN_KEY = 'UNKNOWN_KEY',
}

/**
 * A binding converted to internal format (without position)
 */
export interface PartialConvertedBinding {
  behaviorId: number;
  param1: number | null;
  param2: number | null;
}

/**
 * A binding converted to internal format (with position)
 */
export interface ConvertedBinding extends PartialConvertedBinding {
  position: number;
}

/**
 * Result of converting parsed layers to internal format
 */
export interface ConversionResult {
  success: boolean;
  layers?: Array<{
    id: number;
    label: string;
    bindings: ConvertedBinding[];
  }>;
  warnings?: string[];
  error?: ParseError;
}

/**
 * Result of importing a keymap file
 */
export interface ImportResult {
  success: boolean;
  layers?: Array<{
    id: number;
    label: string;
    bindings: ConvertedBinding[];
  }>;
  warnings?: string[];
  error?: ImportError;
}

/**
 * Import error information
 */
export interface ImportError {
  code: ImportErrorCode;
  message: string;
  context?: any;
}

/**
 * Import error codes
 */
export enum ImportErrorCode {
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  PARSE_ERROR = 'PARSE_ERROR',
  CONVERSION_ERROR = 'CONVERSION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RPC_ERROR = 'RPC_ERROR',
}

/**
 * Import validation result
 */
export interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}
