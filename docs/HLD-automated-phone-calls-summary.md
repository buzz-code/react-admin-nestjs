# Automated Phone Calls HLD - Executive Summary

## Overview
This document provides a high-level design for implementing automated outbound phone calling functionality integrated with the Yemot telephony platform.

## Key Features
1. **Phone Message Template Management** - Create reusable message templates with TTS or audio files
2. **Bulk Triggering** - Send calls to multiple students from existing UI lists
3. **Call Tracking** - Monitor call status and history
4. **User-Specific Configuration** - Per-organization message customization

## Architecture Summary

### Database Entities
- `phone_messages` - Stores message templates (TTS text or audio file paths)
- `phone_call_history` - Tracks individual call attempts and results

### Backend Components
- **PhoneMessage Entity** - Manages message templates
- **PhoneCallService** - Orchestrates call initiation and tracking
- **YemotApiService** - Integrates with Yemot API (ApiOutCallV2)

### Frontend Components
- **Phone Message CRUD** - UI for managing templates (`/client/src/entities/phone-message.jsx`)
- **BulkPhoneCallButton** - Bulk action button for entity lists
- **Call History Viewer** - Display call logs and status

## Critical Design Questions Requiring Your Input

### Q1: Variable Substitution
**Should messages support placeholders like `{studentName}`, `{className}`?**
- ✅ **RECOMMENDED**: Yes - More flexible and personalized
- Alternative: Fixed messages only - Simpler but less useful

### Q2: Message Ownership Pattern
**Should messages follow the Text/TextByUser pattern?**
- ✅ **RECOMMENDED**: Hybrid (system defaults + user overrides, userId=0 for system)
- Alternative: Pure user-specific (userId always set)

### Q5: Yemot API Endpoint
**Which API should we use?**
- ✅ **RECOMMENDED**: ApiOutCallV2 (modern, feature-rich)
- Alternative: ApiOutCall (legacy, broader compatibility)

### Q6: Audio File Hosting
**Where should audio files be stored?**
- ✅ **RECOMMENDED for Phase 1**: Upload to Yemot storage (ApiUploadFile)
- Alternative: Host on application server with public URL
- Future: Cloud storage (S3/GCS) if scale demands

### Q7: Yemot Token Management
**How should authentication tokens be handled?**
- ✅ **RECOMMENDED for MVP**: Single system-wide token (env variable)
- **RECOMMENDED for Production**: User-specific tokens (stored encrypted in User entity)

### Q8: Phone Number Validation
**Should we validate phone numbers before calling?**
- ✅ **RECOMMENDED for MVP**: Accept any format, let Yemot validate
- Alternative: Validate Israeli format (regex pattern)
- Future: Use libphonenumber-js for international support

### Q10: Bulk Operations Processing
**How should large bulk calls be handled?**
- ✅ **RECOMMENDED**: Asynchronous with job queue (Bull/BullMQ)
- Alternative: Synchronous (risk of timeout)

### Q11: Yemot Account Setup ⚠️ CRITICAL
**Required Information:**
- Do we have an existing Yemot account with API access?
- What is the account tier and rate limits?
- Do we need separate accounts for staging/production?
- What is the authentication token?

### Q12: User Workflow Priorities
**Which lists should have bulk call buttons?**
- ✅ Student Klasses Report (specified in requirements)
- Student List?
- Teacher List (staff notifications)?

### Q13: Message Content Validation
- Should we validate content (max length, forbidden words)?
- Should admins preview/test messages before bulk use?

### Q14: Billing & Cost Control
- How to track Yemot call costs?
- Should we implement quota limits per user?
- Approval required for large operations (>100 calls)?

## Implementation Phases

### Phase 1: MVP (2-3 weeks)
- Create database entities (PhoneMessage, PhoneCallHistory)
- Implement PhoneCallService and YemotApiService
- Build phone message CRUD UI
- Add BulkPhoneCallButton to student-klasses-report
- Basic call history viewer
- **TTS only** (no audio files yet)

### Phase 2: Enhanced (1-2 weeks)
- Audio file upload support
- Variable substitution
- Retry logic for failed calls
- User-specific token management

### Phase 3: Advanced (2-3 weeks)
- Scheduled calls (job queue)
- Opt-out management
- Enhanced analytics
- CSV export

### Phase 4: Production Hardening (1 week)
- Performance optimization
- Monitoring/alerting
- Security audit
- Load testing

## Integration Points

### Existing Entities Modified
1. **Student Klasses Report** (`/client/src/entities/student-klasses-report.jsx`)
   - Add `BulkPhoneCallButton` to `additionalBulkButtons`

2. **App.jsx** (`/client/src/App.jsx`)
   - Register `phone_message` resource (settings menu)
   - Register `phone_call_history` resource (admin menu)

3. **Student Entity** (optional)
   - Consider adding `parentPhone` field
   - Consider adding `phoneCallOptOut` flag

### New Files Created
**Backend:**
- `/server/src/db/entities/PhoneMessage.entity.ts`
- `/server/src/db/entities/PhoneCallHistory.entity.ts`
- `/server/src/entity-modules/phone-message.config.ts`
- `/server/src/entity-modules/phone-call-history.config.ts`
- `/server/src/services/phone-call.service.ts`
- `/server/shared/utils/yemot/yemot-api.service.ts`

**Frontend:**
- `/client/src/entities/phone-message.jsx`
- `/client/src/entities/phone-call-history.jsx`
- `/client/src/components/bulk-actions/BulkPhoneCallButton.jsx`

## Security Considerations
- **Rate Limiting**: Prevent abuse (10 templates/hour, 100 calls/batch)
- **Phone Masking**: Log masked numbers only (05X-XXX-1234)
- **Token Security**: Encrypt Yemot tokens at rest
- **Permissions**: Admin-only access
- **Audit Trail**: Log all call actions

## Performance Considerations
- **Bulk Operations**: Use job queue (Bull) for async processing
- **Database Indexing**: Index userId, status, createdAt on history table
- **Caching**: Cache active templates (60s TTL)

## Testing Strategy
- **Unit Tests**: Service methods, API client, validation
- **Integration Tests**: End-to-end flow with Yemot sandbox
- **Manual Tests**: Real Yemot account with test phone numbers

## Success Metrics
- **Performance**: Bulk calls queued <2s, processed <5min
- **Reliability**: 95%+ success rate (excluding invalid numbers)
- **Adoption**: 50%+ admins use within first month
- **Time Savings**: 80% reduction in manual calling time

## Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Yemot API changes | Version API calls, monitor docs |
| Rate limiting | Implement queue, respect limits |
| Invalid numbers cost money | Validate before calling, opt-out list |
| User errors in bulk ops | Confirmation dialogs, preview |

## Next Steps (Action Items)

1. **Immediate**: Answer critical questions (Q11-Q14)
2. **Week 1**: Obtain Yemot credentials, set up sandbox
3. **Week 1-2**: Implement Phase 1 MVP backend
4. **Week 2-3**: Implement Phase 1 MVP frontend
5. **Week 3**: Integration testing
6. **Week 4+**: Phase 2 enhancements

## Questions for You

Please review the full HLD document (`docs/HLD-automated-phone-calls.md`) and provide answers to:

1. **Q11**: Yemot account details and credentials
2. **Q12**: Which entity lists need bulk call buttons
3. **Q13**: Message content validation requirements
4. **Q14**: Billing and cost control preferences
5. **General**: Any concerns or modifications to the proposed design

Once these are answered, we can proceed with implementation!

---

**Full HLD Document**: `/docs/HLD-automated-phone-calls.md`  
**Created**: 2026-01-15  
**Status**: Awaiting stakeholder review
