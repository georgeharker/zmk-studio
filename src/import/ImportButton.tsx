/**
 * ImportButton: UI component for triggering keymap import
 *
 * Displays a button with Upload icon that opens file picker for .keymap files
 */

import { Button, Tooltip, TooltipTrigger } from 'react-aria-components';
import { Upload } from 'lucide-react';
import { useRef } from 'react';

export interface ImportButtonProps {
  onImport: (file: File) => void | Promise<void>;
  isImporting?: boolean;
  disabled?: boolean;
  tooltip?: string;
}

export function ImportButton({
  onImport,
  isImporting = false,
  disabled = false,
  tooltip = 'Import keymap from .keymap file',
}: ImportButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonPress = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input so same file can be selected again
      event.target.value = '';
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".keymap"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <TooltipTrigger>
        <Button
          className="flex items-center justify-center p-1.5 rounded
            enabled:hover:bg-base-300 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-150"
          onPress={handleButtonPress}
          isDisabled={disabled || isImporting}
          aria-label="Import keymap"
        >
          <Upload
            className={`inline-block w-4 mx-1 ${isImporting ? 'animate-pulse' : ''}`}
            aria-hidden="true"
          />
          {isImporting && (
            <span className="ml-1 text-sm">Importing...</span>
          )}
        </Button>
        <Tooltip className="bg-gray-800 text-white px-2 py-1 rounded text-sm max-w-xs">
          {tooltip}
        </Tooltip>
      </TooltipTrigger>
    </>
  );
}
