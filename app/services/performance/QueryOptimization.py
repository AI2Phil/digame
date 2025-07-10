"""
Advanced Query Optimization Service for Production-Scale Performance
Implements database query caching, connection pooling, and performance monitoring
"""

import asyncio
import time
import logging
from typing import Dict, List, Any, Optional, Tuple, Union
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from collections import defaultdict, deque
import hashlib
import json
import redis
from sqlalchemy import text, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import QueuePool
import psutil
import threading
from contextlib import contextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class QueryMetrics:
    """Metrics for database query performance"""
    query_hash: str
    execution_time: float
    rows_returned: int
    cache_hit: bool
    timestamp: datetime
    connection_pool_size: int
    active_connections: int
    query_plan: Optional[str] = None
    parameters: Optional[Dict] = None

@dataclass
class ConnectionPoolMetrics:
    """Metrics for database connection pool"""
    pool_size: int
    checked_out: int
    overflow: int
    checked_in: int
    total_connections: int
    failed_connections: int
    connection_creation_time: float
    average_checkout_time: float

@dataclass
class CacheMetrics:
    """Metrics for query result caching"""
    total_queries: int
    cache_hits: int
    cache_misses: int
    cache_size: int
    evictions: int
    hit_rate: float
    average_retrieval_time: float

class QueryCache:
    """Advanced query result caching with Redis backend"""
    
    def __init__(self, redis_client: redis.Redis, default_ttl: int = 300):
        self.redis_client = redis_client
        self.default_ttl = default_ttl
        self.metrics = CacheMetrics(0, 0, 0, 0, 0, 0.0, 0.0)
        self._lock = threading.Lock()
    
    def _generate_cache_key(self, query: str, params: Optional[Dict] = None) -> str:
        """Generate a unique cache key for query and parameters"""
        query_normalized = ' '.join(query.split())  # Normalize whitespace
        params_str = json.dumps(params or {}, sort_keys=True)
        combined = f"{query_normalized}:{params_str}"
        return f"query_cache:{hashlib.md5(combined.encode()).hexdigest()}"
    
    async def get(self, query: str, params: Optional[Dict] = None) -> Optional[Any]:
        """Retrieve cached query result"""
        start_time = time.time()
        cache_key = self._generate_cache_key(query, params)
        
        try:
            cached_result = await self.redis_client.get(cache_key)
            retrieval_time = time.time() - start_time
            
            with self._lock:
                self.metrics.total_queries += 1
                if cached_result:
                    self.metrics.cache_hits += 1
                    result = json.loads(cached_result)
                    logger.debug(f"Cache hit for query: {cache_key[:20]}...")
                else:
                    self.metrics.cache_misses += 1
                    result = None
                    logger.debug(f"Cache miss for query: {cache_key[:20]}...")
                
                # Update metrics
                self.metrics.hit_rate = (self.metrics.cache_hits / self.metrics.total_queries) * 100
                self.metrics.average_retrieval_time = (
                    (self.metrics.average_retrieval_time * (self.metrics.total_queries - 1) + retrieval_time) 
                    / self.metrics.total_queries
                )
            
            return result
            
        except Exception as e:
            logger.error(f"Cache retrieval error: {e}")
            return None
    
    async def set(self, query: str, result: Any, params: Optional[Dict] = None, ttl: Optional[int] = None) -> bool:
        """Cache query result"""
        cache_key = self._generate_cache_key(query, params)
        ttl = ttl or self.default_ttl
        
        try:
            serialized_result = json.dumps(result, default=str)
            await self.redis_client.setex(cache_key, ttl, serialized_result)
            
            with self._lock:
                self.metrics.cache_size = await self.redis_client.dbsize()
            
            logger.debug(f"Cached result for query: {cache_key[:20]}... (TTL: {ttl}s)")
            return True
            
        except Exception as e:
            logger.error(f"Cache storage error: {e}")
            return False
    
    async def invalidate_pattern(self, pattern: str) -> int:
        """Invalidate cache entries matching pattern"""
        try:
            keys = await self.redis_client.keys(f"query_cache:*{pattern}*")
            if keys:
                deleted = await self.redis_client.delete(*keys)
                logger.info(f"Invalidated {deleted} cache entries matching pattern: {pattern}")
                return deleted
            return 0
        except Exception as e:
            logger.error(f"Cache invalidation error: {e}")
            return 0
    
    def get_metrics(self) -> CacheMetrics:
        """Get current cache metrics"""
        with self._lock:
            return self.metrics

class ConnectionPoolManager:
    """Advanced database connection pool management"""
    
    def __init__(self, engine: Engine):
        self.engine = engine
        self.metrics = ConnectionPoolMetrics(0, 0, 0, 0, 0, 0, 0.0, 0.0)
        self.checkout_times = deque(maxlen=1000)  # Track last 1000 checkouts
        self._setup_pool_monitoring()
    
    def _setup_pool_monitoring(self):
        """Setup connection pool event monitoring"""
        
        @event.listens_for(self.engine, "connect")
        def on_connect(dbapi_connection, connection_record):
            self.metrics.total_connections += 1
            logger.debug("New database connection established")
        
        @event.listens_for(self.engine, "checkout")
        def on_checkout(dbapi_connection, connection_record, connection_proxy):
            start_time = time.time()
            connection_record._checkout_start = start_time
            self.metrics.checked_out += 1
        
        @event.listens_for(self.engine, "checkin")
        def on_checkin(dbapi_connection, connection_record):
            if hasattr(connection_record, '_checkout_start'):
                checkout_time = time.time() - connection_record._checkout_start
                self.checkout_times.append(checkout_time)
                
                # Update average checkout time
                if self.checkout_times:
                    self.metrics.average_checkout_time = sum(self.checkout_times) / len(self.checkout_times)
                
                delattr(connection_record, '_checkout_start')
            
            self.metrics.checked_in += 1
    
    def get_pool_status(self) -> ConnectionPoolMetrics:
        """Get current connection pool status"""
        pool = self.engine.pool
        
        # Use getattr with defaults for pool attributes
        pool_obj = getattr(pool, '_pool', None)
        self.metrics.pool_size = pool_obj.qsize() if pool_obj and hasattr(pool_obj, 'qsize') else 0
        self.metrics.checked_out = getattr(pool, '_checked_out', 0)
        self.metrics.overflow = getattr(pool, '_overflow', 0)
        self.metrics.checked_in = self.metrics.pool_size - self.metrics.checked_out
        
        return self.metrics
    
    def optimize_pool_settings(self) -> Dict[str, Any]:
        """Analyze and suggest pool optimization settings"""
        metrics = self.get_pool_status()
        cpu_count = psutil.cpu_count()
        memory_gb = psutil.virtual_memory().total / (1024**3)
        
        suggestions: Dict[str, Any] = {
            "current_pool_size": metrics.pool_size,
            "current_overflow": metrics.overflow,
            "suggested_pool_size": min((cpu_count or 4) * 2, 20),  # Conservative estimate
            "suggested_max_overflow": cpu_count or 4,
            "suggested_pool_timeout": 30,
            "suggested_pool_recycle": 3600,  # 1 hour
            "reasoning": []
        }
        reasoning_list: List[str] = suggestions["reasoning"]
        
        # Analyze utilization
        utilization = (metrics.checked_out / metrics.pool_size) * 100 if metrics.pool_size > 0 else 0
        
        if utilization > 80:
            reasoning_list.append("High pool utilization detected - consider increasing pool size")
            suggestions["suggested_pool_size"] = min(metrics.pool_size + 5, 30)
        
        if metrics.overflow > 0:
            reasoning_list.append("Pool overflow detected - consider increasing base pool size")
        
        if self.metrics.average_checkout_time > 1.0:
            reasoning_list.append("High average checkout time - consider optimizing queries or increasing pool size")
        
        return suggestions

class QueryAnalyzer:
    """Advanced query performance analysis and optimization"""
    
    def __init__(self, session: Session):
        self.session = session
        self.query_metrics: Dict[str, List[QueryMetrics]] = defaultdict(list)
        self.slow_query_threshold = 1.0  # 1 second
        self._lock = threading.Lock()
    
    def _generate_query_hash(self, query: str) -> str:
        """Generate hash for query identification"""
        # Normalize query by removing extra whitespace and parameters
        normalized = ' '.join(query.split())
        return hashlib.md5(normalized.encode()).hexdigest()[:16]
    
    async def analyze_query(self, query: str, params: Optional[Dict] = None) -> QueryMetrics:
        """Analyze query performance and collect metrics"""
        query_hash = self._generate_query_hash(query)
        start_time = time.time()
        
        try:
            # Execute EXPLAIN for query plan
            explain_query = f"EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) {query}"
            explain_result = self.session.execute(text(explain_query), params or {})
            query_plan_row = explain_result.fetchone()
            query_plan = query_plan_row[0] if query_plan_row else None
            
            # Execute actual query
            result = self.session.execute(text(query), params or {})
            rows = result.fetchall()
            execution_time = time.time() - start_time
            
            # Create metrics
            metrics = QueryMetrics(
                query_hash=query_hash,
                execution_time=execution_time,
                rows_returned=len(rows),
                cache_hit=False,
                timestamp=datetime.now(),
                connection_pool_size=0,  # Will be updated by pool manager
                active_connections=0,    # Will be updated by pool manager
                query_plan=query_plan,
                parameters=params
            )
            
            # Store metrics
            with self._lock:
                self.query_metrics[query_hash].append(metrics)
                # Keep only last 100 executions per query
                if len(self.query_metrics[query_hash]) > 100:
                    self.query_metrics[query_hash] = self.query_metrics[query_hash][-100:]
            
            # Log slow queries
            if execution_time > self.slow_query_threshold:
                logger.warning(f"Slow query detected: {query_hash} took {execution_time:.2f}s")
                await self._analyze_slow_query(query, metrics)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Query analysis error: {e}")
            raise
    
    async def _analyze_slow_query(self, query: str, metrics: QueryMetrics):
        """Analyze slow query and suggest optimizations"""
        suggestions = []
        
        if metrics.query_plan:
            plan_data = json.loads(metrics.query_plan) if isinstance(metrics.query_plan, str) else metrics.query_plan
            
            # Check for sequential scans
            if self._has_sequential_scan(plan_data):
                suggestions.append("Consider adding indexes for sequential scans")
            
            # Check for high cost operations
            if self._has_high_cost_operations(plan_data):
                suggestions.append("High-cost operations detected - consider query optimization")
            
            # Check for large result sets
            if metrics.rows_returned > 10000:
                suggestions.append("Large result set - consider pagination or filtering")
        
        if suggestions:
            logger.info(f"Query optimization suggestions for {metrics.query_hash}: {suggestions}")
    
    def _has_sequential_scan(self, plan_data: Dict) -> bool:
        """Check if query plan contains sequential scans"""
        def check_node(node):
            if isinstance(node, dict):
                if node.get("Node Type") == "Seq Scan":
                    return True
                for child in node.get("Plans", []):
                    if check_node(child):
                        return True
            return False
        
        return check_node(plan_data)
    
    def _has_high_cost_operations(self, plan_data: Dict, threshold: float = 1000.0) -> bool:
        """Check if query plan has high-cost operations"""
        def check_cost(node):
            if isinstance(node, dict):
                total_cost = node.get("Total Cost", 0)
                if total_cost > threshold:
                    return True
                for child in node.get("Plans", []):
                    if check_cost(child):
                        return True
            return False
        
        return check_cost(plan_data)
    
    def get_query_statistics(self, query_hash: Optional[str] = None) -> Dict[str, Any]:
        """Get comprehensive query statistics"""
        with self._lock:
            if query_hash:
                metrics_list = self.query_metrics.get(query_hash, [])
            else:
                metrics_list = [m for metrics in self.query_metrics.values() for m in metrics]
        
        if not metrics_list:
            return {}
        
        total_queries = len(metrics_list)
        total_time = sum(m.execution_time for m in metrics_list)
        avg_time = total_time / total_queries
        slow_queries = [m for m in metrics_list if m.execution_time > self.slow_query_threshold]
        
        return {
            "total_queries": total_queries,
            "average_execution_time": avg_time,
            "total_execution_time": total_time,
            "slow_queries_count": len(slow_queries),
            "slow_queries_percentage": (len(slow_queries) / total_queries) * 100,
            "fastest_query": min(m.execution_time for m in metrics_list),
            "slowest_query": max(m.execution_time for m in metrics_list),
            "total_rows_returned": sum(m.rows_returned for m in metrics_list),
            "cache_hit_rate": (sum(1 for m in metrics_list if m.cache_hit) / total_queries) * 100
        }

class DatabaseOptimizer:
    """Main database optimization coordinator"""
    
    def __init__(self, engine: Engine, redis_client: redis.Redis):
        self.engine = engine
        self.cache = QueryCache(redis_client)
        self.pool_manager = ConnectionPoolManager(engine)
        self.query_analyzer: Optional[QueryAnalyzer] = None  # Will be set per session
        self.optimization_rules = self._load_optimization_rules()
    
    def _load_optimization_rules(self) -> Dict[str, Any]:
        """Load query optimization rules"""
        return {
            "cache_ttl_rules": {
                "SELECT": 300,      # 5 minutes for SELECT queries
                "COUNT": 600,       # 10 minutes for COUNT queries
                "AGGREGATE": 900,   # 15 minutes for aggregate queries
            },
            "cache_patterns": {
                "user_profiles": 1800,    # 30 minutes
                "system_config": 3600,    # 1 hour
                "static_data": 7200,      # 2 hours
            },
            "optimization_thresholds": {
                "slow_query_time": 1.0,
                "large_result_set": 10000,
                "high_cpu_usage": 80.0,
                "high_memory_usage": 85.0,
            }
        }
    
    @contextmanager
    def optimized_session(self):
        """Context manager for optimized database session"""
        session = Session(self.engine)
        self.query_analyzer = QueryAnalyzer(session)
        
        try:
            yield session
        finally:
            session.close()
    
    async def execute_optimized_query(
        self,
        session: Session,
        query: str,
        params: Optional[Dict] = None,
        cache_ttl: Optional[int] = None,
        force_cache: bool = False
    ) -> Tuple[List[Any], QueryMetrics]:
        """Execute query with optimization and caching"""
        
        # Check cache first
        if not force_cache:
            cached_result = await self.cache.get(query, params)
            if cached_result is not None:
                metrics = QueryMetrics(
                    query_hash=self.query_analyzer._generate_query_hash(query) if self.query_analyzer else "",
                    execution_time=0.0,
                    rows_returned=len(cached_result),
                    cache_hit=True,
                    timestamp=datetime.now(),
                    connection_pool_size=self.pool_manager.metrics.pool_size,
                    active_connections=self.pool_manager.metrics.checked_out
                )
                return cached_result, metrics
        
        # Execute query with analysis
        if not self.query_analyzer:
            raise ValueError("Query analyzer not initialized")
        metrics = await self.query_analyzer.analyze_query(query, params)
        result = session.execute(text(query), params or {}).fetchall()
        
        # Convert result to serializable format
        serializable_result = [dict(row._mapping) for row in result]
        
        # Cache result based on query type and rules
        if self._should_cache_query(query, metrics):
            ttl = cache_ttl or self._determine_cache_ttl(query)
            await self.cache.set(query, serializable_result, params, ttl)
        
        return serializable_result, metrics
    
    def _should_cache_query(self, query: str, metrics: QueryMetrics) -> bool:
        """Determine if query result should be cached"""
        query_upper = query.upper().strip()
        
        # Don't cache if query modifies data
        if any(keyword in query_upper for keyword in ['INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER']):
            return False
        
        # Don't cache very fast queries (overhead not worth it)
        if metrics.execution_time < 0.1:
            return False
        
        # Don't cache very large result sets
        if metrics.rows_returned > self.optimization_rules["optimization_thresholds"]["large_result_set"]:
            return False
        
        return True
    
    def _determine_cache_ttl(self, query: str) -> int:
        """Determine appropriate cache TTL for query"""
        query_upper = query.upper()
        
        # Check for specific patterns
        for pattern, ttl in self.optimization_rules["cache_patterns"].items():
            if pattern.upper() in query_upper:
                return ttl
        
        # Check for query types
        if "COUNT(" in query_upper:
            return self.optimization_rules["cache_ttl_rules"]["COUNT"]
        elif any(func in query_upper for func in ["SUM(", "AVG(", "MAX(", "MIN(", "GROUP BY"]):
            return self.optimization_rules["cache_ttl_rules"]["AGGREGATE"]
        else:
            return self.optimization_rules["cache_ttl_rules"]["SELECT"]
    
    async def optimize_database_performance(self) -> Dict[str, Any]:
        """Comprehensive database performance optimization"""
        optimization_report = {
            "timestamp": datetime.now().isoformat(),
            "pool_optimization": {},
            "cache_optimization": {},
            "query_optimization": {},
            "system_metrics": {},
            "recommendations": []
        }
        
        # Analyze connection pool
        pool_suggestions = self.pool_manager.optimize_pool_settings()
        optimization_report["pool_optimization"] = pool_suggestions
        
        # Analyze cache performance
        cache_metrics = self.cache.get_metrics()
        optimization_report["cache_optimization"] = {
            "hit_rate": cache_metrics.hit_rate,
            "total_queries": cache_metrics.total_queries,
            "cache_size": cache_metrics.cache_size,
            "recommendations": self._generate_cache_recommendations(cache_metrics)
        }
        
        # Analyze query performance
        if self.query_analyzer:
            query_stats = self.query_analyzer.get_query_statistics()
            optimization_report["query_optimization"] = query_stats
        
        # System metrics
        optimization_report["system_metrics"] = {
            "cpu_usage": psutil.cpu_percent(),
            "memory_usage": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent,
            "active_connections": self.pool_manager.metrics.checked_out
        }
        
        # Generate recommendations
        optimization_report["recommendations"] = self._generate_optimization_recommendations(optimization_report)
        
        return optimization_report
    
    def _generate_cache_recommendations(self, metrics: CacheMetrics) -> List[str]:
        """Generate cache optimization recommendations"""
        recommendations = []
        
        if metrics.hit_rate < 50:
            recommendations.append("Low cache hit rate - consider increasing cache TTL or reviewing caching strategy")
        
        if metrics.cache_size > 100000:  # Arbitrary threshold
            recommendations.append("Large cache size - consider implementing cache eviction policies")
        
        if metrics.average_retrieval_time > 0.1:
            recommendations.append("High cache retrieval time - consider optimizing Redis configuration")
        
        return recommendations
    
    def _generate_optimization_recommendations(self, report: Dict[str, Any]) -> List[str]:
        """Generate comprehensive optimization recommendations"""
        recommendations = []
        
        # System-level recommendations
        if report["system_metrics"]["cpu_usage"] > 80:
            recommendations.append("High CPU usage detected - consider scaling database resources")
        
        if report["system_metrics"]["memory_usage"] > 85:
            recommendations.append("High memory usage detected - consider optimizing queries or adding memory")
        
        # Pool recommendations
        if report["pool_optimization"]["reasoning"]:
            recommendations.extend(report["pool_optimization"]["reasoning"])
        
        # Cache recommendations
        if report["cache_optimization"]["recommendations"]:
            recommendations.extend(report["cache_optimization"]["recommendations"])
        
        # Query recommendations
        query_stats = report.get("query_optimization", {})
        if query_stats.get("slow_queries_percentage", 0) > 10:
            recommendations.append("High percentage of slow queries - review and optimize query performance")
        
        return recommendations

# Example usage and testing
async def example_usage():
    """Example of how to use the query optimization system"""
    import redis
    from sqlalchemy import create_engine
    
    # Setup
    engine = create_engine("postgresql://user:pass@localhost/db", poolclass=QueuePool)
    redis_client = redis.Redis(host='localhost', port=6379, db=0)
    
    optimizer = DatabaseOptimizer(engine, redis_client)
    
    # Use optimized session
    with optimizer.optimized_session() as session:
        # Execute optimized query
        result, metrics = await optimizer.execute_optimized_query(
            session,
            "SELECT * FROM users WHERE active = :active",
            {"active": True},
            cache_ttl=300
        )
        
        print(f"Query executed in {metrics.execution_time:.2f}s")
        print(f"Cache hit: {metrics.cache_hit}")
        print(f"Rows returned: {metrics.rows_returned}")
    
    # Get optimization report
    report = await optimizer.optimize_database_performance()
    print("Optimization Report:", json.dumps(report, indent=2, default=str))

if __name__ == "__main__":
    asyncio.run(example_usage())