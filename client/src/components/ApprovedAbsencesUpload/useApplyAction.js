import { useCallback } from 'react';
import { useDataProvider, useNotify } from 'react-admin';
import { handleActionSuccess, handleError } from '@shared/utils/notifyUtil';

export const useApplyAction = (previewData, configValues, setLoading, resetForm) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const handleApply = useCallback(async () => {
    if (!previewData) return;

    try {
      setLoading(true);

      // Get all matched reports
      const matchedReports = previewData.details
        .filter(d => d.matched)
        .flatMap(d => d.reports);

      if (matchedReports.length === 0) {
        notify('לא נמצאו דיווחים תואמים', { type: 'warning' });
        return;
      }

      const reportIds = matchedReports.map(r => r.id);

      // Call bulkKnownAbsences action
      const response = await dataProvider.action(
        'att_report_with_report_month',
        'bulkKnownAbsences',
        {
          'extra.ids': reportIds.join(','),
          'extra.reason': configValues.reason,
          'extra.isApproved': true,
          'extra.senderName': configValues.senderName,
          'extra.comment': configValues.comment
        }
      );

      handleActionSuccess(notify)(response);

      // Show summary
      if (previewData.notMatched > 0) {
        setTimeout(() => {
          notify(
            `${previewData.notMatched} שורות דולגו בגלל שגיאות`,
            { type: 'warning' }
          );
        }, 1000);
      }

      // Reset form
      resetForm();

    } catch (error) {
      handleError(notify)(error);
    } finally {
      setLoading(false);
    }
  }, [previewData, configValues, dataProvider, notify, setLoading, resetForm]);

  return { handleApply };
};
