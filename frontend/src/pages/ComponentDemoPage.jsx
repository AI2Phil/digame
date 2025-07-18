import React, { useState } from 'react';
import Button, { ButtonGroup, IconButton } from '../components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, AlertDialog, useDialog } from '../components/ui/Dialog';
import { Form, FormField, FormLabel, FormInput, FormTextarea, FormSelect, FormCheckbox, FormSubmitButton } from '../components/ui/Form';
import Input from '../components/ui/Input';
import { DataTable } from '../components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent, TabBadge } from '../components/ui/Tabs';
import { ToastProvider, useToast } from '../components/ui/Toast';
import { Code } from '../components/ui/Code'; // Import Code component
import LocalizedFormattingDemo from '../components/Demo/LocalizedFormattingDemo'; // Import the new demo component

const ComponentDemoPage = () => {
  const [formData, setFormData] = useState({});
  const [tableData] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Manager', status: 'Active' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Active' }
  ]);

  const tableColumns = [
    { key: 'name', title: 'Name', sortable: true, filterable: true },
    { key: 'email', title: 'Email', sortable: true, filterable: true },
    { key: 'role', title: 'Role', sortable: true, filterable: true },
    { 
      key: 'status', 
      title: 'Status', 
      sortable: true, 
      filterable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${
          value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value}
        </span>
      )
    }
  ];

  const dialog = useDialog();
  const [alertOpen, setAlertOpen] = useState(false);

  return (
    <ToastProvider>
      <ComponentDemoContent 
        formData={formData}
        setFormData={setFormData}
        tableData={tableData}
        tableColumns={tableColumns}
        dialog={dialog}
        alertOpen={alertOpen}
        setAlertOpen={setAlertOpen}
      />
    </ToastProvider>
  );
};

const ComponentDemoContent = ({ 
  formData, 
  setFormData, 
  tableData, 
  tableColumns, 
  dialog, 
  alertOpen, 
  setAlertOpen 
}) => {
  const { toast } = useToast();

  const handleFormSubmit = (values) => {
    console.log('Form submitted:', values);
    toast.success('Form Submitted', 'Your form has been successfully submitted!');
  };

  const handleToastDemo = (type) => {
    switch (type) {
      case 'success':
        toast.success('Success!', 'This is a success message');
        break;
      case 'error':
        toast.error('Error!', 'This is an error message');
        break;
      case 'warning':
        toast.warning('Warning!', 'This is a warning message');
        break;
      case 'info':
        toast.info('Info!', 'This is an info message');
        break;
      default:
        toast('Default Toast', 'This is a default toast message');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎨 Component Library Demo
          </h1>
          <p className="text-xl text-gray-600">
            Showcase of all 8 Core UI Components
          </p>
        </div>

        <Tabs defaultValue="buttons" className="space-y-8">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 gap-2 bg-white p-2 rounded-lg shadow-sm">
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="dialogs">Dialogs</TabsTrigger>
            <TabsTrigger value="forms">Forms</TabsTrigger>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="tabs">
              <TabBadge count={3}>Tabs</TabBadge>
            </TabsTrigger>
            <TabsTrigger value="toasts">Toasts</TabsTrigger>
            <TabsTrigger value="formatting">Formatting</TabsTrigger> {/* New Tab Trigger */}
            <TabsTrigger value="overview">Overview</TabsTrigger>
          </TabsList>

          {/* Buttons Demo */}
          <TabsContent value="buttons">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Button Components</h2>
              
              <div className="space-y-8">
                {/* Button Variants */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Button Variants</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="success">Success</Button>
                    <Button variant="warning">Warning</Button>
                  </div>
                  <Code
                    codeString={`<Button variant="primary">Primary</Button>\n<Button variant="secondary">Secondary</Button>\n<Button variant="ghost">Ghost</Button>\n<Button variant="destructive">Destructive</Button>\n<Button variant="outline">Outline</Button>\n<Button variant="success">Success</Button>\n<Button variant="warning">Warning</Button>`}
                    language="jsx"
                    className="mt-2"
                  />
                </div>

                {/* Button Sizes */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Button Sizes</h3>
                  <div className="flex flex-wrap items-center gap-4">
                    <Button size="xs">Extra Small</Button>
                    <Button size="sm">Small</Button>
                    <Button size="md">Medium</Button>
                    <Button size="lg">Large</Button>
                    <Button size="xl">Extra Large</Button>
                  </div>
                  <Code
                    codeString={`<Button size="xs">Extra Small</Button>\n<Button size="sm">Small</Button>\n<Button size="md">Medium</Button>\n<Button size="lg">Large</Button>\n<Button size="xl">Extra Large</Button>`}
                    language="jsx"
                    className="mt-2"
                  />
                </div>

                {/* Button States */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Button States</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button loading>Loading</Button>
                    <Button disabled>Disabled</Button>
                    <Button icon="🚀">With Icon</Button>
                    <Button icon="📧" iconPosition="right">Icon Right</Button>
                  </div>
                  <Code
                    codeString={`<Button loading>Loading</Button>\n<Button disabled>Disabled</Button>\n<Button icon="🚀">With Icon</Button>\n<Button icon="📧" iconPosition="right">Icon Right</Button>`}
                    language="jsx"
                    className="mt-2"
                  />
                </div>

                {/* Button Groups */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Button Groups</h3>
                  <ButtonGroup>
                    <Button variant="outline">Left</Button>
                    <Button variant="outline">Center</Button>
                    <Button variant="outline">Right</Button>
                  </ButtonGroup>
                  <Code
                    codeString={`<ButtonGroup>\n  <Button variant="outline">Left</Button>\n  <Button variant="outline">Center</Button>\n  <Button variant="outline">Right</Button>\n</ButtonGroup>`}
                    language="jsx"
                    className="mt-2"
                  />
                </div>

                {/* Icon Buttons */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Icon Buttons</h3>
                  <div className="flex flex-wrap gap-4">
                    <IconButton icon="❤️" aria-label="Like" />
                    <IconButton icon="🔗" aria-label="Share" variant="outline" />
                    <IconButton icon="⚙️" aria-label="Settings" variant="ghost" />
                    <IconButton icon="🗑️" aria-label="Delete" variant="destructive" />
                  </div>
                  <Code
                    codeString={`<IconButton icon="❤️" aria-label="Like" />\n<IconButton icon="🔗" aria-label="Share" variant="outline" />\n<IconButton icon="⚙️" aria-label="Settings" variant="ghost" />\n<IconButton icon="🗑️" aria-label="Delete" variant="destructive" />`}
                    language="jsx"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Dialogs Demo */}
          <TabsContent value="dialogs">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Dialog Components</h2>
              
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  <Button onClick={dialog.open}>Open Dialog</Button>
                  <Button onClick={() => setAlertOpen(true)} variant="destructive">
                    Open Alert Dialog
                  </Button>
                </div>
                <Code
                  codeString={`<Button onClick={dialog.open}>Open Dialog</Button>\n<Button onClick={() => setAlertOpen(true)} variant="destructive">Open Alert Dialog</Button>`}
                  language="jsx"
                  className="mt-2"
                />

                <Dialog open={dialog.isOpen} onOpenChange={dialog.setIsOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Example Dialog</DialogTitle>
                      <DialogDescription>
                        This is a demonstration of the dialog component with header, body, and footer.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <DialogBody>
                      <p className="text-gray-600">
                        This dialog showcases the flexible dialog system with proper focus management,
                        backdrop clicks, and escape key handling.
                      </p>
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800">
                          💡 Try pressing Escape or clicking outside to close!
                        </p>
                      </div>
                    </DialogBody>
                    
                    <DialogFooter>
                      <Button variant="ghost" onClick={dialog.close}>
                        Cancel
                      </Button>
                      <Button onClick={dialog.close}>
                        Confirm
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Code
                  codeString={`<Dialog open={isOpen} onOpenChange={setIsOpen}>\n  <DialogContent>\n    <DialogHeader>\n      <DialogTitle>Dialog Title</DialogTitle>\n      <DialogDescription>Description...</DialogDescription>\n    </DialogHeader>\n    <DialogBody>...</DialogBody>\n    <DialogFooter>\n      <Button variant="ghost" onClick={closeDialog}>Cancel</Button>\n      <Button onClick={closeDialog}>Confirm</Button>\n    </DialogFooter>\n  </DialogContent>\n</Dialog>`}
                  language="jsx"
                  className="mt-2"
                />

                <AlertDialog
                  open={alertOpen}
                  onOpenChange={setAlertOpen}
                  title="Delete Item"
                  description="Are you sure you want to delete this item? This action cannot be undone."
                  confirmText="Delete"
                  cancelText="Cancel"
                  variant="destructive"
                  onConfirm={() => {
                    toast.success('Deleted', 'Item has been deleted successfully');
                  }}
                />
                 <Code
                  codeString={`<AlertDialog\n  open={isAlertOpen}\n  onOpenChange={setIsAlertOpen}\n  title="Confirm Action"\n  description="Are you sure?"\n  confirmText="Confirm"\n  onConfirm={handleConfirm}\n/>`}
                  language="jsx"
                  className="mt-2"
                />
              </div>
            </div>
          </TabsContent>

          {/* Forms Demo */}
          <TabsContent value="forms">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Form Components</h2>
              
              <Form
                onSubmit={handleFormSubmit}
                validation={{
                  name: { required: true, minLength: 2 },
                  email: { 
                    required: true, 
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    patternMessage: 'Please enter a valid email address'
                  },
                  message: { required: true, minLength: 10 }
                }}
                defaultValues={{ role: '', newsletter: false }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField name="name">
                    <div>
                      <FormLabel htmlFor="name" required>Full Name</FormLabel>
                      <FormInput name="name" placeholder="Enter your full name" />
                    </div>
                  </FormField>

                  <FormField name="email">
                    <div>
                      <FormLabel htmlFor="email" required>Email Address</FormLabel>
                      <FormInput name="email" type="email" placeholder="Enter your email" />
                    </div>
                  </FormField>
                </div>

                <FormField name="role">
                  <div>
                    <FormLabel htmlFor="role">Role</FormLabel>
                    <FormSelect 
                      name="role" 
                      options={[
                        { value: 'developer', label: 'Developer' },
                        { value: 'designer', label: 'Designer' },
                        { value: 'manager', label: 'Manager' },
                        { value: 'other', label: 'Other' }
                      ]}
                      placeholder="Select your role"
                    />
                  </div>
                </FormField>

                <FormField name="message">
                  <div>
                    <FormLabel htmlFor="message" required>Message</FormLabel>
                    <FormTextarea 
                      name="message" 
                      placeholder="Enter your message (minimum 10 characters)"
                      rows={4}
                    />
                  </div>
                </FormField>

                <FormField name="newsletter">
                  <FormCheckbox 
                    name="newsletter" 
                    label="Subscribe to newsletter"
                  />
                </FormField>

                <FormSubmitButton>
                  Submit Form
                </FormSubmitButton>
              </Form>
              <Code
                codeString={`<Form onSubmit={handleSubmit} validation={rules}>\n  <FormField name="username">\n    <FormLabel>Username</FormLabel>\n    <FormInput name="username" />\n  </FormField>\n  <FormSubmitButton>Submit</FormSubmitButton>\n</Form>`}
                language="jsx"
                className="mt-4"
              />
            </div>
          </TabsContent>

          {/* Inputs Demo */}
          <TabsContent value="inputs">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Input Components</h2>
              
              <div className="space-y-6">
                {/* Basic Inputs */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Variants</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Default input" />
                    <Input variant="filled" placeholder="Filled input" />
                    <Input variant="flushed" placeholder="Flushed input" />
                    <Input placeholder="With left icon" icon="🔍" />
                    <Input placeholder="With right icon" icon="📧" iconPosition="right" />
                    <Input placeholder="Clearable input" clearable defaultValue="Clear me!" />
                  </div>
                  <Code
                    codeString={`<Input placeholder="Default" />\n<Input variant="filled" placeholder="Filled" />\n<Input placeholder="With icon" icon="🔍" />`}
                    language="jsx"
                    className="mt-2"
                  />
                </div>

                {/* Input States */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Input States</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input placeholder="Normal state" />
                    <Input placeholder="Error state" error />
                    <Input placeholder="Success state" success />
                    <Input placeholder="Loading state" loading />
                    <Input placeholder="Disabled state" disabled />
                    <Input type="password" placeholder="Password input" />
                  </div>
                  <Code
                    codeString={`<Input placeholder="Error" error />\n<Input placeholder="Loading" loading />\n<Input type="password" placeholder="Password" />`}
                    language="jsx"
                    className="mt-2"
                  />
                </div>

                {/* Special Inputs */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Input Types</h3>
                  <div className="space-y-4">
                    <Input 
                      placeholder="Search anything..." 
                      onSearch={(term) => console.log('Searching:', term)}
                    />
                    <Input 
                      defaultValue="10"
                      min={0} 
                      max={100} 
                      placeholder="Number input"
                    />
                    <Input 
                      accept="image/*" 
                      multiple 
                      onChange={(e) => console.log('Files:', e.target.files)}
                    />
                  </div>
                  <Code
                    codeString={`<Input placeholder="Search..." />\n<Input defaultValue="10" min={0} max={100} />\n<Input accept="image/*" multiple />`}
                    language="jsx"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tables Demo */}
          <TabsContent value="tables">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Table Components</h2>
              
              <DataTable
                data={tableData}
                columns={tableColumns}
                searchable
                filterable
                sortable
                pagination
                pageSize={3}
                rowSelection
                onRowClick={(row) => {
                  toast.info('Row Clicked', `You clicked on ${row.name}`);
                }}
                onSelectionChange={(selected) => {
                  console.log('Selected rows:', selected);
                }}
              />
              <Code
                codeString={`<DataTable\n  data={data}\n  columns={columns}\n  searchable\n  filterable\n  sortable\n  pagination\n  pageSize={5}\n/>`}
                language="jsx"
                className="mt-4"
              />
            </div>
          </TabsContent>

          {/* Tabs Demo */}
          <TabsContent value="tabs">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Tab Components</h2>
              
              <div className="space-y-8">
                {/* Default Tabs */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Default Tabs</h3>
                  <Tabs defaultValue="tab1">
                    <TabsList>
                      <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                      <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                      <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                    </TabsList>
                    <TabsContent value="tab1">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-semibold text-blue-900">Tab 1 Content</h4>
                        <p className="text-blue-700">This is the content for the first tab.</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="tab2">
                      <div className="p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-900">Tab 2 Content</h4>
                        <p className="text-green-700">This is the content for the second tab.</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="tab3">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h4 className="font-semibold text-purple-900">Tab 3 Content</h4>
                        <p className="text-purple-700">This is the content for the third tab.</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                  <Code
                    codeString={`<Tabs defaultValue="tab1">\n  <TabsList>\n    <TabsTrigger value="tab1">Tab 1</TabsTrigger>\n    <TabsTrigger value="tab2">Tab 2</TabsTrigger>\n  </TabsList>\n  <TabsContent value="tab1">Content 1</TabsContent>\n  <TabsContent value="tab2">Content 2</TabsContent>\n</Tabs>`}
                    language="jsx"
                    className="mt-2"
                  />
                </div>

                {/* Pills Variant */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pills Variant</h3>
                  <Tabs defaultValue="pill1" variant="pills">
                    <TabsList>
                      <TabsTrigger value="pill1">
                        <TabBadge count={5}>Messages</TabBadge>
                      </TabsTrigger>
                      <TabsTrigger value="pill2">
                        <TabBadge count={12}>Notifications</TabBadge>
                      </TabsTrigger>
                      <TabsTrigger value="pill3">Settings</TabsTrigger>
                    </TabsList>
                    <TabsContent value="pill1">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p>You have 5 new messages.</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="pill2">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p>You have 12 new notifications.</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="pill3">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p>Settings panel content.</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                  <Code
                    codeString={`<Tabs defaultValue="pill1" variant="pills">\n  <TabsList>\n    <TabsTrigger value="pill1"><TabBadge count={5}>Messages</TabBadge></TabsTrigger>\n  </TabsList>\n  <TabsContent value="pill1">...</TabsContent>\n</Tabs>`}
                    language="jsx"
                    className="mt-2"
                  />
                </div>

                {/* Vertical Tabs */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Vertical Tabs</h3>
                  <Tabs defaultValue="vert1" orientation="vertical">
                    <TabsList>
                      <TabsTrigger value="vert1">Profile</TabsTrigger>
                      <TabsTrigger value="vert2">Account</TabsTrigger>
                      <TabsTrigger value="vert3">Security</TabsTrigger>
                      <TabsTrigger value="vert4">Preferences</TabsTrigger>
                    </TabsList>
                    <TabsContent value="vert1">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold">Profile Settings</h4>
                        <p>Manage your profile information.</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="vert2">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold">Account Settings</h4>
                        <p>Manage your account details.</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="vert3">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold">Security Settings</h4>
                        <p>Manage your security preferences.</p>
                      </div>
                    </TabsContent>
                    <TabsContent value="vert4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold">User Preferences</h4>
                        <p>Customize your experience.</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                  <Code
                    codeString={`<Tabs defaultValue="vert1" orientation="vertical">...</Tabs>`}
                    language="jsx"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Toasts Demo */}
          <TabsContent value="toasts">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Toast Components</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Toast Variants</h3>
                  <div className="flex flex-wrap gap-4">
                    <Button onClick={() => handleToastDemo('success')} variant="success">
                      Success Toast
                    </Button>
                    <Button onClick={() => handleToastDemo('error')} variant="destructive">
                      Error Toast
                    </Button>
                    <Button onClick={() => handleToastDemo('warning')} variant="warning">
                      Warning Toast
                    </Button>
                    <Button onClick={() => handleToastDemo('info')} variant="outline">
                      Info Toast
                    </Button>
                    <Button onClick={() => handleToastDemo('default')} variant="ghost">
                      Default Toast
                    </Button>
                  </div>
                  <Code
                    codeString={`toast.success('Success!', 'This is a success message');\ntoast.error('Error!', 'This is an error message');`}
                    language="jsx"
                    className="mt-2"
                  />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Promise Toast</h3>
                  <Button 
                    onClick={() => {
                      const promise = new Promise((resolve) => {
                        setTimeout(resolve, 2000);
                      });
                      
                      toast.promise(promise, {
                        loading: { title: 'Loading...', description: 'Please wait' },
                        success: { title: 'Success!', description: 'Operation completed' },
                        error: { title: 'Error!', description: 'Something went wrong' }
                      });
                    }}
                    variant="outline"
                  >
                    Promise Toast Demo
                  </Button>
                  <Code
                    codeString={`toast.promise(myPromise,\n  {\n    loading: { title: 'Loading...' },\n    success: { title: 'Success!' },\n    error: { title: 'Error!' }\n  }\n);`}
                    language="jsx"
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Localized Formatting Demo */}
          <TabsContent value="formatting">
            <LocalizedFormattingDemo />
          </TabsContent>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Component Library Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'Button', count: '7 variants', icon: '🔘', color: 'blue' },
                  { name: 'Dialog', count: '2 types', icon: '💬', color: 'green' },
                  { name: 'Form', count: '6 components', icon: '📝', color: 'purple' },
                  { name: 'Input', count: '5 variants', icon: '📝', color: 'orange' },
                  { name: 'Table', count: 'Full featured', icon: '📊', color: 'red' },
                  { name: 'Tabs', count: '4 variants', icon: '📑', color: 'indigo' },
                  { name: 'Toast', count: '5 types', icon: '🔔', color: 'pink' },
                  { name: 'Total', count: '8 components', icon: '🎨', color: 'gray' }
                ].map((component, index) => (
                  <div key={index} className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="text-3xl mb-2">{component.icon}</div>
                      <h3 className="text-lg font-semibold text-gray-900">{component.name}</h3>
                      <p className="text-sm text-gray-600">{component.count}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 What's Next?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Phase 2A - Navigation (5 components)</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Navigation Menu</li>
                      <li>• Sidebar</li>
                      <li>• Breadcrumb</li>
                      <li>• Menubar</li>
                      <li>• Pagination</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Phase 2B - Data Display (6 components)</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• Chart</li>
                      <li>• Progress</li>
                      <li>• Badge</li>
                      <li>• Avatar</li>
                      <li>• Calendar</li>
                      <li>• Skeleton</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ComponentDemoPage;