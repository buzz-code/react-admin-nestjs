# High-Level Design: Automated Phone Calls Feature

## Executive Summary

This document outlines the design for an automated outbound phone calling system integrated with the Yemot telephony platform using the **Templates/Campaigns API**. The system will allow administrators to create reusable campaign templates in Yemot and trigger automated calls to students' phone numbers through bulk actions in the existing UI.

**Version:** 2.0  
**Date:** 2026-01-15  
**Status:** Draft for Review  
**API Reference:** [Yemot API Templates/Campaigns](https://f2.freeivr.co.il/topic/55/api-גישת-מפתחים-למערכות/5) - חלק 2 ניהול קמפיינים

---

## 1. Feature Overview

### 1.1 Business Goals
- Enable automated communication with students/parents via phone calls using Yemot Campaigns
- Reduce manual effort in sending routine notifications
- Provide a flexible, template-based system leveraging Yemot's campaign infrastructure
- Integrate seamlessly with existing educational workflows

### 1.2 Key Capabilities
1. **Campaign Template Management**: Create, configure, and manage Yemot campaign templates
2. **Flexible Message Content**: Support both text-to-speech (TTS) and pre-recorded audio files via Yemot
3. **Bulk Triggering**: Initiate campaigns to multiple recipients from entity lists (e.g., student-klasses-report)
4. **Campaign Tracking**: Monitor campaign status, results, and download reports
5. **User-Specific Configuration**: Allow each organization to manage their own campaign templates

### 1.3 Yemot Templates/Campaigns System
The Yemot platform provides a robust Templates/Campaigns API that:
- **Templates**: Reusable campaign configurations stored in Yemot (message content, IVR flow, settings)
- **Campaigns**: Executions of templates with specific recipient lists
- **Phone Lists**: Managed lists of phone numbers associated with each template
- **Reports**: Detailed campaign execution reports (call status, duration, user interactions)

---

## 2. Terminology

### 2.1 Core Terms

**Proposed Term: "Campaign Template" (Yemot Template)**

**Key Concepts:**
1. **"Campaign Template"** ✅ RECOMMENDED
   - **Definition**: A reusable configuration in Yemot that defines the message content, IVR flow, and settings
   - **Yemot API Term**: "Template" (תבנית קמפיין)
   - **Use Case**: Aligns with Yemot's terminology, clear for users
   - **Database/Code**: `campaign_template` or `yemot_template`

2. **"Campaign"**
   - **Definition**: An execution instance of a template with a specific recipient list
   - **Yemot API Term**: "Campaign" (קמפיין)
   - **Use Case**: Represents an actual outbound call batch

3. **"Phone List Entry"**
   - **Definition**: Individual phone numbers in a campaign's recipient list
   - **Yemot API Term**: "Template Entry" (רשימת תפוצה)
   - **Use Case**: Phone numbers to call for a specific campaign

**Decision Required**: Should we:
- Store full template configuration locally OR just reference Yemot template IDs?
- Sync template data from Yemot OR manage independently?

**Recommendation**: 
- **Database**: Store `yemot_campaign_template` with reference to Yemot template ID
- **UI**: Use "Campaign Template" terminology
- **Code**: Use `campaignTemplate` in TypeScript/JavaScript

---

## 3. System Architecture

### 3.1 Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │ Campaign         │  │ Bulk Action Buttons          │    │
│  │ Template CRUD    │  │ (Student List, etc.)         │    │
│  └──────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        Server Layer                          │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │ Campaign         │  │ Campaign Service             │    │
│  │ Template Entity  │  │ (Orchestration)              │    │
│  └──────────────────┘  └──────────────────────────────┘    │
│                                  │                           │
│                         ┌────────┴────────┐                 │
│                         ▼                 ▼                  │
│              ┌──────────────────┐  ┌──────────────┐         │
│              │ Yemot Templates  │  │ Campaign     │         │
│              │ API Client       │  │ History      │         │
│              └──────────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Yemot IVR System                            │
│  ┌──────────────────┐  ┌──────────────────────────────┐    │
│  │ Templates        │  │ Campaigns                    │    │
│  │ (Stored in       │  │ (Active/Scheduled)           │    │
│  │  Yemot)          │  │                              │    │
│  └──────────────────┘  └──────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Workflow Overview

**Template Creation Flow:**
1. Admin creates campaign template in local system
2. System calls `CreateTemplate` API to create template in Yemot
3. System stores Yemot template ID and metadata locally
4. Admin can configure message content via Yemot UI or API

**Campaign Execution Flow:**
1. Admin selects students from list (e.g., student-klasses-report)
2. Admin clicks bulk action button and selects campaign template
3. System uploads phone numbers to Yemot via `UploadPhoneList` API
4. System triggers campaign via `RunCampaign` API
5. Yemot executes campaign (calls all numbers)
6. System polls campaign status via `GetCampaignStatus` API
7. System downloads campaign report via `DownloadCampaignReport` API
```

---

## 4. Database Design

### 4.1 Campaign Template Entity

**Table Name**: `yemot_campaign_templates`

**Purpose**: Store local references to Yemot campaign templates with metadata

**Schema**:
```typescript
@Entity('yemot_campaign_templates')
export class YemotCampaignTemplate implements IHasUserId {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('varchar', { length: 100 })
  name: string;  // Local friendly name

  @Column('varchar', { length: 500 })
  description: string;  // Human-readable description

  @Column('varchar', { length: 50 })
  yemotTemplateId: string;  // Template ID from Yemot (e.g., "1234")

  @Column('varchar', { length: 100, nullable: true })
  yemotTemplateName: string;  // Template name in Yemot system

  @Column('boolean', { default: true })
  isActive: boolean;  // Enable/disable without deletion

  @Column('boolean', { default: false })
  isSynced: boolean;  // Whether template exists in Yemot

  @Column('simple-json', { nullable: true })
  templateConfig: Record<string, any>;  // Cached template configuration from Yemot

  @Column('datetime', { nullable: true })
  lastSyncedAt: Date;  // Last sync with Yemot

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Design Questions:**

**Q1: Should we create templates in Yemot or sync existing ones?**
- **Option A**: Create new templates via API (`CreateTemplate`) ✅ RECOMMENDED
  - Pro: Full control, integrated workflow
  - Con: Templates managed separately in Yemot UI
  - Implementation: Use `CreateTemplate` API on save

- **Option B**: Sync existing templates from Yemot (`GetTemplates`)
  - Pro: Use templates already configured in Yemot
  - Con: No local template creation
  - Implementation: Import templates via `GetTemplates` API

- **Option C**: Hybrid - support both creation and sync ✅ BEST APPROACH
  - Pro: Maximum flexibility
  - Con: More complex implementation
  - Implementation: "Create New" and "Import Existing" buttons

**Q2: How should we handle template content (audio files, TTS)?**
- **Option A**: Manage entirely in Yemot ✅ RECOMMENDED for Phase 1
  - Pro: Leverage Yemot's content management
  - Con: Users must use Yemot UI for content
  - Implementation: Store only template reference

- **Option B**: Upload content via API
  - Pro: Integrated workflow
  - Con: Complex file management
  - Implementation: Use `UploadFile` and audio management APIs

**Recommendation**: 
- Use Option C (Hybrid) for template management
- Use Option A for content management in Phase 1, Option B for Phase 2

### 4.2 Campaign History Entity

**Table Name**: `yemot_campaigns`

**Purpose**: Track campaign executions and results

**Schema**:
```typescript
@Entity('yemot_campaigns')
export class YemotCampaign implements IHasUserId {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'user_id' })
  userId: number;

  @Column('int', { name: 'campaign_template_id' })
  campaignTemplateId: number;

  @ManyToOne(() => YemotCampaignTemplate)
  campaignTemplate: YemotCampaignTemplate;

  @Column('varchar', { length: 50 })
  yemotCampaignId: string;  // Campaign ID from Yemot

  @Column('varchar', { length: 100, nullable: true })
  recipientSource: string;  // e.g., 'student_klasses_report'

  @Column('simple-json', { nullable: true })
  recipientIds: number[];  // Local entity IDs (student IDs, etc.)

  @Column('int', { default: 0 })
  totalRecipients: number;  // Total phone numbers uploaded

  @Column('enum', { 
    enum: ['pending', 'uploading_phones', 'ready', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  })
  status: string;

  @Column('simple-json', { nullable: true })
  campaignReport: Record<string, any>;  // Downloaded report from Yemot

  @Column('text', { nullable: true })
  errorMessage: string;

  @Column('datetime', { nullable: true })
  startedAt: Date;

  @Column('datetime', { nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

**Design Questions:**

**Q3: Should we store individual call results?**
- **Option A**: Store only campaign-level summary ✅ RECOMMENDED for MVP
  - Pro: Simpler schema, less data
  - Con: No per-call details without downloading report
- **Option B**: Extract and store per-call results from campaign report
  - Pro: Queryable call details
  - Con: Larger database, complex parsing
  - Implementation: Parse `DownloadCampaignReport` response

**Q4: Should we support scheduled campaigns?**
- **Option A**: Immediate execution only (MVP)
  - Pro: Simpler implementation
  - Con: Limited functionality
- **Option B**: Support scheduled campaigns via Yemot ✅ RECOMMENDED for Phase 2
  - Pro: Leverage Yemot's `ScheduleCampaign` API
  - Con: Additional API calls and tracking
  - Implementation: Add `scheduledFor: Date` column, use `ScheduleCampaign` API

**Recommendation**: Start with Option A for both, implement Option B in Phase 2

## 5. Backend Implementation

### 5.1 Entity Module Configuration

**File**: `/server/src/entity-modules/yemot-campaign-template.config.ts`

```typescript
import { YemotCampaignTemplate } from '@/db/entities/YemotCampaignTemplate.entity';
import { getBaseEntityConfig } from '@shared/base-entity/base-entity-config';

export default getBaseEntityConfig(YemotCampaignTemplate, {
  dto: {
    create: CreateYemotCampaignTemplateDto,
    update: UpdateYemotCampaignTemplateDto,
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

### 5.2 Campaign Service

**File**: `/server/src/services/yemot-campaign.service.ts`

**Key Responsibilities:**
1. Manage campaign template lifecycle (create, sync, update, delete)
2. Upload phone lists to Yemot templates
3. Trigger campaign execution
4. Poll campaign status
5. Download and store campaign reports

**Core Methods:**
```typescript
@Injectable()
export class YemotCampaignService {
  constructor(
    @InjectRepository(YemotCampaignTemplate) private templateRepo: Repository<YemotCampaignTemplate>,
    @InjectRepository(YemotCampaign) private campaignRepo: Repository<YemotCampaign>,
    private yemotTemplatesApiService: YemotTemplatesApiService,
  ) {}

  // Template Management
  async createTemplate(dto: CreateTemplateDto): Promise<YemotCampaignTemplate>;
  async syncTemplatesFromYemot(userId: number): Promise<YemotCampaignTemplate[]>;
  async updateTemplate(id: number, dto: UpdateTemplateDto): Promise<YemotCampaignTemplate>;
  async deleteTemplate(id: number): Promise<void>;

  // Campaign Execution
  async runCampaign(params: RunCampaignDto): Promise<YemotCampaign>;
  async uploadPhoneList(templateId: number, phoneNumbers: string[]): Promise<void>;
  
  // Monitoring
  async getCampaignStatus(campaignId: number): Promise<YemotCampaign>;
  async downloadCampaignReport(campaignId: number): Promise<void>;
  async cancelCampaign(campaignId: number): Promise<void>;
}
```

### 5.3 Yemot Templates API Integration

**File**: `/server/shared/utils/yemot/yemot-templates-api.service.ts`

**Based on Yemot API Documentation** (חלק 2 ניהול קמפיינים)

**Available API Methods:**

| Yemot API Method | Purpose | Our Usage |
|------------------|---------|-----------|
| `GetTemplates` | Get all campaign templates | Sync/import existing templates |
| `CreateTemplate` | Create new campaign template | Create template from app |
| `UpdateTemplate` | Update template configuration | Modify template settings |
| `DeleteTemplate` | Delete template | Remove template |
| `UploadPhoneList` | Upload phone numbers to template | Bulk add recipients |
| `GetTemplateEntries` | Get phone list for template | View recipients |
| `UpdateTemplateEntry` | Update single phone number | Edit recipient |
| `ClearTemplateEntries` | Clear all phone numbers | Reset recipients |
| `RunCampaign` | Execute campaign | Trigger calls |
| `GetCampaignStatus` | Get campaign execution status | Monitor progress |
| `DownloadCampaignReport` | Download campaign report | Get results |
| `GetActiveCampaigns` | Get currently running campaigns | Monitor active |
| `CampaignAction` | Control campaign (pause/resume/stop) | Manage execution |
| `ScheduleCampaign` | Schedule campaign for later | Future: scheduled calls |

**Design Questions:**

**Q5: Which Yemot API approach should we use?**

- **Option A**: Use Templates + RunCampaign API ✅ RECOMMENDED
  - Pro: Aligns with Yemot's campaign system, reusable templates
  - Con: Requires template creation/management
  - **APIs Used**: 
    - `CreateTemplate` - Create template in Yemot
    - `UploadPhoneList` - Add phone numbers
    - `RunCampaign` - Execute campaign
    - `GetCampaignStatus` - Monitor progress
    - `DownloadCampaignReport` - Get results

- **Option B**: Use generic outbound call API (deprecated approach)
  - Pro: Simpler for one-off calls
  - Con: Not aligned with user's requirement to focus on Templates/Campaigns
  - **Not recommended based on user feedback**

**Q6: How should we manage template content (audio, IVR flow)?**

- **Option A**: Manage in Yemot web interface ✅ RECOMMENDED for Phase 1
  - Pro: Leverage Yemot's robust content management UI
  - Con: Split workflow (create template in app, configure in Yemot)
  - Implementation: Create template shell via API, user configures in Yemot

- **Option B**: Manage content via API
  - Pro: Fully integrated workflow
  - Con: Complex implementation with file uploads
  - APIs: `UploadFile`, `GetIVR2Dir`, `FileAction`, etc.
  - **Recommended for Phase 2**

- **Option C**: Hybrid - basic TTS via API, advanced via Yemot UI
  - Pro: Best of both worlds
  - Con: Most complex
  - Implementation: Support `text` parameter in `CreateTemplate`, advanced features in Yemot

**Q7: How should we handle campaign reports?**

- **Option A**: Download and parse full report ✅ RECOMMENDED
  - Pro: Complete data, queryable locally
  - Con: Larger storage, parsing complexity
  - Implementation: Use `DownloadCampaignReport` API, parse CSV/JSON

- **Option B**: Store only campaign status
  - Pro: Minimal storage
  - Con: No detailed per-call data
  - Implementation: Use `GetCampaignStatus` only

**Recommendation**: Use Option A for API approach, Option A for content (Phase 1), Option A for reports

**Implementation Approach:**

```typescript
@Injectable()
export class YemotTemplatesApiService {
  private readonly baseUrl = 'https://www.call2all.co.il/ym/api';
  
  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  /**
   * Get all templates from Yemot
   * API: GetTemplates
   */
  async getTemplates(token: string): Promise<YemotTemplate[]> {
    const response = await this.httpService.post(`${this.baseUrl}/GetTemplates`, {
      token,
    }).toPromise();
    
    return this.parseTemplatesResponse(response.data);
  }

  /**
   * Create new campaign template
   * API: CreateTemplate
   */
  async createTemplate(token: string, params: CreateTemplateParams): Promise<string> {
    const response = await this.httpService.post(`${this.baseUrl}/CreateTemplate`, {
      token,
      templateName: params.name,
      text: params.text || '', // TTS text (optional)
      // Additional parameters as needed
    }).toPromise();
    
    // Returns template ID
    return this.parseTemplateId(response.data);
  }

  /**
   * Upload phone numbers to template
   * API: UploadPhoneList
   */
  async uploadPhoneList(
    token: string, 
    templateId: string, 
    phoneNumbers: string[]
  ): Promise<void> {
    // Create text file content with phone numbers
    const phoneListContent = phoneNumbers.join('\n');
    
    const response = await this.httpService.post(`${this.baseUrl}/UploadPhoneList`, {
      token,
      template: templateId,
      fileContent: Buffer.from(phoneListContent).toString('base64'),
      // Options: 'add' or 'replace'
      mode: 'replace',
    }).toPromise();
    
    this.validateResponse(response.data);
  }

  /**
   * Run campaign
   * API: RunCampaign
   */
  async runCampaign(token: string, templateId: string): Promise<string> {
    const response = await this.httpService.post(`${this.baseUrl}/RunCampaign`, {
      token,
      template: templateId,
    }).toPromise();
    
    // Returns campaign ID
    return this.parseCampaignId(response.data);
  }

  /**
   * Get campaign status
   * API: GetCampaignStatus
   */
  async getCampaignStatus(
    token: string, 
    campaignId: string
  ): Promise<CampaignStatus> {
    const response = await this.httpService.post(`${this.baseUrl}/GetCampaignStatus`, {
      token,
      campaign: campaignId,
    }).toPromise();
    
    return this.parseCampaignStatus(response.data);
  }

  /**
   * Download campaign report
   * API: DownloadCampaignReport
   */
  async downloadCampaignReport(
    token: string, 
    campaignId: string
  ): Promise<CampaignReport> {
    const response = await this.httpService.post(`${this.baseUrl}/DownloadCampaignReport`, {
      token,
      campaign: campaignId,
    }).toPromise();
    
    return this.parseReport(response.data);
  }

  /**
   * Delete template
   * API: DeleteTemplate
   */
  async deleteTemplate(token: string, templateId: string): Promise<void> {
    const response = await this.httpService.post(`${this.baseUrl}/DeleteTemplate`, {
      token,
      template: templateId,
    }).toPromise();
    
    this.validateResponse(response.data);
  }
}
```

**TypeScript Interfaces:**

```typescript
export interface YemotTemplate {
  id: string;
  name: string;
  status: string;
  phoneCount: number;
  // Additional fields from API
}

export interface CreateTemplateParams {
  name: string;
  text?: string;  // TTS text
  // Additional configuration
}

export interface CampaignStatus {
  status: 'running' | 'completed' | 'paused' | 'stopped';
  totalCalls: number;
  completedCalls: number;
  successfulCalls: number;
  failedCalls: number;
  // Additional status fields
}

export interface CampaignReport {
  campaignId: string;
  totalNumbers: number;
  calls: CampaignCallDetail[];
  summary: CampaignSummary;
}

export interface CampaignCallDetail {
  phoneNumber: string;
  status: string;
  duration: number;
  timestamp: Date;
  // Additional call details
}
```

---

## 6. Frontend Implementation

### 6.1 Campaign Template Management

**File**: `/client/src/entities/yemot-campaign-template.jsx`

**UI Components:**
1. **List View**: Display all campaign templates with sync status
2. **Create Form**: Create new template (creates in Yemot via API)
3. **Import Button**: Sync existing templates from Yemot
4. **Edit Form**: Modify template metadata (actual content managed in Yemot)
5. **Sync Button**: Re-sync template data from Yemot

**Key Fields:**
- Name (local friendly name)
- Description
- Yemot Template ID (auto-populated after creation)
- Yemot Template Name
- Active status toggle
- Sync status indicator
- Last synced timestamp
- Link to Yemot UI for content configuration

**Design Pattern**: Follow existing entity patterns with Material-UI components, similar to `text.jsx`

### 6.2 Bulk Action Button

**File**: `/client/src/components/bulk-actions/BulkCampaignButton.jsx`

**User Workflow:**
1. User selects students from list (e.g., student-klasses-report)
2. Clicks "Send Campaign" bulk action button
3. Modal opens with:
   - Dropdown to select campaign template
   - Phone number source field selection (e.g., student phone, parent phone)
   - Preview of recipient count
   - Confirmation button
4. System:
   - Extracts phone numbers from selected students
   - Uploads phone list to Yemot template via API
   - Triggers campaign execution via RunCampaign
   - Creates campaign history record
5. Success notification with campaign tracking link

**Implementation:**

```jsx
export const BulkCampaignButton = () => {
  const { selectedIds } = useListContext();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const { data: templates } = useGetList('yemot_campaign_template', { 
    filter: { isActive: true, isSynced: true } 
  });

  const handleRunCampaign = async (values) => {
    // Call dataProvider to trigger campaign
    await dataProvider.create('yemot_campaign/run', {
      data: {
        campaignTemplateId: values.templateId,
        recipientIds: selectedIds,
        recipientSource: 'student_klasses_report',
        phoneNumberField: values.phoneNumberField,
      }
    });
  };

  return (
    <BulkRequestButton 
      label="שליחת קמפיין טלפוני"
      icon={<CampaignIcon />}
      mutate={handleRunCampaign}
      dialogTitle="בחירת תבנית קמפיין"
    >
      <SelectInput 
        source="templateId" 
        choices={templates} 
        optionText="description"
        label="תבנית קמפיין"
        validate={required()}
      />
      <SelectInput 
        source="phoneNumberField" 
        choices={[
          { id: 'phone', name: 'טלפון תלמידה' },
          { id: 'parentPhone', name: 'טלפון הורה' }
        ]}
        label="שדה טלפון"
        validate={required()}
      />
      <Typography variant="body2" color="textSecondary">
        {selectedIds.length} נמענים נבחרו
      </Typography>
    </BulkRequestButton>
  );
};
```

**Integration Points:**
- Add to `student-klasses-report.jsx` additionalBulkButtons
- Add to `student-klass.jsx` additionalBulkButtons
- Consider adding to `student.jsx` for individual campaigns

### 6.3 Campaign History Viewer

**File**: `/client/src/entities/yemot-campaign.jsx`

**Display Information:**
- Campaign timestamp
- Template used
- Status (with color coding: running, completed, failed)
- Total recipients
- Completed calls count
- Success rate
- Campaign report download button
- Filters: by date, status, template

**Actions:**
- View campaign report (opens modal with detailed results)
- Download report as CSV
- Cancel running campaign
- Re-run campaign with same recipients

**Report Display:**
Shows parsed campaign report data:
- Total calls made
- Success/failure breakdown
- Per-call details (phone number, status, duration)
- Interactive charts (success rate, call distribution)

## 7. API Endpoints

### 7.1 Campaign Templates

| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| GET | `/api/yemot_campaign_template` | List templates | admin |
| GET | `/api/yemot_campaign_template/:id` | Get template details | admin |
| POST | `/api/yemot_campaign_template` | Create template (+ Yemot) | admin |
| POST | `/api/yemot_campaign_template/sync` | Sync from Yemot | admin |
| PATCH | `/api/yemot_campaign_template/:id` | Update template | admin |
| DELETE | `/api/yemot_campaign_template/:id` | Delete template (+ Yemot) | admin |

### 7.2 Campaign Operations

| Method | Endpoint | Description | Permissions |
|--------|----------|-------------|-------------|
| POST | `/api/yemot_campaign/run` | Run campaign | admin |
| GET | `/api/yemot_campaign` | List campaign history | admin |
| GET | `/api/yemot_campaign/:id` | Get campaign details | admin |
| GET | `/api/yemot_campaign/:id/status` | Get campaign status | admin |
| GET | `/api/yemot_campaign/:id/report` | Download campaign report | admin |
| POST | `/api/yemot_campaign/:id/cancel` | Cancel running campaign | admin |

**Workflow Example:**

1. **Create Template**:
   ```
   POST /api/yemot_campaign_template
   {
     "name": "Welcome Message",
     "description": "Welcome call to new students",
     "text": "שלום, ברוכים הבאים"
   }
   Response: { id: 1, yemotTemplateId: "1234" }
   ```

2. **Run Campaign**:
   ```
   POST /api/yemot_campaign/run
   {
     "campaignTemplateId": 1,
     "recipientIds": [10, 20, 30],
     "recipientSource": "student_klasses_report",
     "phoneNumberField": "phone"
   }
   Response: { id: 5, yemotCampaignId: "CAMP123", status: "pending" }
   ```

3. **Check Status**:
   ```
   GET /api/yemot_campaign/5/status
   Response: {
     status: "running",
     totalCalls: 3,
     completedCalls: 2,
     successfulCalls: 2
   }
   ```

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
- Add opt-out flag: `campaignOptOut` (boolean)

### 10.2 Student Klasses Report

**Changes Required:**
- Add `BulkCampaignButton` to `additionalBulkButtons` array
- Ensure phone numbers are loaded with report data

**Example Integration:**
```jsx
const additionalBulkButtons = [
  <StudentReportCardReactButton key='studentReportCardReact' />,
  <BulkCampaignButton key='bulkCampaign' />,  // NEW
];
```

### 10.3 App Registration

**Changes Required:**
- Register `yemot_campaign_template` resource in `/client/src/App.jsx`
- Register `yemot_campaign` resource for admin users
- Add appropriate icons (CampaignIcon, PhoneIcon)
- Place templates in 'settings' menu group
- Place campaigns in 'admin' menu group for history

**Example App.jsx Integration:**
```jsx
import yemotCampaignTemplate from 'src/entities/yemot-campaign-template';
import yemotCampaign from 'src/entities/yemot-campaign';
import CampaignIcon from '@mui/icons-material/Campaign';

// In admin section:
<Resource name="yemot_campaign_template" {...yemotCampaignTemplate} 
  options={{ menuGroup: 'settings' }} icon={CampaignIcon} />
  
{isAdmin(permissions) && <>
  <Resource name="yemot_campaign" {...yemotCampaign} 
    options={{ menuGroup: 'admin' }} icon={CampaignIcon} />
</>}
```

---

## 11. Testing Strategy

### 11.1 Unit Tests

**Backend:**
- `YemotCampaignService` methods
- Yemot Templates API client mock responses
- Template creation/sync logic
- Phone list upload formatting
- Campaign report parsing

**Frontend:**
- Campaign template CRUD components
- Bulk campaign button rendering
- Form validation
- Template sync status display

### 11.2 Integration Tests

- End-to-end flow: Create template → Upload phones → Run campaign → Monitor status → Download report
- Yemot Templates API integration (use test account)
- Error handling scenarios (API failures, invalid templates)
- Campaign status polling

### 11.3 Manual Testing

- Test with real Yemot account (use test phone numbers)
- Verify template creation in Yemot
- Configure message content in Yemot UI
- Test campaign execution
- Verify report accuracy
- Test all bulk action scenarios

---

## 12. Performance Considerations

### 12.1 Bulk Operations

**Q10: How should we handle large bulk operations?**

- **Option A**: Synchronous phone list upload + async campaign execution ✅ RECOMMENDED
  - Pro: Simple, leverages Yemot's campaign execution
  - Con: Upload may timeout for very large lists
  - Implementation: Upload phone list synchronously (fast), Yemot runs campaign asynchronously
  
- **Option B**: Job queue for phone list upload + campaign trigger
  - Pro: Most robust, no timeouts
  - Con: Requires Bull/BullMQ infrastructure
  - Implementation:
    ```typescript
    @Processor('campaigns')
    export class CampaignProcessor {
      @Process('run-campaign')
      async handleRunCampaign(job: Job<RunCampaignData>) {
        // Upload phones in batches
        // Trigger campaign
        // Poll for completion
      }
    }
    ```

- **Option C**: Chunked upload with progress tracking
  - Pro: Good UX for large lists
  - Con: More complex implementation
  - Implementation: Upload phones in chunks of 1000, show progress bar

**Recommendation**: 
- Phase 1: Option A (up to 1000 numbers)
- Phase 2: Option B or C for larger scale

**Note**: Yemot's `UploadPhoneList` API handles the phone list upload efficiently. The campaign execution itself is handled asynchronously by Yemot, so our system only needs to:
1. Upload phone list (synchronous, but fast)
2. Trigger campaign (synchronous API call)
3. Poll for status (asynchronous background job or manual refresh)

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
- [ ] Create `YemotCampaignTemplate` entity and migration
- [ ] Create `YemotCampaign` entity and migration
- [ ] Implement `YemotCampaignService` with basic operations
- [ ] Create `YemotTemplatesApiService` client
- [ ] Implement template creation via `CreateTemplate` API
- [ ] Implement phone list upload via `UploadPhoneList` API
- [ ] Implement campaign execution via `RunCampaign` API
- [ ] Implement status polling via `GetCampaignStatus` API
- [ ] Add entity module configurations

**Frontend:**
- [ ] Create campaign template CRUD UI (list, create, edit)
- [ ] Implement template sync from Yemot (`GetTemplates`)
- [ ] Implement `BulkCampaignButton` component
- [ ] Integrate button into `student-klasses-report`
- [ ] Create campaign history viewer (read-only)
- [ ] Display campaign status and results

**Testing:**
- [ ] Unit tests for services
- [ ] Integration test for campaign flow
- [ ] Manual testing with Yemot account

### Phase 2: Enhanced Features
**Timeline: 1-2 weeks**

- [ ] Campaign report download and parsing (`DownloadCampaignReport`)
- [ ] Detailed per-call results display
- [ ] Template content management via API (audio upload)
- [ ] User-specific Yemot token management
- [ ] Campaign cancellation (`CampaignAction`)
- [ ] Opt-out list management

### Phase 3: Advanced Features
**Timeline: 2-3 weeks**

- [ ] Scheduled campaigns (`ScheduleCampaign` API)
- [ ] Job queue for large phone lists (Bull/BullMQ)
- [ ] Campaign templates approval workflow
- [ ] Enhanced reporting and analytics
- [ ] Export campaign reports to CSV
- [ ] Integration with additional entities (teachers, parents)
- [ ] Campaign retry for failed calls

### Phase 4: Production Hardening
**Timeline: 1 week**

- [ ] Performance optimization (batch phone uploads)
- [ ] Enhanced error handling
- [ ] Monitoring dashboard for campaign metrics
- [ ] Load testing with large phone lists
- [ ] Security audit
- [ ] Documentation (API docs, user guide)

---

## 15. Open Questions & Decisions Required

### 15.1 Critical Decisions

**Q11: Yemot Account Setup** ⚠️ CRITICAL
- Do we have an existing Yemot account with API access?
- What is the account tier and associated rate limits?
- Do we need separate accounts for staging/production?
- **NEW**: Does the account have Templates/Campaigns API access enabled?

**Q12: User Workflow Priorities**
- Which entity lists should have bulk campaign buttons initially?
  - Student klasses report ✅ (specified in requirements)
  - Student list?
  - Teacher list (for staff notifications)?
  - Custom recipient lists?

**Q13: Template Management Approach**
- Should we create templates via API or import existing templates from Yemot?
- Hybrid approach (both create and import)?
- Where should template content (audio/IVR) be configured:
  - Yemot web interface (recommended for Phase 1)?
  - Via API (Phase 2)?
  
**Q14: Billing & Cost Control**
- How should we track Yemot campaign costs?
- Should we implement quota limits per user/organization?
- Should we require additional approval for large bulk operations (e.g., >100 calls)?

### 15.2 Future Considerations

**Q15: Campaign Monitoring**
- Should we implement real-time campaign status polling?
- Webhook endpoint for campaign completion notifications?
- How frequently should we check campaign status?

**Q16: Multi-Language Support**
- Should TTS in templates support multiple languages?
- Yemot supports Hebrew TTS by default
- Consider adding language field to template if needed

**Q17: Integration with Existing Yemot Functionality**
- The system has existing inbound call handling (`YemotHandlerService`, chains)
- Should outbound campaigns integrate with existing call tracking?
- Current `YemotCall` entity tracks inbound calls - keep separate for campaigns?
- **Recommendation**: Keep separate - campaigns are fundamentally different from interactive IVR calls

**Q18: Template Synchronization**
- How often should we sync templates from Yemot?
- Manual sync only or automatic periodic sync?
- What happens if template is deleted in Yemot but referenced locally?

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
- **Main API Documentation**: https://f2.freeivr.co.il/topic/55/api-גישת-מפתחים-למערכות/5
- **Templates/Campaigns** (חלק 2 ניהול קמפיינים):
  - `GetTemplates`: https://f2.freeivr.co.il/post/32033
  - `CreateTemplate`: https://f2.freeivr.co.il/post/32037
  - `UpdateTemplate`: https://f2.freeivr.co.il/post/32034
  - `DeleteTemplate`: https://f2.freeivr.co.il/post/32038
  - `UploadPhoneList`: https://f2.freeivr.co.il/post/32043
  - `GetTemplateEntries`: https://f2.freeivr.co.il/post/32039
  - `RunCampaign`: https://f2.freeivr.co.il/post/32044
  - `GetCampaignStatus`: https://f2.freeivr.co.il/post/32045
  - `DownloadCampaignReport`: https://f2.freeivr.co.il/post/32046
  - `GetActiveCampaigns`: https://f2.freeivr.co.il/post/32047
  - `CampaignAction`: https://f2.freeivr.co.il/post/32048
  - `ScheduleCampaign`: https://f2.freeivr.co.il/post/32049
- **File Management**:
  - `UploadFile`: https://f2.freeivr.co.il/post/32031
  - Audio file management: https://f2.freeivr.co.il/post/32035

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
-- Yemot Campaign Templates
CREATE TABLE yemot_campaign_templates (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500) NOT NULL,
  yemot_template_id VARCHAR(50) NOT NULL,
  yemot_template_name VARCHAR(100) NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_synced BOOLEAN DEFAULT FALSE,
  template_config JSON NULL,
  last_synced_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_yemot_template_id (yemot_template_id),
  INDEX idx_is_active (is_active),
  UNIQUE KEY unique_user_yemot_template (user_id, yemot_template_id)
);

-- Yemot Campaigns
CREATE TABLE yemot_campaigns (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  campaign_template_id INT UNSIGNED NOT NULL,
  yemot_campaign_id VARCHAR(50) NOT NULL,
  recipient_source VARCHAR(100) NULL,
  recipient_ids JSON NULL,
  total_recipients INT DEFAULT 0,
  status ENUM('pending', 'uploading_phones', 'ready', 'running', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  campaign_report JSON NULL,
  error_message TEXT NULL,
  started_at DATETIME NULL,
  completed_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_campaign_template_id (campaign_template_id),
  INDEX idx_yemot_campaign_id (yemot_campaign_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (campaign_template_id) REFERENCES yemot_campaign_templates(id) ON DELETE CASCADE
);
```

### Appendix B: TypeScript Types/Interfaces

```typescript
// DTOs
export class CreateCampaignTemplateDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsString()
  @MaxLength(500)
  description: string;

  @IsOptional()
  @IsString()
  text?: string;  // TTS text for template (optional)
}

export class RunCampaignDto {
  @IsNumber()
  campaignTemplateId: number;

  @IsArray()
  @IsNumber({}, { each: true })
  recipientIds: number[];

  @IsString()
  recipientSource: string;  // e.g., 'student_klasses_report'

  @IsEnum(['phone', 'parentPhone'])
  phoneNumberField: string;
}

// Yemot Templates API Types
export interface YemotTemplate {
  id: string;
  name: string;
  status: string;
  phoneCount: number;
  lastModified: Date;
}

export interface CreateTemplateParams {
  token: string;
  templateName: string;
  text?: string;
}

export interface UploadPhoneListParams {
  token: string;
  templateId: string;
  phoneNumbers: string[];
  mode: 'add' | 'replace';
}

export interface RunCampaignParams {
  token: string;
  templateId: string;
}

export interface CampaignStatus {
  campaignId: string;
  status: 'running' | 'completed' | 'paused' | 'stopped';
  totalCalls: number;
  completedCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageDuration: number;
}

export interface CampaignReport {
  campaignId: string;
  templateId: string;
  startTime: Date;
  endTime: Date;
  totalNumbers: number;
  calls: CampaignCallDetail[];
  summary: {
    successful: number;
    failed: number;
    noAnswer: number;
    busy: number;
    totalDuration: number;
  };
}

export interface CampaignCallDetail {
  phoneNumber: string;
  status: 'answered' | 'no_answer' | 'busy' | 'failed';
  duration: number;
  timestamp: Date;
  hangupCause?: string;
}
}
```

### Appendix C: Sample UI Mockups (Descriptions)

**Campaign Template List:**
```
+---------------------------------------------------------------+
| Campaign Templates                    [+ New] [Sync from Yemot]|
+---------------------------------------------------------------+
| Name              | Yemot ID | Synced | Active | Actions      |
|-------------------|----------|--------|--------|--------------|
| Welcome Message   | 1234     | ✓      | ✓      | Edit | View |
| Absence Reminder  | 1235     | ✓      | ✓      | Edit | View |
| Payment Due       | 1236     | ✓      | ✗      | Edit | View |
+---------------------------------------------------------------+
```

**Run Campaign Dialog:**
```
+-----------------------------------------------+
| Run Campaign for 15 Students                  |
+-----------------------------------------------+
| Select Campaign Template:                     |
| [▼ Welcome Message (ID: 1234)          ]     |
|                                               |
| Phone Number Field:                           |
| [▼ Student Phone                        ]     |
|                                               |
| Recipients: 15 students selected              |
|                                               |
| Note: Campaign will be created in Yemot       |
| and executed immediately.                     |
|                                               |
| [Cancel]                        [Run Campaign]|
+-----------------------------------------------+
```

**Campaign History:**
```
+-----------------------------------------------------------------------+
| Campaigns                                                      [Refresh]|
+-----------------------------------------------------------------------+
| Template         | Campaign ID | Status    | Recipients | Success Rate |
|------------------|-------------|-----------|------------|--------------|
| Welcome Message  | CAMP123     | Completed | 15         | 93% (14/15)  |
| Absence Reminder | CAMP124     | Running   | 25         | 60% (15/25)  |
| Payment Due      | CAMP125     | Failed    | 10         | 0%           |
+-----------------------------------------------------------------------+
| Actions: [View Report] [Download CSV] [Cancel Campaign]              |
+-----------------------------------------------------------------------+
```
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
| 2.0 | 2026-01-15 | GitHub Copilot | **Major revision** - Shifted from generic outbound calls to Yemot Templates/Campaigns API approach per stakeholder feedback |

**Version 2.0 Changes:**
- Updated to use Yemot Templates/Campaigns API (חלק 2 ניהול קמפיינים)
- Changed entities: `YemotCampaignTemplate` and `YemotCampaign` (instead of PhoneMessage/PhoneCallHistory)
- Workflow: Create template → Upload phone list → Run campaign → Monitor status → Download report
- Added template sync capability from Yemot
- Focused on campaign-based approach vs individual call approach
- Updated all API endpoints, services, and frontend components accordingly
- Added comprehensive Yemot Templates API method references

---

**Document Status**: Draft v2.0 - Awaiting stakeholder review and decision on open questions.

**Next Steps**:
1. Review and answer open questions (Q1-Q18)
2. Confirm Yemot account has Templates/Campaigns API access
3. Approve/modify database schema
4. Obtain Yemot credentials and test API access
5. Approve implementation phases and timeline
6. Begin Phase 1 development
