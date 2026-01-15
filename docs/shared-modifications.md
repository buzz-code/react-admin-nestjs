# Required Modifications to Shared Files

This document outlines the changes needed in the shared submodules (`server/shared` and `client/shared`) to fully support the Phone Campaign MVP feature.

## Summary

The current implementation of the Phone Campaign MVP requires some modifications to the shared codebase to support:
1. Services with additional dependencies injected via constructor
2. CrudRequest type augmentation for auth property

## Server-Side Modifications

### 1. BaseEntityModuleOptions Interface Enhancement

**File:** `server/shared/base-entity/interface.ts`

**Issue:** The current `BaseEntityModuleOptions` interface expects services to have a strict constructor signature: `(repo: Repository<T>, mailSendService: MailSendService)`. This prevents services from injecting additional dependencies like `YemotApiService` or `PhoneCampaignService`.

**Current:**
```typescript
export interface BaseEntityModuleOptions {
    entity: any;
    service?: typeof BaseEntityService;
    // ... other properties
}
```

**Proposed Solution:**
Allow more flexible service constructors by relaxing the type constraint or providing an alternative way to specify custom services.

**Option A - Relax Type Constraint:**
```typescript
export interface BaseEntityModuleOptions {
    entity: any;
    service?: any; // Allow any service class that extends BaseEntityService
    // ... other properties
}
```

**Option B - Add Custom Service Factory:**
```typescript
export interface BaseEntityModuleOptions {
    entity: any;
    service?: typeof BaseEntityService;
    serviceFactory?: (container: any) => BaseEntityService<any>; // Custom instantiation
    // ... other properties
}
```

**Recommendation:** Option A is simpler and provides flexibility while maintaining backward compatibility.

---

### 2. CrudRequest Type Augmentation for Auth

**File:** `server/shared/auth/crud-auth.filter.ts` or create new `server/shared/types/crud-request.d.ts`

**Issue:** The `CrudRequest` type from `@dataui/crud` doesn't include the `auth` property that is added by CrudAuth middleware, causing TypeScript errors when accessing `req.auth.userId`.

**Proposed Solution:**
Create a type declaration file to augment the CrudRequest interface:

```typescript
// server/shared/types/crud-request.d.ts
import '@dataui/crud';

declare module '@dataui/crud' {
  export interface CrudRequest {
    auth?: {
      userId: number;
      permissions?: any;
      [key: string]: any;
    };
  }
}
```

**Alternative Workaround (current):**
Use type assertion: `const userId = (req as any).auth?.userId;`

This works but loses type safety.

---

## Workarounds Used in MVP

Since we cannot modify shared files in this MVP, the following workarounds have been implemented:

### 1. Service Type Constraint
- **Workaround:** Services are still properly typed but the config exports ignore the TypeScript error
- **Impact:** Type safety is reduced but functionality is preserved
- **Location:** `phone-template.config.ts`, `phone-campaign.config.ts`, `student-by-year.config.ts`

### 2. Auth Property Access
- **Workaround:** Type assertion `(req as any).auth?.userId` is used
- **Impact:** No IntelliSense for auth properties
- **Location:** All service `doAction` methods

---

## Testing Without Modifications

The MVP can be tested without shared modifications using the workarounds above. The TypeScript compiler will show warnings but the code will function correctly at runtime because:

1. The BaseEntityModule uses dynamic dependency injection that works regardless of the TypeScript type
2. The auth middleware properly attaches the auth object to requests at runtime
3. Type assertions bypass compile-time checks but preserve runtime behavior

---

## Recommended Implementation Order

If/when implementing these modifications to shared files:

1. **First:** Implement CrudRequest type augmentation (easier, no breaking changes)
2. **Second:** Test with existing services to ensure no regressions
3. **Third:** Implement BaseEntityModuleOptions flexibility (requires more testing)
4. **Fourth:** Update phone campaign services to remove workarounds

---

## Files Affected in MVP

### Server Files Created:
- `server/src/db/entities/PhoneTemplate.entity.ts`
- `server/src/db/entities/PhoneCampaign.entity.ts`
- `server/src/services/yemot-api.service.ts`
- `server/src/entity-modules/phone-template.config.ts`
- `server/src/entity-modules/phone-campaign.config.ts`

### Server Files Modified:
- `server/src/entities.module.ts` - Added phone campaign entity registrations
- `server/src/entity-modules/student-by-year.config.ts` - Added phone campaign action handler

### Client Files Created:
- `client/src/entities/phone-template.jsx`
- `client/src/entities/phone-campaign.jsx`
- `client/src/components/PhoneTemplateBulkButton.jsx`

### Client Files Modified:
- `client/src/App.jsx` - Registered new resources
- `client/src/domainTranslations.js` - Added translations
- `client/src/pivots/StudentAttendanceList.jsx` - Added bulk button

---

## Additional Notes

### User Settings for Yemot API Key

The MVP stores the Yemot API key in `User.additionalData.yemotApiKey`. The frontend needs a settings UI to allow users to configure this. This could be:

1. Added to the existing Settings page (`client/src/settings/Settings.jsx`)
2. Added to the User edit form
3. Created as a new dedicated "Phone Settings" page

**Recommendation:** Add to existing Settings page for simplicity.

**Example implementation:**
```jsx
// In Settings.jsx
<TextInput
  source="additionalData.yemotApiKey"
  label="Yemot API Key"
  type="password"
  helperText="Enter your Yemot API key for phone campaigns"
/>
```

---

## Migration Considerations

When deploying this MVP:

1. **Database Migration:** Run migrations to create `phone_templates` and `phone_campaigns` tables
2. **User Configuration:** Users need to configure their Yemot API keys before using the feature
3. **Testing:** Test with Yemot test environment before production deployment
4. **Permissions:** Consider adding specific permissions for phone campaign features

---

## Security Considerations

1. **API Key Storage:** The `User.additionalData.yemotApiKey` should be encrypted at the application level before storage
2. **API Key Display:** Show masked version in UI (e.g., `077***1234`)
3. **Audit Logging:** All Yemot API calls should be logged with userId for audit purposes
4. **Rate Limiting:** Consider implementing rate limiting for campaign execution

---

## Future Enhancements (Beyond MVP)

As outlined in the HLD, Phase 2 and Phase 3 enhancements include:

**Phase 2:**
- Audio file support
- Automatic status refresh
- Additional bulk actions on other entities
- Campaign report export

**Phase 3:**
- Scheduled campaigns
- Message personalization (dynamic fields)
- Per-call tracking (detailed results)
- Analytics dashboard
- Cost estimation

---

## Questions for Product Owner

1. Should the Yemot API key configuration be part of user settings or a dedicated admin feature?
2. Is encryption of the API key required for compliance?
3. What permissions model should be used (all users or specific roles)?
4. Should there be a limit on campaign size (number of phones per campaign)?
5. Is there a need for campaign approval workflow?
