/**
 * Storybook stories for BehaviorMapper
 *
 * Tests behavior ID → ZMK code mapping
 */

import type { Meta, StoryObj } from '@storybook/react';
import { BehaviorMapper } from './BehaviorMapper';
import { HidMapper } from './HidMapper';
import { Binding } from './types';

// Component wrapper to display behavior mappings
const BehaviorMappingDemo = ({ bindings }: { bindings: Binding[] }) => {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>
      <h3>Behavior ID → ZMK Code Mapping:</h3>
      <table style={{
        borderCollapse: 'collapse',
        width: '100%',
        marginTop: '16px',
      }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Behavior ID</th>
            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Behavior Name</th>
            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Parameters</th>
            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>ZMK Code</th>
          </tr>
        </thead>
        <tbody>
          {bindings.map((binding, idx) => {
            const behavior = BehaviorMapper.getBehavior(binding.behaviorId);
            const zmkCode = BehaviorMapper.formatBinding(binding, HidMapper.getZmkKeyName.bind(HidMapper));

            return (
              <tr key={idx}>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{binding.behaviorId}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>{behavior?.displayName || 'Unknown'}</td>
                <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                  {binding.param1}
                  {binding.param2 !== null && binding.param2 !== undefined && `, ${binding.param2}`}
                </td>
                <td style={{ padding: '8px', border: '1px solid #ddd', fontWeight: 'bold', color: '#007acc' }}>
                  {zmkCode}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

const meta: Meta<typeof BehaviorMappingDemo> = {
  title: 'Export/BehaviorMapper',
  component: BehaviorMappingDemo,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic key press behaviors (kp)
 */
export const KeyPressBehaviors: Story = {
  args: {
    bindings: [
      { behaviorId: 1, param1: 0x04, param2: null, position: 0 }, // Q (HID 0x04)
      { behaviorId: 1, param1: 0x1A, param2: null, position: 1 }, // W (HID 0x1A)
      { behaviorId: 1, param1: 0x08, param2: null, position: 2 }, // E (HID 0x08)
      { behaviorId: 1, param1: 0x2C, param2: null, position: 3 }, // SPACE (HID 0x2C)
      { behaviorId: 1, param1: 0x28, param2: null, position: 4 }, // ENTER (HID 0x28)
      { behaviorId: 1, param1: 0x29, param2: null, position: 5 }, // ESC (HID 0x29)
    ],
  },
};

/**
 * All behavior types
 */
export const AllBehaviorTypes: Story = {
  args: {
    bindings: [
      { behaviorId: 0, param1: 0, param2: null, position: 0 }, // &trans
      { behaviorId: 1, param1: 0x04, param2: null, position: 1 }, // &kp Q
      { behaviorId: 2, param1: 0xE0, param2: 0x04, position: 2 }, // &mt LCTRL A
      { behaviorId: 3, param1: 1, param2: 0x2B, position: 3 }, // &lt 1 TAB
      { behaviorId: 4, param1: 1, param2: null, position: 4 }, // &mo 1
      { behaviorId: 5, param1: 2, param2: null, position: 5 }, // &tog 2
      { behaviorId: 6, param1: 0, param2: null, position: 6 }, // &bt 0
    ],
  },
};

/**
 * Modifier keys
 */
export const ModifierKeys: Story = {
  args: {
    bindings: [
      { behaviorId: 1, param1: 0xE0, param2: null, position: 0 }, // LCTRL
      { behaviorId: 1, param1: 0xE1, param2: null, position: 1 }, // LSHFT
      { behaviorId: 1, param1: 0xE2, param2: null, position: 2 }, // LALT
      { behaviorId: 1, param1: 0xE3, param2: null, position: 3 }, // LGUI
      { behaviorId: 1, param1: 0xE4, param2: null, position: 4 }, // RCTRL
      { behaviorId: 1, param1: 0xE5, param2: null, position: 5 }, // RSHFT
    ],
  },
};

/**
 * Unknown behavior ID (fallback handling)
 */
export const UnknownBehavior: Story = {
  args: {
    bindings: [
      { behaviorId: 99, param1: 0, param2: null, position: 0 }, // Unknown behavior
      { behaviorId: 1, param1: 0x04, param2: null, position: 1 }, // Valid behavior
    ],
  },
};
