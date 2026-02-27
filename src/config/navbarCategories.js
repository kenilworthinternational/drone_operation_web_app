import {
  FaHome,
  FaChartBar,
  FaPlusCircle,
  FaUsers,
  FaCalendarAlt,
  FaPauseCircle,
  FaFileAlt,
  FaSitemap,
  FaFlag,
  FaHandshake,
  FaBuilding,
  FaUserTie,
  FaProjectDiagram,
  FaMoneyBillWave,
  FaMoneyBill,
  FaBoxes,
  FaTools,
  FaUserShield,
  FaClipboardList,
  FaUserCog,
  FaKey,
  FaCogs,
  FaCalendarCheck,
  FaWarehouse,
  FaStore,
  FaShoppingCart,
  FaTruck,
  FaFileInvoice,
  FaDesktop,
  FaMobileAlt,
  FaMap,
  FaClock,
  FaCheck,
} from 'react-icons/fa';

const navbarCategories = [
  {
    title: 'Corporate',
    icon: FaBuilding,
    children: [
      { path: '/home/dataViewer', label: 'Infographics', icon: FaChartBar },
      { path: '/home/dashboard', label: 'Dashboard', icon: FaHome },
      { path: '/home/calenderView/corporate', label: 'Mission Calendar', icon: FaCalendarAlt },
      { path: '/home/reports/corporate', label: 'Reports', icon: FaFileAlt },
    ],
  },
  {
    title: 'Planning and Monitoring',
    icon: FaCalendarCheck,
    children: [
      { path: '/home/createBookings', label: 'Booking Creation', icon: FaPlusCircle },
      // { path: '/home/bookingList', label: 'Nonp Booking', icon: FaFileAlt },
    ],
  },
  {
    title: 'Management',
    icon: FaUserTie,
    children: [
      { path: '/home/reports/management', label: 'Reports', icon: FaFileAlt },
      { path: '/home/calenderView/management', label: 'Mission Calendar', icon: FaCalendarAlt },
      { path: '/home/earnings', label: 'Pilot Earnings', icon: FaMoneyBill },
      { path: '/home/reportReview', label: 'Review Reports', icon: FaFlag },
      { path: '/home/deactivatePlan', label: 'Deactive Plan', icon: FaPauseCircle },
    ],
  },
  {
    title: 'Central Operation Management',
    icon: FaProjectDiagram,
    children: [
      { path: '/home/monitoringDashboard', label: 'Monitoring Dashboard', icon: FaDesktop },
      { path: '/home/workflowDashboard', label: 'Workflow Dashboard', icon: FaProjectDiagram },
      { path: '/home/calenderView/opsroom', label: 'Mission Calendar', icon: FaCalendarAlt },
    ],
  },
  {
    title: 'Finance',
    icon: FaMoneyBillWave,
    children: [
      { path: '/home/brokers', label: 'Brokers', icon: FaHandshake },
      { path: '/home/financial-cards', label: 'Financial Cards', icon: FaMoneyBillWave },
      { path: '/home/vehicle-rent', label: 'Vehicle Rent', icon: FaTruck },
      { path: '/home/reports/finance', label: 'Reports', icon: FaFileAlt },
    ],
  },
  {
    title: 'ICT - System Admin',
    icon: FaUserCog,
    children: [
      { path: '/home/ict/system-admin/users', label: 'Users', icon: FaUsers },
      { path: '/home/ict/system-admin/auth-controls', label: 'Auth Controls', icon: FaKey },
      { path: '/home/ict/system-admin/app-versions', label: 'App Versions', icon: FaMobileAlt },
      { path: '/home/ict/system-admin/logs-report', label: 'Logs Report', icon: FaClipboardList },
    ],
  },
  {
    title: 'Fleet Management',
    icon: FaCogs,
    children: [
      { path: '/home/fleet', label: 'Resource Allocation', icon: FaCogs },
      { path: '/home/accident-reports', label: 'Accident Reports', icon: FaFileAlt },
      { path: '/home/maintenance', label: 'Maintenance', icon: FaTools },
      { path: '/home/fleet-update', label: 'Fleet update', icon: FaStore },
    ],
  },
  {
    title: 'Stock and Assets Management',
    icon: FaWarehouse,
    children: [
      { path: '/home/stock-assets/supplier-registration', label: 'Supplier Management', icon: FaHandshake },
      { path: '/home/stock-assets/inventory-items-registration', label: 'Inventory Items Registration', icon: FaBoxes },
      {
        path: '/home/stock-assets/procurement-process',
        label: 'Procurement Process',
        icon: FaShoppingCart,
        subItems: [
          { path: '/home/stock-assets/procurement-process/requests', label: 'Procurement Requests', icon: FaFileAlt },
          { path: '/home/stock-assets/procurement-process/approved-queue', label: 'Approved Procure Queue', icon: FaClipboardList },
          { path: '/home/stock-assets/procurement-process/request-quotations', label: 'Request Quotations', icon: FaFileInvoice },
          { path: '/home/stock-assets/procurement-process/pending-quotations', label: 'Pending Quotations Queue', icon: FaClock },
          { path: '/home/stock-assets/procurement-process/quotations-evaluation', label: 'Quotations Evaluation', icon: FaChartBar },
          { path: '/home/stock-assets/procurement-process/tech-evaluation', label: 'Tech Evaluation', icon: FaTools },
          { path: '/home/stock-assets/procurement-process/finalize-quotations', label: 'Finalize Quotations', icon: FaCheck },
          { path: '/home/stock-assets/procurement-process/purchase-order-issue', label: 'Purchasing Order Issue', icon: FaShoppingCart },
          { path: '/home/stock-assets/procurement-process/grn', label: 'Good Received Note', icon: FaWarehouse },
        ],
      },
      {
        path: '/home/stock-assets/central-stores',
        label: 'Central Stores (GRN/GIN)',
        icon: FaStore,
        subItems: [
          { path: '/home/stock-assets/central-stores/request-items-services', label: 'Request Items/Services', icon: FaFileInvoice },
          { path: '/home/stock-assets/central-stores/request-queue', label: 'Request Queue', icon: FaClipboardList },
          { path: '/home/stock-assets/central-stores/issue-items-services', label: 'Issue Items/Services', icon: FaBoxes },
          { path: '/home/stock-assets/central-stores/need-to-procure-queue', label: 'Need to Procure Queue', icon: FaShoppingCart },
        ],
      },
      { path: '/home/stock-assets/asset-transfer', label: 'Asset/Item/Service Transfer', icon: FaTruck },
      { path: '/home/stock-assets/asset-request', label: 'Asset/Item/Service Request', icon: FaFileInvoice },
    ],
  },
  {
    title: 'HR and Admin',
    icon: FaUserShield,
    children: [
      { path: '/home/employeeRegistration', label: 'Employee Registration', icon: FaUserTie },
      { path: '/home/employees', label: 'Employees', icon: FaUsers },
      { path: '/home/jdManagement', label: 'JD Management', icon: FaClipboardList },
      { path: '/home/employeeAssignment', label: 'Employee Assignment', icon: FaUserTie },
      { path: '/home/attendance/roaster-planning', label: 'Attendance & Roaster', icon: FaClock },
      {
        path: '/home/finance-approvals',
        label: 'Finance Approvals',
        icon: FaMoneyBillWave,
        subItems: [
          { path: '/home/financial-cards', label: 'Financial Cards', icon: FaMoneyBillWave },
          { path: '/home/vehicle-rent-approvals', label: 'Vehicle Rent Approvals', icon: FaTruck },
        ]
      },
    ],
  },
  {
    title: 'Geo Spatial Management',
    icon: FaMap,
    children: [
      { path: '/home/geo-spatial/mapping-update', label: 'Mapping Update', icon: FaMap },
    ],
  },
];

export default navbarCategories;