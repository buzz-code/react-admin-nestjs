import { usePermissions } from 'react-admin';
import { getResourceComponents } from '@shared/components/crudContainers/CommonEntity';
import {
  Datagrid as ImportFileDatagrid,
  filters,
  Representation
} from '@shared/components/common-entities/import-file';
import { BulkReportButton } from '@shared/components/crudContainers/BulkReportButton';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { isLessonSignature } from 'src/utils/appPermissions';

/**
 * App-specific wrapper for import-file that adds permission-based customization
 * This allows the shared component to remain generic while enabling 
 * app-specific features like lesson signature fields
 */

const additionalBulkButtons = [
  <BulkReportButton 
    key='lessonSignaturePdf'
    label='הורד דוחות PDF למורה' 
    icon={<PictureAsPdfIcon />} 
    name='lessonSignaturePdf' 
    filename='דוחות-נוכחות'
  />
];

const Datagrid = ({ children, ...props }) => {
  const { permissions } = usePermissions();
  const hasLessonSignature = isLessonSignature(permissions);

  return (
    <ImportFileDatagrid
      hasLessonSignature={hasLessonSignature}
      additionalBulkButtons={hasLessonSignature ? additionalBulkButtons : []}
      {...props}
    >
      {children}
    </ImportFileDatagrid>
  );
};

const entity = {
  Datagrid,
  filters,
  Representation,
};

export default getResourceComponents(entity);
