# Automated Phone Calls - Architecture Diagram

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           Frontend (React Admin)                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  phone-template  │  │  phone-campaign  │  │  Student Klasses │  │
│  │    .jsx          │  │    .jsx          │  │     Report       │  │
│  │                  │  │                  │  │                  │  │
│  │  - List/Create   │  │  - View History  │  │  - Bulk Actions  │  │
│  │  - Edit/Delete   │  │  - Status Track  │  │  - Select Records│  │
│  │  - Upload Audio  │  │  - Download Rpt  │  │                  │  │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘  │
│           │                     │                     │              │
│           └─────────────────────┼─────────────────────┘              │
│                                 │                                    │
│           ┌─────────────────────▼─────────────────────┐              │
│           │  PhoneTemplateBulkButton.jsx              │              │
│           │  - Select Template                        │              │
│           │  - Extract Phone Numbers                  │              │
│           │  - Confirm & Execute                      │              │
│           └─────────────────────┬─────────────────────┘              │
└───────────────────────────────┬─┴──────────────────────────────────┘
                                │
                      API Calls │ (REST)
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                        Backend (NestJS)                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                    API Endpoints                               │  │
│  │  /api/phone-template/*  |  /api/phone-campaign/*              │  │
│  └────────────┬────────────────────────┬──────────────────────────┘  │
│               │                        │                              │
│  ┌────────────▼────────────┐  ┌───────▼──────────────┐              │
│  │ PhoneTemplateService    │  │ PhoneCampaignService │              │
│  │                         │  │                      │              │
│  │ - createTemplate()      │  │ - executeCampaign()  │              │
│  │ - configureMessage()    │  │ - trackStatus()      │              │
│  │ - syncWithYemot()       │  │ - getCampaignResults()│              │
│  │ - validateTemplate()    │  │ - cancelCampaign()   │              │
│  └────────────┬────────────┘  └───────┬──────────────┘              │
│               │                       │                              │
│               └───────────┬───────────┘                              │
│                           │                                          │
│               ┌───────────▼────────────┐                             │
│               │   YemotApiService      │                             │
│               │                        │                             │
│               │ - createTemplate()     │                             │
│               │ - uploadAudioFile()    │                             │
│               │ - uploadPhoneList()    │                             │
│               │ - runCampaign()        │                             │
│               │ - getCampaignStatus()  │                             │
│               │ - downloadReport()     │                             │
│               └───────────┬────────────┘                             │
│                           │                                          │
│  ┌────────────────────────┼──────────────────────────────┐          │
│  │        Database (TypeORM)                             │          │
│  │                        │                              │          │
│  │  ┌─────────────────┐  │  ┌────────────────────────┐  │          │
│  │  │ PhoneTemplate   │  │  │  PhoneCampaign         │  │          │
│  │  ├─────────────────┤  │  ├────────────────────────┤  │          │
│  │  │ id              │  │  │  id                    │  │          │
│  │  │ userId          │  │  │  userId                │  │          │
│  │  │ name            │  │  │  phoneTemplateId       │  │          │
│  │  │ description     │  │  │  yemotCampaignId       │  │          │
│  │  │ yemotTemplateId │  │  │  status                │  │          │
│  │  │ messageType     │  │  │  totalPhones           │  │          │
│  │  │ messageText     │  │  │  successfulCalls       │  │          │
│  │  │ messageFilePath │  │  │  failedCalls           │  │          │
│  │  │ isActive        │  │  │  phoneNumbers          │  │          │
│  │  │ callerId        │  │  │  errorMessage          │  │          │
│  │  │ settings        │  │  │  createdAt             │  │          │
│  │  │ createdAt       │  │  │  completedAt           │  │          │
│  │  │ updatedAt       │  │  └────────────────────────┘  │          │
│  │  └─────────────────┘                                 │          │
│  └──────────────────────────────────────────────────────┘          │
└───────────────────────────────┬──────────────────────────────────────┘
                                │
                                │ HTTPS API Calls
                                │ (with API KEY)
                                │
┌───────────────────────────────▼──────────────────────────────────────┐
│                     Yemot Phone System API                            │
│                     (https://www.call2all.co.il/ym/api/)             │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Template Management          Campaign Execution                     │
│  ┌──────────────────┐         ┌──────────────────┐                  │
│  │ CreateTemplate   │         │ UploadPhoneList  │                  │
│  │ GetTemplates     │         │ RunCampaign      │                  │
│  │ UpdateTemplate   │         │ GetCampaignStatus│                  │
│  │ DeleteTemplate   │         │ GetActiveCampaigns│                 │
│  └──────────────────┘         │ DownloadReport   │                  │
│                               └──────────────────┘                  │
│  Content Management                                                  │
│  ┌──────────────────┐                                               │
│  │ UploadFile       │                                               │
│  │ DownloadFile     │                                               │
│  │ (Audio/TTS)      │                                               │
│  └──────────────────┘                                               │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
                                │
                                │ Actual Phone Calls
                                ▼
                        [ Phone Network ]
                                │
                                ▼
                        [ Student Phones ]
```

## Data Flow Diagram

### Creating a Phone Template

```
User → Frontend → POST /api/phone-template
                     │
                     ▼
              PhoneTemplateService.createTemplate()
                     │
                     ├─► Save to PhoneTemplate table
                     │
                     └─► YemotApiService.createTemplate()
                           │
                           ▼
                        Yemot API (CreateTemplate)
                           │
                           └─► Returns yemotTemplateId
                                 │
                                 ▼
                           Update PhoneTemplate record
```

### Executing a Campaign

```
User selects records → Clicks Bulk Button → PhoneTemplateBulkButton
                                                   │
                                                   ├─► Extracts phone numbers
                                                   ├─► Shows template selector
                                                   └─► POST /api/phone-campaign/execute
                                                          │
                                                          ▼
                                               PhoneCampaignService.executeCampaign()
                                                          │
                                                          ├─► Create PhoneCampaign record (status: pending)
                                                          │
                                                          ├─► YemotApiService.uploadPhoneList()
                                                          │      │
                                                          │      ▼
                                                          │   Yemot API (UploadPhoneList)
                                                          │
                                                          ├─► YemotApiService.runCampaign()
                                                          │      │
                                                          │      ▼
                                                          │   Yemot API (RunCampaign)
                                                          │      │
                                                          │      └─► Returns campaignId
                                                          │
                                                          └─► Update PhoneCampaign (status: running, yemotCampaignId)
                                                                 │
                                                                 ▼
                                                          Background polling:
                                                          YemotApiService.getCampaignStatus()
                                                                 │
                                                                 ▼
                                                          Update PhoneCampaign with results
```

## Component Interaction Matrix

| Component | Interacts With | Purpose |
|-----------|----------------|---------|
| **Frontend Components** |
| phone-template.jsx | PhoneTemplateService | CRUD operations on templates |
| phone-campaign.jsx | PhoneCampaignService | View campaign history |
| PhoneTemplateBulkButton | PhoneCampaignService | Trigger campaigns |
| **Backend Services** |
| PhoneTemplateService | YemotApiService, PhoneTemplate entity | Template management |
| PhoneCampaignService | YemotApiService, PhoneCampaign entity | Campaign execution |
| YemotApiService | Yemot External API | API integration |
| **Data Layer** |
| PhoneTemplate | PhoneTemplateService, User entity | Store template config |
| PhoneCampaign | PhoneCampaignService, PhoneTemplate, User | Store campaign status |

## Authentication Flow

```
Backend Service
      │
      ├─► Get User's Yemot API KEY
      │    (from User entity or env variable)
      │
      ▼
YemotApiService
      │
      ├─► Add to request header: 
      │    "authorization: {API_KEY}"
      │
      ▼
HTTPS Request to Yemot API
      │
      ▼
Yemot validates API KEY
      │
      ├─► Valid → Process request
      │
      └─► Invalid → Return 401/403 error
```

## Error Handling Flow

```
API Call to Yemot
      │
      ▼
  ┌─────────┐
  │ Success?│
  └────┬────┘
       │
       ├─── Yes ──► Return result
       │
       └─── No ──► Check error type
                        │
                        ├─► Timeout/Rate Limit
                        │      │
                        │      └─► Retry with backoff
                        │
                        ├─► Auth Error
                        │      │
                        │      └─► Fail immediately
                        │             │
                        │             └─► Log error
                        │                   │
                        │                   └─► Update campaign status: failed
                        │
                        └─► Network Error
                               │
                               └─► Retry up to 3 times
                                      │
                                      └─► If all fail → Mark failed
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Environment                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │   Frontend    │  │    Backend    │  │     MySQL      │  │
│  │   (Vite)      │  │   (NestJS)    │  │   Database     │  │
│  │   Port 3000   │  │   Port 3001   │  │   Port 3306    │  │
│  │               │  │               │  │                │  │
│  │  + phone-     │  │  + Yemot      │  │  + phone_      │  │
│  │    template   │  │    ApiService │  │    templates   │  │
│  │    .jsx       │  │               │  │  + phone_      │  │
│  │               │  │  + Phone      │  │    campaigns   │  │
│  │  + Phone      │  │    Template   │  │                │  │
│  │    Template   │  │    Service    │  │                │  │
│  │    BulkButton │  │               │  │                │  │
│  │               │  │  + Phone      │  │                │  │
│  │  + phone-     │  │    Campaign   │  │                │  │
│  │    campaign   │  │    Service    │  │                │  │
│  │    .jsx       │  │               │  │                │  │
│  └───────┬───────┘  └───────┬───────┘  └────────────────┘  │
│          │                  │                               │
│          └──────────────────┘                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              │
                    ┌─────────▼──────────┐
                    │  Yemot API Server  │
                    │  (External)        │
                    └────────────────────┘
```
