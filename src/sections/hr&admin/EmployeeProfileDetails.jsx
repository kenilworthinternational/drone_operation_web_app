import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetAllEmployeeRegistrationsQuery } from '../../api/services NodeJs/jdManagementApi';
import {
  AddEmployeeModal,
} from './employeeProfile/EmployeeProfileCoreTabs';
import EmployeeListSidebar from './employeeProfile/EmployeeListSidebar';
import EmployeeProfileTabbedView from './employeeProfile/EmployeeProfileTabbedView';
import '../../styles/employeeProfileDetails.css';

const EmployeeProfileDetails = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const employeeParam = searchParams.get('employee') || '';

  const { data: employeesData, isLoading: loadingEmployees, refetch: refetchEmployees } = useGetAllEmployeeRegistrationsQuery();
  const employees = useMemo(() => {
    if (!employeesData) return [];
    if (Array.isArray(employeesData)) return employeesData;
    if (Array.isArray(employeesData.data)) return employeesData.data;
    return [];
  }, [employeesData]);

  const [employeeId, setEmployeeId] = useState(employeeParam);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    setEmployeeId(employeeParam);
  }, [employeeParam]);

  const handleSelectEmployee = (id) => {
    const idStr = String(id);
    setEmployeeId(idStr);
    const next = new URLSearchParams(searchParams);
    next.set('employee', idStr);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="epd-container ep-shell">
      <div className="epd-header-row ep-page-header">
        <div>
          <h2 className="epd-title">Employee Profile</h2>
          <p className="ep-page-hint">Select an employee from the list to view and manage their full HR profile.</p>
        </div>
        <button type="button" className="epd-btn epd-btn-primary" onClick={() => setShowAddModal(true)}>
          + Add Employee
        </button>
      </div>

      <div className="ep-layout">
        <EmployeeListSidebar
          employees={employees}
          selectedId={employeeId}
          onSelect={handleSelectEmployee}
          isLoading={loadingEmployees}
        />

        <main className="ep-main">
          {!employeeId ? (
            <div className="ep-main-empty">
              <h3>Select an employee</h3>
              <p>Choose someone from the list on the left, or add a new employee to get started.</p>
            </div>
          ) : (
            <EmployeeProfileTabbedView employeeId={employeeId} key={employeeId} />
          )}
        </main>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onCreated={(data) => {
            refetchEmployees();
            if (data?.id) {
              handleSelectEmployee(String(data.id));
            }
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
};

export default EmployeeProfileDetails;
