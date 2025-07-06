import React, { useState, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Copy, Check } from 'lucide-react';
import { Button } from './Button'; // Assuming Button component is available
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip'; // Removed to avoid TypeScript errors

/**
 * Code component for displaying code snippets with a copy-to-clipboard button.
 * @param {object} props - The component props.
 * @param {string} props.codeString - The code string to display.
 * @param {string} [props.language='plaintext'] - The language of the code (for styling/future syntax highlighting).
 * @param {string} [props.className] - Additional CSS classes for the main container.
 * @param {string} [props.preClassName] - Additional CSS classes for the <pre> tag.
 * @param {string} [props.codeClassName] - Additional CSS classes for the <code> tag.
 * @param {boolean} [props.showCopyButton=true] - Whether to show the copy button.
 * @param {React.ReactNode} [props.copyIcon] - Icon for the copy button.
 * @param {React.ReactNode} [props.copiedIcon] - Icon when text is copied.
 * @param {string} [props.copyTooltipText='Copy to clipboard'] - Tooltip text for the copy button.
 * @param {string} [props.copiedTooltipText='Copied!'] - Tooltip text after copying.
 * @param {number} [props.copiedDuration=2000] - Duration to show the copied state (in ms).
 */
const Code = (/** @type {any} */ {
  codeString,
  language = 'plaintext',
  className,
  preClassName,
  codeClassName,
  showCopyButton = true,
  copyIcon = <Copy className="h-3 w-3" />, // Adjusted size
  copiedIcon = <Check className="h-3 w-3 text-green-500" />, // Adjusted size
  copyTooltipText = 'Copy code',
  copiedTooltipText = 'Copied!',
  copiedDuration = 2000,
  ...props
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const textInput = useRef(null);

  const handleCopy = () => {
    if (navigator.clipboard && codeString) {
      navigator.clipboard.writeText(codeString).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), copiedDuration);
      });
    } else if (textInput.current) {
      // Fallback for older browsers or insecure contexts
      textInput.current.select();
      document.execCommand('copy');
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuration);
    }
  };

  return (
    <div className={cn('relative group bg-muted rounded-md border text-sm font-mono', className)} {...props}>
      <pre
        className={cn('p-4 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent', preClassName)}
        ref={textInput} // For fallback copy
        // For accessibility, make pre focusable if it's scrollable, though scrollbar-thin helps
        tabIndex={0}
      >
        <code className={cn(`language-${language}`, codeClassName)}>
          {codeString}
        </code>
      </pre>
      {/* Fallback textarea for browsers that don't support navigator.clipboard */}
      {typeof navigator.clipboard === 'undefined' && (
          <textarea
            ref={textInput}
            value={codeString}
            readOnly
            style={{ position: 'absolute', left: '-9999px', top: '0px' }}
            aria-hidden="true"
          />
        )
      }
      {showCopyButton && codeString && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity',
            isCopied && 'opacity-100' // Keep visible when copied
          )}
          onClick={handleCopy}
          aria-label={isCopied ? copiedTooltipText : copyTooltipText}
          title={isCopied ? copiedTooltipText : copyTooltipText}
        >
          {isCopied ? copiedIcon : copyIcon}
        </Button>
      )}
    </div>
  );
};

Code.displayName = 'Code';

export { Code };
