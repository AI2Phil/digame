"""
Performance Optimization Service
Provides caching, async processing, and database query optimization
"""

import asyncio
import json
import hashlib
from typing import Any, Dict, List, Optional, Callable, Union
from datetime import datetime, timedelta
from functools import wraps
import logging
from concurrent.futures import ThreadPoolExecutor
import time

# Redis for caching (in production)
try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False

from sqlalchemy.orm import Session
from sqlalchemy import text

logger = logging.getLogger(__name__)


class CacheService:
    """
    Caching service with Redis backend and in-memory fallback
    """
    
    def __init__(self, redis_url: Optional[str] = None):
        self.redis_client = None
        self.memory_cache: Dict[str, Dict[str, Any]] = {}
        self.cache_stats = {
            "hits": 0,
            "misses": 0,
            "sets": 0,
            "deletes": 0
        }
        
        if REDIS_AVAILABLE and redis_url:
            try:
                self.redis_client = redis.from_url(redis_url, decode_responses=True)  # type: ignore
                self.redis_client.ping()  # type: ignore
                logger.info("Redis cache initialized successfully")
            except Exception as e:
                logger.warning(f"Redis connection failed, using memory cache: {e}")
                self.redis_client = None
        else:
            logger.info("Using in-memory cache (Redis not available)")
    
    def _generate_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate cache key from prefix and arguments"""
        key_data = f"{prefix}:{':'.join(map(str, args))}"
        if kwargs:
            key_data += f":{json.dumps(kwargs, sort_keys=True)}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    async def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            if self.redis_client:
                value = await asyncio.get_event_loop().run_in_executor(
                    None, self.redis_client.get, key  # type: ignore
                )
                if value:
                    self.cache_stats["hits"] += 1
                    return json.loads(value)
            else:
                # Memory cache
                cache_entry = self.memory_cache.get(key)
                if cache_entry and cache_entry["expires_at"] > datetime.utcnow():
                    self.cache_stats["hits"] += 1
                    return cache_entry["value"]
                elif cache_entry:
                    # Expired entry
                    del self.memory_cache[key]
            
            self.cache_stats["misses"] += 1
            return None
            
        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            self.cache_stats["misses"] += 1
            return None
    
    async def set(self, key: str, value: Any, ttl: int = 3600) -> bool:
        """Set value in cache with TTL in seconds"""
        try:
            if self.redis_client:
                serialized = json.dumps(value, default=str)
                await asyncio.get_event_loop().run_in_executor(
                    None, self.redis_client.setex, key, ttl, serialized  # type: ignore
                )
            else:
                # Memory cache
                self.memory_cache[key] = {
                    "value": value,
                    "expires_at": datetime.utcnow() + timedelta(seconds=ttl)
                }
                
                # Simple cleanup of expired entries
                if len(self.memory_cache) > 1000:
                    self._cleanup_memory_cache()
            
            self.cache_stats["sets"] += 1
            return True
            
        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")
            return False
    
    async def delete(self, key: str) -> bool:
        """Delete value from cache"""
        try:
            if self.redis_client:
                await asyncio.get_event_loop().run_in_executor(
                    None, self.redis_client.delete, key  # type: ignore
                )
            else:
                self.memory_cache.pop(key, None)
            
            self.cache_stats["deletes"] += 1
            return True
            
        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")
            return False
    
    async def clear_pattern(self, pattern: str) -> int:
        """Clear all keys matching pattern"""
        try:
            if self.redis_client:
                keys = await asyncio.get_event_loop().run_in_executor(
                    None, self.redis_client.keys, pattern  # type: ignore
                )
                if keys:
                    await asyncio.get_event_loop().run_in_executor(
                        None, self.redis_client.delete, *keys  # type: ignore
                    )
                return len(keys)
            else:
                # Memory cache pattern matching
                keys_to_delete = [k for k in self.memory_cache.keys() if pattern in k]
                for key in keys_to_delete:
                    del self.memory_cache[key]
                return len(keys_to_delete)
                
        except Exception as e:
            logger.error(f"Cache clear pattern error for {pattern}: {e}")
            return 0
    
    def _cleanup_memory_cache(self):
        """Clean up expired entries from memory cache"""
        now = datetime.utcnow()
        expired_keys = [
            k for k, v in self.memory_cache.items()
            if v["expires_at"] <= now
        ]
        for key in expired_keys:
            del self.memory_cache[key]
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        total_requests = self.cache_stats["hits"] + self.cache_stats["misses"]
        hit_rate = (self.cache_stats["hits"] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            **self.cache_stats,
            "hit_rate_percent": round(float(hit_rate), 2),
            "total_requests": total_requests,
            "cache_type": "redis" if self.redis_client else "memory",
            "memory_cache_size": len(self.memory_cache) if not self.redis_client else None
        }


class AsyncTaskProcessor:
    """
    Async task processing service for background operations
    """
    
    def __init__(self, max_workers: int = 4):
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        self.task_queue: List[Dict[str, Any]] = []
        self.running_tasks: Dict[str, asyncio.Task] = {}
        self.task_results: Dict[str, Any] = {}
        self.task_stats = {
            "submitted": 0,
            "completed": 0,
            "failed": 0,
            "running": 0
        }
    
    async def submit_task(
        self,
        task_id: str,
        func: Callable,
        *args,
        priority: int = 1,
        **kwargs
    ) -> str:
        """Submit a task for async processing"""
        task_info = {
            "task_id": task_id,
            "func": func,
            "args": args,
            "kwargs": kwargs,
            "priority": priority,
            "submitted_at": datetime.utcnow(),
            "status": "queued"
        }
        
        self.task_queue.append(task_info)
        self.task_queue.sort(key=lambda x: x["priority"], reverse=True)
        self.task_stats["submitted"] += 1
        
        # Start processing if not already running
        if task_id not in self.running_tasks:
            self.running_tasks[task_id] = asyncio.create_task(
                self._process_task(task_info)
            )
        
        return task_id
    
    async def _process_task(self, task_info: Dict[str, Any]) -> Any:
        """Process a single task"""
        task_id = task_info["task_id"]
        
        try:
            task_info["status"] = "running"
            task_info["started_at"] = datetime.utcnow()
            self.task_stats["running"] += 1
            
            # Execute the task
            if asyncio.iscoroutinefunction(task_info["func"]):
                result = await task_info["func"](*task_info["args"], **task_info["kwargs"])
            else:
                result = await asyncio.get_event_loop().run_in_executor(
                    self.executor,
                    task_info["func"],
                    *task_info["args"],
                    **task_info["kwargs"]
                )
            
            # Store result
            self.task_results[task_id] = {
                "status": "completed",
                "result": result,
                "completed_at": datetime.utcnow(),
                "duration": (datetime.utcnow() - task_info["started_at"]).total_seconds()
            }
            
            self.task_stats["completed"] += 1
            self.task_stats["running"] -= 1
            
            return result
            
        except Exception as e:
            logger.error(f"Task {task_id} failed: {e}")
            
            self.task_results[task_id] = {
                "status": "failed",
                "error": str(e),
                "failed_at": datetime.utcnow()
            }
            
            self.task_stats["failed"] += 1
            self.task_stats["running"] -= 1
            
            raise
        
        finally:
            # Clean up
            if task_id in self.running_tasks:
                del self.running_tasks[task_id]
    
    async def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """Get status of a task"""
        if task_id in self.task_results:
            return self.task_results[task_id]
        
        if task_id in self.running_tasks:
            return {"status": "running"}
        
        # Check queue
        for task in self.task_queue:
            if task["task_id"] == task_id:
                return {"status": "queued", "submitted_at": task["submitted_at"]}
        
        return None
    
    async def wait_for_task(self, task_id: str, timeout: Optional[float] = None) -> Any:
        """Wait for a task to complete and return result"""
        if task_id in self.running_tasks:
            try:
                await asyncio.wait_for(self.running_tasks[task_id], timeout=timeout)
            except asyncio.TimeoutError:
                raise TimeoutError(f"Task {task_id} timed out")
        
        result = self.task_results.get(task_id)
        if result:
            if result["status"] == "completed":
                return result["result"]
            elif result["status"] == "failed":
                raise Exception(f"Task failed: {result['error']}")
        
        raise ValueError(f"Task {task_id} not found")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get task processing statistics"""
        return {
            **self.task_stats,
            "queue_size": len(self.task_queue),
            "active_tasks": len(self.running_tasks),
            "completed_tasks": len([r for r in self.task_results.values() if r["status"] == "completed"]),
            "failed_tasks": len([r for r in self.task_results.values() if r["status"] == "failed"])
        }


class DatabaseOptimizer:
    """
    Database query optimization service
    """
    
    def __init__(self):
        self.query_stats: Dict[str, Dict[str, Any]] = {}
        self.slow_query_threshold = 1.0  # seconds
    
    def track_query(self, query_id: str, execution_time: float, query: str):
        """Track query performance"""
        if query_id not in self.query_stats:
            self.query_stats[query_id] = {
                "query": query,
                "executions": 0,
                "total_time": 0,
                "min_time": float('inf'),
                "max_time": 0,
                "slow_executions": 0
            }
        
        stats = self.query_stats[query_id]
        stats["executions"] += 1
        stats["total_time"] += execution_time
        stats["min_time"] = min(stats["min_time"], execution_time)
        stats["max_time"] = max(stats["max_time"], execution_time)
        
        if execution_time > self.slow_query_threshold:
            stats["slow_executions"] += 1
    
    def get_slow_queries(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get slowest queries"""
        queries = []
        for query_id, stats in self.query_stats.items():
            avg_time = stats["total_time"] / stats["executions"]
            queries.append({
                "query_id": query_id,
                "query": stats["query"][:200] + "..." if len(stats["query"]) > 200 else stats["query"],
                "executions": stats["executions"],
                "avg_time": round(avg_time, 4),
                "max_time": round(stats["max_time"], 4),
                "slow_executions": stats["slow_executions"],
                "slow_percentage": round(stats["slow_executions"] / stats["executions"] * 100, 2)
            })
        
        return sorted(queries, key=lambda x: x["avg_time"], reverse=True)[:limit]
    
    async def optimize_query(self, db: Session, query: str) -> Dict[str, Any]:
        """Analyze and suggest optimizations for a query"""
        try:
            # Get query execution plan
            explain_query = f"EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) {query}"
            result = db.execute(text(explain_query)).fetchone()  # type: ignore
            
            if result:
                plan = result[0][0] if result[0] else {}  # JSON result with safe access
                
                suggestions = []
                
                # Analyze execution plan with safe access
                plan_str = str(plan) if plan else ""
                if "Seq Scan" in plan_str:
                    suggestions.append("Consider adding indexes for sequential scans")
                
                execution_time = plan.get("Execution Time", 0) if isinstance(plan, dict) else 0
                if execution_time > 100:
                    suggestions.append("Query execution time is high, consider optimization")
                
                return {
                    "execution_plan": plan,
                    "suggestions": suggestions,
                    "execution_time": plan.get("Execution Time", 0) if isinstance(plan, dict) else 0
                }
            
        except Exception as e:
            logger.error(f"Query optimization error: {e}")
            return {"error": str(e)}
        
        return {"error": "Could not analyze query"}


# Decorators for caching and performance monitoring

def cached(ttl: int = 3600, key_prefix: str = "cache"):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            cache_service = CacheService()
            cache_key = cache_service._generate_key(key_prefix, func.__name__, *args, **kwargs)
            
            # Try to get from cache
            cached_result = await cache_service.get(cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            if asyncio.iscoroutinefunction(func):
                result = await func(*args, **kwargs)
            else:
                result = func(*args, **kwargs)
            
            await cache_service.set(cache_key, result, ttl)
            return result
        
        return wrapper
    return decorator


def monitor_performance(track_db_queries: bool = False):
    """Decorator for monitoring function performance"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            
            try:
                if asyncio.iscoroutinefunction(func):
                    result = await func(*args, **kwargs)
                else:
                    result = func(*args, **kwargs)
                
                execution_time = time.time() - start_time
                
                # Log slow operations
                if execution_time > 1.0:
                    logger.warning(f"Slow operation: {func.__name__} took {execution_time:.2f}s")
                
                return result
                
            except Exception as e:
                execution_time = time.time() - start_time
                logger.error(f"Function {func.__name__} failed after {execution_time:.2f}s: {e}")
                raise
        
        return wrapper
    return decorator


# Global instances
cache_service = CacheService()
task_processor = AsyncTaskProcessor()
db_optimizer = DatabaseOptimizer()