/**
 * ExportButton: UI component for triggering keymap export
 *
 * Displays a button with Download icon that triggers export operation
 */

import { Button, Tooltip, TooltipTrigger } from 'react-aria-components';
import { Download } from 'lucide-react';
import { ExportButtonProps } from './types';

export function ExportButton({
  onExport,
  isExporting,
  disabled,
  tooltip = 'Export keymap to .keymap file',
}: ExportButtonProps) {
  return (
    <TooltipTrigger>
      <Button
        className="flex items-center justify-center p-1.5 rounded
          enabled:hover:bg-base-300 disabled:opacity-50 disabled:cursor-not-allowed
          transition-colors duration-150"
        onPress={onExport}
        isDisabled={disabled || isExporting}
        aria-label="Export keymap"
      >
        <Download
          className={`inline-block w-4 mx-1 ${isExporting ? 'animate-pulse' : ''}`}
          aria-hidden="true"
        />
        {isExporting && (
          <span className="ml-1 text-sm">Exporting...</span>
        )}
      </Button>
      <Tooltip className="bg-gray-800 text-white px-2 py-1 rounded text-sm max-w-xs">
        {tooltip}
      </Tooltip>
    </TooltipTrigger>
  );
}
