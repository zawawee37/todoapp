import { db } from '../config/database.js'
import logger from './logger.js'

// Security event logging to database
export const logSecurityEvent = async (eventType, userId, ipAddress, userAgent, details) => {
  try {
    await db.runAsync(
      'INSERT INTO security_events (event_type, user_id, ip_address, user_agent, details, created_at) VALUES (?, ?, ?, ?, ?, ?)',
      [eventType, userId, ipAddress, userAgent, JSON.stringify(details), new Date().toISOString()]
    )
  } catch (error) {
    logger.error('Failed to log security event:', error)
  }
}

// Get security events for monitoring
export const getSecurityEvents = async (limit = 100, eventType = null) => {
  try {
    let query = 'SELECT * FROM security_events'
    let params = []
    
    if (eventType) {
      query += ' WHERE event_type = ?'
      params.push(eventType)
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?'
    params.push(limit)
    
    return await db.allAsync(query, params)
  } catch (error) {
    logger.error('Failed to get security events:', error)
    return []
  }
}

// Detect suspicious patterns
export const detectSuspiciousActivity = async () => {
  try {
    // Multiple failed logins from same IP in last hour
    const suspiciousIPs = await db.allAsync(`
      SELECT ip_address, COUNT(*) as failed_attempts
      FROM security_events 
      WHERE event_type = 'FAILED_LOGIN' 
      AND created_at > datetime('now', '-1 hour')
      GROUP BY ip_address
      HAVING failed_attempts >= 10
    `)
    
    // Multiple password reset attempts
    const passwordResetAbuse = await db.allAsync(`
      SELECT ip_address, COUNT(*) as reset_attempts
      FROM security_events 
      WHERE event_type = 'PASSWORD_RESET_REQUEST' 
      AND created_at > datetime('now', '-1 hour')
      GROUP BY ip_address
      HAVING reset_attempts >= 5
    `)
    
    // Validation failures (potential attack)
    const validationAttacks = await db.allAsync(`
      SELECT ip_address, COUNT(*) as validation_failures
      FROM security_events 
      WHERE event_type = 'VALIDATION_FAILURE' 
      AND created_at > datetime('now', '-10 minutes')
      GROUP BY ip_address
      HAVING validation_failures >= 20
    `)
    
    return {
      suspiciousIPs,
      passwordResetAbuse,
      validationAttacks
    }
  } catch (error) {
    logger.error('Failed to detect suspicious activity:', error)
    return null
  }
}

// Clean old security events (run periodically)
export const cleanOldSecurityEvents = async (daysToKeep = 30) => {
  try {
    const result = await db.runAsync(
      'DELETE FROM security_events WHERE created_at < datetime("now", "-" || ? || " days")',
      [daysToKeep]
    )
    
    logger.info(`Cleaned ${result.changes} old security events`)
    return result.changes
  } catch (error) {
    logger.error('Failed to clean old security events:', error)
    return 0
  }
}

// Security metrics for monitoring
export const getSecurityMetrics = async () => {
  try {
    const [
      totalEvents,
      failedLogins,
      accountLockouts,
      suspiciousActivities,
      recentEvents
    ] = await Promise.all([
      db.getAsync('SELECT COUNT(*) as count FROM security_events WHERE created_at > datetime("now", "-24 hours")'),
      db.getAsync('SELECT COUNT(*) as count FROM security_events WHERE event_type = "FAILED_LOGIN" AND created_at > datetime("now", "-24 hours")'),
      db.getAsync('SELECT COUNT(*) as count FROM security_events WHERE event_type = "ACCOUNT_LOCKED" AND created_at > datetime("now", "-24 hours")'),
      db.getAsync('SELECT COUNT(*) as count FROM security_events WHERE event_type = "SUSPICIOUS_ACTIVITY" AND created_at > datetime("now", "-24 hours")'),
      db.allAsync('SELECT event_type, COUNT(*) as count FROM security_events WHERE created_at > datetime("now", "-1 hour") GROUP BY event_type ORDER BY count DESC LIMIT 10')
    ])
    
    return {
      last24Hours: {
        totalEvents: totalEvents.count,
        failedLogins: failedLogins.count,
        accountLockouts: accountLockouts.count,
        suspiciousActivities: suspiciousActivities.count
      },
      lastHour: recentEvents
    }
  } catch (error) {
    logger.error('Failed to get security metrics:', error)
    return null
  }
}