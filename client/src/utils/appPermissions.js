import { useHasPermission, hasPermissionLogic, isAdmin } from '@shared/utils/permissionsUtil';

export const appPermissions = {
  scannerUpload: 'scannerUpload',
  inLessonReport: 'inLessonReport',
  inLessonReportWithLate: 'inLessonReport.withLate',
  absCountEffect: 'absCountEffect',
};

export const isScannerUpload = (permissions) => hasPermissionLogic(permissions, appPermissions.scannerUpload);
export const useIsScannerUpload = () => useHasPermission(appPermissions.scannerUpload);

export const isInLessonReport = (permissions) => isAdmin(permissions) || hasPermissionLogic(permissions, appPermissions.inLessonReport);
export const useIsInLessonReport = () => useHasPermission(appPermissions.inLessonReport);

export const isInLessonReportWithLate = (permissions) => isAdmin(permissions) || hasPermissionLogic(permissions, appPermissions.inLessonReportWithLate);
export const useIsInLessonReportWithLate = () => useHasPermission(appPermissions.inLessonReportWithLate);

export const isAbsCountEffect = (permissions) => hasPermissionLogic(permissions, appPermissions.absCountEffect);
export const useIsAbsCountEffect = () => useHasPermission(appPermissions.absCountEffect);
