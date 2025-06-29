import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Play, Pause, RotateCcw, CheckCircle, XCircle, 
  AlertTriangle, Clock, Code, Database, Globe,
  Monitor, Zap, Shield, Users, Settings, Eye,
  Download, Upload, Filter, Search, Calendar,
  BarChart3, TrendingUp, Activity, FileText
} from 'lucide-react';

interface TestSuite {
  id: string;
  name: string;
  description: string;
  category: 'unit' | 'integration' | 'e2e' | 'performance' | 'security';
  status: 'idle' | 'running' | 'passed' | 'failed' | 'skipped';
  test_count: number;
  passed_count: number;
  failed_count: number;
  skipped_count: number;
  duration: number;
  last_run: string;
  coverage_percentage: number;
  environment: 'development' | 'staging' | 'production';
  automated: boolean;
  schedule?: {
    frequency: 'manual' | 'commit' | 'daily' | 'weekly';
    time?: string;
  };
}

interface TestCase {
  id: string;
  suite_id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'skipped';
  duration: number;
  error_message?: string;
  stack_trace?: string;
  assertions: {
    total: number;
    passed: number;
    failed: number;
  };
  coverage: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
  last_run: string;
  flaky: boolean;
  retry_count: number;
}

interface TestMetrics {
  total_suites: number;
  total_tests: number;
  overall_pass_rate: number;
  average_duration: number;
  coverage_percentage: number;
  flaky_tests_count: number;
  trend_data: Array<{
    date: string;
    pass_rate: number;
    duration: number;
    coverage: number;
  }>;
  category_breakdown: Array<{
    category: string;
    count: number;
    pass_rate: number;
  }>;
}

interface TestEnvironment {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'offline';
  url: string;
  version: string;
  last_deployment: string;
  health_checks: Array<{
    name: string;
    status: 'passing' | 'failing';
    response_time: number;
    last_check: string;
  }>;
  resource_usage: {
    cpu: number;
    memory: number;
    disk: number;
  };
}

export const TestingSuite: React.FC = () => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [metrics, setMetrics] = useState<TestMetrics | null>(null);
  const [environments, setEnvironments] = useState<TestEnvironment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'suites' | 'cases' | 'environments' | 'reports'>('overview');
  const [selectedSuite, setSelectedSuite] = useState<TestSuite | null>(null);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTestingData();
  }, []);

  const fetchTestingData = async () => {
    try {
      setLoading(true);
      
      const [suitesRes, casesRes, metricsRes, environmentsRes] = await Promise.all([
        fetch('/api/testing/suites', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/testing/cases', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/testing/metrics', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/testing/environments', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
