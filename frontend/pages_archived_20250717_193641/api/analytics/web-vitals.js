// API endpoint to collect Web Vitals data
export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      name,
      value,
      id,
      delta,
      rating,
      navigationType,
      timestamp,
      url,
      userAgent
    } = req.body;

    // Validate required fields
    if (!name || value === undefined || !id) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Log the metric (in production, you would store this in a database)
    console.log('Web Vitals Metric Received:', {
      name,
      value,
      id,
      delta,
      rating,
      navigationType,
      timestamp,
      url,
      userAgent: userAgent ? userAgent.substring(0, 100) : undefined, // Truncate for storage
      receivedAt: new Date().toISOString()
    });

    // In a real application, you would:
    // 1. Store the data in a database (e.g., MongoDB, PostgreSQL)
    // 2. Send to analytics services (e.g., Google Analytics, DataDog)
    // 3. Trigger alerts for poor performance metrics
    // 4. Aggregate data for dashboards

    // Example database storage (commented out):
    /*
    await db.collection('web_vitals').insertOne({
      name,
      value,
      id,
      delta,
      rating,
      navigationType,
      timestamp: new Date(timestamp),
      url,
      userAgent,
      receivedAt: new Date()
    });
    */

    // Example analytics service integration (commented out):
    /*
    if (process.env.ANALYTICS_API_KEY) {
      await fetch('https://analytics-service.com/api/metrics', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          metric: name,
          value,
          metadata: {
            id,
            delta,
            rating,
            navigationType,
            url,
            timestamp
          }
        })
      });
    }
    */

    // Example alerting for poor performance (commented out):
    /*
    const shouldAlert = (
      (name === 'LCP' && value > 4000) ||
      (name === 'FID' && value > 300) ||
      (name === 'CLS' && value > 0.25) ||
      (name === 'FCP' && value > 3000) ||
      (name === 'TTFB' && value > 2500)
    );

    if (shouldAlert) {
      await sendAlert({
        type: 'performance_degradation',
        metric: name,
        value,
        url,
        timestamp
      });
    }
    */

    // Provide performance recommendations based on metrics
    const recommendations = getPerformanceRecommendations(name, value, rating);

    res.status(200).json({
      success: true,
      message: 'Metric recorded successfully',
      recommendations
    });

  } catch (error) {
    console.error('Error processing Web Vitals metric:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

function getPerformanceRecommendations(metricName, value, rating) {
  const recommendations = [];

  switch (metricName) {
    case 'LCP':
      if (rating === 'poor') {
        recommendations.push(
          'Optimize images and use next-gen formats (WebP, AVIF)',
          'Implement lazy loading for below-the-fold images',
          'Reduce server response times',
          'Use a CDN for static assets'
        );
      } else if (rating === 'needs-improvement') {
        recommendations.push(
          'Preload critical resources',
          'Optimize CSS delivery'
        );
      }
      break;

    case 'FID':
      if (rating === 'poor') {
        recommendations.push(
          'Break up long-running JavaScript tasks',
          'Use web workers for heavy computations',
          'Defer non-critical JavaScript',
          'Optimize third-party scripts'
        );
      } else if (rating === 'needs-improvement') {
        recommendations.push(
          'Reduce JavaScript execution time',
          'Use code splitting'
        );
      }
      break;

    case 'CLS':
      if (rating === 'poor') {
        recommendations.push(
          'Add size attributes to images and videos',
          'Reserve space for dynamic content',
          'Avoid inserting content above existing content',
          'Use transform animations instead of layout-triggering properties'
        );
      } else if (rating === 'needs-improvement') {
        recommendations.push(
          'Optimize font loading with font-display: swap',
          'Preload critical fonts'
        );
      }
      break;

    case 'FCP':
      if (rating === 'poor') {
        recommendations.push(
          'Eliminate render-blocking resources',
          'Minify CSS and JavaScript',
          'Remove unused CSS',
          'Optimize server response times'
        );
      }
      break;

    case 'TTFB':
      if (rating === 'poor') {
        recommendations.push(
          'Optimize server performance',
          'Use a CDN',
          'Implement caching strategies',
          'Optimize database queries'
        );
      }
      break;

    default:
      break;
  }

  return recommendations;
}