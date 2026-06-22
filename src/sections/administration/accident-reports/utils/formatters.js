export function formatDate(dateString) {
  if (!dateString) return 'N/A';
  try {
    if (typeof dateString === 'string') {
      if (dateString.match(/^\d{4}-\d{2}-\d{2}/)) {
        return dateString.split('T')[0];
      }
      const date = new Date(dateString);
      if (!Number.isNaN(date.getTime())) {
        return date.toLocaleDateString();
      }
    }
    return String(dateString);
  } catch {
    return String(dateString);
  }
}

export function formatTime(timeString) {
  if (!timeString) return 'N/A';
  const value = String(timeString);
  return value.length >= 5 ? value.slice(0, 5) : value;
}

export function getActionStatus(report) {
  if (!report?.action) {
    return { key: 'pending', label: 'Pending review' };
  }
  if (report.action === 'd') {
    return { key: 'declined', label: 'Declined' };
  }
  if (report.action === 'r') {
    const maintenanceId = report.maintenance_id || report.maintenanceId;
    return {
      key: 'repair',
      label: maintenanceId ? `Repair #${maintenanceId}` : 'Repair',
    };
  }
  return { key: 'pending', label: 'Pending review' };
}

export function getEquipmentLabel(report) {
  const items = report?.equipment_items;
  if (Array.isArray(items) && items.length) {
    return items
      .map((item) => {
        const name = item.label || item.item_name || item.item_code || `Item #${item.id}`;
        const serial = item.device_serial || item.deviceSerial;
        return serial ? `${name} (${serial})` : name;
      })
      .join(', ');
  }
  return report?.equipment_type_name || 'N/A';
}
