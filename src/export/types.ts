/**
 * Type Contracts for ZMK Studio Export/Import Feature
 *
 * Feature: 007-zmk-studio-export
 * Purpose: TypeScript interfaces and types for keymap export/import
 */

// ============================================================================
// Core Domain Types
// ============================================================================

/**
 * Complete keyboard configuration
 */
export interface Keymap {
  layers: Layer[];
  deviceName: string;
  layoutName: string;
  timestamp: Date;
  version: string;
  totalBindings: number;
}

/**
 * Individual keyboard layer with bindings
 */
export interface Layer {
  id: number;
  label: string;
  bindings: Binding[];
  isActive?: boolean;
}

/**
 * Key behavior assignment for a specific position
 */
export interface Binding {
  behaviorId: number;
  param1: number;
  param2: number | null;
  position: number;
}

/**
 * Behavior metadata (kp, mt, lt, etc.)
 */
export interface Behavior {
  id: number;
  code: string;
  displayName: string;
  paramCount: number;
  description: string;
}

/**
 * HID usage code to ZMK key name mapping
 */
export interface KeyCode {
  hidUsage: number;
  zmkName: string;
  label: string;
  category: 'letter' | 'number' | 'modifier' | 'function' | 'special';
}

// ============================================================================
// Export-Specific Types
// ============================================================================

/**
 * Intermediate representation for .keymap file generation
 */
export interface ExportedKeymap {
  metadata: ExportMetadata;
  layers: ExportedLayer[];
  layerConstants: Map<number, string>;
  includes: string[];
  footer: string;
}

/**
 * Export metadata comment block
 */
export interface ExportMetadata {
  timestamp: string; // ISO 8601
  deviceName: string;
  version: string;
  layerCount: number;
}

/**
 * Layer in DeviceTree format
 */
export interface ExportedLayer {
  constantName: string; // e.g., "DEF", "LWR"
  label: string;
  bindings: string[]; // ZMK binding code strings
}

/**
 * Export operation result
 */
export interface ExportResult {
  success: boolean;
  filename: string;
  content?: string;
  error?: ExportError;
}

/**
 * Export error details
 */
export interface ExportError {
  code: ExportErrorCode;
  message: string;
  context?: Record<string, any>;
}

export enum ExportErrorCode {
  NO_KEYBOARD = 'NO_KEYBOARD',
  RPC_FAILURE = 'RPC_FAILURE',
  UNKNOWN_BEHAVIOR = 'UNKNOWN_BEHAVIOR',
  INVALID_LAYER = 'INVALID_LAYER',
  GENERATION_FAILED = 'GENERATION_FAILED',
}

// ============================================================================
// RPC Protocol Types
// ============================================================================

/**
 * RPC request for getting all layers
 */
export interface GetLayersRequest {
  keymap: {
    getLayers: true;
  };
}

/**
 * RPC response with layer list
 */
export interface GetLayersResponse {
  keymap: {
    getLayers: {
      layers: RpcLayer[];
    };
  };
}

/**
 * RPC layer representation
 */
export interface RpcLayer {
  id: number;
  name: string;
}

/**
 * RPC request for specific layer bindings
 */
export interface GetLayerRequest {
  keymap: {
    getLayer: {
      layerId: number;
    };
  };
}

/**
 * RPC response with layer bindings
 */
export interface GetLayerResponse {
  keymap: {
    getLayer: {
      bindings: RpcBinding[];
    };
  };
}

/**
 * RPC binding representation
 */
export interface RpcBinding {
  behaviorId: number;
  param1: number;
  param2?: number;
}

/**
 * RPC request for behavior list
 */
export interface GetBehaviorsRequest {
  behaviors: {
    getAllBehaviorIds: true;
  };
}

/**
 * RPC response with behavior IDs
 */
export interface GetBehaviorsResponse {
  behaviors: {
    getAllBehaviorIds: {
      ids: number[];
    };
  };
}

/**
 * RPC request for behavior details
 */
export interface GetBehaviorDetailsRequest {
  behaviors: {
    getDetails: {
      behaviorId: number;
    };
  };
}

/**
 * RPC response with behavior metadata
 */
export interface GetBehaviorDetailsResponse {
  behaviors: {
    getDetails: {
      id: number;
      displayName: string;
      // Additional fields TBD from actual RPC
    };
  };
}

// ============================================================================
// Layer Management Types
// ============================================================================

/**
 * Layer operation for undo/redo
 */
export interface LayerOperation {
  type: 'create' | 'delete' | 'rename' | 'reorder';
  layerId: number;
  oldValue: any;
  newValue: any;
  timestamp: Date;
}

/**
 * Layer reference (for dependency tracking)
 */
export interface LayerReference {
  sourceLayerId: number;
  bindingPosition: number;
  targetLayerId: number;
  behaviorCode: 'lt' | 'mo' | 'tog';
}

/**
 * Result of layer delete operation
 */
export interface DeleteLayerResult {
  success: boolean;
  deletedLayerId: number;
  affectedBindings?: LayerReference[];
  error?: string;
}

/**
 * Layer reorder operation
 */
export interface ReorderLayersOperation {
  oldIndex: number;
  newIndex: number;
  updatedReferences: LayerReference[];
}

// ============================================================================
// Service Interfaces
// ============================================================================

/**
 * Export service interface
 */
export interface IExportService {
  exportKeymap(deviceName: string): Promise<ExportResult>;
  fetchLayers(): Promise<Layer[]>;
  fetchBehaviors(): Promise<Behavior[]>;
  generateKeymapFile(keymap: Keymap): string;
}

/**
 * Keymap generator interface
 */
export interface IKeymapGenerator {
  generate(keymap: Keymap): string;
  generateLayer(layer: Layer, behaviors: Behavior[]): string;
  generateBinding(binding: Binding, behavior: Behavior): string;
  generateMetadata(metadata: ExportMetadata): string;
  generateIncludes(includes: string[]): string;
  generateLayerConstants(layers: Layer[]): string;
  generateFooter(): string;
}

/**
 * Behavior mapper interface
 */
export interface IBehaviorMapper {
  getBehaviorCode(behaviorId: number): string | null;
  getBehavior(behaviorId: number): Behavior | null;
  isLayerBehavior(behaviorId: number): boolean;
  getParamCount(behaviorId: number): number;
}

/**
 * HID mapper interface
 */
export interface IHidMapper {
  getZmkKeyName(hidUsage: number): string | null;
  getKeyCode(hidUsage: number): KeyCode | null;
  isModifier(hidUsage: number): boolean;
}

/**
 * Layer manager interface
 */
export interface ILayerManager {
  createLayer(label?: string): Promise<Layer>;
  deleteLayer(layerId: number): Promise<DeleteLayerResult>;
  renameLayer(layerId: number, newLabel: string): Promise<void>;
  reorderLayers(oldIndex: number, newIndex: number): Promise<ReorderLayersOperation>;
  findLayerReferences(layerId: number): LayerReference[];
  updateLayerReferences(references: LayerReference[], newLayerId: number): Promise<void>;
  validateLayerLimit(): boolean;
  canDeleteLayer(layerId: number): boolean;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Export configuration options
 */
export interface ExportConfig {
  includeMetadata: boolean;
  includeComments: boolean;
  formatBindings: 'compact' | 'expanded' | 'rows';
  maxLineLength: number;
}

/**
 * Behavior mapping configuration
 */
export interface BehaviorMapConfig {
  knownBehaviors: Map<number, Behavior>;
  fallbackStrategy: 'comment' | 'error' | 'skip';
}

/**
 * Layer constraints configuration
 */
export interface LayerConstraints {
  maxLayers: number;
  minLayers: number;
  maxLabelLength: number;
  labelPattern: RegExp;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  value: any;
  message: string;
  severity: 'error';
}

/**
 * Validation warning
 */
export interface ValidationWarning {
  field: string;
  value: any;
  message: string;
  severity: 'warning';
}

/**
 * Keymap validator interface
 */
export interface IKeymapValidator {
  validate(keymap: Keymap): ValidationResult;
  validateLayer(layer: Layer): ValidationResult;
  validateBinding(binding: Binding): ValidationResult;
  validateLayerLabel(label: string): ValidationResult;
}

// ============================================================================
// UI Component Props
// ============================================================================

/**
 * Export button component props
 */
export interface ExportButtonProps {
  onExport: () => void;
  isExporting: boolean;
  disabled: boolean;
  tooltip?: string;
}

/**
 * Export progress component props
 */
export interface ExportProgressProps {
  step: ExportStep;
  progress: number;
}

export enum ExportStep {
  IDLE = 'IDLE',
  FETCHING_LAYERS = 'FETCHING_LAYERS',
  FETCHING_BEHAVIORS = 'FETCHING_BEHAVIORS',
  GENERATING_FILE = 'GENERATING_FILE',
  DOWNLOADING = 'DOWNLOADING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR',
}

/**
 * Layer list component props
 */
export interface LayerListProps {
  layers: Layer[];
  activeLayerId: number | null;
  onLayerSelect: (layerId: number) => void;
  onLayerCreate: () => void;
  onLayerDelete: (layerId: number) => void;
  onLayerRename: (layerId: number, newLabel: string) => void;
  onLayerReorder: (oldIndex: number, newIndex: number) => void;
  disabled?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default export configuration
 */
export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  includeMetadata: true,
  includeComments: true,
  formatBindings: 'rows',
  maxLineLength: 80,
};

/**
 * Default layer constraints
 */
export const DEFAULT_LAYER_CONSTRAINTS: LayerConstraints = {
  maxLayers: 16,
  minLayers: 1,
  maxLabelLength: 32,
  labelPattern: /^[a-zA-Z0-9_]+$/,
};

/**
 * DeviceTree includes
 */
export const DEVICETREE_INCLUDES = [
  '<behaviors.dtsi>',
  '<dt-bindings/zmk/keys.h>',
  '<dt-bindings/zmk/bt.h>',
];

/**
 * Export file extension
 */
export const KEYMAP_FILE_EXTENSION = '.keymap';

/**
 * Export filename pattern
 */
export const EXPORT_FILENAME_PATTERN = '{deviceName}-{date}{ext}';
