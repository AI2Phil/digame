#!/usr/bin/env node

const { intelligentCacheManager } = require('../src/services/intelligentCacheManager');
const { cacheWarmingStrategies } = require('../src/services/cacheWarmingStrategies');

/**
 * Intelligent Cache CLI Tool
 * Command-line interface for advanced cache management and analytics
 */

const commands = {
    'analytics': {
        description: 'Get comprehensive cache analytics and performance metrics',
        execute: async () => {
            console.log('🔍 Retrieving intelligent cache analytics...\n');
            
            try {
                const analytics = await intelligentCacheManager.getCacheAnalytics();
                
                console.log('📊 INTELLIGENT CACHE ANALYTICS');
                console.log('================================');
                
                // Performance metrics
                console.log('\n🚀 Performance Metrics:');
                console.log(`   Warming Hits: ${analytics.performance.warmingHits}`);
                console.log(`   Predictive Hits: ${analytics.performance.predictiveHits}`);
                console.log(`   Pattern Matches: ${analytics.performance.patternMatches}`);
                console.log(`   Optimizations Saved: ${analytics.performance.optimizationsSaved}`);
                console.log(`   Intelligent Evictions: ${analytics.performance.intelligentEvictions}`);
                
                // Usage patterns
                console.log('\n🧠 Usage Patterns:');
                console.log(`   Total Keys Tracked: ${analytics.usagePatterns.totalKeys}`);
                console.log(`   Total Accesses: ${analytics.usagePatterns.totalAccesses}`);
                console.log(`   Average Frequency: ${analytics.usagePatterns.averageFrequency.toFixed(2)}`);
                
                // Top accessed keys
                if (analytics.usagePatterns.topKeys.length > 0) {
                    console.log('\n🔥 Top Accessed Keys:');
                    analytics.usagePatterns.topKeys.slice(0, 5).forEach((key, index) => {
                        console.log(`   ${index + 1}. ${key.key} (${key.frequency} accesses)`);
                    });
                }
                
                // Cache managers
                console.log('\n💾 Cache Managers Status:');
                for (const [type, status] of Object.entries(analytics.cacheManagers)) {
                    const health = status.status || 'unknown';
                    const icon = health === 'healthy' ? '✅' : health === 'degraded' ? '⚠️' : '❌';
                    console.log(`   ${icon} ${type}: ${health}`);
                    
                    if (status.performance) {
                        console.log(`      Hit Rate: ${status.performance.hitRate}`);
                        console.log(`      Total Requests: ${status.performance.totalRequests}`);
                    }
                }
                
                // Optimization status
                console.log('\n⚡ Auto-Optimization:');
                console.log(`   Enabled: ${analytics.optimization.enabled ? 'Yes' : 'No'}`);
                console.log(`   Optimizations Saved: ${analytics.optimization.optimizationsSaved}`);
                console.log(`   Last Optimization: ${analytics.optimization.lastOptimization}`);
                
                console.log('\n✅ Analytics retrieval completed successfully');
                
            } catch (error) {
                console.error('❌ Failed to retrieve analytics:', error.message);
                process.exit(1);
            }
        }
    },

    'health': {
        description: 'Check intelligent cache system health',
        execute: async () => {
            console.log('🏥 Checking intelligent cache health...\n');
            
            try {
                // Check all cache managers
                const healthChecks = [];
                for (const [type, manager] of Object.entries(intelligentCacheManager.cacheManagers)) {
                    try {
                        const health = await manager.healthCheck();
                        healthChecks.push({ type, health, status: 'healthy' });
                    } catch (error) {
                        healthChecks.push({ type, health: { error: error.message }, status: 'unhealthy' });
                    }
                }
                
                // Check warming strategies
                let strategyHealth;
                try {
                    strategyHealth = cacheWarmingStrategies.getStrategyStatus();
                } catch (error) {
                    strategyHealth = { error: error.message };
                }
                
                console.log('🏥 INTELLIGENT CACHE HEALTH REPORT');
                console.log('===================================');
                
                // Overall status
                const overallHealthy = healthChecks.every(check => check.status === 'healthy');
                console.log(`\n🎯 Overall Status: ${overallHealthy ? '✅ HEALTHY' : '❌ UNHEALTHY'}`);
                
                // Cache managers health
                console.log('\n💾 Cache Managers:');
                healthChecks.forEach(check => {
                    const icon = check.status === 'healthy' ? '✅' : '❌';
                    console.log(`   ${icon} ${check.type}: ${check.status}`);
                    
                    if (check.health.memory) {
                        console.log(`      Memory: ${check.health.memory.size}/${check.health.memory.capacity} items`);
                    }
                    
                    if (check.health.performance) {
                        console.log(`      Hit Rate: ${check.health.performance.hitRate}`);
                        console.log(`      Total Requests: ${check.health.performance.totalRequests}`);
                    }
                    
                    if (check.health.error) {
                        console.log(`      Error: ${check.health.error}`);
                    }
                });
                
                // Warming strategies health
                console.log('\n🔥 Warming Strategies:');
                if (strategyHealth.error) {
                    console.log(`   ❌ Error: ${strategyHealth.error}`);
                } else {
                    console.log(`   ✅ Total Strategies: ${strategyHealth.totalStrategies}`);
                    console.log(`   📊 Performance Metrics:`);
                    console.log(`      Total Warmings: ${strategyHealth.performanceMetrics.totalWarmings}`);
                    console.log(`      Successful: ${strategyHealth.performanceMetrics.successfulWarmings}`);
                    console.log(`      Average Time: ${strategyHealth.performanceMetrics.averageWarmingTime.toFixed(2)}ms`);
                }
                
                // Intelligent features
                console.log('\n🧠 Intelligent Features:');
                console.log(`   ✅ Usage Patterns: ${intelligentCacheManager.usagePatterns.size} keys tracked`);
                console.log(`   ✅ Access Frequency: ${intelligentCacheManager.accessFrequency.size} entries`);
                console.log(`   ✅ Auto-Tuning: ${intelligentCacheManager.autoTuning.enabled ? 'Enabled' : 'Disabled'}`);
                
                console.log('\n✅ Health check completed successfully');
                
            } catch (error) {
                console.error('❌ Health check failed:', error.message);
                process.exit(1);
            }
        }
    },

    'warm': {
        description: 'Execute cache warming strategy [strategy-name]',
        execute: async (strategyName) => {
            if (!strategyName) {
                console.log('❌ Strategy name required. Available strategies:');
                console.log('   - critical-data');
                console.log('   - user-behavior');
                console.log('   - analytics-reports');
                console.log('   - api-endpoints');
                console.log('   - predictive-content');
                console.log('   - peak-hours');
                process.exit(1);
            }
            
            console.log(`🔥 Executing warming strategy: ${strategyName}...\n`);
            
            try {
                const result = await cacheWarmingStrategies.executeStrategy(strategyName);
                
                console.log('🔥 CACHE WARMING RESULTS');
                console.log('========================');
                console.log(`Strategy: ${result.strategy}`);
                console.log(`Items Warmed: ${result.warmedCount}`);
                console.log(`Timestamp: ${result.timestamp}`);
                
                if (result.results && result.results.length > 0) {
                    console.log('\n📊 Detailed Results:');
                    result.results.forEach((res, index) => {
                        console.log(`   ${index + 1}. ${res.type}: ${res.count} items`);
                        if (res.ranges) {
                            console.log(`      Ranges: ${res.ranges.join(', ')}`);
                        }
                        if (res.endpoints) {
                            console.log(`      Endpoints: ${res.endpoints.slice(0, 3).join(', ')}${res.endpoints.length > 3 ? '...' : ''}`);
                        }
                    });
                }
                
                console.log('\n✅ Warming strategy executed successfully');
                
            } catch (error) {
                console.error('❌ Warming strategy failed:', error.message);
                process.exit(1);
            }
        }
    },

    'predictive': {
        description: 'Execute predictive cache warming',
        execute: async () => {
            console.log('🔮 Executing predictive cache warming...\n');
            
            try {
                const result = await intelligentCacheManager.predictiveWarmUp({
                    maxItems: 50,
                    minFrequency: 5,
                    timeWindow: 3600000 // 1 hour
                });
                
                console.log('🔮 PREDICTIVE WARMING RESULTS');
                console.log('=============================');
                console.log(`Items Warmed: ${result}`);
                console.log(`Timestamp: ${new Date().toISOString()}`);
                
                console.log('\n✅ Predictive warming completed successfully');
                
            } catch (error) {
                console.error('❌ Predictive warming failed:', error.message);
                process.exit(1);
            }
        }
    },

    'optimize': {
        description: 'Execute auto-optimization',
        execute: async () => {
            console.log('⚡ Executing auto-optimization...\n');
            
            try {
                const optimizations = await intelligentCacheManager.autoOptimize();
                
                console.log('⚡ AUTO-OPTIMIZATION RESULTS');
                console.log('============================');
                console.log(`Optimizations Applied: ${optimizations.length}`);
                console.log(`Timestamp: ${new Date().toISOString()}`);
                
                if (optimizations.length > 0) {
                    console.log('\n📊 Applied Optimizations:');
                    optimizations.forEach((opt, index) => {
                        console.log(`   ${index + 1}. ${opt.type || 'Optimization'}: ${opt.description || 'Applied'}`);
                    });
                }
                
                console.log('\n✅ Auto-optimization completed successfully');
                
            } catch (error) {
                console.error('❌ Auto-optimization failed:', error.message);
                process.exit(1);
            }
        }
    },

    'patterns': {
        description: 'View usage patterns and access analytics',
        execute: async () => {
            console.log('🧠 Retrieving usage patterns...\n');
            
            try {
                // Get usage patterns
                const patterns = Array.from(intelligentCacheManager.usagePatterns.entries())
                    .map(([key, pattern]) => ({
                        key,
                        pattern,
                        frequency: intelligentCacheManager.accessFrequency.get(key) || 0,
                        lastAccess: intelligentCacheManager.lastAccess.get(key) || 0
                    }))
                    .sort((a, b) => b.frequency - a.frequency)
                    .slice(0, 20); // Top 20
                
                console.log('🧠 USAGE PATTERNS ANALYSIS');
                console.log('===========================');
                
                console.log(`\n📊 Summary:`);
                console.log(`   Total Keys Tracked: ${intelligentCacheManager.usagePatterns.size}`);
                console.log(`   Total Access Frequency Entries: ${intelligentCacheManager.accessFrequency.size}`);
                
                const totalAccesses = Array.from(intelligentCacheManager.accessFrequency.values())
                    .reduce((sum, freq) => sum + freq, 0);
                console.log(`   Total Accesses: ${totalAccesses}`);
                
                if (patterns.length > 0) {
                    const avgFrequency = patterns.reduce((sum, p) => sum + p.frequency, 0) / patterns.length;
                    console.log(`   Average Frequency: ${avgFrequency.toFixed(2)}`);
                    
                    console.log('\n🔥 Top Accessed Keys:');
                    patterns.forEach((pattern, index) => {
                        const lastAccessTime = pattern.lastAccess > 0 
                            ? new Date(pattern.lastAccess).toLocaleString()
                            : 'Never';
                        
                        console.log(`   ${index + 1}. ${pattern.key}`);
                        console.log(`      Frequency: ${pattern.frequency}`);
                        console.log(`      Last Access: ${lastAccessTime}`);
                        
                        if (pattern.pattern && pattern.pattern.avgInterval > 0) {
                            console.log(`      Avg Interval: ${(pattern.pattern.avgInterval / 1000).toFixed(2)}s`);
                            console.log(`      Trend: ${pattern.pattern.trend}`);
                        }
                        console.log('');
                    });
                } else {
                    console.log('\n📝 No usage patterns found. Start using the cache to see patterns develop.');
                }
                
                console.log('✅ Usage patterns analysis completed');
                
            } catch (error) {
                console.error('❌ Failed to retrieve patterns:', error.message);
                process.exit(1);
            }
        }
    },

    'strategies': {
        description: 'List available warming strategies and their status',
        execute: async () => {
            console.log('🔥 Retrieving warming strategies...\n');
            
            try {
                const strategyStatus = cacheWarmingStrategies.getStrategyStatus();
                
                console.log('🔥 WARMING STRATEGIES STATUS');
                console.log('============================');
                
                console.log(`\n📊 Overview:`);
                console.log(`   Total Strategies: ${strategyStatus.totalStrategies}`);
                console.log(`   Total Warmings: ${strategyStatus.performanceMetrics.totalWarmings}`);
                console.log(`   Successful Warmings: ${strategyStatus.performanceMetrics.successfulWarmings}`);
                console.log(`   Average Warming Time: ${strategyStatus.performanceMetrics.averageWarmingTime.toFixed(2)}ms`);
                
                console.log('\n🎯 Available Strategies:');
                strategyStatus.strategies.forEach((strategy, index) => {
                    console.log(`\n   ${index + 1}. ${strategy.name}`);
                    console.log(`      Priority: ${strategy.priority}`);
                    console.log(`      Frequency: ${strategy.frequency}ms`);
                    console.log(`      Description: ${strategy.description}`);
                    console.log(`      Last Execution: ${strategy.lastExecution || 'Never'}`);
                    console.log(`      Next Execution: ${strategy.nextExecution || 'Not scheduled'}`);
                    console.log(`      Success Rate: ${strategy.successRate}%`);
                });
                
                if (strategyStatus.warmingHistory.length > 0) {
                    console.log('\n📜 Recent Warming History:');
                    strategyStatus.warmingHistory.slice(-5).forEach((history, index) => {
                        const status = history.success ? '✅' : '❌';
                        console.log(`   ${status} ${history.strategy} - ${history.timestamp} (${history.duration}ms)`);
                    });
                }
                
                console.log('\n✅ Strategy status retrieval completed');
                
            } catch (error) {
                console.error('❌ Failed to retrieve strategies:', error.message);
                process.exit(1);
            }
        }
    },

    'clear': {
        description: 'Clear intelligent cache data [--patterns] [--metrics] [--all]',
        execute: async (...args) => {
            const clearPatterns = args.includes('--patterns') || args.includes('--all');
            const clearMetrics = args.includes('--metrics') || args.includes('--all');
            const clearAll = args.includes('--all');
            
            if (!clearPatterns && !clearMetrics && !clearAll) {
                console.log('❌ Specify what to clear:');
                console.log('   --patterns  Clear usage patterns and access frequency data');
                console.log('   --metrics   Clear performance metrics');
                console.log('   --all       Clear everything (caches, patterns, metrics)');
                process.exit(1);
            }
            
            console.log('🧹 Clearing intelligent cache data...\n');
            
            try {
                const results = {};
                
                if (clearAll) {
                    // Clear all cache types
                    for (const [type, manager] of Object.entries(intelligentCacheManager.cacheManagers)) {
                        results[type] = await manager.clear();
                    }
                }
                
                if (clearPatterns || clearAll) {
                    intelligentCacheManager.usagePatterns.clear();
                    intelligentCacheManager.accessFrequency.clear();
                    intelligentCacheManager.lastAccess.clear();
                    results.patterns = 'cleared';
                }
                
                if (clearMetrics || clearAll) {
                    intelligentCacheManager.performanceMetrics = {
                        warmingHits: 0,
                        predictiveHits: 0,
                        intelligentEvictions: 0,
                        patternMatches: 0,
                        optimizationsSaved: 0
                    };
                    results.metrics = 'cleared';
                }
                
                console.log('🧹 CACHE CLEARING RESULTS');
                console.log('=========================');
                
                Object.entries(results).forEach(([key, value]) => {
                    const status = value === true || value === 'cleared' ? '✅' : '❌';
                    console.log(`   ${status} ${key}: ${value}`);
                });
                
                console.log('\n✅ Cache clearing completed successfully');
                
            } catch (error) {
                console.error('❌ Cache clearing failed:', error.message);
                process.exit(1);
            }
        }
    },

    'help': {
        description: 'Show this help message',
        execute: () => {
            console.log('🤖 INTELLIGENT CACHE CLI TOOL');
            console.log('==============================');
            console.log('Advanced cache management and analytics\n');
            
            console.log('📋 Available Commands:');
            Object.entries(commands).forEach(([cmd, info]) => {
                console.log(`   ${cmd.padEnd(12)} - ${info.description}`);
            });
            
            console.log('\n💡 Examples:');
            console.log('   npm run icache:analytics     # View comprehensive analytics');
            console.log('   npm run icache:health        # Check system health');
            console.log('   npm run icache:warm critical-data  # Execute critical data warming');
            console.log('   npm run icache:predictive    # Execute predictive warming');
            console.log('   npm run icache:patterns      # View usage patterns');
            console.log('   npm run icache:clear --all   # Clear all cache data');
            
            console.log('\n🔗 Related Commands:');
            console.log('   npm run db:status           # Database status');
            console.log('   npm run db:health           # Database health');
            console.log('   npm start                   # Start server');
        }
    }
};

// Parse command line arguments
const [,, command, ...args] = process.argv;

if (!command || !commands[command]) {
    console.log('❌ Invalid or missing command\n');
    commands.help.execute();
    process.exit(1);
}

// Execute the command
(async () => {
    try {
        await commands[command].execute(...args);
        process.exit(0);
    } catch (error) {
        console.error('❌ Command execution failed:', error.message);
        process.exit(1);
    }
})();