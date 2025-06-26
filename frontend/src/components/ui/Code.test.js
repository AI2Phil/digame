import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Code } from './Code';

// Mock navigator.clipboard
const mockClipboard = {
  writeText: jest.fn(),
};
Object.defineProperty(navigator, 'clipboard', {
  value: mockClipboard,
  writable: true,
});

// Mock document.execCommand for older browser fallback
document.execCommand = jest.fn();


describe('Code Component', () => {
  const testCodeString = "const greeting = 'Hello, World!';\nconsole.log(greeting);";

  beforeEach(() => {
    // Clear mocks before each test
    mockClipboard.writeText.mockClear();
    document.execCommand.mockClear();
  });

  test('renders the code string correctly', () => {
    render(<Code codeString={testCodeString} />);
    expect(screen.getByText(testCodeString)).toBeInTheDocument();
  });

  test('applies language class correctly', () => {
    render(<Code codeString={testCodeString} language="javascript" />);
    const codeElement = screen.getByText(testCodeString);
    expect(codeElement).toHaveClass('language-javascript');
  });

  test('shows copy button by default', () => {
    render(<Code codeString={testCodeString} />);
    expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument();
  });

  test('hides copy button when showCopyButton is false', () => {
    render(<Code codeString={testCodeString} showCopyButton={false} />);
    expect(screen.queryByRole('button', { name: /copy code/i })).not.toBeInTheDocument();
  });

  test('hides copy button if codeString is empty or null', () => {
    render(<Code codeString="" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    render(<Code codeString={null} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('copy button copies code to clipboard and shows copied state', async () => {
    mockClipboard.writeText.mockResolvedValueOnce(undefined);
    render(<Code codeString={testCodeString} copiedDuration={100} />);

    const copyButton = screen.getByRole('button', { name: /copy code/i });
    fireEvent.click(copyButton);

    expect(mockClipboard.writeText).toHaveBeenCalledWith(testCodeString);

    // Check for copied icon/state
    // Assuming copyIcon has 'Copy' and copiedIcon has 'Check'
    // Check tooltip change
    await screen.findByRole('button', {name: /copied!/i}); // wait for tooltip to update
    expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/copy code/i)).not.toBeInTheDocument(); // Old icon should be gone

    // Wait for the copied state to revert
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument();
    }, { timeout: 200 }); // Slightly more than copiedDuration
  });

  test('uses fallback copy method if navigator.clipboard is not available', async () => {
    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      writable: true,
    });

    // Mock the select and execCommand for the fallback
    const mockSelect = jest.fn();
    const mockRef = { current: { select: mockSelect, value: testCodeString } };
    jest.spyOn(React, 'useRef').mockReturnValue(mockRef);
    document.execCommand.mockReturnValue(true);


    render(<Code codeString={testCodeString} copiedDuration={100} />);

    const copyButton = screen.getByRole('button', { name: /copy code/i });
    fireEvent.click(copyButton);

    expect(mockRef.current.select).toHaveBeenCalled();
    expect(document.execCommand).toHaveBeenCalledWith('copy');

    await screen.findByRole('button', {name: /copied!/i});
    expect(screen.getByRole('button', { name: /copied!/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /copy code/i })).toBeInTheDocument();
    }, { timeout: 200 });

    // Restore navigator.clipboard and React.useRef
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
    });
    jest.restoreAllMocks();
  });

  test('applies custom classNames', () => {
    render(
      <Code
        codeString={testCodeString}
        className="custom-container"
        preClassName="custom-pre"
        codeClassName="custom-code"
      />
    );
    expect(screen.getByText(testCodeString).closest('div[class*="custom-container"]')).toBeInTheDocument();
    expect(screen.getByText(testCodeString).closest('pre')).toHaveClass('custom-pre');
    expect(screen.getByText(testCodeString)).toHaveClass('custom-code');
  });

  test('copy button is initially hidden and appears on group hover', () => {
    render(<Code codeString={testCodeString} />);
    const copyButton = screen.getByRole('button', { name: /copy code/i });
    // In JSDOM, Tailwind group-hover states aren't automatically applied.
    // We check for the opacity-0 class which should be there initially.
    expect(copyButton).toHaveClass('opacity-0');
    // A more robust test would involve Cypress or Playwright for actual hover interaction.
    // For unit tests, we can verify the class that controls visibility.
  });
});
