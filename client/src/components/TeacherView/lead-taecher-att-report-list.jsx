import attReport from "../../entities/att-report-with-report-month.jsx";
import { TeacherGuard } from "src/components/TeacherView/TeacherAccess.jsx";
import { useObjectStore } from "src/utils/storeUtil";

const BaseList = attReport.list;

const LeadTeacherAttReportList = (props) => {
  const { value: teacher } = useObjectStore("teacher");

  const leadTeacherFilter = {
    'klass.klassType.teacherReferenceId': teacher?.id,
  };

  return (
    <TeacherGuard>
      <BaseList {...props} filter={leadTeacherFilter} />
    </TeacherGuard>
  );
};

export default LeadTeacherAttReportList;