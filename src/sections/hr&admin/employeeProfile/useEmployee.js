import { useGetEmployeeRegistrationByIdQuery } from '../../../api/services NodeJs/jdManagementApi';
import { employeeRecord } from './employeeProfileUtils';

export function useEmployee(employeeId) {
  const { data, isLoading, refetch } = useGetEmployeeRegistrationByIdQuery(
    { id: employeeId },
    { skip: !employeeId },
  );
  return { employee: employeeRecord(data), isLoading, refetch };
}
