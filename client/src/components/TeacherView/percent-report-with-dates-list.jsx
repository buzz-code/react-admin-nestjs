import PercentReportWithDatesList from 'src/pivots/PercentReportWithDatesList';
import { TeacherGuard } from 'src/components/TeacherView/TeacherAccess.jsx';
import { useObjectStore } from 'src/utils/storeUtil';

const TeacherPercentReportWithDatesList = (props) => {
    const { value: teacher } = useObjectStore('teacher');
    const teacherFilter = {
        teacherReferenceId: teacher?.id
    };

    return <TeacherGuard> <PercentReportWithDatesList {...props} filter={teacherFilter} /> </TeacherGuard>;


}
export default TeacherPercentReportWithDatesList;
