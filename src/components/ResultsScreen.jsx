import { PPC_CONFIG } from '../simulation.js';
import { LEARNING_POINTS } from '../processSteps.js';
import { SupplierYard } from './SupplierYard.jsx';

function MetricRow({ label, value, unit = '' }) {
  return (
    <div className="metric-row">
      <span className="metric-row__label">{label}</span>
      <span className="metric-row__value">
        {value}
        {unit && <span className="metric-row__unit"> {unit}</span>}
      </span>
    </div>
  );
}

function ResultsCard({ title, results }) {
  if (!results) return null;
  return (
    <div className="results-card">
      <h3>{title}</h3>
      <MetricRow label="Total Project Demand" value={results.totalProjectDemandTons.toFixed(0)} unit="tons" />
      <MetricRow
        label="Average Inventory in Supplier Yard"
        value={results.avgInventoryInYardTons.toFixed(1)}
        unit="tons"
      />
      <MetricRow
        label="Maximum Inventory in Supplier Yard"
        value={results.maxInventoryInYardTons.toFixed(1)}
        unit="tons"
      />
      <MetricRow
        label="Average Schedule Deviation"
        value={results.avgScheduleDeviation.toFixed(2)}
        unit="days"
      />
      <MetricRow
        label="Average Confirmed Due Deviation"
        value={results.avgConfirmedDueDeviation.toFixed(2)}
        unit="days"
      />
      <MetricRow label="On-Time Delivery" value={results.onTimePct.toFixed(1)} unit="%" />
      <MetricRow label="Expedite Shipments" value={results.expediteShipments.toFixed(1)} />
      <SupplierYard tons={results.avgInventoryInYardTons} maxTons={80} />
    </div>
  );
}

export function ResultsScreen({
  strategy,
  ppcLevel,
  results,
  compareMode,
  compareResults,
  showInventoryExplanation,
  onToggleInventoryExplanation,
  onRunAgain,
  onCompare,
  onBackToWelcome,
}) {
  const ppcLabel = PPC_CONFIG[ppcLevel]?.label ?? ppcLevel;

  let inventoryReduction = null;
  if (compareMode && compareResults?.push && compareResults?.pull) {
    const pushInv = compareResults.push.avgInventoryInYardTons;
    const pullInv = compareResults.pull.avgInventoryInYardTons;
    inventoryReduction = ((pushInv - pullInv) / pushInv) * 100;
  }

  return (
    <div className="screen results">
      <header className="results__header">
        <h1>Simulation Results</h1>
        {!compareMode && (
          <p className="results__meta">
            {strategy.toUpperCase()} · PPC {ppcLabel} · 1,000 Monte Carlo trials
          </p>
        )}
        {compareMode && (
          <p className="results__meta">Push vs Pull comparison · PPC {ppcLabel}</p>
        )}
      </header>

      {compareMode && compareResults ? (
        <>
          <div className="compare-grid">
            <ResultsCard title="Push" results={compareResults.push} />
            <ResultsCard title="Pull" results={compareResults.pull} />
          </div>
          <section className="compare-highlights">
            <h2>Comparison Highlights</h2>
            <ul>
              <li>
                <strong>Inventory reduction (Pull vs Push):</strong>{' '}
                {inventoryReduction?.toFixed(1)}%
              </li>
              <li>
                <strong>Schedule deviation difference:</strong>{' '}
                {(compareResults.push.avgScheduleDeviation -
                  compareResults.pull.avgScheduleDeviation).toFixed(2)}{' '}
                days lower with Pull
              </li>
              <li>
                <strong>OTD difference:</strong>{' '}
                {(compareResults.pull.onTimePct - compareResults.push.onTimePct).toFixed(1)} pp
                (Pull vs Push)
              </li>
              <li>
                <strong>Yard inventory ratio (Push / Pull):</strong>{' '}
                {(
                  compareResults.push.avgInventoryInYardTons /
                  compareResults.pull.avgInventoryInYardTons
                ).toFixed(2)}
                ×
              </li>
            </ul>
            <div className="yard-compare">
              <SupplierYard tons={compareResults.push.avgInventoryInYardTons} label="Push yard" variant="high" />
              <SupplierYard tons={compareResults.pull.avgInventoryInYardTons} label="Pull yard" variant="low" />
            </div>
          </section>
        </>
      ) : (
        <>
          <div className="results-single">
            <ResultsCard
              title={`${strategy === 'push' ? 'Push' : 'Pull'} Results`}
              results={results}
            />
          </div>
        </>
      )}

      {showInventoryExplanation && (
        <section className="explanation-box">
          <h2>Inventory Explanation</h2>
          <p>
            <strong>Push</strong> fabricates from an early schedule (~2 months ahead). When plans
            change, rebar waits in the supplier yard — average inventory is typically{' '}
            <strong>2.5×–3.0× higher</strong> than Pull.
          </p>
          <p>
            <strong>Pull</strong> waits for a 3–4 week look-ahead before fabrication, so less
            speculative rebar accumulates. The yard visually shows about one-third the Push level
            at the same PPC.
          </p>
        </section>
      )}

      <section className="learning-box">
        <h2>Learning Points</h2>
        <ul>
          {LEARNING_POINTS.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </section>

      <div className="results__actions">
        <button type="button" className="btn btn--secondary" onClick={onRunAgain}>
          Run Again
        </button>
        {!compareMode && (
          <button type="button" className="btn btn--secondary" onClick={onCompare}>
            Compare Push vs Pull
          </button>
        )}
        <button type="button" className="btn btn--secondary" onClick={onToggleInventoryExplanation}>
          {showInventoryExplanation ? 'Hide' : 'Show'} Inventory Explanation
        </button>
        <button type="button" className="btn btn--ghost" onClick={onBackToWelcome}>
          Back to Welcome
        </button>
      </div>
    </div>
  );
}
