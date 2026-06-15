import { PUSH_STEPS, PULL_STEPS } from '../processSteps.js';
import { SupplierYard } from './SupplierYard.jsx';

export function ProcessSimulation({
  strategy,
  stepIndex,
  lookAheadShared,
  onShareLookAhead,
  onNextStep,
  onFinish,
}) {
  const steps = strategy === 'push' ? PUSH_STEPS : PULL_STEPS;
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  const isLookAheadGate = step?.requiresLookAhead && !lookAheadShared;
  const fabricationBlocked =
    strategy === 'pull' && !lookAheadShared && step?.id === 'fabrication';

  const inventoryTons = strategy === 'push' ? 48 : 17;
  const showYard = step?.flow?.includes('inventory');

  return (
    <div className="screen process">
      <header className="process__header">
        <h1>Process Simulation — {strategy === 'push' ? 'Push' : 'Pull'}</h1>
        <div className="step-progress">
          Step {stepIndex + 1} of {steps.length}: <strong>{step.title}</strong>
        </div>
        <div className="step-dots">
          {steps.map((s, i) => (
            <span
              key={s.id}
              className={`step-dot ${i <= stepIndex ? 'step-dot--active' : ''} ${s.requiresLookAhead && !lookAheadShared && i === stepIndex ? 'step-dot--waiting' : ''}`}
              title={s.title}
            />
          ))}
        </div>
      </header>

      <div className="split-layout">
        {/* Contractor side */}
        <div className="panel panel--contractor">
          <div className="panel__header">
            <span className="panel__icon">🏗️</span>
            <h2>Contractor</h2>
          </div>
          <p className="panel__message">{step.contractor}</p>
          {step.flow === 'schedule' && (
            <div className="doc-badge doc-badge--out animate-slide-right">📋 Delivery Schedule</div>
          )}
          {step.flow === 'confirm' && (
            <div className="doc-badge doc-badge--confirm">✓ Confirmed Delivery Due</div>
          )}
          {step.requiresLookAhead && (
            <button
              type="button"
              className={`btn btn--accent ${lookAheadShared ? 'btn--done' : 'btn--pulse'}`}
              onClick={onShareLookAhead}
              disabled={lookAheadShared}
            >
              {lookAheadShared ? '✓ Look-Ahead Shared' : 'Share Look-Ahead Schedule'}
            </button>
          )}
        </div>

        {/* Center flow */}
        <div className="flow-center">
          <FlowVisual flow={step.flow} strategy={strategy} lookAheadShared={lookAheadShared} />
          {isLookAheadGate && (
            <p className="flow-alert">⚠ Fabrication blocked until look-ahead is shared</p>
          )}
          {fabricationBlocked && step.id === 'fabrication' && (
            <p className="flow-alert">Supplier idle — waiting for look-ahead</p>
          )}
        </div>

        {/* Supplier side */}
        <div className="panel panel--supplier">
          <div className="panel__header">
            <span className="panel__icon">🏭</span>
            <h2>Supplier</h2>
          </div>
          <p className="panel__message">{step.supplier}</p>
          {step.flow === 'drawings-return' && (
            <div className="doc-badge doc-badge--in animate-slide-left">📐 Shop Drawings</div>
          )}
          {step.flow === 'fabrication' && (
            <div className={`fab-line ${fabricationBlocked ? 'fab-line--idle' : 'fab-line--active'}`}>
              <span>{fabricationBlocked ? 'Fabrication idle' : 'Fabricating rebar…'}</span>
            </div>
          )}
          {step.flow === 'deliver' && (
            <div className="truck animate-truck">🚚 Delivering</div>
          )}
          {showYard && (
            <SupplierYard
              tons={inventoryTons}
              variant={step.flow === 'inventory-high' ? 'high' : 'low'}
            />
          )}
        </div>
      </div>

      <div className="process__actions">
        {isLookAheadGate ? (
          <p className="hint">Click &ldquo;Share Look-Ahead Schedule&rdquo; on the Contractor side to continue.</p>
        ) : isLast ? (
          <button type="button" className="btn btn--primary btn--large" onClick={onFinish}>
            Run Monte Carlo & View Results
          </button>
        ) : (
          <button type="button" className="btn btn--primary" onClick={onNextStep}>
            Next Step →
          </button>
        )}
      </div>
    </div>
  );
}

function FlowVisual({ flow, strategy, lookAheadShared }) {
  const arrows = {
    schedule: 'Contractor ———→ Supplier',
    'drawings-return': 'Supplier ———→ Contractor',
    'lookahead-gate': lookAheadShared ? 'Look-Ahead ———→ Supplier ✓' : 'Look-Ahead — - - → Supplier',
    fabrication: strategy === 'pull' && !lookAheadShared ? '⏸ Blocked' : '⚙ Fabrication',
    'inventory-high': '📦 Yard filling (Push)',
    'inventory-low': '📦 Yard modest (Pull)',
    confirm: '✓ Confirmed Due',
    deliver: '🚚 Delivery',
    measure: '📊 Measure deviation',
  };

  return (
    <div className={`flow-visual flow-visual--${flow}`}>
      <div className="flow-visual__arrow">{arrows[flow] || '→'}</div>
    </div>
  );
}
