/**
 * Storybook stories for ExportButton component
 *
 * Tests three states: Default, Exporting, Disabled
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ExportButton } from './ExportButton';

const meta: Meta<typeof ExportButton> = {
  title: 'Export/ExportButton',
  component: ExportButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default state: Button enabled, ready to export
 */
export const Default: Story = {
  args: {
    onExport: () => console.log('Export clicked'),
    isExporting: false,
    disabled: false,
  },
};

/**
 * Exporting state: Button shows loading indicator
 */
export const Exporting: Story = {
  args: {
    onExport: () => {},
    isExporting: true,
    disabled: false,
  },
};

/**
 * Disabled state: No keyboard connected
 */
export const Disabled: Story = {
  args: {
    onExport: () => {},
    isExporting: false,
    disabled: true,
  },
};

/**
 * With custom tooltip
 */
export const WithTooltip: Story = {
  args: {
    onExport: () => console.log('Export with tooltip'),
    isExporting: false,
    disabled: false,
    tooltip: 'Export your keymap configuration',
  },
};
