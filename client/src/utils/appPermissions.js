import { useHasPermission, hasPermissionLogic, isAdmin } from '@shared/utils/permissionsUtil';

export const appPermissions = {
  scannerUpload: 'scannerUpload',
  inLessonReport: 'inLessonReport',
  inLessonReportWithLate: 'inLessonReport.withLate',
  inLessonReportOnly: 'inLessonReport.only',
  inLessonReportStartWithTeacher: 'inLessonReport.startWithTeacher',
  absCountEffect: 'absCountEffect',
  lessonSignature: 'lessonSignature',
};

export const isScannerUpload = (permissions) => hasPermissionLogic(permissions, appPermissions.scannerUpload);
export const useIsScannerUpload = () => useHasPermission(appPermissions.scannerUpload);

export const isInLessonReport = (permissions) => isAdmin(permissions) || hasPermissionLogic(permissions, appPermissions.inLessonReport);
export const useIsInLessonReport = () => useHasPermission(appPermissions.inLessonReport);

export const isInLessonReportWithLate = (permissions) => isAdmin(permissions) || hasPermissionLogic(permissions, appPermissions.inLessonReportWithLate);
export const useIsInLessonReportWithLate = () => useHasPermission(appPermissions.inLessonReportWithLate);

export const isInLessonReportStartWithTeacher = (permissions) => isAdmin(permissions) || hasPermissionLogic(permissions, appPermissions.inLessonReportStartWithTeacher);
export const useIsInLessonReportStartWithTeacher = () => useHasPermission(appPermissions.inLessonReportStartWithTeacher);

export const isOnlyInLessonReport = (permissions) => hasPermissionLogic(permissions, appPermissions.inLessonReportOnly);
export const useIsOnlyInLessonReport = () => useHasPermission(appPermissions.inLessonReportOnly);

export const isAbsCountEffect = (permissions) => hasPermissionLogic(permissions, appPermissions.absCountEffect);
export const useIsAbsCountEffect = () => useHasPermission(appPermissions.absCountEffect);

export const isLessonSignature = (permissions) => isAdmin(permissions) || hasPermissionLogic(permissions, appPermissions.lessonSignature);
export const useIsLessonSignature = () => useHasPermission(appPermissions.lessonSignature);
