import {
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
  FaMap,
  FaClock,
  FaCheck,
  FaTachometerAlt,
} from 'react-icons/fa';

const navbarCategories = [
  {
    title: 'Strategic Planning and Monitoring wing',
    icon: FaCalendarCheck,
    children: [
      { path: '/home/createBookings', label: 'Booking Creation', icon: FaPlusCircle },
      { path: '/home/reports/corporate', label: 'Reports', icon: FaFileAlt },
    ],
  },
  {
    title: 'Field Operations Wing',
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
    title: 'Operation Digitalization & Digital Monitoring & Evaluation Wing',
    icon: FaProjectDiagram,
    children: [
      { path: '/home/workflowDashboard', label: 'Workflow Dashboard', icon: FaProjectDiagram },
    ],
  },
  {
    title: 'Finance',
    icon: FaMoneyBillWave,
    children: [
      { path: '/home/brokers', label: 'Brokers', icon: FaHandshake },
      { path: '/home/financial-cards', label: 'Financial Cards', icon: FaMoneyBillWave },
      { path: '/home/transport/finance', label: 'Transport Payments', icon: FaTruck },
      { path: '/home/reports/finance', label: 'Reports', icon: FaFileAlt },
    ],
  },
  {
    title: 'ICT Wing',
    icon: FaSitemap,
    children: [
      {
        path: '/home/ict/development/dev-center',
        label: 'ICT Development',
        icon: FaProjectDiagram,
        subItems: [
          { path: '/home/ict/development/dev-center', label: 'Dev Center', icon: FaTachometerAlt },
        ],
      },
      {
        path: '/home/ict/system-admin/users',
        label: 'System Administration',
        icon: FaUserCog,
        subItems: [
          { path: '/home/ict/system-admin/users', label: 'Users', icon: FaUsers },
          { path: '/home/ict/system-admin/auth-controls', label: 'Auth Controls', icon: FaKey },
          { path: '/home/ict/system-admin/logs-report', label: 'Logs Report', icon: FaClipboardList },
          { path: '/home/ict/system-admin/master-data-update', label: 'Master Data Update', icon: FaTools },
        ],
      },
    ],
  },
  {
    title: 'Human Resource Management',
    icon: FaUsers,
    children: [
      { path: '/home/employeeRegistration', label: 'Employee Registration', icon: FaUserTie },
      { path: '/home/employees', label: 'Employees', icon: FaUsers },
      { path: '/home/jdManagement', label: 'JD Management', icon: FaClipboardList },
      { path: '/home/employeeAssignment', label: 'Employee Assignment', icon: FaUserTie },
      { path: '/home/attendance/roaster-planning', label: 'Attendance & Roaster', icon: FaClock },
    ],
  },
  {
    title: 'Administration Wing',
    icon: FaBuilding,
    children: [
      { path: '/home/transport/hr', label: 'Vehicle Fleet', icon: FaTruck },
      { path: '/home/fleet', label: 'Resource Allocation', icon: FaCogs },
      { path: '/home/accident-reports', label: 'Accident Reports', icon: FaFileAlt },
      { path: '/home/maintenance', label: 'Maintenance', icon: FaTools },
      { path: '/home/fleet-update', label: 'Fleet update', icon: FaStore },
      { path: '/home/stock-assets/supplier-registration', label: 'Supplier Management', icon: FaHandshake },
      { path: '/home/stock-assets/inventory-items-registration', label: 'Inventory Items Registration', icon: FaBoxes },
      {
        path: '/home/stock-assets/procurement-process',
        label: 'Procurement Process',
        icon: FaShoppingCart,
        subItems: [
          { path: '/home/stock-assets/procurement-process/requests', label: 'Procurement Requests', icon: FaFileAlt },
          { path: '/home/stock-assets/procurement-process/approve-requests', label: 'Procurement Approval', icon: FaClipboardList },
          { path: '/home/stock-assets/procurement-process/request-quotations', label: 'Request Quotations', icon: FaFileInvoice },
          { path: '/home/stock-assets/procurement-process/submit-quotation', label: 'Submit Supplier Quotation', icon: FaFileInvoice },
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
      {
        path: '/home/finance-approvals',
        label: 'Finance Approvals',
        icon: FaMoneyBillWave,
        subItems: [
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