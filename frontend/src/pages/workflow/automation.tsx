import React from 'react';
import { useRouter } from 'next/router';
import PageHeader from '../../components/PageHeader';
import { WorkflowAutomationDashboard } from '../../components/workflow/WorkflowAutomationDashboard';
import { Zap, Download, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const WorkflowAutomation = () => {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader
        title="Workflow Automation"
        subtitle="Create, manage, and monitor automated workflows with database-driven insights"
        icon={<Zap className="h-8 w-8" />}
        breadcrumb={[
          { label: 'Workflow', href: '/workflow' },
          { label: 'Automation', href: '/workflow/automation' }
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => router.push('/workflow/automation?tab=designer')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </div>
        }
      />

      {/* Database-driven Workflow Automation Dashboard */}
      <WorkflowAutomationDashboard />
    </div>
  );
};

export default WorkflowAutomation;