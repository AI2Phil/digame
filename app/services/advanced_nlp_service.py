import asyncio
import json
import logging
import re
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional, Tuple
from collections import defaultdict

from ..services.ai_integration_service import AIIntegrationService
from ..services.behavior_service import BehaviorService

logger = logging.getLogger(__name__)

@dataclass
class ConversationContext:
    """Data class for managing conversation context"""
    conversation_id: str
    user_id: int
    messages: List[Dict[str, Any]] = field(default_factory=list)
    context_summary: str = ""
    sentiment_history: List[Dict[str, Any]] = field(default_factory=list)
    topics: List[str] = field(default_factory=list)
    last_updated: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class DocumentAnalysis:
    """Data class for document analysis results"""
    document_id: str
    summary: str
    sentiment_score: float
    sentiment_label: str
    topics: List[str]
    key_points: List[str]
    entities: List[Dict[str, Any]] = field(default_factory=list)
    action_items: List[str] = field(default_factory=list)
    readability_score: float = 0.0
    word_count: int = 0
    language: str = "en"
    confidence_score: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)

class AdvancedNLPService:
    """Advanced Natural Language Processing Service for Digame platform"""
    
    def __init__(self, ai_integration_service: AIIntegrationService, behavior_service: BehaviorService):
        self.ai_integration_service = ai_integration_service
        self.behavior_service = behavior_service
        self.conversation_contexts: Dict[str, ConversationContext] = {}
        self.supported_languages = [
            "en", "es", "fr", "de", "it", "pt", "ru", "zh", "ja", "ko", "ar"
        ]
        
    async def manage_conversation(
        self,
        user_id: int,
        conversation_id: str,
        message: str,
        message_type: str = "user",
        context_window: int = 10
    ) -> Dict[str, Any]:
        """
        Manage conversation context with advanced NLP analysis
        """
        try:
            # Get or create conversation context
            if conversation_id not in self.conversation_contexts:
                self.conversation_contexts[conversation_id] = ConversationContext(
                    conversation_id=conversation_id,
                    user_id=user_id
                )
            
            context = self.conversation_contexts[conversation_id]
            
            # Analyze the new message
            message_analysis = await self._analyze_message(message, user_id)
            
            # Create message entry
            message_entry = {
                "timestamp": datetime.now().isoformat(),
                "type": message_type,
                "content": message,
                "sentiment": message_analysis["sentiment"],
                "topics": message_analysis["topics"],
                "entities": message_analysis.get("entities", []),
                "language": message_analysis.get("language", "en")
            }
            
            # Add to conversation context
            context.messages.append(message_entry)
            context.sentiment_history.append({
                "timestamp": datetime.now().isoformat(),
                "sentiment": message_analysis["sentiment"]
            })
            
            # Update topics (merge and deduplicate)
            new_topics = set(context.topics + message_analysis["topics"])
            context.topics = list(new_topics)[:20]  # Keep top 20 topics
            
            # Maintain context window
            if len(context.messages) > context_window:
                context.messages = context.messages[-context_window:]
            
            # Update context summary
            context.context_summary = await self._generate_context_summary(context)
            context.last_updated = datetime.now()
            
            # Generate conversation insights
            insights = await self._generate_conversation_insights(context)
            
            return {
                "conversation_id": conversation_id,
                "message_analysis": message_analysis,
                "context_summary": context.context_summary,
                "current_topics": context.topics,
                "sentiment_trend": self._calculate_sentiment_trend(context.sentiment_history),
                "insights": insights,
                "metadata": {
                    "message_count": len(context.messages),
                    "conversation_length": len(context.messages),
                    "last_updated": context.last_updated.isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error managing conversation {conversation_id}: {str(e)}")
            raise

    async def analyze_document(
        self,
        document_content: str,
        document_id: str,
        analysis_type: str = "comprehensive",
        language: Optional[str] = None
    ) -> DocumentAnalysis:
        """
        Perform comprehensive document analysis
        """
        try:
            # Detect language if not provided
            if not language:
                language = await self._detect_language(document_content)
            
            # Initialize results with defaults
            summary = "Summary generation failed"
            sentiment = {"score": 0.0, "label": "neutral"}
            topics = []
            key_points = []
            entities = []
            action_items = []
            
            # Basic analysis (always included)
            try:
                summary = await self._generate_document_summary(document_content)
            except Exception as e:
                logger.error(f"Error generating summary: {str(e)}")
            
            if analysis_type in ["comprehensive", "detailed"]:
                try:
                    sentiment = await self._analyze_document_sentiment(document_content)
                except Exception as e:
                    logger.error(f"Error analyzing sentiment: {str(e)}")
                
                try:
                    topics = await self._extract_document_topics(document_content)
                except Exception as e:
                    logger.error(f"Error extracting topics: {str(e)}")
                
                try:
                    key_points = await self._extract_key_points(document_content)
                except Exception as e:
                    logger.error(f"Error extracting key points: {str(e)}")
                
                if analysis_type == "detailed":
                    try:
                        entities = await self._extract_entities(document_content)
                    except Exception as e:
                        logger.error(f"Error extracting entities: {str(e)}")
                    
                    try:
                        action_items = await self._extract_action_items(document_content)
                    except Exception as e:
                        logger.error(f"Error extracting action items: {str(e)}")
            
            # Calculate additional metrics
            readability_score = self._calculate_readability_score(document_content)
            word_count = len(document_content.split())
            confidence_score = 85.0  # Base confidence score
            
            return DocumentAnalysis(
                document_id=document_id,
                summary=summary,
                sentiment_score=float(sentiment.get("score", 0.0)) if isinstance(sentiment, dict) else 0.0,
                sentiment_label=str(sentiment.get("label", "neutral")) if isinstance(sentiment, dict) else "neutral",
                topics=topics,
                key_points=key_points,
                entities=entities,
                action_items=action_items,
                readability_score=readability_score,
                word_count=word_count,
                language=language,
                confidence_score=confidence_score,
                metadata={
                    "analysis_type": analysis_type,
                    "processed_at": datetime.now().isoformat(),
                    "processing_time": "calculated_separately"
                }
            )
            
        except Exception as e:
            logger.error(f"Error analyzing document {document_id}: {str(e)}")
            raise

    async def analyze_communication_sentiment(
        self,
        communications: List[Dict[str, Any]],
        user_id: int,
        time_range: Optional[Tuple[datetime, datetime]] = None
    ) -> Dict[str, Any]:
        """
        Analyze sentiment across multiple communications
        """
        try:
            if not communications:
                return {"error": "No communications provided for analysis"}
            
            # Filter by time range if provided
            if time_range:
                start_time, end_time = time_range
                communications = [
                    comm for comm in communications
                    if start_time <= datetime.fromisoformat(comm.get("timestamp", datetime.now().isoformat())) <= end_time
                ]
            
            # Analyze sentiment for each communication
            sentiment_results = []
            for comm in communications:
                try:
                    sentiment = await self._analyze_text_sentiment(comm.get("content", ""))
                    sentiment_results.append(sentiment)
                except Exception as e:
                    logger.error(f"Error analyzing sentiment for communication: {str(e)}")
                    sentiment_results.append({"score": 0.0, "label": "neutral"})
            
            # Process results
            valid_sentiments = [
                result for result in sentiment_results
                if isinstance(result, dict) and "score" in result
            ]
            
            if not valid_sentiments:
                return {"error": "Failed to analyze sentiment for any communications"}
            
            # Calculate overall metrics
            overall_score = sum(s["score"] for s in valid_sentiments) / len(valid_sentiments)
            
            # Categorize communications by sentiment
            sentiment_distribution = {"positive": 0, "neutral": 0, "negative": 0}
            communication_details = []
            
            for i, (comm, sentiment) in enumerate(zip(communications, sentiment_results)):
                if isinstance(sentiment, dict) and "score" in sentiment:
                    label = sentiment.get("label", "neutral")
                    sentiment_distribution[label] += 1
                    
                    communication_details.append({
                        "communication_id": comm.get("id", i),
                        "timestamp": comm.get("timestamp"),
                        "type": comm.get("type", "unknown"),
                        "sentiment": sentiment.get("score", 0.0),
                        "label": sentiment.get("label", "neutral")
                    })
            
            # Analyze trends over time
            communication_breakdown = {}
            for detail in communication_details:
                comm_type = detail["type"]
                if comm_type not in communication_breakdown:
                    communication_breakdown[comm_type] = {"count": 0, "sentiments": []}
                
                communication_breakdown[comm_type]["count"] += 1
                communication_breakdown[comm_type]["sentiments"].append(detail["sentiment"])
            
            # Calculate type-specific averages
            for comm_type in communication_breakdown:
                sentiments = communication_breakdown[comm_type]["sentiments"]
                if sentiments:
                    communication_breakdown[comm_type]["average_sentiment"] = sum(sentiments) / len(sentiments)
                else:
                    communication_breakdown[comm_type]["average_sentiment"] = 0.0
            
            # Generate insights
            insights = await self._generate_sentiment_insights(
                valid_sentiments, communication_details, user_id
            )
            
            return {
                "user_id": user_id,
                "analysis_period": {
                    "start": time_range[0].isoformat() if time_range else None,
                    "end": time_range[1].isoformat() if time_range else None
                },
                "overall_sentiment": {
                    "score": overall_score,
                    "label": self._score_to_label(overall_score)
                },
                "sentiment_distribution": sentiment_distribution,
                "communication_breakdown": communication_breakdown,
                "communication_details": communication_details,
                "insights": insights,
                "metadata": {
                    "total_communications": len(communications),
                    "analyzed_communications": len(valid_sentiments),
                    "analysis_timestamp": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error analyzing communication sentiment for user {user_id}: {str(e)}")
            raise

    async def generate_content(
        self,
        user_id: int,
        content_type: str,
        context: Dict[str, Any],
        style_preferences: Optional[Dict[str, Any]] = None,
        length: str = "medium"
    ) -> Dict[str, Any]:
        """
        Generate AI-powered content based on context and preferences
        
        Args:
            user_id: User identifier
            content_type: Type of content to generate (email, message, document, etc.)
            context: Context information for content generation
            style_preferences: User's style preferences
            length: Desired content length (short, medium, long)
            
        Returns:
            Generated content with metadata and alternatives
        """
        try:
            # Get user context and preferences
            user_context = await self._get_user_context(user_id)
            
            # Build content generation prompt
            prompt = await self._build_content_prompt(
                content_type, context, user_context, style_preferences, length
            )
            
            # Generate primary content
            generated_content = await self._generate_ai_content(user_id, prompt)
            
            # Generate alternative versions
            alternatives = await self._generate_content_alternatives(
                user_id, prompt, generated_content, num_alternatives=2
            )
            
            # Analyze generated content
            content_analysis = await self._analyze_generated_content(generated_content)
            
            # Generate improvement suggestions
            suggestions = await self._generate_content_suggestions(
                generated_content, content_type, user_context
            )
            
            return {
                "user_id": user_id,
                "content_type": content_type,
                "generated_content": generated_content,
                "alternatives": alternatives,
                "analysis": content_analysis,
                "suggestions": suggestions,
                "metadata": {
                    "generation_timestamp": datetime.now().isoformat(),
                    "prompt_tokens": len(prompt.split()),
                    "content_length": len(generated_content),
                    "style_applied": style_preferences is not None
                }
            }
            
        except Exception as e:
            logger.error(f"Error generating content for user {user_id}: {str(e)}")
            raise

    async def provide_intelligent_suggestions(
        self,
        user_id: int,
        current_content: str,
        context: Dict[str, Any],
        suggestion_types: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Provide intelligent content suggestions and improvements
        
        Args:
            user_id: User identifier
            current_content: Current content to improve
            context: Context information
            suggestion_types: Types of suggestions to provide
            
        Returns:
            Intelligent suggestions and improvements
        """
        try:
            if suggestion_types is None:
                suggestion_types = ["completion", "improvement", "alternatives"]
            
            suggestions = {}
            
            # Content completion suggestions
            if "completion" in suggestion_types:
                completion_suggestions = await self._generate_completion_suggestions(
                    user_id, current_content, context
                )
                suggestions["completion"] = completion_suggestions
            
            # Content improvement suggestions
            if "improvement" in suggestion_types:
                improvement_suggestions = await self._generate_improvement_suggestions(
                    user_id, current_content, context
                )
                suggestions["improvement"] = improvement_suggestions
            
            # Alternative phrasings
            if "alternatives" in suggestion_types:
                alternative_suggestions = await self._generate_alternative_suggestions(
                    user_id, current_content, context
                )
                suggestions["alternatives"] = alternative_suggestions
            
            # Analyze current content
            content_analysis = await self._analyze_text_comprehensive(current_content)
            
            # Generate contextual recommendations
            contextual_recommendations = await self._generate_contextual_recommendations(
                user_id, current_content, context, content_analysis
            )
            
            return {
                "user_id": user_id,
                "current_content_analysis": content_analysis,
                "suggestions": suggestions,
                "contextual_recommendations": contextual_recommendations,
                "metadata": {
                    "suggestion_timestamp": datetime.now().isoformat(),
                    "content_length": len(current_content),
                    "suggestion_types": suggestion_types
                }
            }
            
        except Exception as e:
            logger.error(f"Error providing intelligent suggestions for user {user_id}: {str(e)}")
            raise

    async def personalize_content(
        self,
        user_id: int,
        content: str,
        personalization_level: str = "medium",
        target_audience: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Personalize content based on user behavior and preferences
        
        Args:
            user_id: User identifier
            content: Content to personalize
            personalization_level: Level of personalization (low, medium, high)
            target_audience: Target audience for the content
            
        Returns:
            Personalized content with personalization metrics
        """
        try:
            # Get user behavioral data
            user_behavior = await self._get_user_behavioral_data(user_id)
            
            # Analyze user communication style
            communication_style = await self._analyze_user_communication_style(user_id)
            
            # Determine personalization strategy
            personalization_strategy = self._determine_personalization_strategy(
                user_behavior, communication_style, personalization_level, target_audience
            )
            
            # Apply personalization
            personalized_content = await self._apply_personalization(
                content, personalization_strategy, user_behavior, communication_style
            )
            
            # Calculate personalization score
            personalization_score = await self._calculate_personalization_score(
                content, personalized_content, personalization_strategy
            )
            
            return {
                "user_id": user_id,
                "original_content": content,
                "personalized_content": personalized_content,
                "personalization_strategy": personalization_strategy,
                "personalization_score": personalization_score,
                "metrics": {
                    "personalization_level": personalization_level,
                    "target_audience": target_audience,
                    "content_change_percentage": self._calculate_content_change_percentage(
                        content, personalized_content
                    ),
                    "style_alignment_score": communication_style.get("alignment_score", 0.0)
                },
                "metadata": {
                    "personalization_timestamp": datetime.now().isoformat(),
                    "behavioral_data_points": len(user_behavior.get("data_points", [])),
                    "communication_samples": len(communication_style.get("samples", []))
                }
            }
            
        except Exception as e:
            logger.error(f"Error personalizing content for user {user_id}: {str(e)}")
            raise

    # Helper Methods Implementation
    
    async def _analyze_message(self, message: str, user_id: int) -> Dict[str, Any]:
        """Analyze a single message for sentiment, topics, and entities"""
        try:
            # Analyze sentiment
            sentiment = await self._analyze_text_sentiment(message)
            
            # Extract topics
            topics = await self._extract_text_topics(message)
            
            # Detect language
            language = await self._detect_language(message)
            
            # Extract entities (basic)
            entities = await self._extract_basic_entities(message)
            
            return {
                "sentiment": sentiment,
                "topics": topics,
                "language": language,
                "entities": entities,
                "word_count": len(message.split()),
                "character_count": len(message)
            }
            
        except Exception as e:
            logger.error(f"Error analyzing message: {str(e)}")
            return {
                "sentiment": {"score": 0.0, "label": "neutral"},
                "topics": [],
                "language": "en",
                "entities": [],
                "word_count": len(message.split()),
                "character_count": len(message)
            }

    async def _analyze_text_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment of text using AI"""
        try:
            prompt = f"""
            Analyze the sentiment of the following text and provide a score between -1.0 (very negative) and 1.0 (very positive), along with a label (positive, negative, or neutral).
            
            Text: "{text}"
            
            Respond with JSON format:
            {{"score": 0.0, "label": "neutral", "confidence": 0.0}}
            """
            
            response = await self.ai_integration_service.make_request(
                api_key="your-api-key",  # This should be retrieved from user settings
                base_url="https://api.openai.com/v1",
                endpoint="chat/completions",
                payload={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 100,
                    "temperature": 0.1
                }
            )
            
            content = response.get("choices", [{}])[0].get("message", {}).get("content", "{}")
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                return {"score": 0.0, "label": "neutral", "confidence": 0.0}
                
        except Exception as e:
            logger.error(f"Error analyzing text sentiment: {str(e)}")
            return {"score": 0.0, "label": "neutral", "confidence": 0.0}

    async def _extract_text_topics(self, text: str, max_topics: int = 5) -> List[str]:
        """Extract main topics from text"""
        try:
            prompt = f"""
            Extract the main topics from the following text. Return up to {max_topics} topics as a JSON array of strings.
            
            Text: "{text}"
            
            Respond with JSON format:
            ["topic1", "topic2", "topic3"]
            """
            
            response = await self.ai_integration_service.make_request(
                api_key="your-api-key",  # This should be retrieved from user settings
                base_url="https://api.openai.com/v1",
                endpoint="chat/completions",
                payload={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 150,
                    "temperature": 0.1
                }
            )
            
            content = response.get("choices", [{}])[0].get("message", {}).get("content", "[]")
            try:
                return json.loads(content)
            except json.JSONDecodeError:
                return []
                
        except Exception as e:
            logger.error(f"Error extracting topics: {str(e)}")
            return []

    async def _detect_language(self, text: str) -> str:
        """Detect the language of the text"""
        try:
            prompt = f"""
            Detect the language of the following text and return the ISO 639-1 language code (e.g., 'en' for English, 'es' for Spanish).
            
            Text: "{text[:200]}..."
            
            Respond with only the language code.
            """
            
            response = await self.ai_integration_service.make_request(
                api_key="your-api-key",  # This should be retrieved from user settings
                base_url="https://api.openai.com/v1",
                endpoint="chat/completions",
                payload={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 10,
                    "temperature": 0.1
                }
            )
            
            content = response.get("choices", [{}])[0].get("message", {}).get("content", "en").strip().lower()
            return content if content in self.supported_languages else "en"
                
        except Exception as e:
            logger.error(f"Error detecting language: {str(e)}")
            return "en"

    async def _generate_document_summary(self, content: str, max_length: int = 200) -> str:
        """Generate a summary of document content"""
        try:
            prompt = f"""
            Summarize the following document content in approximately {max_length} characters or less. Focus on the main points and key information.
            
            Content: "{content}"
            
            Summary:
            """
            
            response = await self.ai_integration_service.make_request(
                api_key="your-api-key",  # This should be retrieved from user settings
                base_url="https://api.openai.com/v1",
                endpoint="chat/completions",
                payload={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": max_length // 3,
                    "temperature": 0.3
                }
            )
            
            return response.get("choices", [{}])[0].get("message", {}).get("content", "Summary generation failed").strip()
                
        except Exception as e:
            logger.error(f"Error generating document summary: {str(e)}")
            return "Summary generation failed"

    async def _analyze_document_sentiment(self, content: str) -> Dict[str, Any]:
        """Analyze sentiment of document content"""
        return await self._analyze_text_sentiment(content)

    async def _extract_document_topics(self, content: str) -> List[str]:
        """Extract topics from document content"""
        return await self._extract_text_topics(content, max_topics=10)

    async def _extract_key_points(self, content: str) -> List[str]:
        """Extract key points from document content"""
        try:
            prompt = f"""
            Extract the key points from the following document content. Return up to 10 key points as a JSON array of strings.
            
            Content: "{content}"
            
            Respond with JSON format:
            ["key point 1", "key point 2", "key point 3"]
            """
            
            response = await self.ai_integration_service.make_request(
                api_key="your-api-key",  # This should be retrieved from user settings
                base_url="https://api.openai.com/v1",
                endpoint="chat/completions",
                payload={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 300,
                    "temperature": 0.1
                }
            )
            
            content_response = response.get("choices", [{}])[0].get("message", {}).get("content", "[]")
            try:
                return json.loads(content_response)
            except json.JSONDecodeError:
                return []
                
        except Exception as e:
            logger.error(f"Error extracting key points: {str(e)}")
            return []

    async def _extract_entities(self, content: str) -> List[Dict[str, Any]]:
        """Extract entities from content"""
        try:
            prompt = f"""
            Extract named entities from the following content. Return entities with their types as a JSON array.
            
            Content: "{content}"
            
            Respond with JSON format:
            [{{"entity": "entity name", "type": "PERSON|ORGANIZATION|LOCATION|DATE|OTHER", "confidence": 0.9}}]
            """
            
            response = await self.ai_integration_service.make_request(
                api_key="your-api-key",  # This should be retrieved from user settings
                base_url="https://api.openai.com/v1",
                endpoint="chat/completions",
                payload={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 200,
                    "temperature": 0.1
                }
            )
            
            content_response = response.get("choices", [{}])[0].get("message", {}).get("content", "[]")
            try:
                return json.loads(content_response)
            except json.JSONDecodeError:
                return []
                
        except Exception as e:
            logger.error(f"Error extracting entities: {str(e)}")
            return []

    async def _extract_action_items(self, content: str) -> List[str]:
        """Extract action items from content"""
        try:
            prompt = f"""
            Extract action items or tasks from the following content. Return up to 10 action items as a JSON array of strings.
            
            Content: "{content}"
            
            Respond with JSON format:
            ["action item 1", "action item 2", "action item 3"]
            """
            
            response = await self.ai_integration_service.make_request(
                api_key="your-api-key",  # This should be retrieved from user settings
                base_url="https://api.openai.com/v1",
                endpoint="chat/completions",
                payload={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 200,
                    "temperature": 0.1
                }
            )
            
            content_response = response.get("choices", [{}])[0].get("message", {}).get("content", "[]")
            try:
                return json.loads(content_response)
            except json.JSONDecodeError:
                return []
                
        except Exception as e:
            logger.error(f"Error extracting action items: {str(e)}")
            return []

    async def _extract_basic_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract basic entities from text"""
        try:
            entities = []
            
            # Email addresses
            email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
            emails = re.findall(email_pattern, text)
            for email in emails:
                entities.append({"entity": email, "type": "EMAIL", "confidence": 0.9})
            
            # URLs
            url_pattern = r'http[s]?://(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+'
            urls = re.findall(url_pattern, text)
            for url in urls:
                entities.append({"entity": url, "type": "URL", "confidence": 0.9})
            
            # Phone numbers (basic pattern)
            phone_pattern = r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
            phones = re.findall(phone_pattern, text)
            for phone in phones:
                entities.append({"entity": phone, "type": "PHONE", "confidence": 0.8})
            
            return entities
                
        except Exception as e:
            logger.error(f"Error extracting basic entities: {str(e)}")
            return []

    def _calculate_readability_score(self, text: str) -> float:
        """Calculate readability score for text"""
        try:
            sentences = len(re.split(r'[.!?]+', text))
            words = len(text.split())
            characters = len(text.replace(' ', ''))
            
            if sentences == 0 or words == 0:
                return 0.0
            
            avg_sentence_length = words / sentences
            avg_word_length = characters / words
            
            # Simplified readability score (0-100, higher is more readable)
            readability = max(0.0, 100.0 - (avg_sentence_length * 2) - (avg_word_length * 5))
            return min(100.0, readability)
            
        except Exception as e:
            logger.error(f"Error calculating readability score: {str(e)}")
            return 0.0

    def _score_to_label(self, score: float) -> str:
        """Convert sentiment score to label"""
        if score > 0.1:
            return "positive"
        elif score < -0.1:
            return "negative"
        else:
            return "neutral"

    def _calculate_sentiment_trend(self, sentiment_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate sentiment trend from history"""
        try:
            if len(sentiment_history) < 2:
                return {"trend": "stable", "change": 0.0}
            
            recent_scores = [s["sentiment"]["score"] for s in sentiment_history[-5:] if isinstance(s.get("sentiment"), dict)]
            
            if len(recent_scores) < 2:
                return {"trend": "stable", "change": 0.0}
            
            change = recent_scores[-1] - recent_scores[0]
            
            if change > 0.1:
                trend = "improving"
            elif change < -0.1:
                trend = "declining"
            else:
                trend = "stable"
            
            return {"trend": trend, "change": change}
            
        except Exception as e:
            logger.error(f"Error calculating sentiment trend: {str(e)}")
            return {"trend": "stable", "change": 0.0}

    async def _generate_context_summary(self, context: ConversationContext) -> str:
        """Generate a summary of conversation context"""
        try:
            if not context.messages:
                return "No conversation history available"
            
            recent_messages = context.messages[-5:]  # Last 5 messages
            message_content = "\n".join([f"{msg['type']}: {msg['content']}" for msg in recent_messages])
            
            prompt = f"""
            Summarize the following conversation context in 2-3 sentences:
            
            {message_content}
            
            Summary:
            """
            
            response = await self.ai_integration_service.make_request(
                api_key="your-api-key",  # This should be retrieved from user settings
                base_url="https://api.openai.com/v1",
                endpoint="chat/completions",
                payload={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": prompt}],
                    "max_tokens": 100,
                    "temperature": 0.3
                }
            )
            
            return response.get("choices", [{}])[0].get("message", {}).get("content", "Context summary unavailable").strip()
            
        except Exception as e:
            logger.error(f"Error generating context summary: {str(e)}")
            return "Context summary unavailable"

    async def _generate_conversation_insights(self, context: ConversationContext) -> Dict[str, Any]:
        """Generate insights from conversation context"""
        try:
            insights = {
                "dominant_topics": context.topics[:3],
                "message_count": len(context.messages),
                "conversation_duration": "calculated_separately",
                "sentiment_summary": "neutral",
                "engagement_level": "medium"
            }
            
            # Calculate sentiment summary
            if context.sentiment_history:
                avg_sentiment = sum(s["sentiment"]["score"] for s in context.sentiment_history if isinstance(s.get("sentiment"), dict)) / len(context.sentiment_history)
                insights["sentiment_summary"] = self._score_to_label(avg_sentiment)
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating conversation insights: {str(e)}")
            return {"error": "Failed to generate insights"}

    async def _generate_sentiment_insights(self, sentiments: List[Dict[str, Any]], details: List[Dict[str, Any]], user_id: int) -> Dict[str, Any]:
        """Generate insights from sentiment analysis"""
        try:
            insights = {
                "overall_trend": "stable",
                "dominant_sentiment": "neutral",
                "sentiment_consistency": "medium",
                "recommendations": []
            }
            
            if sentiments:
                avg_score = sum(s["score"] for s in sentiments) / len(sentiments)
                insights["dominant_sentiment"] = self._score_to_label(avg_score)
                
                # Calculate consistency
                scores = [s["score"] for s in sentiments]
                variance = sum((x - avg_score) ** 2 for x in scores) / len(scores)
                if variance < 0.1:
                    insights["sentiment_consistency"] = "high"
                elif variance > 0.3:
                    insights["sentiment_consistency"] = "low"
                else:
                    insights["sentiment_consistency"] = "medium"
            
            return insights
            
        except Exception as e:
            logger.error(f"Error generating sentiment insights: {str(e)}")
            return {"error": "Failed to generate sentiment insights"}

    # Placeholder methods for content generation and personalization
    # These would be implemented with full AI integration in production
    
    async def _get_user_context(self, user_id: int) -> Dict[str, Any]:
        """Get user context for content generation"""
        return {"user_id": user_id, "preferences": {}, "history": []}

    async def _build_content_prompt(self, content_type: str, context: Dict[str, Any], user_context: Dict[str, Any], style_preferences: Optional[Dict[str, Any]], length: str) -> str:
        """Build prompt for content generation"""
        return f"Generate {content_type} content with {length} length based on context: {context}"

    async def _generate_ai_content(self, user_id: int, prompt: str) -> str:
        """Generate AI content"""
        return "Generated content placeholder"

    async def _generate_content_alternatives(self, user_id: int, prompt: str, content: str, num_alternatives: int) -> List[str]:
        """Generate alternative content versions"""
        return [f"Alternative {i+1}" for i in range(num_alternatives)]

    async def _analyze_generated_content(self, content: str) -> Dict[str, Any]:
        """Analyze generated content"""
        return {"quality_score": 0.8, "readability": 0.7, "engagement": 0.6}

    async def _generate_content_suggestions(self, content: str, content_type: str, user_context: Dict[str, Any]) -> List[str]:
        """Generate content improvement suggestions"""
        return ["Suggestion 1", "Suggestion 2", "Suggestion 3"]

    async def _generate_completion_suggestions(self, user_id: int, content: str, context: Dict[str, Any]) -> List[str]:
        """Generate content completion suggestions"""
        return ["Completion 1", "Completion 2", "Completion 3"]

    async def _generate_improvement_suggestions(self, user_id: int, content: str, context: Dict[str, Any]) -> List[str]:
        """Generate content improvement suggestions"""
        return ["Improvement 1", "Improvement 2", "Improvement 3"]

    async def _generate_alternative_suggestions(self, user_id: int, content: str, context: Dict[str, Any]) -> List[str]:
        """Generate alternative content suggestions"""
        return ["Alternative 1", "Alternative 2", "Alternative 3"]

    async def _analyze_text_comprehensive(self, content: str) -> Dict[str, Any]:
        """Comprehensive text analysis"""
        return {"quality": 0.8, "clarity": 0.7, "engagement": 0.6}

    async def _generate_contextual_recommendations(self, user_id: int, content: str, context: Dict[str, Any], analysis: Dict[str, Any]) -> List[str]:
        """Generate contextual recommendations"""
        return ["Recommendation 1", "Recommendation 2", "Recommendation 3"]

    async def _get_user_behavioral_data(self, user_id: int) -> Dict[str, Any]:
        """Get user behavioral data"""
        return {"data_points": [], "patterns": {}}

    async def _analyze_user_communication_style(self, user_id: int) -> Dict[str, Any]:
        """Analyze user communication style"""
        return {"style": "professional", "tone": "neutral", "alignment_score": 0.8, "samples": []}

    def _determine_personalization_strategy(self, user_behavior: Dict[str, Any], communication_style: Dict[str, Any], level: str, audience: Optional[str]) -> Dict[str, Any]:
        """Determine personalization strategy"""
        return {"strategy": "adaptive", "level": level, "audience": audience}

    async def _apply_personalization(self, content: str, strategy: Dict[str, Any], behavior: Dict[str, Any], style: Dict[str, Any]) -> str:
        """Apply personalization to content"""
        return f"Personalized: {content}"

    async def _calculate_personalization_score(self, original: str, personalized: str, strategy: Dict[str, Any]) -> float:
        """Calculate personalization effectiveness score"""
        return 0.85

    def _calculate_content_change_percentage(self, original: str, modified: str) -> float:
        """Calculate percentage of content that was changed"""
        if not original:
            return 0.0
        
        original_words = set(original.split())
        modified_words = set(modified.split())
        
        if not original_words:
            return 0.0
        
        changed_words = original_words.symmetric_difference(modified_words)
        return (len(changed_words) / len(original_words)) * 100.0