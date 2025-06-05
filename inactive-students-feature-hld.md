# High-Level Design (HLD) for Adding "Inactive Students" Field

## Overview
Add a boolean field `isActive` to the Student entity that will:
- Be stored in the database
- Display in all student tables and reports
- Allow filtering by active/inactive status
- Default to `true` (active) for new students

## Changes Required

### 1. Backend Changes

#### Database Schema (Student Entity)
- **File**: `/server/src/db/entities/Student.entity.ts`
- Add new boolean column `isActive` with default value `true`
- Add appropriate validation decorators

#### Student Configuration
- **File**: `/server/src/entity-modules/student.config.ts`
- Update export headers to include the inactive status field
- Add filtering capabilities for the new field

#### View Entities & Reports
The following view entities will automatically include the new field through their joins with the Student entity:
- `StudentByYear.entity.ts`
- `StudentKlassReport.entity.ts`
- `StudentBaseKlass.entity.ts`
- `StudentSpeciality.entity.ts`
- `StudentGlobalReport.entity.ts`
- `StudentPercentReport.entity.ts`

#### Migration
- Create database migration to add the `isActive` column with default value `true`

### 2. Frontend Changes

#### Core Student Component
- **File**: `/client/src/entities/student.jsx`
- Add checkbox input for `isActive` field in the form
- Add boolean field display in the datagrid
- Add filter for active/inactive status

#### Components Requiring Filter Updates
The following components need to include the active/inactive filter:
- **File**: `/client/src/entities/student-klass.jsx`
- **File**: `/client/src/entities/att-report-with-report-month.jsx`
- **File**: `/client/src/entities/grade.jsx`
- **File**: `/client/src/entities/known-absence.jsx`
- **File**: `/client/src/pivots/PercentReportWithDatesList.jsx`

#### Student Attendance Component
- **File**: `/client/src/pivots/StudentAttendanceList.jsx`
- Add filter for active/inactive students

### 3. Excel Report Updates
- **File**: `/server/shared/utils/report/data-to-excel.generator.ts`
- Ensure the isActive field is properly handled in Excel exports
- Update column width calculations to accommodate the new field

## Technical Implementation Details

### Database Column Specification
```sql
isActive BOOLEAN NOT NULL DEFAULT true
```

### Migration Commands
```bash
# 1. First, dry-run the migration to verify it's correct:
docker compose exec server yarn typeorm:generate src/migrations/AddIsActiveToStudent --dryrun --pretty

# 2. Generate a migration after verifying the changes:
docker compose exec server yarn typeorm:generate src/migrations/AddIsActiveToStudent --pretty

# 3. Run migrations:
docker compose exec server yarn typeorm:run
```

### Boolean Validator and Transformer
- Create custom validator that converts various formats ('true', 'TRUE', 'כן', '1', etc.) to boolean
- Create TypeORM transformer for proper database conversion
- Handle Hebrew inputs ('כן' for yes, 'לא' for no)

### Frontend Filter Configuration
- Add boolean filter with options: "Active", "Inactive", "All"
- Default filter state: "Active" (show only active students)
- Use `BooleanInput` and `BooleanField` from react-admin

### Validation Rules
- Required field (cannot be null)
- Default value: `true`
- No additional business logic validation required

## Progress Section

### Task Breakdown

#### Phase 1: Backend Implementation
- [x] **Task 1.1**: Create Boolean Validator and Type Converter
- [x] **Task 1.2**: Add `isActive` field to Student entity
- [x] **Task 1.3**: Create database migration
- [x] **Task 1.4**: Update student configuration for exports (including Hebrew boolean formatter)
- [x] **Task 1.5**: Test backend changes

#### Phase 2: Core Frontend Implementation  
- [x] **Task 2.1**: Update student.jsx component (form, datagrid, filters)
- [x] **Task 2.2**: Test core student functionality

#### Phase 3: Filter Integration
- [x] **Task 3.1**: Add filter to student-klass.jsx
- [x] **Task 3.2**: Add filter to att-report-with-report-month.jsx
- [x] **Task 3.3**: Add filter to grade.jsx
- [x] **Task 3.4**: Add filter to known-absence.jsx
- [x] **Task 3.5**: Add filter to PercentReportWithDatesList.jsx
- [x] **Task 3.6**: Add filter to StudentAttendanceList.jsx

#### Phase 4: Testing & Validation
- [ ] **Task 4.1**: Test all filters work correctly
- [ ] **Task 4.2**: Test Excel exports include isActive field
- [ ] **Task 4.3**: Test database migration
- [ ] **Task 4.4**: End-to-end testing

## Notes
- The feature maintains backward compatibility
- Existing students will be marked as active by default
- The filter should default to showing only active students in most views
- Admin users can still view inactive students by changing the filter
