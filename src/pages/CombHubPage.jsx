import { Navigate } from 'react-router-dom';

/** COMB entry: `/home/comb` → default Monitoring with COMB chrome. */
export default function CombHubPage() {
  return <Navigate to="/home/monitoringDashboard?comb=1" replace />;
}
