# Automated Phone Calls - HLD Summary

## Quick Reference

**Full Document:** [HLD-Automated-Phone-Calls.md](./HLD-Automated-Phone-Calls.md)

## Feature Overview

Create reusable phone message templates and trigger automated phone campaigns via bulk actions using Yemot API.

## Key Components

### Entities
1. **PhoneTemplate** - Reusable message template configuration
2. **PhoneCampaign** - Campaign execution tracking

### Services
1. **YemotApiService** - Yemot REST API integration
2. **PhoneTemplateService** - Template business logic
3. **PhoneCampaignService** - Campaign execution logic

### Frontend
1. **phone-template.jsx** - Template management UI
2. **phone-campaign.jsx** - Campaign history UI
3. **PhoneTemplateBulkButton.jsx** - Reusable bulk action component

## Yemot API Methods Required

**Template Management:**
- CreateTemplate, GetTemplates, UpdateTemplate, DeleteTemplate

**Content Management:**
- UploadFile (audio files)

**Campaign Execution:**
- UploadPhoneList, RunCampaign

**Campaign Monitoring:**
- GetCampaignStatus, GetActiveCampaigns, DownloadCampaignReport

## Key Design Decisions (Recommended)

1. **Template Creation Timing**: On PhoneTemplate creation (immediate)
2. **Message Content**: Embedded in PhoneTemplate entity
3. **Phone Extraction**: Configuration-based with accessor functions
4. **Execution Flow**: Hybrid - validate sync, execute async
5. **Result Tracking**: Summary only for MVP
6. **Terminology**: "Phone Template" + "Campaign"
7. **Multi-Tenancy**: Per-user templates
8. **Error Handling**: Smart retry (retry on specific errors)

## Implementation Phases

### Phase 1: MVP
- Basic entities and CRUD
- YemotApiService core methods
- Single bulk action button
- TTS messages only
- Summary tracking

### Phase 2: Enhanced
- Audio file support
- Multiple integrations
- Real-time updates
- Report download

### Phase 3: Advanced
- Scheduled campaigns
- Template sharing
- Per-call tracking
- Analytics dashboard
- Personalization

## Open Questions for PO

1. Do we have Yemot API KEY for each user or system-level?
2. Who pays for calls? Budget/limits per user?
3. Which entity gets bulk button first?
4. TTS only or audio files in MVP?
5. Scheduled campaigns needed in MVP?
6. Detail level for campaign reports?
7. Who can create templates - all users or admin only?
8. Legal requirements for calling hours, opt-out?
9. Integrate with existing YemotCall entity?
10. Preferred UI terminology?

## Success Criteria

- Users can create templates and execute campaigns
- Campaigns with 100+ numbers execute timely
- 95%+ success rate for valid numbers
- Users need no training
- 50%+ adoption rate

## Next Steps

1. Review and approve HLD
2. Answer open questions
3. Create implementation tickets
4. Set up Yemot API test environment
5. Begin Phase 1 implementation
