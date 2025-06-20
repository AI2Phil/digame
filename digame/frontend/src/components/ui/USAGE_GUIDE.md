# UI Component Usage Guide

This guide provides basic usage examples for the custom UI components available in this project. These components are built using Radix UI primitives and styled with Tailwind CSS.

## General Setup

Ensure that Radix UI and Tailwind CSS are properly installed and configured in your project. The necessary Tailwind directives should be in your global CSS file.

The `cn` utility from `src/lib/utils.ts` is used internally by some components and can be useful for conditional class naming.

## Components

### 1. Button

Wraps a standard HTML button or can render as a child component (e.g., a link styled as a button).

**Import:**
```tsx
import { Button } from './Button'; // Adjust path as necessary
```

**Usage Examples:**

**Default Button:**
```tsx
<Button onClick={() => alert('Clicked!')}>Default Button</Button>
```

**Destructive Button:**
```tsx
<Button variant="destructive">Delete Item</Button>
```

**Outline Button:**
```tsx
<Button variant="outline">Outline Button</Button>
```

**Secondary Button:**
```tsx
<Button variant="secondary">Secondary Action</Button>
```

**Ghost Button:**
```tsx
<Button variant="ghost">Ghost Button</Button>
```

**Link Button:**
```tsx
<Button variant="link" asChild>
  <a href="/some-link">Link Styled as Button</a>
</Button>
```

**Different Sizes:**
```tsx
<Button size="sm">Small Button</Button>
<Button size="lg">Large Button</Button>
<Button size="icon">
  {/* Add an icon here e.g., <YourIconComponent className="h-4 w-4" /> */}
  <span>Icon</span>
</Button>
```

**Key Props:**
- `variant`: 'default', 'destructive', 'outline', 'secondary', 'ghost', 'link'
- `size`: 'default', 'sm', 'lg', 'icon'
- `asChild`: (boolean) If true, renders the component as its child element, inheriting props.
- Standard HTMLButtonElement props (e.g., `onClick`, `disabled`).

---

### 2. Card

A flexible content container with optional header, content, title, description, and footer sections.

**Import:**
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card'; // Adjust path
```

**Usage Example:**
```tsx
<Card className="w-[350px]">
  <CardHeader>
    <CardTitle>Project Report</CardTitle>
    <CardDescription>Monthly status update</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Details about the project progress...</p>
  </CardContent>
  <CardFooter>
    <Button size="sm">View Details</Button>
  </CardFooter>
</Card>
```

**Key Parts:**
- `<Card>`: The main container.
- `<CardHeader>`: Header section.
- `<CardTitle>`: Title within the header.
- `<CardDescription>`: Description within the header.
- `<CardContent>`: Main content area.
- `<CardFooter>`: Footer section.
- All parts accept a `className` prop for custom styling.

---

### 3. Dialog

A modal dialog component that appears over the main content. Wraps Radix UI Dialog primitives.

**Import:**
```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Optional: for custom close buttons
} from './Dialog'; // Adjust path
import { Button } from './Button'; // For trigger/actions
```

**Usage Example:**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Open Dialog</Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Edit Profile</DialogTitle>
      <DialogDescription>
        Make changes to your profile here. Click save when you're done.
      </DialogDescription>
    </DialogHeader>
    <div className="grid gap-4 py-4">
      {/* Add form elements here, e.g., using the Input component */}
      <p>Dialog main content goes here...</p>
    </div>
    <DialogFooter>
      <DialogClose asChild>
        <Button variant="secondary">Cancel</Button>
      </DialogClose>
      <Button type="submit">Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Key Parts:**
- `<Dialog>`: Root component.
- `<DialogTrigger>`: Element that triggers the dialog to open. Often used with `asChild`.
- `<DialogContent>`: The main modal content area.
- `<DialogHeader>`, `<DialogTitle>`, `<DialogDescription>`, `<DialogFooter>`: Structural parts for content.
- `<DialogClose>`: A button to close the dialog. Often used with `asChild`.
- Props for positioning and behavior can be passed to Radix parts if not abstracted by these wrappers.

---

### 4. Input

A basic styled input field.

**Import:**
```tsx
import { Input } from './Input'; // Adjust path
```

**Usage Example:**
```tsx
<div>
  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
    Username
  </label>
  <Input
    type="text"
    id="username"
    placeholder="Enter your username"
    className="mt-1"
  />
</div>

<div>
  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
    Email (disabled)
  </label>
  <Input
    type="email"
    id="email"
    placeholder="your@email.com"
    disabled
    className="mt-1"
  />
</div>
```

**Key Props:**
- Standard HTMLInputElement props (e.g., `type`, `placeholder`, `value`, `onChange`, `disabled`).
- `className`: For additional custom styling.

---

### 5. Tabs

A set of layered sections of content, known as tab panels, that are displayed one at a time. Wraps Radix UI Tabs primitives.

**Import:**
```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs'; // Adjust path
```

**Usage Example:**
```tsx
<Tabs defaultValue="account" className="w-[400px]">
  <TabsList className="grid w-full grid-cols-2">
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">
    <Card>
      <CardHeader><CardTitle>Account</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <p>Make changes to your account here.</p>
      </CardContent>
      <CardFooter>
        <Button>Save changes</Button>
      </CardFooter>
    </Card>
  </TabsContent>
  <TabsContent value="password">
    <Card>
      <CardHeader><CardTitle>Password</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        <p>Change your password here.</p>
      </CardContent>
      <CardFooter>
        <Button>Change password</Button>
      </CardFooter>
    </Card>
  </TabsContent>
</Tabs>
```

**Key Parts:**
- `<Tabs defaultValue="value">`: The root component. `defaultValue` specifies the initially active tab.
- `<TabsList>`: Container for the tab triggers.
- `<TabsTrigger value="value">`: The button that activates a tab. Its `value` must match a `<TabsContent>` value.
- `<TabsContent value="value">`: The content panel associated with a trigger.
- All parts accept a `className` prop for custom styling.

EOL
