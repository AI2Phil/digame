from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/workflow-marketplace", tags=["workflow-marketplace"])

# Pydantic models for workflow marketplace
class WorkflowTemplate(BaseModel):
    id: int
    name: str
    description: str
    category: str
    author: str
    downloads: int
    rating: float
    reviews: int
    tags: List[str]
    complexity: str
    estimated_time: str
    last_updated: str
    version: str
    featured: bool
    verified: bool
    price: str
    thumbnail: str
    steps: int
    triggers: List[str]
    integrations: List[str]

class UserWorkflow(BaseModel):
    id: int
    name: str
    description: str
    category: str
    visibility: str
    downloads: int
    rating: float
    reviews: int
    tags: List[str]
    complexity: str
    estimated_time: str
    last_updated: str
    version: str
    featured: bool
    verified: bool
    price: str
    thumbnail: str
    steps: int
    triggers: List[str]
    integrations: List[str]

class Community(BaseModel):
    id: int
    name: str
    description: str
    members: int
    workflows: int
    category: str
    activity: str
    moderators: List[str]
    rules: List[str]
    recent_activity: List[Dict[str, str]]

class TemplatesResponse(BaseModel):
    templates: List[WorkflowTemplate]
    total_count: int
    data_source: str
    categories: List[str]
    filters_applied: Dict[str, Any]

class MyWorkflowsResponse(BaseModel):
    workflows: List[UserWorkflow]
    total_count: int
    data_source: str
    stats: Dict[str, Any]

class CommunityResponse(BaseModel):
    communities: List[Community]
    total_count: int
    data_source: str
    stats: Dict[str, Any]

# Enhanced fallback data generators
def generate_enhanced_templates() -> List[WorkflowTemplate]:
    """Generate comprehensive template data for fallback scenarios"""
    return [
        WorkflowTemplate(
            id=1,
            name="CI/CD Pipeline Template",
            description="Complete continuous integration and deployment workflow for modern applications",
            category="DevOps",
            author="DevOps Team",
            downloads=2847,
            rating=4.8,
            reviews=156,
            tags=["CI/CD", "Docker", "Kubernetes", "Testing"],
            complexity="Intermediate",
            estimated_time="30 minutes",
            last_updated="2 days ago",
            version="2.1.0",
            featured=True,
            verified=True,
            price="Free",
            thumbnail="/api/placeholder/300/200",
            steps=12,
            triggers=["Git Push", "Pull Request"],
            integrations=["GitHub", "Docker Hub", "Slack"]
        ),
        WorkflowTemplate(
            id=2,
            name="Customer Onboarding Flow",
            description="Automated customer onboarding with email sequences, account setup, and welcome materials",
            category="Marketing",
            author="Marketing Pro",
            downloads=1923,
            rating=4.9,
            reviews=89,
            tags=["Onboarding", "Email", "CRM", "Automation"],
            complexity="Beginner",
            estimated_time="15 minutes",
            last_updated="1 week ago",
            version="1.5.2",
            featured=True,
            verified=True,
            price="Free",
            thumbnail="/api/placeholder/300/200",
            steps=8,
            triggers=["User Registration", "Payment Completed"],
            integrations=["Mailchimp", "Salesforce", "Stripe"]
        ),
        WorkflowTemplate(
            id=3,
            name="Data Processing Pipeline",
            description="ETL workflow for processing large datasets with validation, transformation, and storage",
            category="Data Science",
            author="Data Analytics Inc",
            downloads=1456,
            rating=4.7,
            reviews=67,
            tags=["ETL", "Big Data", "Analytics", "Machine Learning"],
            complexity="Advanced",
            estimated_time="45 minutes",
            last_updated="3 days ago",
            version="3.0.1",
            featured=False,
            verified=True,
            price="$29",
            thumbnail="/api/placeholder/300/200",
            steps=18,
            triggers=["File Upload", "Schedule"],
            integrations=["AWS S3", "Snowflake", "Tableau"]
        ),
        WorkflowTemplate(
            id=4,
            name="Security Incident Response",
            description="Automated security incident detection, analysis, and response workflow",
            category="Security",
            author="CyberSec Solutions",
            downloads=892,
            rating=4.9,
            reviews=34,
            tags=["Security", "Incident Response", "SIEM", "Automation"],
            complexity="Advanced",
            estimated_time="60 minutes",
            last_updated="5 days ago",
            version="1.8.0",
            featured=False,
            verified=True,
            price="$49",
            thumbnail="/api/placeholder/300/200",
            steps=15,
            triggers=["Security Alert", "Anomaly Detection"],
            integrations=["Splunk", "PagerDuty", "Jira"]
        ),
        WorkflowTemplate(
            id=5,
            name="E-commerce Order Processing",
            description="Complete order fulfillment workflow from payment to shipping notification",
            category="E-commerce",
            author="Commerce Hub",
            downloads=2156,
            rating=4.6,
            reviews=123,
            tags=["E-commerce", "Orders", "Inventory", "Shipping"],
            complexity="Intermediate",
            estimated_time="25 minutes",
            last_updated="1 day ago",
            version="2.3.1",
            featured=True,
            verified=True,
            price="Free",
            thumbnail="/api/placeholder/300/200",
            steps=10,
            triggers=["Order Placed", "Payment Confirmed"],
            integrations=["Shopify", "PayPal", "FedEx"]
        ),
        WorkflowTemplate(
            id=6,
            name="Social Media Campaign",
            description="Multi-platform social media posting and engagement tracking workflow",
            category="Marketing",
            author="Social Media Experts",
            downloads=1678,
            rating=4.5,
            reviews=78,
            tags=["Social Media", "Content", "Analytics", "Scheduling"],
            complexity="Beginner",
            estimated_time="20 minutes",
            last_updated="4 days ago",
            version="1.4.0",
            featured=False,
            verified=True,
            price="$19",
            thumbnail="/api/placeholder/300/200",
            steps=7,
            triggers=["Content Ready", "Schedule"],
            integrations=["Twitter", "Facebook", "Instagram", "LinkedIn"]
        ),
        WorkflowTemplate(
            id=7,
            name="Automated Testing Suite",
            description="Comprehensive testing workflow with unit, integration, and end-to-end tests",
            category="DevOps",
            author="QA Masters",
            downloads=1234,
            rating=4.7,
            reviews=45,
            tags=["Testing", "QA", "Automation", "CI/CD"],
            complexity="Intermediate",
            estimated_time="40 minutes",
            last_updated="6 days ago",
            version="1.9.2",
            featured=False,
            verified=True,
            price="Free",
            thumbnail="/api/placeholder/300/200",
            steps=14,
            triggers=["Code Commit", "Pull Request"],
            integrations=["Jest", "Cypress", "GitHub Actions"]
        ),
        WorkflowTemplate(
            id=8,
            name="Invoice Processing Automation",
            description="Automated invoice processing with OCR, validation, and approval workflows",
            category="Finance",
            author="FinTech Solutions",
            downloads=987,
            rating=4.4,
            reviews=56,
            tags=["Finance", "OCR", "Automation", "Approval"],
            complexity="Advanced",
            estimated_time="50 minutes",
            last_updated="1 week ago",
            version="2.0.3",
            featured=False,
            verified=True,
            price="$39",
            thumbnail="/api/placeholder/300/200",
            steps=16,
            triggers=["Invoice Received", "Email Attachment"],
            integrations=["QuickBooks", "SAP", "DocuSign"]
        )
    ]

def generate_enhanced_user_workflows() -> List[UserWorkflow]:
    """Generate comprehensive user workflow data for fallback scenarios"""
    return [
        UserWorkflow(
            id=1,
            name="Custom Lead Scoring",
            description="Proprietary lead scoring algorithm with CRM integration",
            category="Sales",
            visibility="Private",
            downloads=0,
            rating=0.0,
            reviews=0,
            tags=["Lead Scoring", "CRM", "Sales"],
            complexity="Intermediate",
            estimated_time="35 minutes",
            last_updated="2 hours ago",
            version="1.0.0",
            featured=False,
            verified=False,
            price="Private",
            thumbnail="/api/placeholder/300/200",
            steps=14,
            triggers=["Lead Created", "Activity Updated"],
            integrations=["HubSpot", "Salesforce"]
        ),
        UserWorkflow(
            id=2,
            name="Inventory Alert System",
            description="Real-time inventory monitoring with automated reorder alerts",
            category="Operations",
            visibility="Public",
            downloads=45,
            rating=4.2,
            reviews=8,
            tags=["Inventory", "Alerts", "Automation"],
            complexity="Beginner",
            estimated_time="15 minutes",
            last_updated="1 week ago",
            version="1.2.0",
            featured=False,
            verified=False,
            price="Free",
            thumbnail="/api/placeholder/300/200",
            steps=6,
            triggers=["Stock Level", "Threshold"],
            integrations=["ERP System", "Email"]
        ),
        UserWorkflow(
            id=3,
            name="Customer Support Ticket Routing",
            description="Intelligent ticket routing based on priority, category, and agent availability",
            category="Support",
            visibility="Public",
            downloads=123,
            rating=4.6,
            reviews=23,
            tags=["Support", "Routing", "Automation"],
            complexity="Intermediate",
            estimated_time="25 minutes",
            last_updated="3 days ago",
            version="1.3.1",
            featured=False,
            verified=False,
            price="Free",
            thumbnail="/api/placeholder/300/200",
            steps=9,
            triggers=["Ticket Created", "Priority Change"],
            integrations=["Zendesk", "Slack", "Teams"]
        )
    ]

def generate_enhanced_communities() -> List[Community]:
    """Generate comprehensive community data for fallback scenarios"""
    return [
        Community(
            id=1,
            name="Workflow Builders Community",
            description="Share and discover workflow templates with fellow automation enthusiasts",
            members=12847,
            workflows=2156,
            category="General",
            activity="Very Active",
            moderators=["John Doe", "Jane Smith"],
            rules=["Be respectful", "Share quality content", "Help others"],
            recent_activity=[
                {"user": "Alex Chen", "action": "shared", "item": "API Testing Workflow", "time": "2 hours ago"},
                {"user": "Sarah Wilson", "action": "commented on", "item": "Database Backup Template", "time": "4 hours ago"},
                {"user": "Mike Johnson", "action": "liked", "item": "Email Campaign Automation", "time": "6 hours ago"}
            ]
        ),
        Community(
            id=2,
            name="DevOps Automation Hub",
            description="Specialized community for DevOps and infrastructure automation workflows",
            members=8934,
            workflows=1456,
            category="DevOps",
            activity="Active",
            moderators=["DevOps Master", "Cloud Architect"],
            rules=["Focus on DevOps", "Test before sharing", "Document thoroughly"],
            recent_activity=[
                {"user": "Tom Rodriguez", "action": "shared", "item": "Kubernetes Deployment", "time": "1 hour ago"},
                {"user": "Lisa Park", "action": "updated", "item": "Docker Build Pipeline", "time": "3 hours ago"},
                {"user": "Chris Lee", "action": "reviewed", "item": "Infrastructure as Code", "time": "5 hours ago"}
            ]
        ),
        Community(
            id=3,
            name="Marketing Automation Experts",
            description="Community focused on marketing workflows, campaigns, and customer engagement",
            members=6721,
            workflows=987,
            category="Marketing",
            activity="Moderate",
            moderators=["Marketing Guru", "Campaign Expert"],
            rules=["Marketing focus only", "Respect privacy", "Share insights"],
            recent_activity=[
                {"user": "Emma Davis", "action": "shared", "item": "Lead Nurturing Campaign", "time": "2 hours ago"},
                {"user": "Ryan Miller", "action": "commented on", "item": "A/B Testing Workflow", "time": "4 hours ago"},
                {"user": "Sophie Brown", "action": "liked", "item": "Customer Segmentation", "time": "7 hours ago"}
            ]
        ),
        Community(
            id=4,
            name="Data Science Workflows",
            description="Advanced community for data processing, ML pipelines, and analytics workflows",
            members=5432,
            workflows=743,
            category="Data Science",
            activity="Active",
            moderators=["Data Scientist", "ML Engineer"],
            rules=["Data science focus", "Share datasets responsibly", "Explain methodologies"],
            recent_activity=[
                {"user": "Dr. Amanda Foster", "action": "shared", "item": "ML Model Training Pipeline", "time": "1 hour ago"},
                {"user": "Kevin Zhang", "action": "updated", "item": "Data Cleaning Workflow", "time": "2 hours ago"},
                {"user": "Maria Santos", "action": "commented on", "item": "Feature Engineering Template", "time": "4 hours ago"}
            ]
        )
    ]

@router.get("/templates", response_model=TemplatesResponse)
async def get_workflow_templates(
    category: str = Query("all", description="Filter by category"),
    sort: str = Query("popular", description="Sort order"),
    search: str = Query("", description="Search query"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=100, description="Items per page")
):
    """
    Get workflow templates from the marketplace
    
    This endpoint provides comprehensive workflow template data with filtering,
    sorting, and search capabilities. Falls back to enhanced demo data if
    database is unavailable.
    """
    try:
        logger.info(f"Fetching workflow templates - category: {category}, sort: {sort}, search: {search}")
        
        # In a real implementation, this would query the database
        # For now, we'll simulate database unavailability and return enhanced fallback data
        
        # Simulate database query attempt
        # db_templates = await get_templates_from_database(category, sort, search, page, limit)
        # if db_templates:
        #     return TemplatesResponse(
        #         templates=db_templates,
        #         total_count=len(db_templates),
        #         data_source="database",
        #         categories=["DevOps", "Marketing", "Data Science", "Security", "E-commerce", "Operations", "Sales", "Finance"],
        #         filters_applied={"category": category, "sort": sort, "search": search}
        #     )
        
        # Enhanced fallback data
        templates = generate_enhanced_templates()
        
        # Apply filters
        if category != "all":
            templates = [t for t in templates if t.category == category]
        
        if search:
            search_lower = search.lower()
            templates = [
                t for t in templates 
                if search_lower in t.name.lower() 
                or search_lower in t.description.lower()
                or any(search_lower in tag.lower() for tag in t.tags)
            ]
        
        # Apply sorting
        if sort == "popular":
            templates.sort(key=lambda x: x.downloads, reverse=True)
        elif sort == "recent":
            # For demo purposes, sort by ID (simulating recent updates)
            templates.sort(key=lambda x: x.id, reverse=True)
        elif sort == "rating":
            templates.sort(key=lambda x: x.rating, reverse=True)
        elif sort == "downloads":
            templates.sort(key=lambda x: x.downloads, reverse=True)
        elif sort == "name":
            templates.sort(key=lambda x: x.name)
        
        # Apply pagination
        start_idx = (page - 1) * limit
        end_idx = start_idx + limit
        paginated_templates = templates[start_idx:end_idx]
        
        return TemplatesResponse(
            templates=paginated_templates,
            total_count=len(templates),
            data_source="enhanced_fallback",
            categories=["DevOps", "Marketing", "Data Science", "Security", "E-commerce", "Operations", "Sales", "Finance"],
            filters_applied={"category": category, "sort": sort, "search": search, "page": page, "limit": limit}
        )
        
    except Exception as e:
        logger.error(f"Error fetching workflow templates: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch workflow templates: {str(e)}")

@router.get("/my-workflows", response_model=MyWorkflowsResponse)
async def get_my_workflows():
    """
    Get user's personal workflows
    
    This endpoint provides user's created and managed workflows with
    statistics and management capabilities.
    """
    try:
        logger.info("Fetching user workflows")
        
        # Enhanced fallback data
        workflows = generate_enhanced_user_workflows()
        
        # Calculate stats
        total_downloads = sum(w.downloads for w in workflows)
        avg_rating = sum(w.rating for w in workflows if w.rating > 0) / len([w for w in workflows if w.rating > 0]) if any(w.rating > 0 for w in workflows) else 0
        public_count = len([w for w in workflows if w.visibility == "Public"])
        
        stats = {
            "total_workflows": len(workflows),
            "total_downloads": total_downloads,
            "average_rating": round(float(avg_rating), 1),
            "public_workflows": public_count,
            "private_workflows": len(workflows) - public_count
        }
        
        return MyWorkflowsResponse(
            workflows=workflows,
            total_count=len(workflows),
            data_source="enhanced_fallback",
            stats=stats
        )
        
    except Exception as e:
        logger.error(f"Error fetching user workflows: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch user workflows: {str(e)}")

@router.get("/community", response_model=CommunityResponse)
async def get_community_data():
    """
    Get community data and statistics
    
    This endpoint provides information about workflow communities,
    their activity, and recent interactions.
    """
    try:
        logger.info("Fetching community data")
        
        # Enhanced fallback data
        communities = generate_enhanced_communities()
        
        # Calculate stats
        total_members = sum(c.members for c in communities)
        total_workflows = sum(c.workflows for c in communities)
        active_communities = len([c for c in communities if c.activity in ["Very Active", "Active"]])
        
        stats = {
            "total_members": total_members,
            "total_workflows": total_workflows,
            "active_communities": active_communities,
            "total_communities": len(communities),
            "daily_activity": 847  # Simulated daily activity count
        }
        
        return CommunityResponse(
            communities=communities,
            total_count=len(communities),
            data_source="enhanced_fallback",
            stats=stats
        )
        
    except Exception as e:
        logger.error(f"Error fetching community data: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch community data: {str(e)}")

@router.post("/templates/{template_id}/download")
async def download_template(template_id: int):
    """Download a workflow template"""
    try:
        logger.info(f"Downloading template {template_id}")
        
        # In a real implementation, this would:
        # 1. Verify user permissions
        # 2. Increment download counter
        # 3. Return template file or configuration
        
        return {
            "message": f"Template {template_id} downloaded successfully",
            "download_url": f"/api/templates/{template_id}/file",
            "data_source": "enhanced_fallback"
        }
        
    except Exception as e:
        logger.error(f"Error downloading template {template_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to download template: {str(e)}")

@router.post("/templates/{template_id}/favorite")
async def toggle_favorite(template_id: int):
    """Toggle favorite status for a template"""
    try:
        logger.info(f"Toggling favorite for template {template_id}")
        
        # In a real implementation, this would update user preferences
        
        return {
            "message": f"Favorite status toggled for template {template_id}",
            "is_favorite": True,  # Simulated response
            "data_source": "enhanced_fallback"
        }
        
    except Exception as e:
        logger.error(f"Error toggling favorite for template {template_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to toggle favorite: {str(e)}")

@router.post("/workflows/upload")
async def upload_workflow():
    """Upload a new workflow to the marketplace"""
    try:
        logger.info("Uploading new workflow")
        
        # In a real implementation, this would:
        # 1. Validate workflow format
        # 2. Store workflow data
        # 3. Create marketplace entry
        
        return {
            "message": "Workflow uploaded successfully",
            "workflow_id": 999,  # Simulated new workflow ID
            "status": "pending_review",
            "data_source": "enhanced_fallback"
        }
        
    except Exception as e:
        logger.error(f"Error uploading workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload workflow: {str(e)}")

@router.get("/categories")
async def get_categories():
    """Get available workflow categories"""
    try:
        categories = [
            {"id": "all", "name": "All Categories", "count": 8},
            {"id": "DevOps", "name": "DevOps", "count": 2},
            {"id": "Marketing", "name": "Marketing", "count": 2},
            {"id": "Data Science", "name": "Data Science", "count": 1},
            {"id": "Security", "name": "Security", "count": 1},
            {"id": "E-commerce", "name": "E-commerce", "count": 1},
            {"id": "Finance", "name": "Finance", "count": 1}
        ]
        
        return {
            "categories": categories,
            "data_source": "enhanced_fallback"
        }
        
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch categories: {str(e)}")

@router.get("/stats")
async def get_marketplace_stats():
    """Get overall marketplace statistics"""
    try:
        stats = {
            "total_templates": 8,
            "total_downloads": 12233,
            "active_users": 1547,
            "community_members": 33934,
            "featured_templates": 3,
            "verified_authors": 6,
            "categories": 7,
            "average_rating": 4.6
        }
        
        return {
            "stats": stats,
            "data_source": "enhanced_fallback"
        }
        
    except Exception as e:
        logger.error(f"Error fetching marketplace stats: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch marketplace stats: {str(e)}")