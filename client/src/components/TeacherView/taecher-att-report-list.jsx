import attReport from '../../entities/att-report-with-report-month.jsx';
import { TeacherGuard } from 'src/components/TeacherView/TeacherAccess.jsx';
import { useObjectStore } from 'src/utils/storeUtil';

const BaseList = attReport.list;

const teacherAttReportList = (props) => {
    const { value: teacher } = useObjectStore('teacher');
    const teacherFilter = {
        teacherReferenceId: teacher.tz
    };

    return <TeacherGuard>  <BaseList {...props} filter={teacherFilter} /> </TeacherGuard>;


}
export default { list: teacherAttReportList };
