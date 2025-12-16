# Shared Folder Test Fixes

This document describes the test fixes that were made in the shared folders (`client/shared` and `server/shared`) to make all unit tests pass. These changes are already applied to the main branch of this repository but were originally made in the shared submodule repositories.

## Why These Changes Are Needed

The shared folders are git submodules pointing to:
- `client/shared` → https://github.com/buzz-code/nra-client
- `server/shared` → https://github.com/buzz-code/nra-server

When working on this repository, tests in these shared folders were failing and needed fixes. Since the shared folders are separate repositories, changes cannot be committed directly from this repository.

## Changes Made

### Client Shared: Data Provider Tests

**Files Modified:**
1. `client/shared/providers/__tests__/dataProvider.test.js`
2. `client/shared/providers/__tests__/baseDataProvider.test.ts`

**Issue:**
Tests were failing with error: `Invalid file response, missing keys: contentLength`

**Root Cause:**
The `validateFileResponse` function in `baseDataProvider.ts` (lines 148-152) validates that file responses include all required fields: `data`, `type`, `disposition`, and `contentLength`. Mock responses in tests were missing the `contentLength` field.

**Fix Applied:**
Added `contentLength` field to all mock file responses in tests.

**Example Change in `dataProvider.test.js`:**
```javascript
// Before
const mockResponse = {
  json: {
    data: btoa('test pdf content'),
    type: 'application/pdf',
    disposition: 'attachment; filename="report.pdf"',
  },
};

// After
const testData = btoa('test pdf content');
const mockResponse = {
  json: {
    data: testData,
    type: 'application/pdf',
    disposition: 'attachment; filename="report.pdf"',
    contentLength: testData.length,
  },
};
```

**Specific Test Cases Modified:**
1. `actionAndDownload › executes action with download` (line ~160)
2. `actionAndDownload › executes download with default empty params` (line ~194)

**Example Change in `baseDataProvider.test.ts`:**
```typescript
// Before (line ~168-175)
httpClient.mockResolvedValueOnce({
  json: {
    type: 'application/json',
    data: 'base64data',
    disposition,
  },
});

// After
const testData = 'base64data';
httpClient.mockResolvedValueOnce({
  json: {
    type: 'application/json',
    data: testData,
    disposition,
    contentLength: testData.length,
  },
});
```

**Specific Test Cases Modified:**
1. `export › handles file export` (line ~160)

## Technical Details

### Validation Logic
The validation function in `client/shared/providers/baseDataProvider.ts`:
```typescript
function validateFileResponse(response: any) {
  if (!response) {
    throw new Error('Invalid file response');
  }
  const expectedKeys = ['data', 'type', 'disposition', 'contentLength'];
  const missingKeys = expectedKeys.filter(key => !(key in response));
  if (missingKeys.length > 0) {
    throw new Error(`Invalid file response, missing keys: ${missingKeys.join(', ')}`);
  }
  const { data, contentLength } = response;
  const actualLength = data.length;
  if (actualLength !== contentLength) {
    throw new Error(`Invalid file response, content length mismatch: expected ${contentLength}, got ${actualLength}`);
  }
}
```

This validation ensures:
1. All required fields are present
2. The `contentLength` matches the actual data length (for data integrity)

### Why contentLength Is Important
The `contentLength` field serves two purposes:
1. **Data Integrity**: Validates that the complete file data was received
2. **API Contract**: Ensures the backend and frontend agree on the expected response format

## Alternative Workflow Options

### Option 1: Direct Submodule Updates (Current Approach)
**Process:**
1. Make changes in the main repository's working copy of the shared folder
2. Document changes in this file
3. Repository owner manually applies changes to the shared repositories
4. Update submodule references in main repository

**Pros:**
- Clear documentation of what needs to change
- Repository owner maintains control over shared repos
- Changes are reviewed before being applied

**Cons:**
- Manual process for applying changes
- Two-step commit process

### Option 2: Separate PRs to Shared Repositories
**Can this be done?** Yes, this is technically feasible with proper setup.

**Process:**
1. Agent creates separate PRs directly to nra-client and nra-server repositories
2. After PRs are merged, update submodule references in main repository
3. Create PR in main repository with updated submodule references

**How to implement:**

**Setup Requirements:**
1. Grant GitHub agent access to shared repositories:
   - Add Copilot bot/agent as collaborator with write access to:
     - https://github.com/buzz-code/nra-client
     - https://github.com/buzz-code/nra-server
   - Or use GitHub App installation with appropriate permissions

2. Configure agent workflow:
   ```yaml
   # In main repository, agent needs to:
   # 1. Detect changes needed in shared folders
   # 2. Clone shared repository separately
   # 3. Create branch, make changes, push to shared repo
   # 4. Create PR in shared repo using GitHub API
   # 5. Wait for PR approval/merge (or auto-merge if configured)
   # 6. Update submodule reference in main repo
   ```

**Detailed workflow:**
1. **Agent detects shared folder changes needed:**
   - Analyzes test failures or requirements
   - Identifies which shared repo needs updates

2. **Create PR in shared repository:**
   ```bash
   # For nra-client changes:
   cd /tmp
   git clone https://github.com/buzz-code/nra-client.git
   cd nra-client
   git checkout -b fix/test-contentLength-validation
   
   # Make changes (e.g., edit providers/__tests__/dataProvider.test.js)
   # ... apply fixes ...
   
   git add .
   git commit -m "fix: add contentLength to mock file responses in tests"
   git push origin fix/test-contentLength-validation
   
   # Create PR using GitHub CLI or API
   gh pr create \
     --title "fix: add contentLength to mock file responses in tests" \
     --body "Fixes test failures by adding required contentLength field" \
     --base main
   ```

3. **After PR is merged, update main repository:**
   ```bash
   cd /path/to/react-admin-nestjs
   
   # Update submodule to latest commit
   git submodule update --remote client/shared
   
   # Or update to specific commit
   cd client/shared
   git fetch origin
   git checkout <merged-commit-sha>
   cd ../..
   
   # Commit the submodule reference update
   git add client/shared
   git commit -m "chore: update client/shared submodule to include test fixes"
   git push
   ```

**GitHub Actions automation:**
You can automate this with GitHub Actions workflow:
```yaml
# .github/workflows/update-submodules.yml
name: Update Submodules
on:
  workflow_dispatch:
    inputs:
      submodule:
        description: 'Which submodule to update'
        required: true
        type: choice
        options:
          - client/shared
          - server/shared
          
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: true
          token: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Update submodule
        run: |
          git submodule update --remote ${{ inputs.submodule }}
          git add ${{ inputs.submodule }}
          git commit -m "chore: update ${{ inputs.submodule }} submodule"
          git push
```

**Pros:**
- Direct updates to source repositories
- Standard PR workflow
- Changes tracked in shared repo history
- Can be fully automated
- Proper code review in shared repos

**Cons:**
- Requires repository access permissions for agents
- More complex coordination (multiple PRs)
- Agents need to handle multiple repositories
- Need to manage submodule update timing
- Potential for synchronization issues if multiple agents work simultaneously

### Option 3: Shared Repository Agent Workflow
**Process:**
1. Create a specialized agent for shared repository changes
2. Main repository agent creates a detailed change specification file (like this document)
3. Shared repository agent reads the specification and applies changes
4. Main repository agent then updates submodule references

**Pros:**
- Automated process
- Maintains separation of concerns
- Can be triggered automatically

**Cons:**
- Requires agent coordination infrastructure
- More complex setup
- Need to handle agent dependencies

### Option 4: Monorepo Approach (Future Consideration)
**Process:**
1. Move shared code from submodules into the main repository
2. Use workspace/package management (yarn workspaces, npm workspaces)
3. Maintain shared code as internal packages

**Pros:**
- Single repository to manage
- Atomic commits across shared and main code
- Simpler CI/CD
- Easier for agents to work with

**Cons:**
- Loses ability to share code with other projects easily
- Requires significant restructuring
- May not be suitable if shared code is used elsewhere

## Recommendation

For the current workflow, **Option 1 (Current Approach)** is most appropriate because:
1. It maintains the existing repository structure
2. Changes are clearly documented and reviewable
3. Repository owner maintains control over shared code
4. No complex automation infrastructure needed
5. Works within current agent capabilities

The changes are minimal, well-documented in this file, and easy to apply manually to the shared repositories when ready.

## Applying the Changes

To apply these changes to the shared repositories:

1. **For nra-client repository:**
   ```bash
   cd path/to/nra-client
   # Edit providers/__tests__/dataProvider.test.js
   # Edit providers/__tests__/baseDataProvider.test.ts
   # Apply changes as documented above
   git commit -m "fix: add contentLength to mock file responses in tests"
   ```

2. **For nra-server repository:**
   No changes needed - all server test fixes were in the main repository.

3. **Update submodule references (if needed):**
   ```bash
   cd path/to/react-admin-nestjs
   git submodule update --remote client/shared
   git commit -m "chore: update client/shared submodule reference"
   ```
