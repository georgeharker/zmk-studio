/**
 * BehaviorMapper: Maps behavior IDs to ZMK behavior codes
 *
 * Converts numeric behavior identifiers from keyboard RPC responses
 * to ZMK DeviceTree syntax (e.g., behaviorId 1 → "kp", behaviorId 2 → "mt")
 */

import { Behavior, Binding } from './types';

/**
 * Known ZMK behaviors with their parameter counts
 *
 * NOTE: These mappings are assumptions based on ZMK firmware conventions.
 * Actual behaviorId values MUST be validated against real keyboard responses
 * (see tasks T011a-c in implementation plan).
 *
 * Expected mapping (to be validated):
 * - 0: trans (transparent) - pass-through to lower layer
 * - 1: kp (key press) - basic key press
 * - 2: mt (mod-tap) - modifier when held, key when tapped
 * - 3: lt (layer-tap) - layer when held, key when tapped
 * - 4: mo (momentary layer) - activate layer while held
 * - 5: tog (toggle layer) - toggle layer on/off
 * - 6: bt (bluetooth) - bluetooth commands
 */
const BEHAVIORS: Map<number, Behavior> = new Map([
  [0, { id: 0, code: 'trans', displayName: 'Transparent', paramCount: 0, description: 'Pass through to lower layer' }],
  [1, { id: 1, code: 'kp', displayName: 'Key Press', paramCount: 1, description: 'Basic key press' }],
  [2, { id: 2, code: 'mt', displayName: 'Mod-Tap', paramCount: 2, description: 'Modifier when held, key when tapped' }],
  [3, { id: 3, code: 'lt', displayName: 'Layer-Tap', paramCount: 2, description: 'Layer when held, key when tapped' }],
  [4, { id: 4, code: 'mo', displayName: 'Momentary Layer', paramCount: 1, description: 'Activate layer while held' }],
  [5, { id: 5, code: 'tog', displayName: 'Toggle Layer', paramCount: 1, description: 'Toggle layer on/off' }],
  [6, { id: 6, code: 'bt', displayName: 'Bluetooth', paramCount: 1, description: 'Bluetooth control' }],
]);

export class BehaviorMapper {
  /**
   * Format a binding into ZMK DeviceTree syntax
   *
   * Examples:
   * - &trans
   * - &kp A
   * - &mt LCTRL A
   * - &lt 1 TAB
   * - &mo 2
   * - &tog 1
   * - &bt BT_CLR
   *
   * @param binding - Binding object with behaviorId and parameters
   * @param getKeyName - Function to convert HID usage codes to key names
   * @returns ZMK binding string (e.g., "&kp A")
   */
  static formatBinding(
    binding: Binding,
    getKeyName: (hidUsage: number) => string | null
  ): string {
    const behavior = BEHAVIORS.get(binding.behaviorId);

    if (!behavior) {
      return `/* Unknown behavior ${binding.behaviorId} */`;
    }

    // Transparent has no parameters
    if (behavior.code === 'trans') {
      return '&trans';
    }

    // Single parameter behaviors (kp, mo, tog, bt)
    if (behavior.paramCount === 1) {
      const param = this.formatParam(binding.param1, behavior, getKeyName);
      return `&${behavior.code} ${param}`;
    }

    // Two parameter behaviors (mt, lt)
    if (behavior.paramCount === 2) {
      // Layer-tap: param1 is layer number, param2 is key
      if (behavior.code === 'lt') {
        const layerNum = binding.param1.toString();
        const keyName = binding.param2 !== null && binding.param2 !== undefined
          ? (getKeyName(binding.param2) || `/* HID 0x${binding.param2.toString(16)} */`)
          : '/* missing key */';
        return `&lt ${layerNum} ${keyName}`;
      }

      // Mod-tap: both params are keys/modifiers
      const param1 = this.formatParam(binding.param1, behavior, getKeyName);
      const param2 = binding.param2 !== null && binding.param2 !== undefined
        ? this.formatParam(binding.param2, behavior, getKeyName)
        : '/* missing param2 */';
      return `&${behavior.code} ${param1} ${param2}`;
    }

    return `&${behavior.code}`;
  }

  /**
   * Format a parameter value based on behavior type
   *
   * @param value - Numeric parameter value
   * @param behavior - Behavior metadata
   * @param getKeyName - Function to convert HID codes to key names
   * @returns Formatted parameter string
   */
  private static formatParam(
    value: number,
    behavior: Behavior,
    getKeyName: (hidUsage: number) => string | null
  ): string {
    // For key press and mod-tap behaviors, convert HID code to key name
    // NOTE: lt (layer-tap) is handled specially in formatBinding()
    if (behavior.code === 'kp' || behavior.code === 'mt') {
      const keyName = getKeyName(value);
      return keyName || `/* HID 0x${value.toString(16)} */`;
    }

    // For layer behaviors (mo, tog), return layer number
    // NOTE: lt (layer-tap) is handled specially in formatBinding()
    if (behavior.code === 'mo' || behavior.code === 'tog') {
      return value.toString();
    }

    // For Bluetooth, could add BT command mapping here
    // For now, just return the numeric value
    return value.toString();
  }

  /**
   * Get behavior by ID
   *
   * @param behaviorId - Numeric behavior identifier
   * @returns Behavior metadata or null if unknown
   */
  static getBehavior(behaviorId: number): Behavior | null {
    return BEHAVIORS.get(behaviorId) || null;
  }

  /**
   * Get behavior code string
   *
   * @param behaviorId - Numeric behavior identifier
   * @returns Behavior code (e.g., "kp", "mt") or null if unknown
   */
  static getBehaviorCode(behaviorId: number): string | null {
    const behavior = BEHAVIORS.get(behaviorId);
    return behavior ? behavior.code : null;
  }

  /**
   * Check if a behavior references a layer
   *
   * @param behaviorId - Numeric behavior identifier
   * @returns True if behavior uses layer numbers as parameters
   */
  static isLayerBehavior(behaviorId: number): boolean {
    const behavior = BEHAVIORS.get(behaviorId);
    return behavior?.code === 'lt' || behavior?.code === 'mo' || behavior?.code === 'tog';
  }

  /**
   * Get parameter count for a behavior
   *
   * @param behaviorId - Numeric behavior identifier
   * @returns Number of parameters (0, 1, or 2)
   */
  static getParamCount(behaviorId: number): number {
    const behavior = BEHAVIORS.get(behaviorId);
    return behavior?.paramCount ?? 0;
  }

  /**
   * Get all known behaviors
   *
   * @returns Map of behavior ID to Behavior metadata
   */
  static getAllBehaviors(): Map<number, Behavior> {
    return new Map(BEHAVIORS);
  }
}
