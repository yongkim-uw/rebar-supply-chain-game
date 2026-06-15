import { useEffect, useState, useRef } from 'react';
import { runMonteCarlo, PPC_CONFIG } from '../simulation.js';
import { SupplierYard } from './SupplierYard.jsx';

const ANIMATION_MS = 2600;
const TRIALS = 1000;

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3;
}

function lerp(from, to, t) {
  return from + (to - from) * t;
}

function AnimatedMetric({ label, value, unit, decimals = 1 }) {
  return (
    <div className="metric-row">
      <span className="metric-row__label">{label}</span>
      <span className="metric-row__value">
        {value.toFixed(decimals)}
        {unit && <span className="metric-row__unit"> {unit}</span>}
      </span>
    </div>
  );
}

/**
 * Runs Monte Carlo, then animates metrics counting up over ~2.5s
 * before handing final results to the results screen.
 */
export function ResultsAnimation({
  strategy,
  ppcLevel,
  projectDemandTons,
  simSeed,
  onComplete,
}) {
  const finalRef = useRef(null);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const [progress, setProgress] = useState(0);
  const [display, setDisplay] = useState({
    avgInventoryInYardTons: 0,
    maxInventoryInYardTons: 0,
    avgScheduleDeviation: 0,
    avgConfirmedDueDeviation: 0,
    onTimePct: 0,
    expediteShipments: 0,
  });

  useEffect(() => {
    const final = runMonteCarlo(strategy, ppcLevel, TRIALS, simSeed, projectDemandTons);
    finalRef.current = final;

    const start = performance.now();
    let frameId;

    function tick(now) {
      const raw = Math.min(1, (now - start) / ANIMATION_MS);
      const t = easeOutCubic(raw);
      setProgress(raw);

      setDisplay({
        avgInventoryInYardTons: lerp(0, final.avgInventoryInYardTons, t),
        maxInventoryInYardTons: lerp(0, final.maxInventoryInYardTons, t),
        avgScheduleDeviation: lerp(0, final.avgScheduleDeviation, t),
        avgConfirmedDueDeviation: lerp(0, final.avgConfirmedDueDeviation, t),
        onTimePct: lerp(0, final.onTimePct, t),
        expediteShipments: lerp(0, final.expediteShipments, t),
      });

      if (raw < 1) {
        frameId = requestAnimationFrame(tick);
      } else if (!completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current(final);
      }
    }

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [strategy, ppcLevel, projectDemandTons, simSeed]);

  const ppcLabel = PPC_CONFIG[ppcLevel]?.label ?? ppcLevel;
  const yardMax = Math.max(60, (finalRef.current?.maxInventoryInYardTons ?? 80) * 1.15);

  return (
    <div className="screen results-animation">
      <header className="results-animation__header">
        <h1>Running Simulation…</h1>
        <p className="results-animation__meta">
          {strategy.toUpperCase()} · PPC {ppcLabel} · {projectDemandTons} tons
        </p>
      </header>

      <div className="progress-block">
        <p className="progress-block__label">Running 1,000 Monte Carlo trials…</p>
        <div className="progress-bar">
          <div className="progress-bar__fill" style={{ width: `${progress * 100}%` }} />
        </div>
        <p className="progress-block__pct">{Math.round(progress * 100)}%</p>
      </div>

      <div className="results-animation__body">
        <div className="results-card results-card--animating">
          <h3>Live Results</h3>
          <AnimatedMetric
            label="Average Inventory in Supplier Yard"
            value={display.avgInventoryInYardTons}
            unit="tons"
          />
          <AnimatedMetric
            label="Maximum Inventory in Supplier Yard"
            value={display.maxInventoryInYardTons}
            unit="tons"
          />
          <AnimatedMetric
            label="Average Schedule Deviation"
            value={display.avgScheduleDeviation}
            unit="days"
            decimals={2}
          />
          <AnimatedMetric
            label="Average Confirmed Due Deviation"
            value={display.avgConfirmedDueDeviation}
            unit="days"
            decimals={2}
          />
          <AnimatedMetric
            label="On-Time Delivery"
            value={display.onTimePct}
            unit="%"
          />
          <AnimatedMetric
            label="Expedite Shipments"
            value={display.expediteShipments}
            decimals={1}
          />
        </div>

        <div className="results-animation__yard">
          <SupplierYard
            tons={display.avgInventoryInYardTons}
            label="Supplier yard (growing)"
            maxTons={yardMax}
            variant={strategy === 'push' ? 'high' : 'low'}
          />
          {strategy === 'push' && (
            <p className="yard-hint">Push yards typically grow much larger than Pull</p>
          )}
        </div>
      </div>
    </div>
  );
}
