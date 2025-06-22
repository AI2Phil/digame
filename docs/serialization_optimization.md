# Serialization Optimization Guide

## Overview

This document provides comprehensive strategies for optimizing data serialization and deserialization in the Digame platform to improve API response times, reduce bandwidth usage, and enhance overall performance.

## Current Serialization Stack

The platform currently uses:
- **Pydantic**: For request/response validation and serialization
- **FastAPI**: Built-in JSON serialization
- **SQLAlchemy**: ORM with automatic model serialization

## Optimization Strategies

### 1. Faster JSON Libraries

#### Replace Default JSON with orjson

**Installation:**
```bash
pip install orjson
```

**Implementation:**

Create `digame/app/core/json_encoder.py`:

```python
import orjson
from fastapi.responses import JSONResponse
from typing import Any

class ORJSONResponse(JSONResponse):
    """Custom JSON response using orjson for better performance"""
    
    media_type = "application/json"

    def render(self, content: Any) -> bytes:
        assert orjson is not None, "orjson must be installed"
        return orjson.dumps(
            content,
            option=orjson.OPT_NON_STR_KEYS | orjson.OPT_SERIALIZE_NUMPY
        )
```

**Update FastAPI app:**

```python
from fastapi import FastAPI
from digame.app.core.json_encoder import ORJSONResponse

app = FastAPI(
    title="Digame API",
    version="1.0.0",
    default_response_class=ORJSONResponse
)
```

**Performance Benefits:**
- 2-3x faster than standard json
- 20-30% memory reduction
- Better datetime handling

### 2. Field Selection and Partial Responses

#### Implement Field Selection

Create `digame/app/core/field_selector.py`:

```python
from typing import Set, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import Query

class FieldSelector:
    """Utility for selecting specific fields in API responses"""
    
    @staticmethod
    def parse_fields(fields: Optional[str] = None) -> Optional[Set[str]]:
        """Parse comma-separated field list"""
        if not fields:
            return None
        return set(field.strip() for field in fields.split(',') if field.strip())
    
    @staticmethod
    def filter_dict(data: Dict[str, Any], fields: Optional[Set[str]]) -> Dict[str, Any]:
        """Filter dictionary to include only specified fields"""
        if not fields:
            return data
        return {k: v for k, v in data.items() if k in fields}
    
    @staticmethod
    def filter_model(model: BaseModel, fields: Optional[Set[str]]) -> Dict[str, Any]:
        """Filter Pydantic model to include only specified fields"""
        data = model.dict()
        return FieldSelector.filter_dict(data, fields)

# Usage in endpoints
@router.get("/users/me/profile")
async def get_user_profile(
    fields: Optional[str] = Query(None, description="Comma-separated list of fields to include"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user profile with optional field selection"""
    
    user_profile = get_user_profile_service(db, current_user.id)
    selected_fields = FieldSelector.parse_fields(fields)
    
    if selected_fields:
        return FieldSelector.filter_model(user_profile, selected_fields)
    
    return user_profile
```

### 3. Response Compression

#### Enable GZip Compression

```python
from fastapi.middleware.gzip import GZipMiddleware

app.add_middleware(GZipMiddleware, minimum_size=1000)
```

#### Custom Compression Middleware

```python
import gzip
import brotli
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

class CompressionMiddleware(BaseHTTPMiddleware):
    """Advanced compression middleware supporting multiple algorithms"""
    
    def __init__(self, app, minimum_size: int = 500):
        super().__init__(app)
        self.minimum_size = minimum_size
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Skip compression for small responses
        if not hasattr(response, 'body') or len(response.body) < self.minimum_size:
            return response
        
        # Check Accept-Encoding header
        accept_encoding = request.headers.get('accept-encoding', '')
        
        if 'br' in accept_encoding:
            # Use Brotli compression (better compression ratio)
            compressed_body = brotli.compress(response.body)
            response.headers['content-encoding'] = 'br'
        elif 'gzip' in accept_encoding:
            # Use GZip compression
            compressed_body = gzip.compress(response.body)
            response.headers['content-encoding'] = 'gzip'
        else:
            return response
        
        response.headers['content-length'] = str(len(compressed_body))
        response.body = compressed_body
        
        return response
```

### 4. Lazy Loading and Pagination

#### Implement Cursor-based Pagination

```python
from typing import Optional, List, Generic, TypeVar
from pydantic import BaseModel
from sqlalchemy.orm import Query

T = TypeVar('T')

class CursorPaginationParams(BaseModel):
    """Cursor-based pagination parameters"""
    cursor: Optional[str] = None
    limit: int = 20
    direction: str = "forward"  # forward or backward

class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response with cursor information"""
    items: List[T]
    next_cursor: Optional[str] = None
    previous_cursor: Optional[str] = None
    has_next: bool = False
    has_previous: bool = False
    total_count: Optional[int] = None

class CursorPaginator:
    """Efficient cursor-based pagination"""
    
    @staticmethod
    def paginate(
        query: Query,
        cursor_field: str,
        params: CursorPaginationParams,
        include_total: bool = False
    ) -> PaginatedResponse:
        """Apply cursor-based pagination to query"""
        
        # Apply cursor filtering
        if params.cursor:
            if params.direction == "forward":
                query = query.filter(getattr(query.column_descriptions[0]['entity'], cursor_field) > params.cursor)
            else:
                query = query.filter(getattr(query.column_descriptions[0]['entity'], cursor_field) < params.cursor)
        
        # Get one extra item to check if there's a next page
        items = query.limit(params.limit + 1).all()
        
        has_next = len(items) > params.limit
        if has_next:
            items = items[:-1]  # Remove the extra item
        
        # Generate cursors
        next_cursor = None
        previous_cursor = None
        
        if items:
            if has_next:
                next_cursor = str(getattr(items[-1], cursor_field))
            if params.cursor:
                previous_cursor = str(getattr(items[0], cursor_field))
        
        total_count = None
        if include_total:
            total_count = query.count()
        
        return PaginatedResponse(
            items=items,
            next_cursor=next_cursor,
            previous_cursor=previous_cursor,
            has_next=has_next,
            has_previous=params.cursor is not None,
            total_count=total_count
        )
```

### 5. Selective Model Loading

#### Implement Partial Model Loading

```python
from sqlalchemy.orm import load_only, selectinload, joinedload

class OptimizedUserService:
    """User service with optimized queries"""
    
    def get_user_profile_minimal(self, db: Session, user_id: int):
        """Get user profile with minimal fields"""
        return db.query(User).options(
            load_only(User.id, User.username, User.email, User.full_name)
        ).filter(User.id == user_id).first()
    
    def get_user_with_goals(self, db: Session, user_id: int):
        """Get user with goals using efficient loading"""
        return db.query(User).options(
            selectinload(User.goals).load_only(
                Goal.id, Goal.title, Goal.status, Goal.target_date
            )
        ).filter(User.id == user_id).first()
    
    def get_users_for_listing(self, db: Session, limit: int = 20):
        """Get users optimized for listing views"""
        return db.query(User).options(
            load_only(
                User.id, User.username, User.full_name, 
                User.profile_picture_url, User.experience_level
            )
        ).limit(limit).all()
```

### 6. Caching Serialized Responses

#### Redis-based Response Caching

```python
import json
import hashlib
from typing import Any, Optional
from digame.app.core.redis_client import get_redis_client

class ResponseCache:
    """Cache for serialized API responses"""
    
    def __init__(self, default_ttl: int = 300):  # 5 minutes
        self.redis = get_redis_client()
        self.default_ttl = default_ttl
    
    def _generate_cache_key(self, endpoint: str, params: dict) -> str:
        """Generate cache key from endpoint and parameters"""
        key_data = f"{endpoint}:{json.dumps(params, sort_keys=True)}"
        return f"response_cache:{hashlib.md5(key_data.encode()).hexdigest()}"
    
    async def get_cached_response(self, endpoint: str, params: dict) -> Optional[dict]:
        """Get cached response"""
        cache_key = self._generate_cache_key(endpoint, params)
        cached_data = await self.redis.get(cache_key)
        
        if cached_data:
            return json.loads(cached_data)
        return None
    
    async def cache_response(
        self, 
        endpoint: str, 
        params: dict, 
        response_data: Any, 
        ttl: Optional[int] = None
    ):
        """Cache response data"""
        cache_key = self._generate_cache_key(endpoint, params)
        ttl = ttl or self.default_ttl
        
        await self.redis.setex(
            cache_key, 
            ttl, 
            json.dumps(response_data, default=str)
        )
    
    async def invalidate_pattern(self, pattern: str):
        """Invalidate cache entries matching pattern"""
        keys = await self.redis.keys(f"response_cache:*{pattern}*")
        if keys:
            await self.redis.delete(*keys)

# Usage in endpoints
response_cache = ResponseCache()

@router.get("/users/{user_id}/goals")
async def get_user_goals(
    user_id: int,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get user goals with response caching"""
    
    cache_params = {"user_id": user_id, "status": status}
    
    # Try to get from cache
    cached_response = await response_cache.get_cached_response("user_goals", cache_params)
    if cached_response:
        return cached_response
    
    # Get from database
    goals = get_user_goals_service(db, user_id, status)
    response_data = [goal.dict() for goal in goals]
    
    # Cache the response
    await response_cache.cache_response("user_goals", cache_params, response_data, ttl=600)
    
    return response_data
```

### 7. Alternative Serialization Formats

#### Protocol Buffers (protobuf)

```python
# For high-performance APIs, consider protobuf
from google.protobuf.json_format import MessageToDict, ParseDict
import user_pb2  # Generated from .proto file

class ProtobufSerializer:
    """Protobuf serialization for high-performance endpoints"""
    
    @staticmethod
    def serialize_user(user_data: dict) -> bytes:
        """Serialize user data to protobuf"""
        user_proto = user_pb2.User()
        ParseDict(user_data, user_proto)
        return user_proto.SerializeToString()
    
    @staticmethod
    def deserialize_user(data: bytes) -> dict:
        """Deserialize protobuf to user data"""
        user_proto = user_pb2.User()
        user_proto.ParseFromString(data)
        return MessageToDict(user_proto)
```

#### MessagePack

```python
import msgpack
from fastapi.responses import Response

class MessagePackResponse(Response):
    """MessagePack response for binary efficiency"""
    
    media_type = "application/msgpack"
    
    def __init__(self, content: Any, **kwargs):
        content = msgpack.packb(content, use_bin_type=True)
        super().__init__(content, **kwargs)

# Usage
@router.get("/users/bulk", response_class=MessagePackResponse)
async def get_users_bulk(db: Session = Depends(get_db)):
    """Get users in MessagePack format for efficiency"""
    users = get_all_users_service(db)
    return [user.dict() for user in users]
```

### 8. Performance Monitoring

#### Serialization Performance Metrics

```python
import time
from functools import wraps
from digame.app.monitoring.metrics import track_performance

def track_serialization_performance(func):
    """Decorator to track serialization performance"""
    
    @wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        result = await func(*args, **kwargs)
        
        serialization_time = time.time() - start_time
        
        # Track metrics
        track_performance("serialization", {
            "endpoint": func.__name__,
            "duration": serialization_time,
            "response_size": len(str(result)) if result else 0
        })
        
        return result
    
    return wrapper

# Usage
@track_serialization_performance
@router.get("/users/me/profile")
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get user profile with performance tracking"""
    return current_user.dict()
```

## Best Practices

### 1. Choose the Right Strategy
- **Small responses**: Field selection and compression
- **Large datasets**: Pagination and lazy loading
- **High-frequency endpoints**: Response caching
- **Real-time data**: Streaming responses

### 2. Performance Testing
- Benchmark different JSON libraries
- Test compression ratios and CPU usage
- Monitor memory consumption
- Measure end-to-end response times

### 3. Monitoring and Optimization
- Track serialization performance metrics
- Monitor cache hit rates
- Analyze response size distributions
- Set up alerts for performance degradation

### 4. Implementation Guidelines
- Start with orjson for immediate gains
- Implement field selection for large models
- Use caching for expensive computations
- Consider alternative formats for bulk operations

This comprehensive serialization optimization guide provides multiple strategies to significantly improve API performance and reduce bandwidth usage in the Digame platform.
