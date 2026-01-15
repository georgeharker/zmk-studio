/**
 * Storybook stories for KeymapGenerator
 *
 * Tests .keymap file generation with various configurations
 */

import type { Meta, StoryObj } from '@storybook/react';
import { KeymapGenerator } from './KeymapGenerator';
import { Keymap, Layer, Binding } from './types';

// Component wrapper to display generated content
const KeymapPreview = ({ keymap }: { keymap: Keymap }) => {
  const content = KeymapGenerator.generate(keymap);

  return (
    <div style={{ width: '800px', fontFamily: 'monospace', fontSize: '12px' }}>
      <h3>Generated .keymap File:</h3>
      <pre style={{
        background: '#f5f5f5',
        padding: '16px',
        borderRadius: '4px',
        overflow: 'auto',
        maxHeight: '600px',
      }}>
        {content}
      </pre>
    </div>
  );
};

const meta: Meta<typeof KeymapPreview> = {
  title: 'Export/KeymapGenerator',
  component: KeymapPreview,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Basic keymap with single layer and &kp behaviors only
 */
export const BasicSingleLayer: Story = {
  args: {
    keymap: {
      deviceName: 'corne',
      layoutName: 'default',
      timestamp: new Date('2025-11-09T10:00:00Z'),
      version: '1.0.0',
      totalBindings: 6,
      layers: [
        {
          id: 0,
          label: 'Default',
          bindings: [
            { behaviorId: 1, param1: 0x04, param2: null, position: 0 }, // Q
            { behaviorId: 1, param1: 0x1A, param2: null, position: 1 }, // W
            { behaviorId: 1, param1: 0x08, param2: null, position: 2 }, // E
            { behaviorId: 1, param1: 0x15, param2: null, position: 3 }, // R
            { behaviorId: 1, param1: 0x17, param2: null, position: 4 }, // T
            { behaviorId: 1, param1: 0x1C, param2: null, position: 5 }, // Y
          ],
        },
      ],
    },
  },
};

/**
 * Multiple layers with layer constants
 */
export const MultipleLayers: Story = {
  args: {
    keymap: {
      deviceName: 'corne',
      layoutName: 'default',
      timestamp: new Date('2025-11-09T10:00:00Z'),
      version: '1.0.0',
      totalBindings: 12,
      layers: [
        {
          id: 0,
          label: 'Default',
          bindings: [
            { behaviorId: 1, param1: 0x04, param2: null, position: 0 }, // Q
            { behaviorId: 1, param1: 0x1A, param2: null, position: 1 }, // W
            { behaviorId: 1, param1: 0x08, param2: null, position: 2 }, // E
            { behaviorId: 4, param1: 1, param2: null, position: 3 }, // MO(1)
          ],
        },
        {
          id: 1,
          label: 'Lower',
          bindings: [
            { behaviorId: 1, param1: 0x1E, param2: null, position: 0 }, // 1
            { behaviorId: 1, param1: 0x1F, param2: null, position: 1 }, // 2
            { behaviorId: 1, param1: 0x20, param2: null, position: 2 }, // 3
            { behaviorId: 0, param1: 0, param2: null, position: 3 }, // &trans
          ],
        },
        {
          id: 2,
          label: 'Raise',
          bindings: [
            { behaviorId: 1, param1: 0x3A, param2: null, position: 0 }, // F1
            { behaviorId: 1, param1: 0x3B, param2: null, position: 1 }, // F2
            { behaviorId: 1, param1: 0x3C, param2: null, position: 2 }, // F3
            { behaviorId: 5, param1: 0, param2: null, position: 3 }, // TOG(0)
          ],
        },
      ],
    },
  },
};

/**
 * Empty layer with all transparent bindings
 */
export const EmptyLayer: Story = {
  args: {
    keymap: {
      deviceName: 'test-keyboard',
      layoutName: 'default',
      timestamp: new Date('2025-11-09T10:00:00Z'),
      version: '1.0.0',
      totalBindings: 4,
      layers: [
        {
          id: 0,
          label: 'Empty',
          bindings: [
            { behaviorId: 0, param1: 0, param2: null, position: 0 }, // &trans
            { behaviorId: 0, param1: 0, param2: null, position: 1 }, // &trans
            { behaviorId: 0, param1: 0, param2: null, position: 2 }, // &trans
            { behaviorId: 0, param1: 0, param2: null, position: 3 }, // &trans
          ],
        },
      ],
    },
  },
};
