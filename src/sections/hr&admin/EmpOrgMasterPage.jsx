import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { withCurrentWingSearch } from '../../config/wingRouteGuard';
import EmpOrgMasterPanel from './empOrg/EmpOrgMasterPanel';
import '../../styles/organizationStructure.css';

export default function EmpOrgMasterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const root = document.querySelector('.content-dashboard');
    root?.classList.add('content-dashboard--organization-structure');
    return () => root?.classList.remove('content-dashboard--organization-structure');
  }, []);

  const goToOrgStructure = () => {
    navigate(withCurrentWingSearch('/home/organizationStructure', location.search));
  };

  return (
    <div className="org-shell org-shell--master">
      <div className="org-page-header org-page-header--row">
        <div>
          <button type="button" className="org-back-link" onClick={goToOrgStructure}>
            ← Organization structure
          </button>
        </div>
      </div>
      <EmpOrgMasterPanel />
    </div>
  );
}
