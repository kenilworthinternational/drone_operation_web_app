import React from 'react';

function employeeInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

function boxDepth(depth) {
  return Math.min(depth, 3);
}

function OrgChartBox({ node, depth, variant = 'node' }) {
  const d = boxDepth(depth);
  const dept = node.departmentName || '';
  const role = depth === 1 && dept
    ? dept
    : (node.designation || node.jobCategory || dept || '');
  const subtitle = role;

  if (variant === 'leaf') {
    return (
      <div className="org-tree-box org-tree-box--leaf" title={subtitle || node.name}>
        <div className="org-tree-avatar org-tree-avatar--sm">{employeeInitials(node.name) || '?'}</div>
        <div className="org-tree-name">{node.name}</div>
      </div>
    );
  }

  return (
    <div className={`org-tree-box org-tree-box--d${d}`} title={node.empNo ? `EMP ${node.empNo}` : undefined}>
      <div className={`org-tree-avatar ${d >= 2 ? 'org-tree-avatar--md' : ''}`}>
        {employeeInitials(node.name) || '?'}
      </div>
      {subtitle && d <= 2 ? <div className="org-tree-role">{subtitle}</div> : null}
      <div className="org-tree-name">{node.name}</div>
      {subtitle && d >= 3 ? <div className="org-tree-role org-tree-role--sm">{subtitle}</div> : null}
    </div>
  );
}

function OrgChartNode({ node, depth = 0, isRoot = false }) {
  const children = node.children || [];
  const hasChildren = children.length > 0;
  const allLeaves = hasChildren && children.every((c) => !(c.children?.length));

  return (
    <li className={`org-tree-node${isRoot ? ' org-tree-node--root' : ''}`}>
      <OrgChartBox node={node} depth={depth} />
      {hasChildren && allLeaves && (
        <ul className="org-tree-leaves">
          {children.map((child) => (
            <li key={child.id}>
              <OrgChartBox node={child} depth={depth + 1} variant="leaf" />
            </li>
          ))}
        </ul>
      )}
      {hasChildren && !allLeaves && (
        <ul className="org-tree-level">
          {children.map((child) => (
            <OrgChartNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function OrgChartTree({ roots }) {
  if (!roots?.length) return null;

  if (roots.length === 1) {
    return (
      <div className="org-tree-chart">
        <ul className="org-tree-level org-tree-level--root">
          <OrgChartNode node={roots[0]} depth={0} isRoot />
        </ul>
      </div>
    );
  }

  return (
    <div className="org-tree-chart">
      <ul className="org-tree-level org-tree-level--root org-tree-level--multi-root">
        {roots.map((node) => (
          <OrgChartNode key={node.id} node={node} depth={0} isRoot />
        ))}
      </ul>
    </div>
  );
}
