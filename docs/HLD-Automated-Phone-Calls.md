# High-Level Design: Automated Phone Calls Feature

## 1. Executive Summary

This HLD describes a new feature for sending automated phone calls to students, parents, or other stakeholders using the Yemot phone system API. The feature will allow users to create reusable phone message templates and trigger them via bulk actions in the admin interface.

**Key Terminology:** 
- **English**: "Phone Template" for template, "Campaign" for execution
- **Hebrew**: "תבנית שיחה" (Tavnit Sicha) for template, "משלוח שיחות" (Mishloach Sichot) for campaign

## 2. Feature Overview

### 2.1 Core Capabilities
1. **Template Management**: Each user creates and manages their own phone message templates
2. **Message Configuration**: Define message content as text (TTS) in MVP, audio files in future phases
3. **Bulk Actions**: Trigger phone campaigns from student attendance report (pivot table)
4. **Campaign Tracking**: Monitor campaigns with user-triggered status refresh button
5. **Integration**: Each user uses their own Yemot API KEY stored in user settings

### 2.2 User Workflow
1. User configures their Yemot API KEY in user settings
2. User creates a phone message template with TTS text
3. User navigates to student attendance report (pivot table)
4. User selects records using checkboxes
5. User clicks bulk action button and selects a phone template
6. Backend extracts phone numbers and triggers Yemot campaign using user's API KEY
7. User can refresh campaign status manually using a button
8. User views campaign results in campaign history

## 3. Architecture Components

### 3.1 Data Model

#### 3.1.1 PhoneTemplate Entity (Backend)
**Location:** `/server/src/db/entities/PhoneTemplate.entity.ts`

```typescript
@Entity()
export class PhoneTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  user: User;

  @Column({ length: 100 })
  name: string;  // Template identifier/name

  @Column({ length: 500 })
  description: string;  // Human-readable description

  @Column({ nullable: true })
  yemotTemplateId: string;  // Yemot campaign template ID

  @Column({ type: 'enum', enum: ['text'] })
  messageType: 'text';  // TTS text only in MVP

  @Column({ type: 'text' })
  messageText: string;  // TTS text content (required in MVP)

  @Column({ length: 255, nullable: true })
  messageFilePath: string;  // Reserved for future audio file support

  @Column({ default: false })
  isActive: boolean;  // Enable/disable template

  @Column({ nullable: true })
  callerId: string;  // Outgoing caller ID

  @Column('simple-json', nullable: true })
  settings: PhoneTemplateSettings;  // Additional settings

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

interface PhoneTemplateSettings {
  maxRetries?: number;
  retryDelay?: number;
  timeWindow?: { start: string; end: string };
  // Future extensibility
}
```

#### 3.1.2 PhoneCampaign Entity (Backend)
**Location:** `/server/src/db/entities/PhoneCampaign.entity.ts`

```typescript
@Entity()
export class PhoneCampaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  phoneTemplateId: number;

  @ManyToOne(() => PhoneTemplate)
  phoneTemplate: PhoneTemplate;

  @Column({ nullable: true })
  yemotCampaignId: string;  // Yemot campaign execution ID

  @Column({ type: 'enum', enum: ['pending', 'running', 'completed', 'failed', 'cancelled'] })
  status: string;

  @Column({ type: 'int', default: 0 })
  totalPhones: number;

  @Column({ type: 'int', default: 0 })
  successfulCalls: number;

  @Column({ type: 'int', default: 0 })
  failedCalls: number;

  @Column('simple-json')
  phoneNumbers: PhoneEntry[];  // Phone numbers in campaign

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  completedAt: Date;
}

interface PhoneEntry {
  phone: string;
  name?: string;
  metadata?: Record<string, any>;
}
```

### 3.2 Backend Components

#### 3.2.1 YemotApiService
**Location:** `/server/src/yemot/yemot-api.service.ts`

New service to interact with Yemot REST API for campaigns/templates.

**Key Methods:**
- `createTemplate(apiKey, description)` - Create Yemot template
- `updateTemplateSettings(apiKey, templateId, settings)` - Update template configuration
- `uploadPhoneList(apiKey, templateId, phones)` - Upload phone numbers
- `runCampaign(apiKey, templateId, phones, options)` - Execute campaign with TTS mode
- `getCampaignStatus(apiKey, campaignId)` - Get campaign status (user-triggered)
- `downloadCampaignReport(apiKey, campaignId)` - Get campaign results

**Authentication:** Uses per-user API KEY from User.additionalData.yemotApiKey, passed in authorization header.


#### 3.2.2 PhoneTemplateService
**Location:** Extends `BaseEntityService<PhoneTemplate>`

Business logic for managing phone templates, integrated with BaseEntityModule.

**Key Methods:**
- `createTemplate(data)` - Create local template and Yemot template via YemotApiService
- `syncWithYemot(templateId)` - Sync local template with Yemot
- `validateTemplate(templateId)` - Validate template is ready to use

**Note:** Standard CRUD operations (list, get, update, delete) are handled by BaseEntityController.

#### 3.2.3 PhoneCampaignService
**Location:** Extends `BaseEntityService<PhoneCampaign>`

Business logic for executing and tracking campaigns.

**Key Methods:**
- `doAction(req, body)` - Overrides base method to handle custom actions:
  - `action: 'execute'` - Called from entity-specific service (e.g., StudentService), creates campaign and executes via YemotApiService
  - `action: 'refresh-status'` - User-triggered status update from Yemot
- `executeCampaign(userId, templateId, phoneNumbers)` - Core execution logic, called by entity services
- `refreshCampaignStatus(campaignId, userId)` - Fetch and update status from Yemot
- `getCampaignResults(campaignId, userId)` - Fetch detailed results from Yemot

**Execution Flow:**
1. Entity service (e.g., StudentService or AttendanceService) receives bulk action request
2. Entity service extracts phone numbers from its own entity records
3. Entity service calls `PhoneCampaignService.executeCampaign(userId, templateId, phoneNumbers)`
4. PhoneCampaignService creates PhoneCampaign record and executes via YemotApiService

**Standard Endpoints (via BaseEntityModule):**
- `POST /phone_campaign/action` with `{ action: 'execute', templateId, selectedIds }` - Routed to entity service
- `POST /phone_campaign/action` with `{ action: 'refresh-status', campaignId }` - Updates campaign status

#### 3.2.4 Entity Modules
- `/server/src/entity-modules/phone-template.config.ts` - Uses BaseEntityModule.register()
- `/server/src/entity-modules/phone-campaign.config.ts` - Uses BaseEntityModule.register()

Standard CRUD configuration following existing patterns, registered in entities.module.ts.

#### 3.2.5 Entity Service Integration (Example: StudentAttendanceService)
**Location:** Entity-specific service that handles bulk actions

To trigger phone campaigns from an entity (e.g., student attendance pivot table):

**Implementation Pattern:**
```typescript
// In StudentAttendanceService or AttendanceService
@Injectable()
export class StudentAttendanceService extends BaseEntityService<StudentAttendance> {
  constructor(
    @InjectEntityRepository repo: Repository<StudentAttendance>,
    mailSendService: MailSendService,
    private phoneCampaignService: PhoneCampaignService,  // Inject campaign service
  ) {
    super(repo, mailSendService);
  }

  async doAction(req: CrudRequest, body: any): Promise<any> {
    if (body.action === 'execute-phone-campaign') {
      // Extract phone numbers from selected records
      const selectedIds = body.selectedIds;
      const phoneNumbers = await this.extractPhoneNumbers(selectedIds);
      
      // Execute campaign via PhoneCampaignService
      return this.phoneCampaignService.executeCampaign(
        req.auth.userId,
        body.templateId,
        phoneNumbers
      );
    }
    return super.doAction(req, body);
  }

  private async extractPhoneNumbers(selectedIds: number[]): Promise<string[]> {
    // Query pivot table or entity records to get phone numbers
    // Implementation specific to entity structure
    const records = await this.repo.findByIds(selectedIds);
    return records.map(r => r.phoneNumber).filter(Boolean);
  }
}
```

**Flow:**
1. Frontend sends: `POST /api/student_attendance/action` with `{ action: 'execute-phone-campaign', templateId, selectedIds }`
2. StudentAttendanceService.doAction() receives request
3. Service extracts phone numbers from its own entity records
4. Service calls PhoneCampaignService.executeCampaign()
5. PhoneCampaignService creates campaign and executes via YemotApiService

### 3.3 Frontend Components

#### 3.3.1 Phone Template Entity
**Location:** `/client/src/entities/phone-template.jsx`

React-Admin resource for managing templates.

**Features:**
- List view with filters (name, isActive)
- Create/Edit forms with TTS message configuration
- Test campaign button (single phone number)
- Each user sees only their own templates

#### 3.3.2 Phone Campaign Entity
**Location:** `/client/src/entities/phone-campaign.jsx`

React-Admin resource for viewing campaign history.

**Features:**
- List view with filters (status, date range, template)
- Show view with summary-level results (total, success, failed counts)
- Manual "Refresh Status" button on each campaign row
- Each user sees only their own campaigns

#### 3.3.3 Bulk Action Button Component
**Location:** `/client/src/components/PhoneTemplateBulkButton.jsx`

Reusable bulk action button integrated with student attendance report pivot table.

**Props:**
- `phoneNumberExtractor` - Function to extract phone numbers from pivot records

**Behavior:**
1. Opens dialog showing user's active phone templates
2. User selects template
3. Confirms action with phone count
4. Triggers POST to entity's /action endpoint (e.g., /api/student_attendance/action) with `{ action: 'execute-phone-campaign', templateId, selectedIds }`
5. Entity service (StudentAttendanceService) extracts phone numbers and calls PhoneCampaignService
6. Shows success/error notification

#### 3.3.4 Integration Example
**Location:** Student attendance report pivot table

Add bulk button to attendance report:

```jsx
import PhoneTemplateBulkButton from 'src/components/PhoneTemplateBulkButton';

// In the pivot table component (StudentAttendanceList.jsx)
const additionalBulkButtons = [
  <PhoneTemplateBulkButton 
    key='phoneTemplate'
    phoneNumberExtractor={(record) => record.phoneNumber}  // Pivot records have phone numbers
  />
];
```

**Note:** The pivot table format differs from standard entity lists, so phone number extraction will need to be tailored to the pivot data structure.

### 3.4 API Endpoints

**All endpoints use standard BaseEntityController endpoints with CrudAuth filtering.**

#### 3.4.1 Phone Templates (via BaseEntityModule)
- `GET /api/phone_template` - List user's templates (auto-filtered by userId)
- `POST /api/phone_template` - Create template
- `GET /api/phone_template/:id` - Get template details
- `PATCH /api/phone_template/:id` - Update template
- `DELETE /api/phone_template/:id` - Delete template

**Custom actions via POST /api/phone_template/action:**
- `{ action: 'test', templateId, phoneNumber }` - Send test call to single number

#### 3.4.2 Phone Campaigns (via BaseEntityModule)
- `GET /api/phone_campaign` - List user's campaigns (auto-filtered by userId)
- `GET /api/phone_campaign/:id` - Get campaign details
- `GET /api/phone_campaign/export` - Export campaign list
- `GET /api/phone_campaign/report` - Get campaign report data

**Custom actions via POST /api/phone_campaign/action:**
- `{ action: 'refresh-status', campaignId }` - Manually refresh campaign status from Yemot

**Note:** Campaign execution is triggered from the entity where bulk action is performed (e.g., student attendance pivot). The entity service (e.g., AttendanceService) handles the bulk action, extracts phone numbers, and calls PhoneCampaignService.executeCampaign() directly.

## 4. Yemot API Integration

### 4.1 Required Yemot API Methods

#### 4.1.1 Template Management
- **CreateTemplate** - Create new campaign template
  - Returns: `templateId`
- **GetTemplates** - List all templates
  - Returns: Array of template configurations
- **UpdateTemplate** - Update template settings
- **DeleteTemplate** - Remove template (if needed)

#### 4.1.2 Content Management
- **UploadFile** - Upload audio files to Yemot
  - Endpoint: `ivr2:` path format
  - Supports: WAV files, automatic conversion
  - Template file naming: `${templateId}.wav`

#### 4.1.3 Campaign Execution
- **UploadPhoneList** - Upload phone numbers to template
  - Format: JSON or colon-separated
  - Supports: name, moreinfo, blocked status
- **RunCampaign** - Execute campaign
  - Parameters: templateId, phones, callerId, options
  - Returns: `campaignId`
  - Options: TTS mode, SMS hybrid, scheduled execution

#### 4.1.4 Campaign Monitoring
- **GetCampaignStatus** - Get real-time status
  - Returns: status, progress, statistics
- **GetActiveCampaigns** - List running campaigns
- **CampaignAction** - Control running campaigns (pause/resume/stop)
- **DownloadCampaignReport** - Get detailed results
- **GetTransactions** - View campaign billing history

### 4.2 Authentication Strategy

**Approach: Per-User API KEY in User Settings (additionalData)**

**Implementation:**
1. Store `yemotApiKey` in User.additionalData JSON field (encrypted at application level)
2. User configures their own Yemot API KEY in user settings/profile page
3. Backend retrieves user's API KEY from additionalData when executing Yemot API calls
4. Pass API KEY in `authorization` header to Yemot API
5. Each user pays for their own calls via their Yemot account

**Benefits:**
- ✅ User manages their own Yemot account and billing
- ✅ No database schema changes needed (uses existing additionalData field)
- ✅ User-level quota and budget management (handled by Yemot)
- ✅ Secure per-user isolation
- ✅ Users can set different Yemot accounts if needed

**Security:**
- Encrypt API KEY at application level before storing in additionalData
- Validate API KEY on first use (test API call)
- Show masked API KEY in UI (e.g., `077***1234`)
- Audit log for all Yemot API calls with userId

**Storage Format:**
```typescript
// User.additionalData structure
{
  yemotApiKey: 'encrypted_api_key_string',
  // ... other user settings
}
```

### 4.3 File Storage Strategy

**MVP: TTS Only - No File Storage Needed**

For MVP, only TTS (text-to-speech) messages are supported, so no audio file storage is required.

**Future Enhancement (Audio Files):**
When audio file support is added in Phase 2:
- Upload audio files directly to Yemot using UploadFile API
- Store only Yemot file path in PhoneTemplate.messageFilePath
- Use template naming convention: `tpl:${yemotTemplateId}`
- Pros: No local storage needed, files managed by Yemot
- Cons: Requires Yemot API for all file operations


## 5. Design Questions and Alternatives

### 5.1 Template Creation Timing

**Question:** When should the Yemot template be created?

**Decision: On PhoneTemplate Creation (Immediate)**
- Create Yemot template immediately when PhoneTemplate is saved
- Store yemotTemplateId immediately
- Rationale: Simple, predictable, ready to use. User already has API KEY configured.
- Consequence: May create Yemot resources that are never used, but user pays only for actual calls.

### 5.2 Message Content Management

**Question:** How should message content (text/audio) be managed?

**Decision: Embedded in PhoneTemplate (TTS only for MVP)**
- Store messageText directly in PhoneTemplate entity
- Simple, self-contained approach
- Rationale: MVP focuses on TTS only, embedded content is simplest
- Consequence: Each template has its own message text. Audio files reserved for future.

### 5.3 Phone Number Extraction

**Question:** How should phone numbers be extracted from entity records?

**Decision: Backend Extraction via doAction**
- Frontend sends selected record IDs via bulk action
- Backend receives IDs and PhoneTemplate ID
- Backend queries the pivot table/entity to extract phone numbers
- Rationale: Backend has direct database access and can handle complex pivot queries
- Consequence: Frontend just passes IDs, backend handles all extraction logic
  
**Frontend:**
```jsx
// Bulk button just sends selected IDs
<PhoneTemplateBulkButton selectedIds={selectedIds} />
```

**Backend (PhoneCampaignService.executeCampaign):**
```typescript
async executeCampaign(req: CrudRequest, body: { templateId: number }) {
  const selectedIds = body.selectedIds;  // From bulk selection
  const phoneNumbers = await this.extractPhoneNumbersFromPivot(selectedIds);
  // ... create campaign and execute
}
```

### 5.4 Campaign Execution Flow

**Question:** Should campaigns be executed synchronously or asynchronously?

**Decision: Synchronous for MVP (Simple Approach)**
- Frontend waits for backend to complete campaign execution
- Backend creates campaign, calls Yemot API, saves yemotCampaignId, returns success
- Status updates are user-triggered via "Refresh Status" button
- Rationale: Simpler implementation for MVP, no background job queue needed
- Consequence: User may wait a few seconds for large campaigns, but gets immediate feedback

**Flow:**
1. User clicks bulk action → POST /phone-campaign/action { action: 'execute', templateId, selectedIds }
2. Backend extracts phone numbers, creates PhoneCampaign record (status: pending)
3. Backend calls Yemot RunCampaign API (waits for response)
4. Backend updates PhoneCampaign with yemotCampaignId (status: running)
5. User gets success message
6. User manually clicks "Refresh Status" button later to get results

### 5.5 Result Tracking

**Question:** How granular should campaign result tracking be?

**Decision: Summary Only (MVP Level)**
- Track only aggregate statistics (total, success, failed)
- Store in PhoneCampaign entity
- Rationale: Matches MVP requirement for "mvp level" detail
- Consequence: No per-call details in MVP. Can enhance in future phases if needed.

**PhoneCampaign Fields:**
- totalPhones: number
- successfulCalls: number  
- failedCalls: number
- status: 'pending' | 'running' | 'completed' | 'failed'

### 5.6 Template vs Campaign Naming

**Question:** What terminology should we use in the UI?

**Decision: "Phone Template" + "Campaign" with Hebrew translations**
- English: "Phone Template" (template), "Campaign" (execution)
- Hebrew: "תבנית שיחה" (template), "מסע פרסום" or "משלוח שיחות" (campaign)
- Rationale: Clear, industry-standard terminology
- Consequence: User-friendly labels in both languages

### 5.7 Multi-Tenancy Considerations

**Question:** Should templates be global or per-user?

**Decision: Per-User Templates and Campaigns**
- Each user creates and manages their own templates
- Each user sees only their own campaigns
- Enforced via CrudAuth filter on userId
- Rationale: Matches requirement "each user can create its own template, and its own campaign"
- Consequence: No template sharing between users, strong isolation

### 5.8 Error Handling Strategy

**Question:** How should Yemot API errors be handled?

**Decision: Smart Retry for MVP**
- Retry on timeout/network errors (up to 2 retries)
- Fail fast on authentication/validation errors
- Log all errors with userId for debugging
- Return user-friendly error messages
- Rationale: Balance between resilience and simplicity
- Consequence: Most transient errors will succeed, permanent errors fail quickly

## 6. Implementation Phases

### Phase 1: MVP (Minimum Viable Product)
**Target:** First working version with essential features

- Store yemotApiKey in User.additionalData (no schema changes)
- User settings page to configure Yemot API KEY
- PhoneTemplate entity with TTS text only
- PhoneCampaign entity with summary-level tracking
- YemotApiService with core Yemot API methods (CreateTemplate, RunCampaign, GetCampaignStatus)
- PhoneTemplateService and PhoneCampaignService extending BaseEntityService
- Entity configs using BaseEntityModule.register()
- StudentAttendanceService integration: override doAction to handle 'execute-phone-campaign' action
- phone-template.jsx - Basic CRUD for templates
- phone-campaign.jsx - View campaign history with "Refresh Status" action button
- PhoneTemplateBulkButton integrated with student attendance pivot table
- Execute campaign via entity service doAction (e.g., /api/student_attendance/action)
- TTS messages only (no audio files)
- Summary-level campaign tracking (total, success, failed counts)
- Manual status refresh via /action endpoint (user-triggered button)

### Phase 2: Enhanced Features
- Audio file upload support (messageFilePath)
- Advanced template settings (timeWindow, retry config)
- Additional bulk action integrations (other entities beyond attendance)
- Automatic status refresh (background polling)
- Campaign report export/download
- Template test functionality (send to single number)

### Phase 3: Advanced Features
- Scheduled campaigns (time-delayed execution)
- Message personalization (insert student name, class name)
- Campaign analytics dashboard
- Per-call result tracking (detailed logs)
- Retry failed calls functionality
- Campaign cost estimation before execution

## 7. Security and Compliance

### 7.1 Security Measures
- API KEY stored securely (encrypted environment variables)
- User-level template isolation
- Phone number validation and sanitization
- Rate limiting on campaign execution
- Audit logging for all operations

### 7.2 Compliance Considerations
- GDPR: Phone numbers are personal data - ensure proper consent
- Do-not-call lists: Check against blocked numbers
- Time restrictions: Respect calling hours
- Opt-out mechanism: Provide way to unsubscribe

### 7.3 Data Privacy
- Minimize phone number retention
- Encrypt phone numbers at rest
- Audit trail for phone number access
- Automatic cleanup of old campaign data

## 8. Testing Strategy

### 8.1 Unit Tests
- Entity validation
- Service business logic
- Phone number extraction
- Yemot API client (mocked)

### 8.2 Integration Tests
- Full campaign execution flow
- Yemot API integration (sandbox)
- Error handling scenarios

### 8.3 E2E Tests
- Template creation workflow
- Bulk action execution
- Campaign status tracking

## 9. Monitoring and Observability

### 9.1 Logging
- Campaign execution events
- Yemot API calls and responses
- Error conditions
- Performance metrics

### 9.2 Metrics
- Campaign success rate
- Average campaign size
- API response times
- Error rates by type

### 9.3 Alerts
- Campaign failures
- API rate limit approaching
- Unusual call volumes

## 10. Migration and Deployment

### 10.1 Database Migrations
- Create PhoneTemplate table
- Create PhoneCampaign table
- Add indexes for performance (userId, status, createdAt)
- No User table changes needed (uses existing additionalData field)

### 10.2 Configuration
- Environment variables for Yemot API credentials
- Feature flags for gradual rollout
- Default settings configuration

### 10.3 Rollout Strategy
- Deploy backend entities and APIs first
- Test with admin users
- Add bulk buttons to selected entities
- Monitor and iterate
- Expand to all applicable entities

## 11. Decisions Made (Based on Product Owner Feedback)

All major questions have been answered by the product owner:

1. **Authentication**: ✅ Per-user API KEY stored in user settings (User.additionalData.yemotApiKey)
2. **Billing**: ✅ Each user pays via their own Yemot account/API KEY
3. **Priority**: ✅ Student attendance report pivot table gets bulk button first
4. **Content**: ✅ MVP supports TTS only, audio files in Phase 2
5. **Scheduling**: ✅ Not needed in MVP, deferred to Phase 3
6. **Reporting**: ✅ MVP level - summary statistics only (total, success, failed)
7. **Permissions**: ✅ Each user creates their own templates and campaigns (per-user isolation)
8. **Compliance**: ✅ Handled by Yemot system (calling hours, opt-out, etc.)
9. **Integration**: ✅ Not related to existing YemotCall entity (incoming calls), separate logic
10. **Terminology**: ✅ EN: "Phone Template" / "Campaign", HE: "תבנית שיחה" / "משלוח שיחות"

### Additional Implementation Details Confirmed:

11. **API Endpoints**: ✅ Use standard BaseEntityModule endpoints only (no custom routes)
12. **Campaign Execution**: ✅ Entity service (e.g., StudentAttendanceService) extracts phone numbers and calls PhoneCampaignService.executeCampaign()
13. **Status Updates**: ✅ User-triggered "Refresh Status" button via /action endpoint (no background polling in MVP)
14. **Phone Number Source**: ✅ Extract from student attendance pivot table records by entity service

## 12. Dependencies and Risks

### 12.1 External Dependencies
- Yemot API availability and stability
- Yemot account with sufficient units/credits
- Network connectivity to Yemot servers

### 12.2 Technical Risks
- Yemot API rate limits or quotas
- Large campaign execution times
- Phone number data quality
- Audio file format compatibility

### 12.3 Mitigation Strategies
- Implement robust error handling and retries
- Add campaign size limits
- Validate phone numbers before sending
- Test with small campaigns first
- Provide clear user feedback and status

## 13. Success Criteria

1. **Functionality**: Users can create templates and execute campaigns successfully
2. **Performance**: Campaigns with 100+ numbers execute within acceptable time
3. **Reliability**: 95%+ success rate for valid phone numbers
4. **Usability**: Users can complete workflow without training
5. **Adoption**: At least 50% of active users create phone templates

## 14. Future Enhancements

- SMS/voice hybrid campaigns
- Voice message recording in UI
- Campaign A/B testing
- Response tracking (key presses)
- Integration with calendar for automated campaigns
- Message templates with dynamic variables
- Multi-language support
- Voice mail detection and handling
- Custom retry logic per template
- Campaign cost estimation

## 15. Conclusion

This HLD provides a comprehensive design for the Automated Phone Calls feature with all decisions finalized based on product owner feedback. The design covers:

- **Data Models**: PhoneTemplate and PhoneCampaign entities with per-user isolation
- **Services**: YemotApiService, PhoneTemplateService, PhoneCampaignService using BaseEntityModule
- **Frontend**: React-Admin entities and bulk action button for student attendance pivot
- **Yemot Integration**: Per-user API KEY authentication, TTS messages, manual status refresh
- **Implementation**: Clear 3-phase roadmap (MVP → Enhanced → Advanced)

**Key Design Principles:**
- Per-user templates and campaigns with strong isolation
- Standard BaseEntityModule patterns only (no custom routes)
- API KEY stored in User.additionalData (no schema changes)
- TTS-only for MVP, audio files deferred
- Entity services extract phone numbers and call PhoneCampaignService
- User-triggered status updates (simple, no background polling)
- Each user manages their own Yemot account and billing

**Next Steps:**
1. ✅ HLD approved with all decisions finalized
2. Create detailed implementation tickets for Phase 1
3. Configure user settings UI for additionalData.yemotApiKey
4. Set up Yemot API test environment with test API KEY
5. Begin Phase 1 implementation
