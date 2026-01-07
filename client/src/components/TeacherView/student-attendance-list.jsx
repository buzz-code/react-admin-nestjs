import StudentAttendanceList from "src/pivots/StudentAttendanceList.jsx";
import { TeacherGuard } from "src/components/TeacherView/TeacherAccess.jsx";
import { useObjectStore } from "src/utils/storeUtil";

const TeacherStudentAttendanceList = (props) => {
  const { value: teacher } = useObjectStore("teacher");
  const teacherFilter = {
    teacherReferenceId: teacher?.id,
  };

  return (
    <TeacherGuard>
      <StudentAttendanceList {...props} filter={teacherFilter} />
    </TeacherGuard>
  );
};
export default TeacherStudentAttendanceList;
