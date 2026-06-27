import React, { useMemo } from 'react';
import { useEmployee } from './useEmployee';
import { splitDate } from './employeeProfileUtils';

function formatTimelineDate(value) {
  const raw = splitDate(value);
  if (!raw) return null;
  try {
    return new Date(raw).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return raw;
  }
}

export default function EmployeeCareerTimeline({ employeeId }) {
  const { employee, isLoading } = useEmployee(employeeId);

  const events = useMemo(() => {
    if (!employee) return [];
    const candidates = [
      { key: 'joined', label: 'Joined company', date: employee.joinedDate },
      { key: 'appointment', label: 'Current appointment', date: employee.appointmentDate },
      { key: 'probation-end', label: 'Probation end', date: employee.probationEndDate },
      { key: 'permanent', label: 'Permanent status', date: employee.permanentDate },
      { key: 'contract-start', label: 'Contract start', date: employee.contractStartDate },
      { key: 'contract-end', label: 'Contract end', date: employee.contractEndDate },
      { key: 'retirement', label: 'Retirement', date: employee.retirementDate },
    ];
    return candidates
      .map((item) => ({ ...item, displayDate: formatTimelineDate(item.date) }))
      .filter((item) => item.displayDate)
      .sort((a, b) => new Date(splitDate(a.date)) - new Date(splitDate(b.date)));
  }, [employee]);

  if (isLoading || !employee) return null;
  if (!events.length) return null;

  return (
    <section className="ep-career-timeline" aria-label="Career timeline">
      <h3 className="ep-career-timeline-title">Career timeline</h3>
      <ol className="ep-career-timeline-list">
        {events.map((event) => (
          <li key={event.key} className="ep-career-timeline-item">
            <span className="ep-career-timeline-dot" aria-hidden="true" />
            <div className="ep-career-timeline-body">
              <span className="ep-career-timeline-label">{event.label}</span>
              <time className="ep-career-timeline-date" dateTime={splitDate(event.date)}>{event.displayDate}</time>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
