# Security Implementation Guide

## 🚀 Quick Start Security Setup

### 1. Environment Configuration
```bash
# Copy environment template
cp api/.env.example api/.env

# Generate secure JWT secret (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Install Dependencies
```bash
cd api
npm install
```

### 3. Run Security Check
```bash
npm run security-audit
npm run security-check
```

## 🔧 Security Features Implemented

### Rate Limiting
- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 attempts per 15 minutes
- **Password Reset**: 3 attempts per hour
- **Speed Limiting**: Progressive delays after 50 requests

### Input Validation & Sanitization
- Email format validation with regex
- Password complexity requirements
- Input length limits
- HTML/XSS sanitization with DOMPurify
- SQL injection prevention with prepared statements

### Authentication Security
- bcrypt password hashing (12 rounds)
- JWT with secure algorithms (HS256)
- Account lockout after 5 failed attempts
- Token blacklisting for logout
- Constant-time password comparison

### Security Headers (Helmet)
- Content Security Policy
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options
- X-Content-Type-Options
- Referrer Policy

### Logging & Monitoring
- Security event logging to database
- Failed login attempt tracking
- Suspicious activity detection
- Comprehensive audit trails
- Real-time security metrics

### Database Security
- Foreign key constraints
- Data length constraints
- Indexed queries for performance
- Secure connection handling

## 📊 Security Monitoring

### Real-time Monitoring
```bash
# Check security status
npm run security-check

# View security logs
tail -f logs/security.log

# Monitor failed logins
grep "FAILED_LOGIN" logs/security.log
```

### Security Metrics Dashboard
The system tracks:
- Failed login attempts
- Account lockouts
- Suspicious activities
- Rate limit violations
- Validation failures

### Automated Alerts
Configure alerts for:
- Multiple failed logins from same IP
- Account lockout events
- Unusual validation failures
- Rate limit violations

## 🛡️ Security Best Practices

### Production Deployment
1. **Environment Variables**
   - Use strong, unique JWT_SECRET
   - Set NODE_ENV=production
   - Configure proper CORS origins

2. **HTTPS Configuration**
   - Enable HTTPS/TLS
   - Use security headers
   - Implement HSTS

3. **Database Security**
   - Regular backups
   - Access controls
   - Encryption at rest

4. **Monitoring**
   - Set up log aggregation
   - Configure alerting
   - Regular security audits

### Regular Maintenance
- Update dependencies monthly
- Review security logs weekly
- Run security audits quarterly
- Update security policies annually

## 🔍 Security Testing

### Manual Testing
```bash
# Test rate limiting
for i in {1..10}; do curl -X POST http://localhost:3001/api/auth/signin; done

# Test input validation
curl -X POST http://localhost:3001/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"<script>alert(1)</script>"}'

# Test authentication
curl -X GET http://localhost:3001/api/todos \
  -H "Authorization: Bearer invalid_token"
```

### Automated Security Testing
```bash
# Dependency vulnerability scan
npm audit

# Security linting
npm run security-check

# Load testing (install artillery first)
artillery quick --count 100 --num 10 http://localhost:3001/api/auth/signin
```

## 🚨 Incident Response

### Security Event Response
1. **Immediate Actions**
   - Check security logs
   - Identify affected accounts
   - Block suspicious IPs if needed

2. **Investigation**
   - Analyze attack patterns
   - Check for data breaches
   - Document findings

3. **Recovery**
   - Reset compromised accounts
   - Update security measures
   - Notify users if required

### Emergency Procedures
```bash
# Block suspicious IP (implement in production)
# iptables -A INPUT -s SUSPICIOUS_IP -j DROP

# Force logout all users (clear token blacklist)
# Restart server to clear in-memory blacklist

# Check for compromised accounts
node -e "
const { getSecurityEvents } = require('./api/utils/security-audit.js');
getSecurityEvents(1000, 'FAILED_LOGIN').then(console.log);
"
```

## 📋 Security Checklist

### Pre-deployment
- [ ] JWT_SECRET is secure (32+ characters)
- [ ] All environment variables configured
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Input validation implemented
- [ ] Logging configured
- [ ] Dependencies updated
- [ ] Security audit passed

### Post-deployment
- [ ] HTTPS enabled
- [ ] Monitoring configured
- [ ] Backup procedures tested
- [ ] Incident response plan ready
- [ ] Security team notified
- [ ] Documentation updated

### Regular Maintenance
- [ ] Weekly log review
- [ ] Monthly dependency updates
- [ ] Quarterly security audits
- [ ] Annual penetration testing
- [ ] Security training for team

## 🔗 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)