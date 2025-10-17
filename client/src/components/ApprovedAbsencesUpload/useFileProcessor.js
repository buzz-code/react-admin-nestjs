import { useCallback } from 'react';
import { useDataProvider, useNotify } from 'react-admin';
import { defaultYearFilter } from '@shared/utils/yearFilter';

export const useFileProcessor = (setFileName, setPreviewData, setLoading) => {
  const dataProvider = useDataProvider();
  const notify = useNotify();

  const handleFileUpload = useCallback(async ({ name, data }) => {
    setFileName(name);

    try {
      setLoading(true);

      // 1. Filter valid rows (must have klassId and reportDate)
      const validRows = data.filter(row => row.klassId && row.reportDate);

      if (validRows.length === 0) {
        notify('הקובץ ריק או לא מכיל שורות תקינות', { type: 'error' });
        setLoading(false);
        return;
      }

      // 2. Lookup klass IDs from keys
      const klassKeys = [...new Set(validRows.map(r => String(r.klassId)))];
      const klassList = await dataProvider.getList('klass', {
        pagination: { page: 1, perPage: 1000 },
        filter: {
          'key:$in': klassKeys.join(','),
          'year': defaultYearFilter.year
        }
      });

      const klassKeyToIdMap = {};
      const klassDataMap = {};
      klassList.data.forEach(klass => {
        klassKeyToIdMap[String(klass.key)] = klass.id;
        klassDataMap[String(klass.key)] = klass;
      });

      // 3. Find matching reports for each row
      const matchResults = await Promise.all(
        validRows.map(async (row) => {
          const klassKey = String(row.klassId);
          const klassReferenceId = klassKeyToIdMap[klassKey];

          if (!klassReferenceId) {
            return {
              row,
              klassKey,
              klassName: null,
              matched: false,
              reports: [],
              error: 'כיתה לא נמצאה במערכת'
            };
          }

          try {
            // Parse the reportDate and create a date range for the same day
            const reportDate = new Date(row.reportDate);
            const startOfDay = new Date(reportDate);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(reportDate);
            endOfDay.setHours(23, 59, 59, 999);

            const result = await dataProvider.getList('att_report_with_report_month', {
              pagination: { page: 1, perPage: 1000 },
              sort: { field: 'student.name', order: 'ASC' },
              filter: {
                'klassReferenceId': klassReferenceId,
                'reportDate:$gte': startOfDay.toISOString(),
                'reportDate:$lte': endOfDay.toISOString(),
                'year': defaultYearFilter.year,
                'absCount:$gt': 0
              }
            });

            return {
              row,
              klassKey,
              klassName: klassDataMap[klassKey]?.name || null,
              matched: result.data.length > 0,
              reports: result.data,
              error: result.data.length === 0 ? 'לא נמצא דיווח נוכחות תואם' : null
            };
          } catch (error) {
            return {
              row,
              klassKey,
              klassName: klassDataMap[klassKey]?.name || null,
              matched: false,
              reports: [],
              error: `שגיאה בשליפת דיווחים: ${error.message}`
            };
          }
        })
      );

      // 4. Set preview data
      const matched = matchResults.filter(r => r.matched).length;
      const notMatched = matchResults.filter(r => !r.matched).length;


      console.log('Match Results:', matchResults);
      setPreviewData({
        total: validRows.length,
        matched,
        notMatched,
        details: matchResults
      });

    } catch (error) {
      notify(error.message || 'שגיאה בעיבוד הקובץ', { type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [dataProvider, notify, setFileName, setPreviewData, setLoading]);

  return { handleFileUpload };
};
