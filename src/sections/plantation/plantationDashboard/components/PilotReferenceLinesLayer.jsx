import React from 'react';
import { Curve, Layer } from 'recharts';
import {
  getCateCoordinateOfLine,
  getTicksOfAxis,
  getBandSizeOfAxis,
} from 'recharts/es6/util/ChartUtils';

/**
 * Horizontal center of all bar rectangles at each category index (matches clustered bars).
 * Recharts uses getCateCoordinateOfBar + per-stack offsets; getCateCoordinateOfLine (band center)
 * can sit between months when multiple Bar stackIds sit side-by-side.
 */
function getCategoryCenterXFromBars(formattedGraphicalItems, dataLength) {
  if (!formattedGraphicalItems?.length || !dataLength) return null;
  const barItems = formattedGraphicalItems.filter(
    (g) => g.item?.type?.displayName === 'Bar'
  );
  if (!barItems.length) return null;
  const centers = [];
  for (let i = 0; i < dataLength; i += 1) {
    let minL = Infinity;
    let maxR = -Infinity;
    for (const b of barItems) {
      const r = b.props?.data?.[i];
      if (r && Number.isFinite(r.x) && Number.isFinite(r.width)) {
        minL = Math.min(minL, r.x);
        maxR = Math.max(maxR, r.x + r.width);
      }
    }
    if (Number.isFinite(minL) && Number.isFinite(maxR) && maxR >= minL) {
      centers.push((minL + maxR) / 2);
    } else {
      centers.push(null);
    }
  }
  return centers;
}

function buildCategoryPoints(chartData, valueKey, xAxis, yAxis, xByIndex) {
  const xAxisTicks = getTicksOfAxis(xAxis, true);
  const bandSize = getBandSizeOfAxis(xAxis, xAxisTicks);
  return chartData
    .map((entry, index) => {
      const val = Number(entry[valueKey]);
      if (!Number.isFinite(val)) return null;
      const y = yAxis.scale(val);
      let x =
        xByIndex && Number.isFinite(xByIndex[index]) ? xByIndex[index] : null;
      if (x == null) {
        x = getCateCoordinateOfLine({
          axis: xAxis,
          ticks: xAxisTicks,
          bandSize,
          entry,
          index,
        });
      }
      if (x == null || y == null || !Number.isFinite(x) || !Number.isFinite(y)) return null;
      return { x, y };
    })
    .filter(Boolean);
}

/**
 * Renders pilot min/max (Ha) as polylines on top of ComposedChart bars.
 * Recharts <Line /> often fails to draw in ComposedChart+Bar stacks; this uses the same
 * coordinate math as Line (Curve + ChartUtils) so lines stay visible.
 */
export function createPilotReferenceLinesRenderer({
  chartData,
  minKey = 'pilotExtentMin',
  maxKey = 'pilotExtentAvg',
  strokeMin = '#dc2626',
  strokeMax = '#2563eb',
}) {
  return function PilotReferenceLinesRenderer(props) {
    const { xAxisMap, yAxisMap, formattedGraphicalItems } = props;
    if (!chartData?.length || !xAxisMap || !yAxisMap) return null;
    const xAxis = xAxisMap[Object.keys(xAxisMap)[0]];
    const yAxis = yAxisMap[Object.keys(yAxisMap)[0]];
    const xByIndex = getCategoryCenterXFromBars(formattedGraphicalItems, chartData.length);
    const ptsMin = buildCategoryPoints(chartData, minKey, xAxis, yAxis, xByIndex);
    const ptsMax = buildCategoryPoints(chartData, maxKey, xAxis, yAxis, xByIndex);

    const renderStroke = (points, stroke) => {
      if (points.length >= 2) {
        return (
          <Curve
            type="linear"
            layout="horizontal"
            points={points}
            stroke={stroke}
            strokeWidth={2.5}
            fill="none"
            dot={false}
          />
        );
      }
      if (points.length === 1) {
        return (
          <circle cx={points[0].x} cy={points[0].y} r={4} fill={stroke} stroke={stroke} strokeWidth={2} />
        );
      }
      return null;
    };

    return (
      <Layer className="recharts-pilot-reference-lines">
        {renderStroke(ptsMin, strokeMin)}
        {renderStroke(ptsMax, strokeMax)}
      </Layer>
    );
  };
}

export default createPilotReferenceLinesRenderer;
