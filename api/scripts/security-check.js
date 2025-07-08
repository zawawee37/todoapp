#!/usr/bin/env node

import { detectSuspiciousActivity, getSecurityMetrics } from '../utils/security-audit.js'
import logger from '../utils/logger.js'

// Security monitoring script
async function runSecurityCheck() {
  console.log('🔍 Running security check...')
  
  try {
    // Check for suspicious activities
    const suspicious = await detectSuspiciousActivity()
    
    if (suspicious) {
      if (suspicious.suspiciousIPs.length > 0) {
        console.log('⚠️  Suspicious IPs detected:')
        suspicious.suspiciousIPs.forEach(ip => {
          console.log(`   ${ip.ip_address}: ${ip.failed_attempts} failed login attempts`)
        })
      }
      
      if (suspicious.passwordResetAbuse.length > 0) {
        console.log('⚠️  Password reset abuse detected:')
        suspicious.passwordResetAbuse.forEach(ip => {
          console.log(`   ${ip.ip_address}: ${ip.reset_attempts} reset attempts`)
        })
      }
      
      if (suspicious.validationAttacks.length > 0) {
        console.log('⚠️  Potential validation attacks:')
        suspicious.validationAttacks.forEach(ip => {
          console.log(`   ${ip.ip_address}: ${ip.validation_failures} validation failures`)
        })
      }
    }
    
    // Get security metrics
    const metrics = await getSecurityMetrics()
    
    if (metrics) {
      console.log('\n📊 Security Metrics (Last 24 hours):')
      console.log(`   Total Events: ${metrics.last24Hours.totalEvents}`)
      console.log(`   Failed Logins: ${metrics.last24Hours.failedLogins}`)
      console.log(`   Account Lockouts: ${metrics.last24Hours.accountLockouts}`)
      console.log(`   Suspicious Activities: ${metrics.last24Hours.suspiciousActivities}`)
      
      if (metrics.lastHour.length > 0) {
        console.log('\n📈 Recent Activity (Last Hour):')
        metrics.lastHour.forEach(event => {
          console.log(`   ${event.event_type}: ${event.count}`)
        })
      }
    }
    
    console.log('\n✅ Security check completed')
    
  } catch (error) {
    console.error('❌ Security check failed:', error)
    logger.error('Security check failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runSecurityCheck()
}