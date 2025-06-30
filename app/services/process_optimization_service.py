from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from ..models.workflow_automation import (
    WorkflowInstance,
    WorkflowStepExecution,
    WorkflowTemplate,
    OptimizationRecommendation
)
from ..schemas.workflow_automation_schemas import (
    OptimizationRecommendationCreate,
    OptimizationRecommendationUpdate
)
# from ..models.task import Task # If task data is used for analysis

# Constants for analysis
MIN_INSTANCES_FOR_TEMPLATE_ANALYSIS = 5
HIGH_ERROR_RATE_THRESHOLD = 0.2 # 20% error rate for a step
BOTTLENECK_DURATION_PERCENTILE = 90 # Steps whose duration is in the 90th percentile
MIN_STEP_EXECUTIONS_FOR_BOTTLENECK = 10

class ProcessOptimizationService:
    def __init__(self, db: Session):
        self.db = db

    def generate_recommendations_for_tenant(self, tenant_id: int) -> List[OptimizationRecommendation]:
        """
        Analyzes all workflow data for a tenant and generates optimization recommendations.
        This is a high-level trigger that can call more specific analysis methods.
        """
        recommendations = []

        # 1. Analyze Workflow Templates for common issues
        templates = self.db.query(WorkflowTemplate).filter(WorkflowTemplate.tenant_id == tenant_id).all()
        for template in templates:
            recommendations.extend(self._analyze_workflow_template(template, tenant_id))

        # 2. Analyze individual recent Workflow Instances for anomalies (optional, can be very noisy)
        # recent_instances = self.db.query(WorkflowInstance).filter(
        #     WorkflowInstance.tenant_id == tenant_id,
        #     WorkflowInstance.created_at >= datetime.utcnow() - timedelta(days=30) # Example: last 30 days
        # ).all()
        # for instance in recent_instances:
        #     recommendations.extend(self._analyze_workflow_instance(instance, tenant_id))

        # 3. Identify candidates for new automation (e.g., from frequent manual tasks if Task model is integrated)
        # recommendations.extend(self._identify_new_automation_candidates(tenant_id))

        # Deduplicate or prioritize recommendations before saving might be useful
        # For now, save all generated ones if they are new.

        newly_created_recommendations = []
        for rec_data in recommendations:
            # Check if a similar recommendation already exists and is 'new' or 'viewed'
            existing_rec = self.db.query(OptimizationRecommendation).filter(
                OptimizationRecommendation.tenant_id == tenant_id,
                OptimizationRecommendation.recommendation_type == getattr(rec_data, 'recommendation_type', None),  # type: ignore
                OptimizationRecommendation.affected_workflow_template_id == getattr(rec_data, 'affected_workflow_template_id', None),  # type: ignore
                OptimizationRecommendation.affected_step_id == getattr(rec_data, 'affected_step_id', None),  # type: ignore
            ).filter(
                OptimizationRecommendation.status.in_(["new", "viewed"])  # type: ignore
            ).first()

            if not existing_rec:
                db_rec = self._create_recommendation_from_schema(rec_data, tenant_id)
                newly_created_recommendations.append(db_rec)

        return newly_created_recommendations

    def _analyze_workflow_template(self, template: WorkflowTemplate, tenant_id: int) -> List[OptimizationRecommendationCreate]:
        """
        Analyzes all instances of a specific workflow template to find common issues.
        """
        template_recommendations = []

        template_id = getattr(template, 'id', None)  # type: ignore
        instances = self.db.query(WorkflowInstance).filter(
            WorkflowInstance.template_id == template_id,
            WorkflowInstance.tenant_id == tenant_id
        ).order_by(WorkflowInstance.created_at.desc()).limit(100).all() # Analyze up to 100 recent instances

        if len(instances) < MIN_INSTANCES_FOR_TEMPLATE_ANALYSIS:
            return [] # Not enough data

        # Aggregate step performance data
        step_performance: Dict[str, Dict[str, Any]] = {}

        for instance in instances:
            instance_id = getattr(instance, 'id', None)  # type: ignore
            step_executions = self.db.query(WorkflowStepExecution).filter(
                WorkflowStepExecution.workflow_instance_id == instance_id
            ).all()

            for step_exec in step_executions:
                step_key = getattr(step_exec, 'step_id', 'unknown')  # type: ignore
                if step_key not in step_performance:
                    step_performance[step_key] = {
                        "total_executions": 0, "failed_executions": 0,
                        "total_duration": 0.0, "durations": [], "step_name": getattr(step_exec, 'step_name', 'Unknown Step')  # type: ignore
                    }

                step_performance[step_key]["total_executions"] += 1
                step_status = getattr(step_exec, 'status', 'unknown')  # type: ignore
                if step_status == "failed":
                    step_performance[step_key]["failed_executions"] += 1
                execution_duration = getattr(step_exec, 'execution_duration', None)  # type: ignore
                if execution_duration is not None:
                    step_performance[step_key]["total_duration"] += execution_duration
                    step_performance[step_key]["durations"].append(execution_duration)

        # Analyze aggregated data for each step in the template definition
        workflow_definition = getattr(template, 'workflow_definition', None)  # type: ignore
        if not workflow_definition or "steps" not in workflow_definition:
            return []

        defined_steps = {step["id"]: step for step in workflow_definition["steps"]}

        for step_id, perf_data in step_performance.items():
            step_name = perf_data.get("step_name", defined_steps.get(step_id, {}).get("name", step_id))

            # High Error Rate Analysis
            if perf_data["total_executions"] > 0:
                error_rate = perf_data["failed_executions"] / perf_data["total_executions"]
                if error_rate >= HIGH_ERROR_RATE_THRESHOLD:
                    # Create recommendation using safe object creation
                    recommendation_data = type('RecommendationData', (), {
                        'recommendation_type': "high_error_rate_step",
                        'description': f"Step '{step_name}' (ID: {step_id}) in Workflow Template '{getattr(template, 'name', 'Unknown')}' has a high error rate of {error_rate*100:.1f}%. "  # type: ignore
                                      f"({perf_data['failed_executions']}/{perf_data['total_executions']} failed). Consider reviewing its configuration or error handling.",
                        'affected_workflow_template_id': getattr(template, 'id', None),  # type: ignore
                        'affected_step_id': step_id,
                        'suggested_actions': ["review_step_configuration", "improve_error_handling", "check_integration_health"],
                        'potential_impact_score': 0.7,
                        'confidence_score': 0.8
                    })()
                    template_recommendations.append(recommendation_data)

            # Bottleneck Analysis (Simplified)
            if perf_data["total_executions"] >= MIN_STEP_EXECUTIONS_FOR_BOTTLENECK and perf_data["durations"]:
                avg_duration = perf_data["total_duration"] / len(perf_data["durations"])
                # A more robust bottleneck detection would compare against overall workflow avg step time or percentiles.
                # For simplicity, let's flag if average duration is significantly high (e.g., > 2 standard deviations from mean of all step avgs)
                # This requires calculating mean/stddev of all step average durations in this template.
                # Or, if a step takes, say, >30% of the total average workflow execution time.

                # Simplified: if average duration is above a certain threshold (e.g. 60 seconds)
                # This is very basic and needs refinement.
                # A better approach: find steps in the upper percentile of durations.
                all_avg_durations = [
                    (sp["total_duration"] / len(sp["durations"])) for sp_id, sp in step_performance.items() if sp["durations"]
                ]
                if not all_avg_durations: continue

                # Calculate 90th percentile of average step durations
                all_avg_durations.sort()
                percentile_index = int(len(all_avg_durations) * (BOTTLENECK_DURATION_PERCENTILE / 100.0))
                percentile_index = min(percentile_index, len(all_avg_durations) - 1) # Ensure valid index
                duration_threshold = all_avg_durations[percentile_index]

                if avg_duration > duration_threshold and avg_duration > 10: # Only flag if reasonably long (e.g. > 10s)
                    # Create recommendation using safe object creation
                    recommendation_data = type('RecommendationData', (), {
                        'recommendation_type': "bottleneck_detected",
                        'description': f"Step '{step_name}' (ID: {step_id}) in Workflow Template '{getattr(template, 'name', 'Unknown')}' has an average execution time of {avg_duration:.2f}s, "  # type: ignore
                                      f"which is significantly higher than other steps. This may be a bottleneck.",
                        'affected_workflow_template_id': getattr(template, 'id', None),  # type: ignore
                        'affected_step_id': step_id,
                        'suggested_actions': ["optimize_step_logic", "parallelize_if_possible", "review_resource_allocation"],
                        'potential_impact_score': 0.8,
                        'confidence_score': 0.75
                    })()
                    template_recommendations.append(recommendation_data)
        return template_recommendations

    def _create_recommendation_from_schema(self, rec_create_schema: OptimizationRecommendationCreate, tenant_id: int) -> OptimizationRecommendation:
        """Helper to create and save an OptimizationRecommendation from its Pydantic schema."""
        rec_data = rec_create_schema.model_dump()
        db_rec = OptimizationRecommendation()  # type: ignore
        setattr(db_rec, 'tenant_id', tenant_id)  # type: ignore
        setattr(db_rec, 'recommendation_type', rec_data["recommendation_type"])  # type: ignore
        setattr(db_rec, 'description', rec_data["description"])  # type: ignore
        setattr(db_rec, 'affected_workflow_template_id', rec_data.get("affected_workflow_template_id"))  # type: ignore
        setattr(db_rec, 'affected_workflow_instance_id', rec_data.get("affected_workflow_instance_id"))  # type: ignore
        setattr(db_rec, 'affected_step_id', rec_data.get("affected_step_id"))  # type: ignore
        setattr(db_rec, 'suggested_actions', rec_data.get("suggested_actions"))  # type: ignore
        setattr(db_rec, 'potential_impact_score', rec_data.get("potential_impact_score"))  # type: ignore
        setattr(db_rec, 'confidence_score', rec_data.get("confidence_score"))  # type: ignore
        setattr(db_rec, 'status', rec_data.get("status", "new"))  # type: ignore
        setattr(db_rec, 'priority', rec_data.get("priority", 5))  # type: ignore
        
        self.db.add(db_rec)
        self.db.commit()
        self.db.refresh(db_rec)
        return db_rec

    # --- CRUD for Recommendations (primarily for users to interact with them) ---
    def get_recommendation(self, recommendation_id: int, tenant_id: int) -> Optional[OptimizationRecommendation]:
        return self.db.query(OptimizationRecommendation).filter(
            OptimizationRecommendation.id == recommendation_id,
            OptimizationRecommendation.tenant_id == tenant_id
        ).first()

    def list_recommendations(
        self,
        tenant_id: int,
        status: Optional[str] = None,
        workflow_template_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[OptimizationRecommendation]:
        query = self.db.query(OptimizationRecommendation).filter(OptimizationRecommendation.tenant_id == tenant_id)
        if status:
            query = query.filter(OptimizationRecommendation.status == status)
        if workflow_template_id:
            query = query.filter(OptimizationRecommendation.affected_workflow_template_id == workflow_template_id)

        return query.order_by(OptimizationRecommendation.priority.asc(), OptimizationRecommendation.generated_at.desc()).offset(skip).limit(limit).all()

    def update_recommendation_status(
        self,
        recommendation_id: int,
        tenant_id: int,
        status_update: OptimizationRecommendationUpdate, # Contains new status, reviewed_by, etc.
        reviewed_by_user_id: int
    ) -> Optional[OptimizationRecommendation]:
        recommendation = self.get_recommendation(recommendation_id, tenant_id)
        if not recommendation:
            return None

        update_data = status_update.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            if hasattr(recommendation, key):
                 setattr(recommendation, key, value)

        setattr(recommendation, 'last_reviewed_at', datetime.utcnow())  # type: ignore
        setattr(recommendation, 'reviewed_by', reviewed_by_user_id)  # type: ignore

        self.db.commit()
        self.db.refresh(recommendation)
        return recommendation

# Dependency injector
def get_process_optimization_service(db: Session) -> ProcessOptimizationService:
    return ProcessOptimizationService(db=db)
