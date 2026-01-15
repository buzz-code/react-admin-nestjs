# High-Level Design: Automated Phone Calls Feature

## Executive Summary

This document outlines the design for an automated outbound phone calling system integrated with the Yemot telephony platform. The system will allow administrators to create reusable phone message templates and trigger automated calls to students' phone numbers through bulk actions in the existing UI.

**Version:** 1.0  
**Date:** 2026-01-15  
**Status:** Draft for Review

---

## 1. Feature Overview

### 1.1 Business Goals
- Enable automated communication with students/parents via phone calls
- Reduce manual effort in sending routine notifications
- Provide a flexible, template-based system for various message types
- Integrate seamlessly with existing educational workflows

### 1.2 Key Capabilities
1. **Message Template Management**: Create, edit, and manage phone message templates
2. **Flexible Message Content**: Support both text-to-speech (TTS) and pre-recorded audio files
3. **Bulk Triggering**: Initiate calls to multiple recipients from entity lists (e.g., student-klasses-report)
4. **Call Tracking**: Monitor call status and results
5. **User-Specific Configuration**: Allow each organization to customize messages

---

## 2. Terminology

### 2.1 Core Terms

**Proposed Term: "Phone Message Template" (or "Call Template")**

**Alternative Options:**
1. **"Phone Message Template"** ✅ RECOMMENDED
   - **Pros**: Clear, descriptive, aligns with existing "Text" entity pattern
   - **Cons**: Slightly verbose
   - **Use Case**: Best for UI labels and user-facing documentation

2. **"Call Template"**
   - **Pros**: Concise, developer-friendly
   - **Cons**: May be ambiguous (template for what?)
   - **Use Case**: Good for code/API naming

3. **"Voice Message"**
   - **Pros**: User-friendly, intuitive
   - **Cons**: Doesn't convey the template/reusable nature
   - **Use Case**: Good for non-technical users

4. **"Phone Notification Template"**
   - **Pros**: Emphasizes notification purpose
   - **Cons**: Too long for frequent use
   - **Use Case**: Good for formal documentation

**Decision Required**: Which terminology should we use for:
- Entity name in database?
- UI labels?
- API endpoints?

**Recommendation**: Use "Phone Message Template" for UI, "phone_message" for database entities, and "phoneMessage" in code.

---

## 3. System Architecture

### 3.1 Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │ Phone Message    │  │ Bulk Action Buttons          │    │
│  │ CRUD UI          │  │ (Student List, etc.)         │    │
│  └──────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Server Layer                          │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │ Phone Message    │  │ Phone Call Service           │    │
│  │ Entity & Config  │  │ (Orchestration)              │    │
│  └──────────────────┘  └──────────────────────────────┘    │
│                                  │                           │
│                         ┌────────┴────────┐                 │
│                         ▼                 ▼                  │
│              ┌──────────────────┐  ┌──────────────┐         │
│              │ Yemot API Client │  │ Call Tracking│         │
│              └──────────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     External Services                        │
│                   ┌──────────────────┐                       │
│                   │ Yemot IVR System │                       │
│                   └──────────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Database Design

### 4.1 Phone Message Template Entity

**Table Name**: `phone_messages`

**Schema**:
```typescript
@Entity('phone_messages')
export class PhoneMessage implements IHasUserId {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('varchar', { length: 100, unique: true })
  name: string;  // Unique identifier/key

  @Column('varchar', { length: 500 })
  description: string;  // Human-readable description

  @Column('enum', { enum: ['tts', 'audio_file'] })
  messageType: 'tts' | 'audio_file';

  @Column('text', { nullable: true })
  textContent: string;  // For TTS messages

  @Column('varchar', { length: 255, nullable: true })
  audioFilePath: string;  // For pre-recorded audio

  @Column('boolean', { default: false })
  isActive: boolean;  // Enable/disable without deletion

  @Column('varchar', { length: 100, nullable: true })
  yemotInstanceId: string;  // Reference to Yemot configuration

  @Column('simple-json', { nullable: true })
  additionalParams: Record<string, any>;  // Flexible params for future use

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Design Questions:**

**Q1: Should we support variable substitution in messages?**
- **Option A**: Fixed messages only (simpler implementation)
  - Pro: Easier to implement and test
  - Con: Less flexible
- **Option B**: Support placeholders like `{studentName}`, `{className}` ✅ RECOMMENDED
  - Pro: More dynamic and personalized
  - Con: Requires parameter mapping and validation
  - Implementation: Follow existing `FormatString` pattern from `yemot.interface.ts`

**Q2: Should messages be user-specific or system-wide?**
- **Option A**: User-specific (userId field required) ✅ RECOMMENDED
  - Pro: Allows per-organization customization
  - Con: More records in database
  - Aligns with: Existing `Text` entity pattern
- **Option B**: System-wide with user overrides
  - Pro: Reduced duplication
  - Con: More complex implementation
- **Option C**: Hybrid (userId = 0 for system, specific userId for overrides)
  - Pro: Best of both worlds
  - Con: Most complex, but aligns with `TextByUser` view pattern

**Recommendation**: Use Option C (Hybrid approach) to align with existing `Text`/`TextByUser` pattern.

### 4.2 Call History Entity

**Table Name**: `phone_call_history`

**Schema**:
```typescript
@Entity('phone_call_history')
export class PhoneCallHistory implements IHasUserId {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('int', { name: 'phone_message_id' })
  phoneMessageId: number;

  @Column('varchar', { length: 20 })
  phoneNumber: string;

  @Column('varchar', { length: 100, nullable: true })
  recipientName: string;  // For reference

  @Column('varchar', { length: 100, nullable: true })
  recipientType: string;  // e.g., 'student', 'parent', 'teacher'

  @Column('int', { nullable: true })
  recipientReferenceId: number;  // Reference to Student.id, etc.

  @Column('enum', { enum: ['pending', 'queued', 'calling', 'completed', 'failed', 'cancelled'] })
  status: string;

  @Column('varchar', { length: 255, nullable: true })
  yemotCallId: string;  // External call ID from Yemot

  @Column('simple-json', { nullable: true })
  callResult: Record<string, any>;  // Response from Yemot API

  @Column('text', { nullable: true })
  errorMessage: string;

  @Column('datetime', { nullable: true })
  initiatedAt: Date;

  @Column('datetime', { nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Design Questions:**

**Q3: Should we track call attempts or just final results?**
- **Option A**: Single record per call attempt ✅ RECOMMENDED
  - Pro: Simpler schema
  - Con: Lost history if retry
- **Option B**: Separate attempts table
  - Pro: Full audit trail
  - Con: More complex queries
- **Recommendation**: Start with Option A, consider B if retry logic is needed

**Q4: Should we support scheduled calls?**
- **Option A**: Immediate execution only (MVP)
  - Pro: Simpler implementation
  - Con: Limited functionality
- **Option B**: Support scheduled time ✅ RECOMMENDED for Phase 2
  - Pro: More flexible (e.g., call during business hours)
  - Con: Requires job scheduler (consider Bull, node-cron)
  - Implementation: Add `scheduledFor: Date` column, use NestJS Bull Queue

---

## 5. Backend Implementation

### 5.1 Entity Module Configuration

**File**: `/server/src/entity-modules/phone-message.config.ts`

```typescript
import { PhoneMessage } from '@/db/entities/PhoneMessage.entity';
import { getBaseEntityConfig } from '@shared/base-entity/base-entity-config';

export default getBaseEntityConfig(PhoneMessage, {
  dto: {
    create: CreatePhoneMessageDto,
    update: UpdatePhoneMessageDto,
  },
  permissions: {
    list: 'admin',
    get: 'admin',
    create: 'admin',
    update: 'admin',
    delete: 'admin',
  },
});
```

### 5.2 Phone Call Service

**File**: `/server/src/services/phone-call.service.ts`

**Key Responsibilities:**
1. Validate phone message template
2. Prepare message content (resolve variables, validate audio files)
3. Call Yemot API to initiate outbound call
4. Create call history records
5. Handle bulk call operations

**Core Methods:**
```typescript
@Injectable()
export class PhoneCallService {
  constructor(
    @InjectRepository(PhoneMessage) private phoneMessageRepo: Repository<PhoneMessage>,
    @InjectRepository(PhoneCallHistory) private callHistoryRepo: Repository<PhoneCallHistory>,
    private yemotApiService: YemotApiService,
  ) {}

  async initiateCall(params: InitiateCallDto): Promise<PhoneCallHistory>;
  async bulkInitiateCalls(params: BulkInitiateCallDto): Promise<PhoneCallHistory[]>;
  async getCallStatus(callId: number): Promise<PhoneCallHistory>;
  async cancelCall(callId: number): Promise<void>;
}
```

### 5.3 Yemot API Integration

**File**: `/server/shared/utils/yemot/yemot-api.service.ts`

**Design Questions:**

**Q5: Which Yemot API endpoint should we use for outbound calls?**

Based on the Yemot API documentation (https://f2.freeivr.co.il), the relevant endpoints are:

- **Option A**: `ApiOutCallV2` - Modern outbound call API ✅ RECOMMENDED
  - Pro: Latest API, better features
  - Con: May require specific Yemot account level
  - **Parameters**:
    - `token`: Authentication token
    - `phone`: Target phone number
    - `text` OR `file`: Message content (TTS or audio file URL)
    - `CallerID`: Display number (optional)
    - `params`: Additional parameters

- **Option B**: `ApiOutCall` - Legacy outbound call API
  - Pro: Broader compatibility
  - Con: Older, potentially fewer features

- **Option C**: `ApiSendMultipleMessage` - Bulk message API
  - Pro: Optimized for bulk operations
  - Con: May have rate limits

**Recommendation**: Use `ApiOutCallV2` with fallback to `ApiOutCall` if needed.

**Q6: How should we handle audio file hosting?**

- **Option A**: Upload files to Yemot storage ✅ RECOMMENDED for Phase 1
  - Pro: Integrated with Yemot, no external hosting needed
  - Con: Requires additional API call, file management
  - Yemot API: `ApiUploadFile`

- **Option B**: Host files on application server with public URL
  - Pro: Full control over files
  - Con: Requires public-facing endpoint, CDN consideration
  - Implementation: Serve from `/server/public/audio/` with proper access controls

- **Option C**: Use cloud storage (S3, Google Cloud Storage)
  - Pro: Scalable, reliable
  - Con: Additional infrastructure and costs

**Recommendation**: Start with Option A (Yemot storage), plan for Option C if scale demands it.

**Q7: How should we handle Yemot authentication tokens?**

- **Option A**: Single system-wide token in environment variables
  - Pro: Simple configuration
  - Con: All calls from same account, single point of failure

- **Option B**: User-specific tokens (stored per user) ✅ RECOMMENDED
  - Pro: Better isolation, per-organization billing
  - Con: More complex configuration, requires UI for token management
  - Implementation: Add `yemotToken` field to User entity, encrypted storage

- **Option C**: Centralized token management service
  - Pro: Best security, token rotation support
  - Con: Over-engineered for MVP

**Recommendation**: Start with Option A for MVP, migrate to Option B for production.

**Implementation Approach:**

```typescript
@Injectable()
export class YemotApiService {
  constructor(private httpService: HttpService) {}

  async initiateOutboundCall(params: YemotOutboundCallParams): Promise<YemotCallResponse> {
    const endpoint = 'https://www.call2all.co.il/ym/api/ApiOutCallV2';
    const payload = {
      token: params.token,
      phone: params.phoneNumber,
      ...(params.messageType === 'tts' 
        ? { text: params.textContent } 
        : { file: params.audioFileUrl }),
      CallerID: params.callerId || undefined,
    };

    try {
      const response = await this.httpService.post(endpoint, payload).toPromise();
      return this.parseYemotResponse(response.data);
    } catch (error) {
      throw new YemotApiException(`Failed to initiate call: ${error.message}`);
    }
  }

  async uploadAudioFile(token: string, filePath: string): Promise<string> {
    // Implementation for ApiUploadFile
  }

  async getCallStatus(token: string, callId: string): Promise<YemotCallStatus> {
    // Implementation for checking call status
  }
}
```

---

## 6. Frontend Implementation

### 6.1 Phone Message Template Management

**File**: `/client/src/entities/phone-message.jsx`

**UI Components:**
1. **List View**: Display all phone message templates with status
2. **Create Form**: Create new template with validation
3. **Edit Form**: Modify existing template
4. **Preview**: Test message content (TTS or play audio)

**Key Fields:**
- Name (unique identifier)
- Description
- Message Type (TTS / Audio File)
- Content (text or file upload)
- Active status toggle
- Variable placeholders help text

**Design Pattern**: Follow existing `text.jsx` entity pattern with Material-UI components.

### 6.2 Bulk Action Button

**File**: `/client/src/components/bulk-actions/BulkPhoneCallButton.jsx`

**User Workflow:**
1. User selects students from list (e.g., student-klasses-report)
2. Clicks "Send Phone Call" bulk action button
3. Modal opens with:
   - Dropdown to select phone message template
   - Preview of message
   - Phone number source field selection (e.g., student phone, parent phone)
   - Confirmation button
4. System validates and queues calls
5. Success notification with summary

**Implementation:**

```jsx
export const BulkPhoneCallButton = () => {
  const { selectedIds } = useListContext();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { data: templates } = useGetList('phone_message', { 
    filter: { isActive: true } 
  });

  const handleSendCalls = async () => {
    // Call dataProvider to trigger bulk phone calls
    await dataProvider.create('phone_call_history/bulk', {
      data: {
        phoneMessageId: selectedTemplate.id,
        recipientIds: selectedIds,
        recipientType: 'student',
      }
    });
  };

  return (
    <BulkRequestButton 
      label="שלח שיחת טלפון"
      icon={<PhoneIcon />}
      mutate={handleSendCalls}
      // ... additional props
    >
      <SelectInput 
        source="phoneMessageId" 
        choices={templates} 
        optionText="description"
      />
      <SelectInput 
        source="phoneNumberField" 
        choices={[
          { id: 'phone', name: 'טלפון תלמיד' },
          { id: 'parentPhone', name: 'טלפון הורה' }
        ]}
      />
    </BulkRequestButton>
  );
};
```

**Integration Points:**
- Add to `student-klasses-report.jsx` additionalBulkButtons
- Add to `student-klass.jsx` additionalBulkButtons
- Consider adding to `student.jsx` for individual calls

### 6.3 Call History Viewer

**File**: `/client/src/entities/phone-call-history.jsx`

**Display Information:**
- Call timestamp
- Recipient details
- Message template used
- Status (with color coding)
- Error messages (if failed)
- Filters: by date, status, recipient, message template

**Actions:**
- Retry failed calls
- Cancel pending calls
- Export call log

---

## 7. API Endpoints

### 7.1 Phone Message Templates

| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/phone_message` | List templates | admin |
| GET | `/api/phone_message/:id` | Get template details | admin |
| POST | `/api/phone_message` | Create template | admin |
| PATCH | `/api/phone_message/:id` | Update template | admin |
| DELETE | `/api/phone_message/:id` | Delete template | admin |

### 7.2 Phone Call Operations

| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| POST | `/api/phone_call_history` | Initiate single call | admin |
| POST | `/api/phone_call_history/bulk` | Initiate bulk calls | admin |
| GET | `/api/phone_call_history` | List call history | admin |
| GET | `/api/phone_call_history/:id` | Get call details | admin |
| POST | `/api/phone_call_history/:id/retry` | Retry failed call | admin |
| POST | `/api/phone_call_history/:id/cancel` | Cancel pending call | admin |

---

## 8. Security Considerations

### 8.1 Phone Number Validation

**Q8: Should we validate/sanitize phone numbers?**

- **Option A**: Accept any format, pass to Yemot ✅ RECOMMENDED for MVP
  - Pro: Flexible, Yemot handles validation
  - Con: May allow invalid numbers

- **Option B**: Validate Israeli phone number format
  - Pro: Catch errors early, reduce costs
  - Con: May reject valid international formats
  - Pattern: `/^0\d{1,2}-?\d{7}$/` or `/^972\d{9}$/`

- **Option C**: Use libphonenumber-js for international validation
  - Pro: Robust, international support
  - Con: Additional dependency

**Recommendation**: Implement basic validation (Option B) with whitelist of prefixes.

### 8.2 Rate Limiting

**Considerations:**
- Prevent abuse of bulk call feature
- Respect Yemot API rate limits
- Implement NestJS ThrottlerModule (already in use)

**Proposed Limits:**
- Phone message creation: 10 per hour per user
- Bulk calls: 100 calls per batch, 5 batches per hour per user
- Individual calls: 50 per hour per user

### 8.3 Sensitive Data

**Protect:**
- Phone numbers: Log only masked versions (e.g., `05X-XXX-1234`)
- Yemot tokens: Encrypt at rest, never log
- Audio files: Validate file types, scan for malware if user-uploaded

### 8.4 Permissions

**Access Control:**
- Only admin users can create/manage phone message templates
- Only admin users can initiate calls
- Consider adding specific permission: `canInitiatePhoneCalls`
- Audit all call actions in `audit_log` table

---

## 9. Error Handling

### 9.1 Failure Scenarios

| Scenario | Handling Strategy |
|----------|------------------|
| Invalid phone number | Validate before queuing, mark as failed immediately |
| Yemot API timeout | Retry with exponential backoff (3 attempts) |
| Audio file not found | Fail fast, notify admin |
| Yemot account quota exceeded | Graceful failure, queue for retry later |
| Invalid template variables | Validate on template save and call initiation |
| Recipient opted out | Check opt-out list, skip silently |

### 9.2 Retry Logic

**Q9: How should we handle retries?**

- **Option A**: Manual retry only (admin clicks retry button)
  - Pro: Simple, controlled
  - Con: Requires manual intervention

- **Option B**: Automatic retry with exponential backoff ✅ RECOMMENDED
  - Pro: Resilient, hands-off
  - Con: More complex implementation
  - Strategy: Retry at 1min, 5min, 15min intervals for transient failures

- **Option C**: Queue-based with worker process
  - Pro: Most robust, decoupled
  - Con: Requires job queue infrastructure (Bull, BullMQ)

**Recommendation**: Start with Option A, implement Option B for production.

---

## 10. Integration with Existing Entities

### 10.1 Student Entity

**Changes Required:**
- Ensure `phone` field exists and is accessible
- Consider adding `parentPhone` field if not present
- Add opt-out flag: `phoneCallOptOut` (boolean)

### 10.2 Student Klasses Report

**Changes Required:**
- Add `BulkPhoneCallButton` to `additionalBulkButtons` array
- Ensure phone numbers are loaded with report data

**Example Integration:**
```jsx
const additionalBulkButtons = [
  <StudentReportCardReactButton key='studentReportCardReact' />,
  <BulkPhoneCallButton key='bulkPhoneCall' />,  // NEW
];
```

### 10.3 App Registration

**Changes Required:**
- Register `phone_message` resource in `/client/src/App.jsx`
- Register `phone_call_history` resource for admin users
- Add appropriate icons (PhoneIcon, CallIcon)
- Place in 'settings' menu group for templates
- Place in 'admin' menu group for call history

---

## 11. Testing Strategy

### 11.1 Unit Tests

**Backend:**
- `PhoneCallService` methods
- Yemot API client mock responses
- Message template validation
- Variable substitution logic

**Frontend:**
- Phone message CRUD components
- Bulk action button rendering
- Form validation

### 11.2 Integration Tests

- End-to-end flow: Create template → Trigger bulk call → Verify history
- Yemot API integration (use sandbox/test account)
- Error handling scenarios

### 11.3 Manual Testing

- Test with real Yemot account (use test phone numbers)
- Verify TTS quality and audio playback
- Test all bulk action scenarios
- Verify call history accuracy

---

## 12. Performance Considerations

### 12.1 Bulk Operations

**Q10: How should we handle large bulk operations?**

- **Option A**: Synchronous processing (block until done)
  - Pro: Simple, immediate feedback
  - Con: Slow for large batches, request timeout risk

- **Option B**: Asynchronous with job queue ✅ RECOMMENDED
  - Pro: Fast response, no timeout, resilient
  - Con: Requires queue infrastructure (Bull)
  - Implementation:
    ```typescript
    @Processor('phone-calls')
    export class PhoneCallProcessor {
      @Process('bulk-initiate')
      async handleBulkCalls(job: Job<BulkCallData>) {
        // Process calls in batches of 10
      }
    }
    ```

- **Option C**: Hybrid (queue for >50 calls, sync for smaller)
  - Pro: Best UX for common cases
  - Con: Dual code paths

**Recommendation**: Implement Option B from the start to avoid refactoring.

### 12.2 Database Indexing

**Indexes Required:**
- `phone_messages`: `userId`, `name`, `isActive`
- `phone_call_history`: `userId`, `phoneMessageId`, `status`, `createdAt`

### 12.3 Caching

- Cache active phone message templates (60 seconds TTL)
- Use existing TypeORM caching for `TextByUser` pattern

---

## 13. Monitoring & Observability

### 13.1 Metrics to Track

- Total calls initiated (by template, by user)
- Success/failure rates
- Average call duration
- Yemot API response times
- Queue depth (if using job queue)

### 13.2 Logging

**Log Events:**
- Template creation/modification
- Bulk call initiation (with count)
- Individual call status changes
- Yemot API errors
- Retry attempts

**Log Level Guidelines:**
- INFO: Call initiated, completed
- WARN: Retry attempt, invalid phone number
- ERROR: Yemot API failure, system error

### 13.3 Alerts

**Alert Conditions:**
- Failure rate > 10% in 1-hour window
- Yemot API unavailable
- Queue depth > 1000 pending calls
- Token authentication failures

---

## 14. Implementation Phases

### Phase 1: MVP (Core Functionality)
**Timeline: 2-3 weeks**

**Backend:**
- [ ] Create `PhoneMessage` entity and migration
- [ ] Create `PhoneCallHistory` entity and migration
- [ ] Implement `PhoneCallService` with basic operations
- [ ] Create Yemot API client service (TTS only)
- [ ] Add phone message entity module configuration
- [ ] Add bulk call endpoint

**Frontend:**
- [ ] Create phone message CRUD UI (list, create, edit)
- [ ] Implement `BulkPhoneCallButton` component
- [ ] Integrate button into `student-klasses-report`
- [ ] Create call history viewer (read-only)

**Testing:**
- [ ] Unit tests for services
- [ ] Integration test for bulk call flow
- [ ] Manual testing with Yemot sandbox

### Phase 2: Enhanced Features
**Timeline: 1-2 weeks**

- [ ] Audio file upload support
- [ ] Variable substitution in messages
- [ ] Retry logic for failed calls
- [ ] User-specific Yemot token management
- [ ] Call status webhook endpoint (if Yemot supports)

### Phase 3: Advanced Features
**Timeline: 2-3 weeks**

- [ ] Scheduled calls (job queue with Bull)
- [ ] Call templates with approval workflow
- [ ] Opt-out management UI
- [ ] Enhanced reporting and analytics
- [ ] Export call history to CSV
- [ ] Integration with additional entities (teachers, parents)

### Phase 4: Production Hardening
**Timeline: 1 week**

- [ ] Performance optimization
- [ ] Enhanced error handling
- [ ] Monitoring dashboard
- [ ] Load testing
- [ ] Security audit
- [ ] Documentation

---

## 15. Open Questions & Decisions Required

### 15.1 Critical Decisions

**Q11: Yemot Account Setup**
- Do we have an existing Yemot account with API access?
- What is the account tier and associated rate limits?
- Do we need separate accounts for staging/production?

**Q12: User Workflow Priorities**
- Which entity lists should have bulk call buttons initially?
  - Student klasses report ✅ (specified in requirements)
  - Student list?
  - Teacher list (for staff notifications)?
  - Custom recipient lists?

**Q13: Message Content Validation**
- Should we validate message content (e.g., max length, forbidden words)?
- Should admins be able to preview/test messages before using in bulk?

**Q14: Billing & Cost Control**
- How should we track Yemot call costs?
- Should we implement quota limits per user/organization?
- Should we require additional approval for large bulk operations (e.g., >100 calls)?

### 15.2 Future Considerations

**Q15: Interactive Calls (IVR)**
- Current design focuses on one-way outbound messages
- Should we plan for interactive responses in the future?
- Would require webhook endpoint for Yemot to send responses back

**Q16: Multi-Language Support**
- Should TTS support multiple languages?
- Yemot supports Hebrew TTS by default
- Consider adding language field to template if needed

**Q17: Integration with Existing Yemot Functionality**
- The system has existing inbound call handling (`YemotHandlerService`, chains)
- Should outbound calls be integrated with the existing call tracking?
- Current `YemotCall` entity tracks inbound calls - should outbound use the same or separate entity?

---

## 16. Dependencies & Prerequisites

### 16.1 External Services
- **Yemot Account**: Active account with API access, token obtained
- **Audio File Hosting**: If using pre-recorded audio (Yemot storage or internal CDN)

### 16.2 Technical Dependencies
- **NestJS HttpModule**: For Yemot API calls
- **Bull/BullMQ** (Phase 2): For job queue (optional)
- **@nestjs/schedule** (Phase 3): For scheduled calls (optional)
- **class-validator**: For DTO validation (already in use)

### 16.3 Infrastructure
- **Database**: Migrations for new entities
- **Storage**: For uploaded audio files (if applicable)
- **Redis** (Phase 2): For job queue (if using Bull)

---

## 17. Risk Assessment

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Yemot API changes | High | Medium | Version API calls, monitor Yemot docs |
| Rate limiting by Yemot | Medium | Medium | Implement queue, respect limits |
| Invalid phone numbers cause costs | Medium | High | Validate before calling, maintain opt-out list |
| Audio file storage costs | Low | Low | Use Yemot storage, set file size limits |
| User error in bulk operations | High | Medium | Confirmation dialogs, preview, undo option |
| Privacy concerns with call logs | Medium | Low | Mask phone numbers in logs, retention policy |

---

## 18. Success Criteria

### 18.1 Functional Requirements
- ✅ Admins can create and manage phone message templates
- ✅ Admins can select students and trigger bulk phone calls
- ✅ System tracks call history with status
- ✅ Supports both TTS and audio file messages
- ✅ Integrates seamlessly with existing UI

### 18.2 Non-Functional Requirements
- **Performance**: Bulk calls queued in <2 seconds, processed within 5 minutes
- **Reliability**: 95%+ call success rate (excluding invalid numbers)
- **Usability**: New users can create and send calls within 5 minutes
- **Security**: No unauthorized access, audit trail for all actions

### 18.3 Business Metrics
- Time savings: Reduce manual calling time by 80%
- Adoption: 50%+ of admins use feature within first month
- Satisfaction: Positive feedback from users

---

## 19. References

### 19.1 Yemot API Documentation
- Main API Documentation: https://f2.freeivr.co.il/topic/55/api-גישת-מפתחים-למערכות/5
- Outbound Calls: (Follow links from main page to ApiOutCallV2 and ApiOutCall)
- File Upload: (Follow links from main page to ApiUploadFile)

### 19.2 Existing Code Patterns
- Entity Module Configuration: `/server/src/entity-modules/*.config.ts`
- Bulk Action Buttons: `/client/src/reports/studentReportCardReactButton.jsx`
- Text Entity Pattern: `/server/shared/entities/Text.entity.ts`
- Yemot Integration: `/server/shared/utils/yemot/`

### 19.3 Related Documentation
- Project Index: `/project-index.md`
- Agents Workflow: `/AGENTS.md`
- New Project Checklist: `/new-project-checklist.md`

---

## 20. Appendices

### Appendix A: Database Migration Script (Skeleton)

```sql
-- Phone Message Templates
CREATE TABLE phone_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(500) NOT NULL,
  message_type ENUM('tts', 'audio_file') NOT NULL,
  text_content TEXT NULL,
  audio_file_path VARCHAR(255) NULL,
  is_active BOOLEAN DEFAULT FALSE,
  yemot_instance_id VARCHAR(100) NULL,
  additional_params JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_name (name),
  INDEX idx_is_active (is_active)
);

-- Phone Call History
CREATE TABLE phone_call_history (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  phone_message_id INT UNSIGNED NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  recipient_name VARCHAR(100) NULL,
  recipient_type VARCHAR(100) NULL,
  recipient_reference_id INT NULL,
  status ENUM('pending', 'queued', 'calling', 'completed', 'failed', 'cancelled') NOT NULL,
  yemot_call_id VARCHAR(255) NULL,
  call_result JSON NULL,
  error_message TEXT NULL,
  initiated_at DATETIME NULL,
  completed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_phone_message_id (phone_message_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (phone_message_id) REFERENCES phone_messages(id) ON DELETE CASCADE
);
```

### Appendix B: TypeScript Types/Interfaces

```typescript
// DTOs
export class CreatePhoneMessageDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(500)
  description: string;

  @IsEnum(['tts', 'audio_file'])
  messageType: 'tts' | 'audio_file';

  @IsOptional()
  @IsString()
  textContent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  audioFilePath?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class BulkInitiateCallDto {
  @IsNumber()
  phoneMessageId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  recipientIds: number[];

  @IsEnum(['student', 'teacher', 'parent'])
  recipientType: 'student' | 'teacher' | 'parent';

  @IsOptional()
  @IsString()
  phoneNumberField?: string;  // e.g., 'phone', 'parentPhone'
}

// Yemot API Types
export interface YemotOutboundCallParams {
  token: string;
  phoneNumber: string;
  messageType: 'tts' | 'audio_file';
  textContent?: string;
  audioFileUrl?: string;
  callerId?: string;
}

export interface YemotCallResponse {
  success: boolean;
  callId?: string;
  errorMessage?: string;
}
```

### Appendix C: Sample UI Mockups (Descriptions)

**Phone Message Template List:**
```
+--------------------------------------------------+
| Phone Message Templates                  [+ New] |
+--------------------------------------------------+
| Name              | Type        | Active | Actions|
|-------------------|-------------|--------|--------|
| Welcome Message   | TTS         | ✓      | Edit   |
| Absence Reminder  | Audio File  | ✓      | Edit   |
| Payment Due       | TTS         | ✗      | Edit   |
+--------------------------------------------------+
```

**Bulk Call Dialog:**
```
+-----------------------------------------------+
| Send Phone Calls to 15 Students               |
+-----------------------------------------------+
| Select Message Template:                      |
| [▼ Welcome Message                      ]     |
|                                               |
| Phone Number Field:                           |
| [▼ Student Phone                        ]     |
|                                               |
| Preview:                                      |
| "שלום {studentName}, זוהי תזכורת..."          |
|                                               |
| [Cancel]                        [Send Calls]  |
+-----------------------------------------------+
```

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-15 | GitHub Copilot | Initial HLD draft |

---

**Document Status**: Draft - Awaiting stakeholder review and decision on open questions.

**Next Steps**:
1. Review and answer open questions (Q1-Q17)
2. Approve/modify database schema
3. Confirm Yemot API approach and obtain credentials
4. Approve implementation phases and timeline
5. Begin Phase 1 development
