import React from 'react';
import { Code } from './Code';
import { Copy, CheckSquare } from 'lucide-react';

export default {
  title: 'UI/Code',
  component: Code,
  argTypes: {
    codeString: {
      control: 'text',
      description: 'The code string to display.',
      defaultValue: "console.log('Hello, Digame!');",
    },
    language: {
      control: 'text',
      description: 'Language for syntax highlighting (currently visual only).',
      defaultValue: 'javascript',
    },
    showCopyButton: {
      control: 'boolean',
      description: 'Whether to display the copy-to-clipboard button.',
      defaultValue: true,
    },
    className: { control: 'text', description: 'Custom CSS class for the container.' },
    preClassName: { control: 'text', description: 'Custom CSS class for the <pre> tag.' },
    codeClassName: { control: 'text', description: 'Custom CSS class for the <code> tag.' },
    copiedDuration: { control: 'number', description: 'Duration (ms) to show "Copied!" state.' },
  },
  parameters: {
    layout: 'padded', // 'padded' is often better for Code blocks than 'centered'
  },
};

const Template = (args) => (
  <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
    <Code {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  codeString: `function greet(name) {\n  return \`Hello, \${name}!\`;\n}\n\nconsole.log(greet('Digame User'));`,
  language: 'javascript',
};

export const PythonCode = Template.bind({});
PythonCode.args = {
  codeString: `def calculate_sum(a, b):\n    return a + b\n\nresult = calculate_sum(5, 10)\nprint(f"The result is: {result}")`,
  language: 'python',
};

export const HTMLCode = Template.bind({});
HTMLCode.args = {
  codeString: `<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>
  <h1>Welcome</h1>
  <p>This is a paragraph.</p>
</body>
</html>`,
  language: 'html',
};

export const CSSCode = Template.bind({});
CSSCode.args = {
  codeString: `body {\n  font-family: Arial, sans-serif;\n  margin: 0;\n  padding: 0;\n  background-color: #f0f0f0;\n}\n\n.container {\n  width: 80%;\n  margin: auto;\n  overflow: hidden;\n}`,
  language: 'css',
};

export const NoCopyButton = Template.bind({});
NoCopyButton.args = {
  codeString: "const simple = true;",
  language: 'javascript',
  showCopyButton: false,
};

export const LongCodeString = Template.bind({});
LongCodeString.args = {
  codeString: `
// This is a long line of code that should demonstrate horizontal scrolling if the container is not wide enough to show it all at once.
const veryLongVariableNameAssignedAString = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

function complexFunction(param1, param2, param3, param4, param5) {
  let result = 0;
  for (let i = 0; i < param1.length; i++) {
    result += param1.charCodeAt(i) * param2;
  }
  if (param3) {
    result /= param4;
  } else {
    result -= param5;
  }
  return result;
}
// Another long comment to ensure scrolling is needed for various content types and lengths of lines.
console.log(complexFunction(veryLongVariableNameAssignedAString, 10, true, 5, 20));
  `.trim(),
  language: 'javascript',
};
LongCodeString.parameters = {
  docs: {
    description: {
      story: 'Demonstrates how the component handles long lines of code with horizontal scrolling.',
    },
  },
};


export const WithCustomIcons = Template.bind({});
WithCustomIcons.args = {
  codeString: `// Custom Icons\nconst custom = "example";`,
  language: 'javascript',
  copyIcon: <Copy className="h-4 w-4 text-blue-500" />,
  copiedIcon: <CheckSquare className="h-4 w-4 text-green-700" />,
  copyTooltipText: 'Copy (Custom)',
  copiedTooltipText: 'Got it! (Custom)',
};

export const EmptyCodeString = Template.bind({});
EmptyCodeString.args = {
  codeString: "",
  language: 'text',
};
EmptyCodeString.parameters = {
  docs: {
    description: {
      story: 'Demonstrates behavior with an empty code string. Copy button should not appear.',
    },
  },
};

export const ShortCopiedDuration = Template.bind({});
ShortCopiedDuration.args = {
  codeString: `// Copied state duration test\nduration = 500;`,
  language: 'javascript',
  copiedDuration: 500,
};
