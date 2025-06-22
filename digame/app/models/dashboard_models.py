from pydantic import BaseModel
from typing import List, Dict, Any
import datetime

class ProductivityChartDataPoint(BaseModel):
    date: datetime.date
    score: float

class ProductivityChart(BaseModel):
    title: str
    data: List[ProductivityChartDataPoint]

class ActivityBreakdownItem(BaseModel):
    activity_name: str
    duration_minutes: int
    percentage: float

class ActivityBreakdown(BaseModel):
    title: str
    data: List[ActivityBreakdownItem]

class ProductivityMetric(BaseModel):
    name: str
    value: str # Value can be string to accommodate various formats e.g., "5 tasks", "3h 30m"
    trend: str # e.g., "+5%", "-2 tasks"

class ProductivityMetricsGroup(BaseModel):
    title: str
    metrics: List[ProductivityMetric]

class RecentActivityItem(BaseModel):
    id: str
    description: str
    timestamp: datetime.datetime
    status: str # e.g., "Completed", "In Progress"

class RecentActivities(BaseModel):
    title: str
    activities: List[RecentActivityItem]
