# Automated Phone Calls - HLD Summary

## Quick Reference

**Full Document:** [HLD-Automated-Phone-Calls.md](./HLD-Automated-Phone-Calls.md)

## Feature Overview

Create reusable phone message templates and trigger automated phone campaigns via bulk actions using Yemot API. Each user manages their own templates, campaigns, and Yemot API KEY stored in user settings.

## Key Components

### Entities
1. **PhoneTemplate** - Per-user reusable message template (TTS text in MVP)
2. **PhoneCampaign** - Per-user campaign execution tracking
3. **User.additionalData.yemotApiKey** - API KEY stored in existing user settings field

### Services
1. **YemotApiService** - Yemot REST API integration (uses per-user API KEY)
2. **PhoneTemplateService** - Extends BaseEntityService, template business logic
3. **PhoneCampaignService** - Extends BaseEntityService, campaign execution & tracking
4. **Entity Services** - StudentAttendanceService (or similar) integrates via doAction override

### Frontend
1. **phone-template.jsx** - Template CRUD (per-user, TTS only)
2. **phone-campaign.jsx** - Campaign history with manual "Refresh Status" action button
3. **PhoneTemplateBulkButton.jsx** - Bulk action for student attendance pivot table

## Yemot API Methods Required

**Template Management:**
- CreateTemplate, UpdateTemplate

**Campaign Execution:**
- UploadPhoneList, RunCampaign (with ttsMode=1)

**Campaign Monitoring:**
- GetCampaignStatus (user-triggered)

## Key Design Decisions (Finalized)

1. **Authentication**: Per-user API KEY in User.additionalData.yemotApiKey
2. **Billing**: Each user pays via their own Yemot account
3. **Template Creation Timing**: Immediate on save
4. **Message Content**: TTS text only (MVP), embedded in PhoneTemplate
5. **Phone Extraction**: Entity service extracts from its own records
6. **Execution Flow**: Entity service → PhoneCampaignService.executeCampaign()
7. **Result Tracking**: Summary only (total, success, failed counts)
8. **Terminology**: EN: "Phone Template"/"Campaign", HE: "תבנית שיחה"/"משלוח שיחות"
9. **Multi-Tenancy**: Per-user templates and campaigns (CrudAuth filtering)
10. **Status Updates**: User-triggered via /action endpoint (no background polling)
11. **API Endpoints**: Standard BaseEntityModule only (no custom routes)
12. **Entity Integration**: Each entity service overrides doAction for campaign execution

## Implementation Phases

### Phase 1: MVP
- User.additionalData.yemotApiKey & settings page
- PhoneTemplate & PhoneCampaign entities
- YemotApiService core methods
- BaseEntityModule configs
- TTS messages only
- Entity service integration (StudentAttendanceService overrides doAction)
- Bulk button on student attendance pivot
- Execute via entity /action endpoint (e.g., /api/student_attendance/action)
- Manual status refresh via /action
- Summary-level tracking

### Phase 2: Enhanced
- Audio file support
- Additional bulk actions
- Automatic status refresh
- Report export
- Template testing

### Phase 3: Advanced
- Scheduled campaigns
- Message personalization
- Per-call tracking
- Analytics dashboard
- Cost estimation

## All Questions Answered ✅

1. ✅ API KEY strategy: Per-user in additionalData
2. ✅ Billing: User's own account
3. ✅ First integration: Student attendance pivot
4. ✅ MVP content: TTS only
5. ✅ Scheduling: Not in MVP
6. ✅ Report detail: MVP level (summary)
7. ✅ Permissions: Each user their own
8. ✅ Compliance: Handled by Yemot
9. ✅ YemotCall integration: Not related
10. ✅ Terminology: "משלוח שיחות" for Hebrew campaign

**Additional Clarifications:**
11. ✅ No custom routes - use standard BaseEntityModule only
12. ✅ Entity services (like StudentAttendanceService) handle phone extraction and call PhoneCampaignService

## Success Criteria

- Users can configure API KEY and create templates
- Bulk action executes campaigns from attendance pivot
- Campaigns execute with TTS messages
- Users can manually refresh campaign status
- 95%+ success rate for valid phone numbers

## Next Steps

1. ✅ HLD approved with all decisions
2. Create Phase 1 implementation tickets
3. Configure user settings UI for additionalData.yemotApiKey
4. Set up Yemot test environment
5. Begin Phase 1 development
