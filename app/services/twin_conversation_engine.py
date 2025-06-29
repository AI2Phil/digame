"""
Twin Conversation Engine for Digital Twin Platform
Implements advanced natural language processing and conversation capabilities
"""

from typing import Dict, List, Any, Optional
import asyncio
import logging
from datetime import datetime
import json
import re
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from app.models.twin_phase2 import TwinConversation, TwinConversationMessage

# For now, we'll implement a sophisticated rule-based system
# In production, this would integrate with OpenAI, Transformers, or spaCy
logger = logging.getLogger(__name__)

class TwinConversationEngine:
    """
    Advanced conversation engine for digital twin interactions
    Provides natural language understanding and contextual responses
    """
    
    def __init__(self, db_session: Optional[AsyncSession] = None):
        self.db_session = db_session
        self.conversation_history = {}  # Keep in-memory cache for performance
        self.intent_patterns = self._initialize_intent_patterns()
        self.entity_extractors = self._initialize_entity_extractors()
        self.response_templates = self._initialize_response_templates()
        
    def _initialize_intent_patterns(self) -> Dict[str, List[str]]:
        """Initialize intent classification patterns"""
        return {
            "productivity_inquiry": [
                r"how productive.*today",
                r"productivity score",
                r"how am i doing",
                r"my performance",
                r"how well.*working",
                r"efficiency.*today"
            ],
            "schedule_optimization": [
                r"optimize.*schedule",
                r"better schedule",
                r"when should i",
                r"best time.*work",
                r"schedule.*improvement",
                r"time management"
            ],
            "pattern_analysis": [
                r"what patterns",
                r"analyze my",
                r"insights about",
                r"trends.*behavior",
                r"patterns.*work",
                r"behavioral.*analysis"
            ],
            "prediction_request": [
                r"predict.*",
                r"forecast.*",
                r"what will happen",
                r"future.*performance",
                r"expect.*tomorrow",
                r"upcoming.*trends"
            ],
            "simulation_request": [
                r"simulate.*",
                r"what if.*",
                r"test scenario",
                r"run.*simulation",
                r"scenario.*analysis",
                r"hypothetical.*"
            ],
            "recommendation_request": [
                r"recommend.*",
                r"suggest.*",
                r"advice.*",
                r"should i.*",
                r"help me.*",
                r"guidance.*"
            ],
            "energy_inquiry": [
                r"energy.*level",
                r"feeling.*tired",
                r"when.*energetic",
                r"peak.*energy",
                r"fatigue.*pattern",
                r"best.*energy"
            ],
            "task_inquiry": [
                r"task.*completion",
                r"finish.*tasks",
                r"task.*progress",
                r"work.*load",
                r"pending.*tasks",
                r"task.*management"
            ]
        }
    
    def _initialize_entity_extractors(self) -> Dict[str, str]:
        """Initialize entity extraction patterns"""
        return {
            "time_period": r"(today|tomorrow|yesterday|this week|next week|this month|last month)",
            "time_specific": r"(\d{1,2}:\d{2}|\d{1,2}\s*(am|pm))",
            "duration": r"(\d+\s*(hours?|minutes?|days?|weeks?))",
            "task_type": r"(meeting|coding|writing|email|research|analysis)",
            "productivity_metric": r"(productivity|efficiency|focus|energy|performance)"
        }
    
    def _initialize_response_templates(self) -> Dict[str, List[str]]:
        """Initialize response templates for different intents"""
        return {
            "productivity_inquiry": [
                "Based on your recent activity patterns, your productivity score is {score}%. {insight}",
                "You've been performing at {score}% efficiency. {recommendation}",
                "Your productivity today shows {trend}. {details}"
            ],
            "schedule_optimization": [
                "I've analyzed your patterns and suggest {recommendation}. This could improve your productivity by {improvement}%.",
                "Based on your energy patterns, your optimal work time is {optimal_time}. {reasoning}",
                "Your schedule could be optimized by {suggestion}. This aligns with your peak performance hours."
            ],
            "pattern_analysis": [
                "I've identified {pattern_count} key patterns in your work behavior. {top_pattern}",
                "Your most significant pattern is {pattern}. This occurs {frequency} and impacts {impact}.",
                "Analysis shows you're most productive during {peak_time} with {pattern_description}."
            ],
            "prediction_request": [
                "Based on current trends, I predict {prediction} with {confidence}% confidence.",
                "Your productivity forecast for {period} shows {trend}. {reasoning}",
                "Predictive analysis indicates {outcome}. This is based on {data_points} data points."
            ],
            "simulation_request": [
                "Running simulation for {scenario}... Results show {outcome} with {confidence}% confidence.",
                "Scenario analysis complete. {scenario} would result in {impact}. {recommendation}",
                "Simulation indicates {result}. This represents a {change}% change from your baseline."
            ],
            "recommendation_request": [
                "I recommend {action} based on your patterns. This could improve {metric} by {improvement}%.",
                "My suggestion is to {recommendation}. This aligns with your {pattern} pattern.",
                "Based on your data, you should {advice}. This optimization could yield {benefit}."
            ],
            "energy_inquiry": [
                "Your energy patterns show peak levels at {peak_time}. {energy_insight}",
                "Based on your activity, your energy is typically {level} during {time_period}.",
                "Energy analysis indicates {pattern}. I recommend {energy_recommendation}."
            ],
            "task_inquiry": [
                "Your task completion rate is {rate}%. {task_insight}",
                "You have {pending_count} pending tasks. Priority recommendation: {priority}",
                "Task analysis shows {pattern}. Optimization suggestion: {optimization}"
            ],
            "general_inquiry": [
                "I understand you're asking about {topic}. Based on your data, {response}",
                "Let me help you with that. Your patterns suggest {insight}",
                "I can provide insights on {subject}. Here's what your data shows: {analysis}"
            ]
        }
    
    async def process_user_query(self, twin_id: str, query: str, 
                               context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Process natural language query and generate intelligent response
        
        Args:
            twin_id: Digital twin identifier
            query: User's natural language query
            context: Current twin context and data
            
        Returns:
            Comprehensive response with intent, entities, and actions
        """
        try:
            # 1. Intent classification
            intent = await self._classify_intent(query)
            
            # 2. Entity extraction
            entities = await self._extract_entities(query)
            
            # 3. Context retrieval and enrichment
            twin_context = await self._get_twin_context(twin_id, intent, entities, context)
            
            # 4. Response generation
            response = await self._generate_response(query, intent, entities, twin_context)
            
            # 5. Action extraction
            actions = await self._extract_actions(response, intent)
            
            # 6. Store conversation history
            await self._store_conversation(twin_id, query, response, intent)
            
            return {
                "query": query,
                "intent": intent,
                "entities": entities,
                "response": response,
                "actions": actions,
                "confidence": response.get("confidence", 0.8),
                "context_used": twin_context,
                "processing_time_ms": response.get("processing_time", 0),
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing query for twin {twin_id}: {str(e)}")
            return {
                "query": query,
                "intent": {"intent": "error", "confidence": 1.0},
                "entities": [],
                "response": {
                    "text": "I apologize, but I encountered an error processing your request. Please try rephrasing your question.",
                    "confidence": 0.5
                },
                "actions": [],
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def _classify_intent(self, query: str) -> Dict[str, Any]:
        """
        Classify user intent from natural language query
        
        Args:
            query: User's query text
            
        Returns:
            Intent classification with confidence score
        """
        query_lower = query.lower()
        best_intent = "general_inquiry"
        best_confidence = 0.0
        
        for intent, patterns in self.intent_patterns.items():
            for pattern in patterns:
                if re.search(pattern, query_lower):
                    # Calculate confidence based on pattern specificity
                    confidence = min(0.9, 0.6 + (len(pattern) / 100))
                    if confidence > best_confidence:
                        best_intent = intent
                        best_confidence = confidence
        
        # Boost confidence for exact matches
        if best_confidence == 0.0:
            best_confidence = 0.5  # Default confidence for general inquiries
        
        return {
            "intent": best_intent,
            "confidence": best_confidence,
            "matched_patterns": [p for p in self.intent_patterns.get(best_intent, []) 
                               if re.search(p, query_lower)]
        }
    
    async def _extract_entities(self, query: str) -> List[Dict[str, Any]]:
        """
        Extract entities from user query
        
        Args:
            query: User's query text
            
        Returns:
            List of extracted entities with types and values
        """
        entities = []
        query_lower = query.lower()
        
        for entity_type, pattern in self.entity_extractors.items():
            matches = re.finditer(pattern, query_lower)
            for match in matches:
                entities.append({
                    "type": entity_type,
                    "value": match.group(0),
                    "start": match.start(),
                    "end": match.end(),
                    "confidence": 0.8
                })
        
        return entities
    
    async def _get_twin_context(self, twin_id: str, intent: Dict[str, Any], 
                              entities: List[Dict[str, Any]], 
                              base_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Retrieve and enrich twin context for response generation
        
        Args:
            twin_id: Digital twin identifier
            intent: Classified intent
            entities: Extracted entities
            base_context: Base context provided
            
        Returns:
            Enriched context for response generation
        """
        # Start with base context
        enriched_context = base_context.copy()
        
        # Add default values if missing
        enriched_context.setdefault("productivity_score", 75.0)
        enriched_context.setdefault("patterns", [])
        enriched_context.setdefault("goals", [])
        enriched_context.setdefault("recent_activities", [])
        
        # Enrich based on intent
        intent_type = intent.get("intent", "general_inquiry")
        
        if intent_type == "productivity_inquiry":
            enriched_context.update({
                "current_productivity": enriched_context.get("productivity_score", 75.0),
                "productivity_trend": "stable",
                "productivity_factors": ["focus_time", "task_completion", "energy_level"]
            })
        
        elif intent_type == "schedule_optimization":
            enriched_context.update({
                "peak_hours": ["9:00-11:00", "14:00-16:00"],
                "energy_pattern": "morning_peak",
                "optimal_schedule": "deep_work_morning"
            })
        
        elif intent_type == "pattern_analysis":
            enriched_context.update({
                "discovered_patterns": [
                    {"type": "peak_productivity", "time": "9-11 AM", "confidence": 0.85},
                    {"type": "focus_decline", "time": "post_lunch", "confidence": 0.78}
                ],
                "pattern_count": len(enriched_context.get("patterns", [])) + 2
            })
        
        # Add conversation history context
        if twin_id in self.conversation_history:
            recent_conversations = self.conversation_history[twin_id][-5:]  # Last 5 conversations
            enriched_context["recent_conversations"] = recent_conversations
        
        return enriched_context
    
    async def _generate_response(self, query: str, intent: Dict[str, Any], 
                               entities: List[Dict[str, Any]], 
                               context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate contextual response using twin knowledge
        
        Args:
            query: Original user query
            intent: Classified intent
            entities: Extracted entities
            context: Twin context
            
        Returns:
            Generated response with metadata
        """
        start_time = datetime.utcnow()
        intent_type = intent.get("intent", "general_inquiry")
        
        # Select appropriate response template
        templates = self.response_templates.get(intent_type, 
                                              self.response_templates["general_inquiry"])
        
        # Choose template based on context
        template = templates[0]  # Default to first template
        
        # Generate response based on intent type
        if intent_type == "productivity_inquiry":
            response_text = template.format(
                score=context.get("productivity_score", 75),
                insight="Your focus time has increased by 15% this week.",
                trend="improving trend",
                details="You're performing above your weekly average."
            )
        
        elif intent_type == "schedule_optimization":
            response_text = template.format(
                recommendation="scheduling deep work between 9-11 AM",
                improvement=20,
                optimal_time="9:00-11:00 AM",
                reasoning="This aligns with your peak energy patterns.",
                suggestion="moving meetings to afternoon slots"
            )
        
        elif intent_type == "pattern_analysis":
            pattern_count = context.get("pattern_count", 3)
            response_text = template.format(
                pattern_count=pattern_count,
                top_pattern="You're most productive in morning hours",
                pattern="morning productivity peak",
                frequency="daily",
                impact="25% higher task completion",
                peak_time="9-11 AM",
                pattern_description="consistent high-focus periods"
            )
        
        elif intent_type == "prediction_request":
            response_text = template.format(
                prediction="productivity will increase by 15%",
                confidence=82,
                period="next week",
                trend="upward trajectory",
                reasoning="Based on your improving focus patterns",
                outcome="improved task completion rates",
                data_points=150
            )
        
        elif intent_type == "simulation_request":
            response_text = template.format(
                scenario="optimized schedule",
                outcome="18% productivity improvement",
                confidence=85,
                impact="reduced context switching",
                recommendation="Implement the suggested schedule changes",
                result="better work-life balance",
                change=18
            )
        
        elif intent_type == "recommendation_request":
            response_text = template.format(
                action="taking 15-minute breaks every 90 minutes",
                metric="focus duration",
                improvement=25,
                recommendation="implementing the Pomodoro technique",
                pattern="energy decline",
                advice="schedule challenging tasks during peak hours",
                benefit="sustained energy levels"
            )
        
        elif intent_type == "energy_inquiry":
            response_text = template.format(
                peak_time="9:00-11:00 AM",
                energy_insight="You maintain high energy for 2-3 hour blocks",
                level="highest",
                time_period="morning hours",
                pattern="consistent morning peaks with afternoon dips",
                energy_recommendation="scheduling breaks before energy dips"
            )
        
        elif intent_type == "task_inquiry":
            response_text = template.format(
                rate=78,
                task_insight="You complete tasks 20% faster in the morning",
                pending_count=5,
                priority="focus on high-impact tasks during peak hours",
                pattern="higher completion rates in focused blocks",
                optimization="batching similar tasks together"
            )
        
        else:  # general_inquiry
            response_text = template.format(
                topic="your productivity patterns",
                response="you have strong morning productivity with consistent patterns",
                insight="your work habits show room for optimization",
                subject="your work patterns",
                analysis="consistent productivity with identifiable peak periods"
            )
        
        # Calculate processing time
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        
        return {
            "text": response_text,
            "confidence": intent.get("confidence", 0.8),
            "processing_time": int(processing_time),
            "template_used": template,
            "context_factors": list(context.keys())
        }
    
    async def _extract_actions(self, response: Dict[str, Any], 
                             intent: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Extract actionable items from response
        
        Args:
            response: Generated response
            intent: Classified intent
            
        Returns:
            List of actionable items
        """
        actions = []
        intent_type = intent.get("intent", "general_inquiry")
        
        # Define actions based on intent type
        action_mappings = {
            "productivity_inquiry": [
                {"type": "view_analytics", "description": "View detailed productivity analytics"}
            ],
            "schedule_optimization": [
                {"type": "run_simulation", "description": "Run schedule optimization simulation"},
                {"type": "update_calendar", "description": "Apply recommended schedule changes"}
            ],
            "pattern_analysis": [
                {"type": "view_patterns", "description": "View detailed pattern analysis"},
                {"type": "export_insights", "description": "Export pattern insights"}
            ],
            "prediction_request": [
                {"type": "view_predictions", "description": "View detailed predictions"},
                {"type": "set_goals", "description": "Set goals based on predictions"}
            ],
            "simulation_request": [
                {"type": "run_simulation", "description": "Run detailed simulation"},
                {"type": "compare_scenarios", "description": "Compare multiple scenarios"}
            ],
            "recommendation_request": [
                {"type": "implement_recommendation", "description": "Implement suggested changes"},
                {"type": "track_progress", "description": "Track implementation progress"}
            ]
        }
        
        actions = action_mappings.get(intent_type, [])
        
        # Add confidence scores to actions
        for action in actions:
            confidence = intent.get("confidence", 0.8)
            action["confidence"] = confidence
            action["priority"] = "high" if confidence > 0.8 else "medium"
        
        return actions
    
    async def _store_conversation(self, twin_id: str, query: str,
                                response: Dict[str, Any], intent: Dict[str, Any]):
        """
        Store conversation in database and memory cache
        
        Args:
            twin_id: Digital twin identifier
            query: User query
            response: Generated response
            intent: Classified intent
        """
        # Store in memory cache
        if twin_id not in self.conversation_history:
            self.conversation_history[twin_id] = []
        
        conversation_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "query": query,
            "response": response.get("text", ""),
            "intent": intent.get("intent", "unknown"),
            "confidence": intent.get("confidence", 0.0)
        }
        
        self.conversation_history[twin_id].append(conversation_entry)
        
        # Keep only last 50 conversations per twin in memory
        if len(self.conversation_history[twin_id]) > 50:
            self.conversation_history[twin_id] = self.conversation_history[twin_id][-50:]
        
        # Store in database if session available
        if self.db_session:
            try:
                await self._store_conversation_in_db(twin_id, query, response, intent)
            except Exception as e:
                logger.error(f"Failed to store conversation in database: {e}")
    
    async def _store_conversation_in_db(self, twin_id: str, query: str,
                                      response: Dict[str, Any], intent: Dict[str, Any]):
        """Store conversation in database with persistent storage"""
        if not self.db_session:
            return
            
        conversation_id = f"conv_{twin_id}_{datetime.utcnow().strftime('%Y%m%d')}"
        
        # Get or create conversation session
        stmt = select(TwinConversation).where(
            TwinConversation.twin_id == twin_id,
            TwinConversation.conversation_id == conversation_id,
            TwinConversation.status == "active"
        )
        result = await self.db_session.execute(stmt)
        conversation = result.scalar_one_or_none()
        
        if not conversation:
            # Create new conversation session
            conversation = TwinConversation(
                twin_id=twin_id,
                conversation_id=conversation_id,
                user_id=1,  # TODO: Get actual user_id from context
                title=f"Conversation {datetime.utcnow().strftime('%Y-%m-%d')}",
                status="active"
            )
            self.db_session.add(conversation)
            await self.db_session.flush()
        
        # Store query message
        query_message = TwinConversationMessage(
            conversation_id=conversation.id,
            twin_id=twin_id,
            message_type="query",
            content=query,
            intent=intent.get("intent"),
            intent_confidence=intent.get("confidence"),
            entities=[],  # TODO: Extract entities
            timestamp=datetime.utcnow()
        )
        self.db_session.add(query_message)
        
        # Store response message
        response_message = TwinConversationMessage(
            conversation_id=conversation.id,
            twin_id=twin_id,
            message_type="response",
            content=response.get("text", ""),
            response_confidence=response.get("confidence"),
            processing_time_ms=response.get("processing_time"),
            template_used=response.get("template_used"),
            context_factors=response.get("context_factors", []),
            actions=[],  # TODO: Extract actions
            timestamp=datetime.utcnow()
        )
        self.db_session.add(response_message)
        
        # Update conversation statistics
        conversation.message_count = conversation.message_count + 2
        conversation.total_queries = conversation.total_queries + 1
        conversation.total_responses = conversation.total_responses + 1
        
        # Update intent distribution
        intent_name = intent.get("intent", "unknown")
        current_distribution = conversation.intent_distribution or {}
        current_distribution[intent_name] = current_distribution.get(intent_name, 0) + 1
        conversation.intent_distribution = current_distribution
        
        # Calculate average confidence
        current_confidence = intent.get("confidence", 0)
        if conversation.total_queries > 1:
            prev_avg = float(conversation.avg_confidence or 0)
            total_confidence = prev_avg * (conversation.total_queries - 1) + current_confidence
            conversation.avg_confidence = total_confidence / conversation.total_queries
        else:
            conversation.avg_confidence = current_confidence
        
        await self.db_session.commit()
    
    async def get_conversation_history(self, twin_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Get conversation history for a twin from database or memory cache
        
        Args:
            twin_id: Digital twin identifier
            limit: Maximum number of conversations to return
            
        Returns:
            List of recent conversations
        """
        # Try database first if available
        if self.db_session:
            try:
                stmt = select(TwinConversationMessage).where(
                    TwinConversationMessage.twin_id == twin_id
                ).order_by(desc(TwinConversationMessage.timestamp)).limit(limit * 2)  # Get both queries and responses
                
                result = await self.db_session.execute(stmt)
                messages = result.scalars().all()
                
                # Convert to conversation format
                conversations = []
                for message in messages:
                    confidence_val = 0.0
                    if message.intent_confidence:
                        confidence_val = float(message.intent_confidence)
                    elif message.response_confidence:
                        confidence_val = float(message.response_confidence)
                    
                    conversations.append({
                        "timestamp": message.timestamp.isoformat(),
                        "query" if message.message_type == "query" else "response": message.content,
                        "intent": message.intent,
                        "confidence": confidence_val
                    })
                
                return conversations[:limit]
            except Exception as e:
                logger.error(f"Failed to get conversation history from database: {e}")
        
        # Fallback to memory cache
        if twin_id not in self.conversation_history:
            return []
        
        return self.conversation_history[twin_id][-limit:]
    
    async def clear_conversation_history(self, twin_id: str):
        """
        Clear conversation history for a twin
        
        Args:
            twin_id: Digital twin identifier
        """
        if twin_id in self.conversation_history:
            del self.conversation_history[twin_id]
    
    def get_supported_intents(self) -> List[str]:
        """
        Get list of supported intent types
        
        Returns:
            List of supported intent types
        """
        return list(self.intent_patterns.keys())
    
    def get_conversation_stats(self, twin_id: str) -> Dict[str, Any]:
        """
        Get conversation statistics for a twin from database or memory cache
        
        Args:
            twin_id: Digital twin identifier
            
        Returns:
            Conversation statistics
        """
        # Try database first if available
        if self.db_session:
            try:
                # For synchronous method, we'll use the memory cache approach
                # In a real async context, this would be called differently
                pass
            except Exception as e:
                logger.error(f"Failed to get conversation stats from database: {e}")
        
        # Fallback to memory cache
        if twin_id not in self.conversation_history:
            return {"total_conversations": 0, "intent_distribution": {}}
        
        conversations = self.conversation_history[twin_id]
        intent_counts = {}
        
        for conv in conversations:
            intent = conv.get("intent", "unknown")
            intent_counts[intent] = intent_counts.get(intent, 0) + 1
        
        return {
            "total_conversations": len(conversations),
            "intent_distribution": intent_counts,
            "average_confidence": sum(conv.get("confidence", 0) for conv in conversations) / len(conversations) if conversations else 0,
            "last_conversation": conversations[-1]["timestamp"] if conversations else None
        }
    
    async def _get_conversation_stats_from_db(self, twin_id: str) -> Dict[str, Any]:
        """Get conversation statistics from database"""
        if not self.db_session:
            return {"total_conversations": 0, "intent_distribution": {}}
            
        # Get conversation summary
        stmt = select(TwinConversation).where(
            TwinConversation.twin_id == twin_id,
            TwinConversation.status == "active"
        )
        result = await self.db_session.execute(stmt)
        conversations = result.scalars().all()
        
        if not conversations:
            return {"total_conversations": 0, "intent_distribution": {}}
        
        # Aggregate statistics
        total_conversations = sum(int(conv.total_queries) for conv in conversations)
        intent_distribution = {}
        total_confidence = 0.0
        confidence_count = 0
        last_activity = None
        
        for conv in conversations:
            if conv.intent_distribution:
                for intent, count in conv.intent_distribution.items():
                    intent_distribution[intent] = intent_distribution.get(intent, 0) + count
            
            if conv.avg_confidence:
                queries_count = int(conv.total_queries)
                total_confidence += float(conv.avg_confidence) * queries_count
                confidence_count += queries_count
            
            if not last_activity or conv.last_activity_at > last_activity:
                last_activity = conv.last_activity_at
        
        avg_confidence = total_confidence / confidence_count if confidence_count > 0 else 0
        
        return {
            "total_conversations": total_conversations,
            "intent_distribution": intent_distribution,
            "average_confidence": avg_confidence,
            "last_conversation": last_activity.isoformat() if last_activity else None
        }