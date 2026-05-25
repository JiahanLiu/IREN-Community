import React, { useMemo, useState } from 'react';
import { DEFAULT_SCENARIO_PARAMS, getCurrentSharesFromDilution } from '../constants/defaults';
import { buildScenarioSites } from '../constants/sites';
import { calculateSiteNetProfit } from '../utils/calculations';
import { formatValue } from '../utils/formatters';

const METRICS = {
  year: { label: 'Year', formatter: value => `${value}` },
  sharePrice: { label: 'Share price', formatter: value => `$${value.toFixed(2)}` },
  marketCap: { label: 'Market cap', formatter: value => formatValue(value) },
  annualRevenue: { label: 'Annual revenue', formatter: value => formatValue(value, '$', '/yr') },
  earningsBeforeTaxSga: { label: 'Earnings before Tax, SG&A', formatter: value => formatValue(value, '$', '/yr') },
  activeMW: { label: 'MWs Active', formatter: value => `${Math.round(value).toLocaleString()}MW` },
};

const X_AXIS_OPTIONS = [
  'year',
  'sharePrice',
  'marketCap',
  'annualRevenue',
  'earningsBeforeTaxSga',
  'activeMW',
];

const Y_AXIS_OPTIONS = [
  'sharePrice',
  'marketCap',
  'annualRevenue',
  'earningsBeforeTaxSga',
  'activeMW',
];

const getScenarioCurrentShares = (params = {}) =>
  params.currentShares ?? getCurrentSharesFromDilution(params.dilutionPercentage);

const getSiteSizeMW = (site) => {
  const sizeValue = Number(site.data.sizeValue ?? site.data.totalLoadValue) || 0;
  const sizeUnit = site.data.sizeUnit ?? site.data.totalLoadUnit ?? 'MW';
  return sizeUnit === 'GW' ? sizeValue * 1000 : sizeValue;
};

const getDomain = (values) => {
  const min = Math.min(...values);
  const max = Math.max(...values);

  if (min === max) {
    const padding = min === 0 ? 1 : Math.abs(min) * 0.1;
    return [min - padding, max + padding];
  }

  const padding = (max - min) * 0.08;
  return [min - padding, max + padding];
};

const getEvenTicks = ([min, max], count = 5) => (
  Array.from({ length: count }, (_, index) => min + ((max - min) * index) / (count - 1))
);

function ScenarioMetricChart({
  gpuPrices,
  gpuHourlyRates,
  scenarioParameters,
  corporateTaxRate,
  taxAbatementRate,
  sgaExpense,
  useDirectSharesInput,
  directShares,
}) {
  const [xMetric, setXMetric] = useState('year');
  const [yMetric, setYMetric] = useState('sharePrice');
  const [chartOpen, setChartOpen] = useState(true);

  const chartData = useMemo(() => {
    return Object.keys(DEFAULT_SCENARIO_PARAMS).sort().map((scenarioId) => {
      const sites = buildScenarioSites(scenarioId, gpuHourlyRates);
      const annualRevenue = sites.reduce((sum, site) => (
        sum + calculateSiteNetProfit(site, gpuPrices, gpuHourlyRates).revenue
      ), 0);
      const earningsBeforeTaxSga = sites.reduce((sum, site) => (
        sum + calculateSiteNetProfit(site, gpuPrices, gpuHourlyRates).netProfit
      ), 0);
      const activeMW = sites.reduce((sum, site) => (
        site.enabled ? sum + getSiteSizeMW(site) : sum
      ), 0);
      const params = scenarioParameters[scenarioId] || DEFAULT_SCENARIO_PARAMS[scenarioId];
      const preTaxNetProfits = earningsBeforeTaxSga - (sgaExpense || 0);
      const corporateTax = preTaxNetProfits * ((corporateTaxRate || 0) / 100);
      const taxAbatement = corporateTax * ((taxAbatementRate || 0) / 100);
      const netProfit = preTaxNetProfits - (corporateTax - taxAbatement);
      const marketCap = netProfit * (params.peRatio || 0);
      const fullyDilutedShares = useDirectSharesInput
        ? (directShares || 0)
        : getScenarioCurrentShares(params);
      const sharePrice = fullyDilutedShares > 0 ? marketCap / fullyDilutedShares : 0;

      return {
        year: Number(scenarioId),
        scenario: scenarioId,
        sharePrice,
        marketCap,
        annualRevenue,
        earningsBeforeTaxSga,
        activeMW,
      };
    });
  }, [
    corporateTaxRate,
    directShares,
    gpuHourlyRates,
    gpuPrices,
    scenarioParameters,
    sgaExpense,
    taxAbatementRate,
    useDirectSharesInput,
  ]);

  const width = 760;
  const height = 360;
  const margin = { top: 28, right: 32, bottom: 68, left: 88 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const xValues = chartData.map(point => point[xMetric]);
  const yValues = chartData.map(point => point[yMetric]);
  const xDomain = xMetric === 'year' ? [Math.min(...xValues), Math.max(...xValues)] : getDomain(xValues);
  const yDomain = getDomain(yValues);
  const scaleX = value => margin.left + ((value - xDomain[0]) / (xDomain[1] - xDomain[0])) * plotWidth;
  const scaleY = value => margin.top + plotHeight - ((value - yDomain[0]) / (yDomain[1] - yDomain[0])) * plotHeight;
  const xTicks = xMetric === 'year'
    ? chartData.map(point => point.year)
    : getEvenTicks(xDomain);
  const yTicks = getEvenTicks(yDomain);
  const linePoints = chartData.map(point => `${scaleX(point[xMetric])},${scaleY(point[yMetric])}`).join(' ');

  return (
    <div className="accordion scenario-chart-card">
      <div className="accordion-header" onClick={() => setChartOpen(!chartOpen)}>
        <h3>Chart</h3>
        <span className="accordion-icon">{chartOpen ? '−' : '+'}</span>
      </div>

      {chartOpen && (
        <div className="accordion-content">
          <div className="chart-controls">
            <label>
              X Axis
              <select value={xMetric} onChange={(event) => setXMetric(event.target.value)}>
                {X_AXIS_OPTIONS.map(metric => (
                  <option key={metric} value={metric}>{METRICS[metric].label}</option>
                ))}
              </select>
            </label>
            <label>
              Y Axis
              <select value={yMetric} onChange={(event) => setYMetric(event.target.value)}>
                {Y_AXIS_OPTIONS.map(metric => (
                  <option key={metric} value={metric}>{METRICS[metric].label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="scenario-chart-wrapper">
            <svg className="scenario-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${METRICS[yMetric].label} by ${METRICS[xMetric].label}`}>
              <line x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotHeight} className="chart-axis" />
              <line x1={margin.left} y1={margin.top + plotHeight} x2={margin.left + plotWidth} y2={margin.top + plotHeight} className="chart-axis" />

              {yTicks.map(tick => (
                <g key={tick}>
                  <line x1={margin.left} x2={margin.left + plotWidth} y1={scaleY(tick)} y2={scaleY(tick)} className="chart-grid-line" />
                  <text x={margin.left - 10} y={scaleY(tick) + 4} textAnchor="end" className="chart-tick-label">
                    {METRICS[yMetric].formatter(tick)}
                  </text>
                </g>
              ))}

              {xTicks.map(tick => (
                <g key={tick}>
                  <line x1={scaleX(tick)} x2={scaleX(tick)} y1={margin.top + plotHeight} y2={margin.top + plotHeight + 6} className="chart-axis" />
                  <text x={scaleX(tick)} y={margin.top + plotHeight + 24} textAnchor="middle" className="chart-tick-label">
                    {xMetric === 'year' ? tick : METRICS[xMetric].formatter(tick)}
                  </text>
                </g>
              ))}

              <polyline points={linePoints} className="chart-line" />

              {chartData.map(point => (
                <g key={point.scenario}>
                  <circle cx={scaleX(point[xMetric])} cy={scaleY(point[yMetric])} r="5" className="chart-point" />
                  <text x={scaleX(point[xMetric])} y={scaleY(point[yMetric]) - 10} textAnchor="middle" className="chart-point-label">
                    {point.scenario}
                  </text>
                </g>
              ))}

              <text x={margin.left + plotWidth / 2} y={height - 10} textAnchor="middle" className="chart-axis-label">
                {METRICS[xMetric].label}
              </text>
              <text x="18" y={margin.top + plotHeight / 2} textAnchor="middle" transform={`rotate(-90 18 ${margin.top + plotHeight / 2})`} className="chart-axis-label">
                {METRICS[yMetric].label}
              </text>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScenarioMetricChart;
