from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field

from ..database import get_db
from ..services.advanced_nlp_service import AdvancedNLPService, DocumentAnalysis
from ..services.ai_integration_service import AIIntegrationService
from ..services.behavior_service import BehaviorService

# Initialize router
router = APIRouter(prefix="/api/v1/advanced-nlp", tags=["Advanced NLP"])

# Pydantic models for request/response validation

class ConversationMessageRequest(BaseModel):
    """Request model for conversation message analysis"""
    user_id: int = Field(..., description="User identifier")
    conversation_id: str = Field(..., description="Conversation identifier")
    message: str = Field(..., description="Message content to analyze")
    message_type: str = Field(default="user", description="Type of message (user, assistant, system)")
    context_window: int = Field(default=10, description="Number of recent messages to maintain in context")

class DocumentAnalysisRequest(BaseModel):
    """Request model for document analysis"""
    document_content: str = Field(..., description="Document text to analyze")
    document_id: str = Field(..., description="Unique identifier for the document")
    analysis_type: str = Field(default="comprehensive", description="Type of analysis (basic, comprehensive, detailed)")
    language: Optional[str] = Field(None, description="Document language (auto-detected if not provided)")

class CommunicationSentimentRequest(BaseModel):
    """Request model for communication sentiment analysis"""
    communications: List[Dict[str, Any]] = Field(..., description="List of communication objects")
    user_id: int = Field(..., description="User identifier")
    start_time: Optional[datetime] = Field(None, description="Start time for analysis period")
    end_time: Optional[datetime] = Field(None, description="End time for analysis period")

class ContentGenerationRequest(BaseModel):
    """Request model for AI content generation"""
    user_id: int = Field(..., description="User identifier")
    content_type: str = Field(..., description="Type of content to generate (email, message, document, etc.)")
    context: Dict[str, Any] = Field(..., description="Context information for content generation")
    style_preferences: Optional[Dict[str, Any]] = Field(None, description="User's style preferences")
    length: str = Field(default="medium", description="Desired content length (short, medium, long)")

class IntelligentSuggestionsRequest(BaseModel):
    """Request model for intelligent content suggestions"""
    user_id: int = Field(..., description="User identifier")
    current_content: str = Field(..., description="Current content to improve")
    context: Dict[str, Any] = Field(..., description="Context information")
    suggestion_types: Optional[List[str]] = Field(None, description="Types of suggestions to provide")

class ContentPersonalizationRequest(BaseModel):
    """Request model for content personalization"""
    user_id: int = Field(..., description="User identifier")
    content: str = Field(..., description="Content to personalize")
    personalization_level: str = Field(default="medium", description="Level of personalization (low, medium, high)")
    target_audience: Optional[str] = Field(None, description="Target audience for the content")

class TextAnalysisRequest(BaseModel):
    """Request model for basic text analysis"""
    text: str = Field(..., description="Text to analyze")
    analysis_types: List[str] = Field(default=["sentiment", "topics", "language"], description="Types of analysis to perform")

# Response models

class ConversationAnalysisResponse(BaseModel):
    """Response model for conversation analysis"""
    conversation_id: str
    message_analysis: Dict[str, Any]
    context_summary: str
    current_topics: List[str]
    sentiment_trend: Dict[str, Any]
    insights: Dict[str, Any]
    metadata: Dict[str, Any]

class DocumentAnalysisResponse(BaseModel):
    """Response model for document analysis"""
    document_id: str
    summary: str
    sentiment_score: float
    sentiment_label: str
    topics: List[str]
    key_points: List[str]
    entities: List[Dict[str, Any]]
    action_items: List[str]
    readability_score: float
    word_count: int
    language: str
    confidence_score: float
    metadata: Dict[str, Any]

class SentimentAnalysisResponse(BaseModel):
    """Response model for sentiment analysis"""
    user_id: int
    analysis_period: Dict[str, Any]
    overall_sentiment: Dict[str, Any]
    sentiment_distribution: Dict[str, int]
    communication_breakdown: Dict[str, Any]
    communication_details: List[Dict[str, Any]]
    insights: Dict[str, Any]
    metadata: Dict[str, Any]

# Dependency to get NLP service
def get_nlp_service(db: Session = Depends(get_db)) -> AdvancedNLPService:
    """Get Advanced NLP Service instance"""
    ai_integration_service = AIIntegrationService(db)
    behavior_service = BehaviorService(db)
    return AdvancedNLPService(ai_integration_service, behavior_service)

# API Endpoints

@router.post("/conversation/analyze", response_model=ConversationAnalysisResponse)
async def analyze_conversation_message(
    request: ConversationMessageRequest,
    nlp_service: AdvancedNLPService = Depends(get_nlp_service)
):
    """
    Analyze a conversation message with advanced NLP capabilities
    
    This endpoint provides comprehensive analysis of conversation messages including:
    - Sentiment analysis
    - Topic extraction
    - Entity recognition
    - Language detection
    - Context management
    - Conversation insights
    """
    try:
        result = await nlp_service.manage_conversation(
            user_id=request.user_id,
            conversation_id=request.conversation_id,
            message=request.message,
            message_type=request.message_type,
            context_window=request.context_window
        )
        return ConversationAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing conversation message: {str(e)}"
        )

@router.post("/document/analyze", response_model=DocumentAnalysisResponse)
async def analyze_document(
    request: DocumentAnalysisRequest,
    nlp_service: AdvancedNLPService = Depends(get_nlp_service)
):
    """
    Perform comprehensive document analysis
    
    This endpoint provides detailed document analysis including:
    - Document summarization
    - Sentiment analysis
    - Topic extraction
    - Key point identification
    - Entity recognition (detailed analysis)
    - Action item extraction (detailed analysis)
    - Readability scoring
    - Language detection
    """
    try:
        result = await nlp_service.analyze_document(
            document_content=request.document_content,
            document_id=request.document_id,
            analysis_type=request.analysis_type,
            language=request.language
        )
        
        return DocumentAnalysisResponse(
            document_id=result.document_id,
            summary=result.summary,
            sentiment_score=result.sentiment_score,
            sentiment_label=result.sentiment_label,
            topics=result.topics,
            key_points=result.key_points,
            entities=result.entities,
            action_items=result.action_items,
            readability_score=result.readability_score,
            word_count=result.word_count,
            language=result.language,
            confidence_score=result.confidence_score,
            metadata=result.metadata
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing document: {str(e)}"
        )

@router.post("/sentiment/communications", response_model=SentimentAnalysisResponse)
async def analyze_communication_sentiment(
    request: CommunicationSentimentRequest,
    nlp_service: AdvancedNLPService = Depends(get_nlp_service)
):
    """
    Analyze sentiment across multiple communications
    
    This endpoint provides comprehensive sentiment analysis including:
    - Overall sentiment scoring
    - Sentiment distribution analysis
    - Communication type breakdown
    - Temporal sentiment trends
    - Sentiment insights and recommendations
    """
    try:
        time_range = None
        if request.start_time and request.end_time:
            time_range = (request.start_time, request.end_time)
        
        result = await nlp_service.analyze_communication_sentiment(
            communications=request.communications,
            user_id=request.user_id,
            time_range=time_range
        )
        return SentimentAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing communication sentiment: {str(e)}"
        )

@router.post("/content/generate")
async def generate_content(
    request: ContentGenerationRequest,
    nlp_service: AdvancedNLPService = Depends(get_nlp_service)
):
    """
    Generate AI-powered content based on context and preferences
    
    This endpoint provides intelligent content generation including:
    - Context-aware content creation
    - Style preference adaptation
    - Multiple content alternatives
    - Content quality analysis
    - Improvement suggestions
    """
    try:
        result = await nlp_service.generate_content(
            user_id=request.user_id,
            content_type=request.content_type,
            context=request.context,
            style_preferences=request.style_preferences,
            length=request.length
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating content: {str(e)}"
        )

@router.post("/suggestions/intelligent")
async def provide_intelligent_suggestions(
    request: IntelligentSuggestionsRequest,
    nlp_service: AdvancedNLPService = Depends(get_nlp_service)
):
    """
    Provide intelligent content suggestions and improvements
    
    This endpoint provides smart content assistance including:
    - Content completion suggestions
    - Improvement recommendations
    - Alternative phrasings
    - Contextual recommendations
    - Content quality analysis
    """
    try:
        result = await nlp_service.provide_intelligent_suggestions(
            user_id=request.user_id,
            current_content=request.current_content,
            context=request.context,
            suggestion_types=request.suggestion_types
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error providing intelligent suggestions: {str(e)}"
        )

@router.post("/content/personalize")
async def personalize_content(
    request: ContentPersonalizationRequest,
    nlp_service: AdvancedNLPService = Depends(get_nlp_service)
):
    """
    Personalize content based on user behavior and preferences
    
    This endpoint provides content personalization including:
    - Behavioral data analysis
    - Communication style adaptation
    - Personalization strategy determination
    - Content modification based on user patterns
    - Personalization effectiveness scoring
    """
    try:
        result = await nlp_service.personalize_content(
            user_id=request.user_id,
            content=request.content,
            personalization_level=request.personalization_level,
            target_audience=request.target_audience
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error personalizing content: {str(e)}"
        )

@router.post("/text/analyze")
async def analyze_text(
    request: TextAnalysisRequest,
    nlp_service: AdvancedNLPService = Depends(get_nlp_service)
):
    """
    Perform basic text analysis
    
    This endpoint provides fundamental text analysis including:
    - Sentiment analysis
    - Topic extraction
    - Language detection
    - Basic entity recognition
    - Text statistics
    """
    try:
        result: Dict[str, Any] = {}
        
        if "sentiment" in request.analysis_types:
            result["sentiment"] = await nlp_service._analyze_text_sentiment(request.text)
        
        if "topics" in request.analysis_types:
            result["topics"] = await nlp_service._extract_text_topics(request.text)
        
        if "language" in request.analysis_types:
            result["language"] = await nlp_service._detect_language(request.text)
        
        if "entities" in request.analysis_types:
            result["entities"] = await nlp_service._extract_basic_entities(request.text)
        
        # Add basic statistics
        result["statistics"] = {
            "word_count": len(request.text.split()),
            "character_count": len(request.text),
            "sentence_count": len([s for s in request.text.split('.') if s.strip()]),
            "readability_score": nlp_service._calculate_readability_score(request.text)
        }
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error analyzing text: {str(e)}"
        )

@router.get("/languages/supported")
async def get_supported_languages(
    nlp_service: AdvancedNLPService = Depends(get_nlp_service)
):
    """
    Get list of supported languages for NLP processing
    
    Returns the list of language codes supported by the advanced NLP service
    """
    return {
        "supported_languages": nlp_service.supported_languages,
        "total_count": len(nlp_service.supported_languages),
        "language_details": {
            "en": "English",
            "es": "Spanish", 
            "fr": "French",
            "de": "German",
            "it": "Italian",
            "pt": "Portuguese",
            "ru": "Russian",
            "zh": "Chinese",
            "ja": "Japanese",
            "ko": "Korean",
            "ar": "Arabic"
        }
    }

@router.get("/health")
async def health_check():
    """
    Health check endpoint for Advanced NLP service
    
    Returns the current status and capabilities of the NLP service
    """
    return {
        "status": "healthy",
        "service": "Advanced NLP Service",
        "version": "1.0.0",
        "capabilities": [
            "conversation_management",
            "document_analysis", 
            "sentiment_analysis",
            "content_generation",
            "intelligent_suggestions",
            "content_personalization",
            "multi_language_support"
        ],
        "timestamp": datetime.now().isoformat()
    }