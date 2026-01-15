# High-Level Design: Automated Phone Calls Feature

## 1. Executive Summary

This HLD describes a new feature for sending automated phone calls to students, parents, or other stakeholders using the Yemot phone system API. The feature will allow users to create reusable phone message templates and trigger them via bulk actions in the admin interface.

**Key Terminology:** We will use the term **"Phone Message Template"** or **"Phone Template"** to refer to configurable phone message definitions.

## 2. Feature Overview

### 2.1 Core Capabilities
1. **Template Management**: Create, configure, and manage reusable phone message templates
2. **Message Configuration**: Define message content as text (TTS) or recorded audio files
3. **Bulk Actions**: Trigger phone campaigns from entity lists (e.g., student classes)
4. **Campaign Tracking**: Monitor and track phone call campaigns
5. **Integration**: Seamless integration with existing Yemot system infrastructure

### 2.2 User Workflow
1. Admin creates a phone message template with configuration
2. Admin uploads or configures message content (text or audio file)
3. Admin navigates to an entity list (e.g., student classes report)
4. Admin selects records using checkboxes
5. Admin clicks bulk action button and selects a phone template
6. System triggers Yemot campaign to selected phone numbers
7. Admin can view campaign status and results

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

  @Column({ type: 'enum', enum: ['text', 'file'] })
  messageType: 'text' | 'file';  // TTS text or audio file

  @Column({ type: 'text', nullable: true })
  messageText: string;  // TTS text content

  @Column({ length: 255, nullable: true })
  messageFilePath: string;  // Path to audio file in Yemot system

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
- `createTemplate(userId, description)` - Create Yemot template
- `uploadAudioFile(templateId, filePath, audioData)` - Upload audio file  
- `updateTemplateSettings(templateId, settings)` - Update template configuration
- `uploadPhoneList(templateId, phones)` - Upload phone numbers
- `runCampaign(templateId, phones, options)` - Execute campaign
- `getCampaignStatus(campaignId)` - Get campaign status
- `downloadCampaignReport(campaignId)` - Get campaign results

**Authentication:** Uses API KEY token stored in environment variables per user.


#### 3.2.2 PhoneTemplateService
**Location:** `/server/src/phone-template/phone-template.service.ts`

Business logic for managing phone templates.

**Key Methods:**
- `createTemplate(data)` - Create template and Yemot template
- `configureMessage(templateId, messageConfig)` - Set up message content
- `syncWithYemot(templateId)` - Sync local template with Yemot
- `validateTemplate(templateId)` - Validate template is ready to use

#### 3.2.3 PhoneCampaignService
**Location:** `/server/src/phone-campaign/phone-campaign.service.ts`

Business logic for executing and tracking campaigns.

**Key Methods:**
- `executeCampaign(templateId, phoneNumbers, metadata)` - Start campaign
- `trackCampaignStatus(campaignId)` - Update campaign status
- `getCampaignResults(campaignId)` - Fetch results from Yemot
- `cancelCampaign(campaignId)` - Cancel running campaign

#### 3.2.4 Entity Modules
- `/server/src/entity-modules/phone-template.config.ts`
- `/server/src/entity-modules/phone-campaign.config.ts`

Standard CRUD configuration following existing patterns.

### 3.3 Frontend Components

#### 3.3.1 Phone Template Entity
**Location:** `/client/src/entities/phone-template.jsx`

React-Admin resource for managing templates.

**Features:**
- List view with filters (name, messageType, isActive)
- Create/Edit forms with message configuration
- File upload for audio messages
- Test campaign button
- Sync with Yemot button

#### 3.3.2 Phone Campaign Entity
**Location:** `/client/src/entities/phone-campaign.jsx`

React-Admin resource for viewing campaign history.

**Features:**
- List view with filters (status, date range, template)
- Show view with detailed results
- Real-time status updates
- Download report button

#### 3.3.3 Bulk Action Button Component
**Location:** `/client/src/components/PhoneTemplateBulkButton.jsx`

Reusable bulk action button for triggering campaigns.

**Props:**
- `entityType` - Type of entity being acted upon
- `phoneNumberExtractor` - Function to extract phone numbers from records
- `metadataExtractor` - Optional function to extract additional data

**Behavior:**
1. Opens dialog showing available active phone templates
2. User selects template
3. Confirms action with phone count
4. Triggers API call to execute campaign
5. Shows success/error notification

#### 3.3.4 Integration Example
**Location:** `/client/src/entities/student-klasses-report.jsx`

Add bulk button to existing entity:

```jsx
import PhoneTemplateBulkButton from 'src/components/PhoneTemplateBulkButton';

const additionalBulkButtons = [
  <PhoneTemplateBulkButton 
    key='phoneTemplate'
    phoneNumberExtractor={(record) => record.student?.phoneNumber}
    metadataExtractor={(record) => ({
      studentName: record.student?.name,
      klassName: record.klass?.name
    })}
  />
];
```

### 3.4 API Endpoints

#### 3.4.1 Phone Templates
- `GET /api/phone-template` - List templates
- `POST /api/phone-template` - Create template
- `GET /api/phone-template/:id` - Get template details
- `PATCH /api/phone-template/:id` - Update template
- `DELETE /api/phone-template/:id` - Delete template
- `POST /api/phone-template/:id/upload-audio` - Upload audio file
- `POST /api/phone-template/:id/sync` - Sync with Yemot
- `POST /api/phone-template/:id/test` - Send test call

#### 3.4.2 Phone Campaigns
- `GET /api/phone-campaign` - List campaigns
- `POST /api/phone-campaign/execute` - Execute new campaign
- `GET /api/phone-campaign/:id` - Get campaign details
- `POST /api/phone-campaign/:id/refresh-status` - Update from Yemot
- `POST /api/phone-campaign/:id/cancel` - Cancel campaign
- `GET /api/phone-campaign/:id/report` - Download report

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

**Recommended Approach: API KEY (Static Token)**

**Rationale:**
- ✅ Persistent, never expires
- ✅ No MFA requirements
- ✅ Can restrict by IP, services, permissions
- ✅ Suitable for server-to-server communication
- ❌ Requires manual setup per user/organization

**Implementation:**
1. Store API KEY in User entity or separate YemotConfig entity
2. Use environment variable for default/system-level key
3. Pass token in `authorization` header (recommended) or as `token` parameter

**Alternative: Login Token (Dynamic)**
- Only if per-user authentication is required
- Requires MFA handling or IP whitelisting
- Adds complexity with token expiration

### 4.3 File Storage Strategy

**Option A: Direct Yemot Storage (Recommended)**
- Upload audio files directly to Yemot using UploadFile API
- Store only Yemot file path in PhoneTemplate entity
- Pros: No local storage needed, files managed by Yemot
- Cons: Requires Yemot API for all file operations

**Option B: Hybrid Storage**
- Store files locally and sync to Yemot when template activated
- Keep local backup for redundancy
- Pros: Offline access, backup capability
- Cons: Increased storage requirements, sync complexity

**Option C: Reference Existing Text/Audio System**
- Extend existing Text entity pattern with filepath field
- Leverage TextByUser view for per-user overrides
- Pros: Consistent with existing patterns, reusable infrastructure
- Cons: May not fit all use cases


## 5. Design Questions and Alternatives

### 5.1 Template Creation Timing

**Question:** When should the Yemot template be created?

**Option A: On PhoneTemplate Creation (Recommended)**
- Create Yemot template immediately when PhoneTemplate is saved
- Store yemotTemplateId immediately
- Pros: Simple, predictable, ready to use
- Cons: Creates Yemot resources that may never be used

**Option B: On First Use**
- Create Yemot template lazily when first campaign is executed
- Pros: Only creates resources when actually needed
- Cons: Added complexity, potential failure point during campaign execution

**Option C: Manual Activation**
- Require explicit "Activate" action to create Yemot template
- Pros: User control, clear activation status
- Cons: Extra user step, potential confusion

**Recommendation:** Option A for simplicity, with Option C as enhancement for advanced users.

### 5.2 Message Content Management

**Question:** How should message content (text/audio) be managed?

**Option A: Embedded in PhoneTemplate (Recommended)**
- Store messageText and messageFilePath directly in PhoneTemplate entity
- Upload audio to Yemot using template naming convention
- Pros: Self-contained, simple to implement
- Cons: Less reusable across templates

**Option B: Separate PhoneMessage Entity**
- Create separate entity for message content
- PhoneTemplate references PhoneMessage
- Pros: Reusable messages, versioning capability
- Cons: Added complexity, more entities to manage

**Option C: Reuse Text Entity**
- Extend existing Text entity pattern
- Use TextByUser view for per-user overrides
- Pros: Consistent with existing system, leverages existing infrastructure
- Cons: Text entity may not fit all phone message needs

**Option D: Hybrid Approach**
- Allow both embedded content AND reference to Text entity
- User chooses which to use
- Pros: Maximum flexibility
- Cons: Most complex, potential confusion

**Recommendation:** Start with Option A for MVP, consider Option C for consistency if Text entity fits requirements well.

### 5.3 Phone Number Extraction

**Question:** How should phone numbers be extracted from entity records?

**Option A: Configuration-Based (Recommended)**
- Define phone number field path in bulk button configuration
- Use accessor function: `phoneNumberExtractor={(record) => record.student.phoneNumber}`
- Pros: Flexible, works with any entity, explicit
- Cons: Requires configuration per entity

**Option B: Convention-Based**
- Follow naming convention (e.g., look for `phoneNumber`, `phone`, `mobile` fields)
- Auto-detect phone numbers in records
- Pros: Less configuration, automatic
- Cons: May miss edge cases, less explicit

**Option C: Entity-Specific Services**
- Create service methods per entity type
- E.g., `StudentKlassService.getPhoneNumbers(recordIds)`
- Pros: Business logic encapsulation, type-safe
- Cons: More code, harder to extend

**Recommendation:** Option A for flexibility, with Option C as enhancement for complex cases.

### 5.4 Campaign Execution Flow

**Question:** Should campaigns be executed synchronously or asynchronously?

**Option A: Asynchronous with Job Queue (Recommended)**
- Create PhoneCampaign record immediately
- Execute Yemot API call asynchronously
- Poll for status updates
- Pros: Non-blocking UI, handles failures gracefully
- Cons: Requires job queue or background worker

**Option B: Synchronous Execution**
- Wait for Yemot API response before returning
- Pros: Simple, immediate feedback
- Cons: Slow UI, timeout risks, poor UX for large campaigns

**Option C: Hybrid - Quick Validation Then Async**
- Validate template and phones synchronously
- Execute campaign asynchronously
- Pros: Fast failure feedback, non-blocking execution
- Cons: Medium complexity

**Recommendation:** Option C for best UX, or Option A for production-grade implementation.

### 5.5 Result Tracking

**Question:** How granular should campaign result tracking be?

**Option A: Summary Only (Recommended for MVP)**
- Track only aggregate statistics (total, success, failed)
- Store in PhoneCampaign entity
- Pros: Simple, low storage overhead
- Cons: No per-call details

**Option B: Per-Call Tracking**
- Create PhoneCampaignCall entity for each call
- Store individual call results
- Pros: Detailed insights, troubleshooting capability
- Cons: High storage overhead, more complex

**Option C: Summary + Error Details**
- Store aggregate stats plus failed call details
- Pros: Balance of simplicity and troubleshooting
- Cons: Medium complexity

**Recommendation:** Option A for MVP, enhance to Option C based on user needs.

### 5.6 Template vs Campaign Naming

**Question:** What terminology should we use in the UI?

**Option A: "Phone Template" + "Campaign" (Recommended)**
- Template = reusable configuration
- Campaign = specific execution instance
- Pros: Clear distinction, industry standard
- Cons: More concepts to explain

**Option B: "Phone Message" + "Broadcast"**
- Message = content to send
- Broadcast = sending action
- Pros: Simpler language, user-friendly
- Cons: Less technical precision

**Option C: "Call Template" + "Call Job"**
- Technical naming
- Pros: Precise, developer-friendly
- Cons: Less user-friendly

**Recommendation:** Option A for clarity, use "Phone Message Template" in UI for user-friendliness.

### 5.7 Multi-Tenancy Considerations

**Question:** Should templates be global or per-user?

**Option A: Per-User Templates (Recommended)**
- Each user has their own templates
- Managed via userId foreign key
- Pros: Isolation, security, aligns with existing pattern
- Cons: No template sharing

**Option B: Global Templates with Permissions**
- System-level templates (userId = 0)
- User-level templates (userId > 0)
- Pros: Template reuse, admin control
- Cons: More complex permissions

**Option C: Organization-Level Templates**
- Templates scoped to organization
- Requires organization entity
- Pros: Team collaboration
- Cons: Requires organization model

**Recommendation:** Option A for MVP, enhance to Option B following Text entity pattern.

### 5.8 Error Handling Strategy

**Question:** How should Yemot API errors be handled?

**Option A: Retry with Exponential Backoff**
- Automatically retry failed API calls
- Implement exponential backoff
- Pros: Resilient to transient failures
- Cons: Delayed error reporting

**Option B: Fail Fast**
- Report errors immediately
- User manually retries
- Pros: Simple, clear failures
- Cons: Poor UX for temporary issues

**Option C: Smart Retry**
- Retry on specific error codes (timeout, rate limit)
- Fail fast on others (auth, invalid data)
- Pros: Best UX, balanced approach
- Cons: Most complex

**Recommendation:** Option C for production quality.

## 6. Implementation Phases

### Phase 1: MVP (Minimum Viable Product)
- PhoneTemplate entity with basic fields
- PhoneCampaign entity with status tracking
- YemotApiService with core methods
- Basic template CRUD in admin
- Single bulk action button implementation
- Text-based messages (TTS) only
- Summary-level campaign tracking

### Phase 2: Enhanced Features
- Audio file upload support
- Advanced template settings
- Multiple bulk action integrations
- Real-time status updates
- Campaign report download

### Phase 3: Advanced Features
- Scheduled campaigns
- Template sharing (global templates)
- Per-call result tracking
- Campaign analytics dashboard
- Message personalization (name insertion)
- Retry failed calls

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
- Add indexes for performance

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

## 11. Open Questions for Product Owner

1. **Authentication**: Do we have Yemot API KEY for each user, or single system-level key?
2. **Billing**: Who pays for phone calls? Is there a budget/limit per user?
3. **Priority**: Which entity should get bulk action button first? (student-klasses-report?)
4. **Content**: Should we support both TTS and audio files in MVP, or TTS only?
5. **Scheduling**: Is scheduled campaign execution needed in MVP?
6. **Reporting**: What level of detail is needed in campaign reports?
7. **Permissions**: Should all users be able to create templates, or admin-only?
8. **Compliance**: Are there legal requirements for calling hours, opt-out, etc.?
9. **Integration**: Should this integrate with existing YemotCall entity for incoming calls?
10. **Naming**: Do we prefer "Phone Template", "Phone Message", or "Call Template" in UI?

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

This HLD provides a comprehensive design for the Automated Phone Calls feature, covering all architectural aspects from data models to API integration. The phased implementation approach allows for incremental delivery and validation. The design questions highlight key decision points that should be discussed with stakeholders before detailed implementation begins.

**Next Steps:**
1. Review and approve HLD
2. Answer open questions
3. Create detailed implementation tickets
4. Set up Yemot API test environment
5. Begin Phase 1 implementation
