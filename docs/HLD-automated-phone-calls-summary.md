# Automated Phone Calls HLD - Executive Summary

## Overview
This document provides a high-level design for implementing automated outbound phone calling functionality integrated with the **Yemot Templates/Campaigns API** system.

**Version**: 2.0 (Major revision - now using Yemot Templates/Campaigns)  
**Date**: 2026-01-15  
**API Reference**: [Yemot Templates/Campaigns](https://f2.freeivr.co.il/topic/55/api-גישת-מפתחים-למערכות/5) - חלק 2 ניהול קמפיינים

## Key Changes from v1.0
- ✅ Now uses Yemot Templates/Campaigns API (per stakeholder request)
- ✅ Template-based campaign approach vs individual call approach
- ✅ Comprehensive campaign management and reporting
- ✅ Full Yemot API method references and workflow documentation

## Yemot Templates/Campaigns Workflow

1. **Create/Sync Template**: Admin creates template in system (calls `CreateTemplate` API) or syncs existing templates from Yemot (`GetTemplates`)
2. **Configure Content**: Template content (audio/IVR) configured in Yemot web interface (Phase 1) or via API (Phase 2)
3. **Select Recipients**: Admin selects students from list (e.g., student-klasses-report)
4. **Upload Phone List**: System uploads phone numbers to Yemot template (`UploadPhoneList`)
5. **Run Campaign**: System triggers campaign execution (`RunCampaign`)
6. **Monitor Progress**: System polls campaign status (`GetCampaignStatus`)
7. **Download Report**: System retrieves detailed results (`DownloadCampaignReport`)

## Critical Questions

### Q11: Yemot Account ⚠️ URGENT
- Do you have Yemot account with **Templates/Campaigns API access**?
- Account tier and rate limits?
- Authentication token?

### Q13: Template Management
- Create new templates via API OR sync existing templates?
- **Recommended**: Hybrid - support both approaches

### Q14: Cost Control
- Track campaign costs?
- Quota limits per user?
- Approval for large campaigns (>100 calls)?

## Implementation (Phase 1: 2-3 weeks)

**Backend:**
- `YemotCampaignTemplate` & `YemotCampaign` entities
- `YemotTemplatesApiService` (API client)
- `YemotCampaignService` (orchestration)

**Frontend:**
- Campaign template CRUD with sync
- `BulkCampaignButton` component
- Campaign history viewer

**Key APIs:**
- `CreateTemplate`, `GetTemplates`, `UploadPhoneList`, `RunCampaign`, `GetCampaignStatus`, `DownloadCampaignReport`

## Next Steps

1. Answer Q11 (Yemot account verification)
2. Review full HLD: `/docs/HLD-automated-phone-calls.md`
3. Approve database schema
4. Begin Phase 1 development

---

**Full Documentation**: `/docs/HLD-automated-phone-calls.md` (comprehensive 1500+ line design document)
