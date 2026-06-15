import {
  AVG_TONS_PER_RELEASE,
  DEFAULT_PROJECT_DEMAND_TONS,
  calcReleaseCount,
} from '../simulation.js';

export function ScenarioSetup({
  strategy,
  ppcLevel,
  projectDemandTons,
  onStrategyChange,
  onPpcChange,
  onProjectDemandChange,
  onBegin,
}) {
  const releaseCount = calcReleaseCount(projectDemandTons);
  const demandValid = projectDemandTons > 0;

  return (
    <div className="screen setup">
      <h1>Scenario Setup</h1>
      <p className="setup__intro">Choose coordination strategy and planning reliability (PPC).</p>

      <section className="setup-section">
        <h2>A. Coordination Strategy</h2>
        <div className="option-grid">
          <label className={`option-card ${strategy === 'push' ? 'option-card--selected' : ''}`}>
            <input
              type="radio"
              name="strategy"
              value="push"
              checked={strategy === 'push'}
              onChange={() => onStrategyChange('push')}
            />
            <span className="option-card__title">Push</span>
            <span className="option-card__desc">
              Early schedule ~2 months ahead drives fabrication
            </span>
          </label>
          <label className={`option-card ${strategy === 'pull' ? 'option-card--selected' : ''}`}>
            <input
              type="radio"
              name="strategy"
              value="pull"
              checked={strategy === 'pull'}
              onChange={() => onStrategyChange('pull')}
            />
            <span className="option-card__title">Pull</span>
            <span className="option-card__desc">
              Look-ahead schedule (3–4 weeks) gates fabrication
            </span>
          </label>
        </div>
      </section>

      <section className="setup-section">
        <h2>B. Contractor Planning Reliability (PPC)</h2>
        <div className="option-grid option-grid--three">
          {[
            { id: 'high', title: 'High PPC', range: '>85%' },
            { id: 'medium', title: 'Medium PPC', range: '60–85%' },
            { id: 'low', title: 'Low PPC', range: '<60%' },
          ].map((opt) => (
            <label
              key={opt.id}
              className={`option-card ${ppcLevel === opt.id ? 'option-card--selected' : ''}`}
            >
              <input
                type="radio"
                name="ppc"
                value={opt.id}
                checked={ppcLevel === opt.id}
                onChange={() => onPpcChange(opt.id)}
              />
              <span className="option-card__title">{opt.title}</span>
              <span className="option-card__desc">{opt.range}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="setup-section">
        <h2>C. Project Demand</h2>
        <div className="demand-input-group">
          <label className="demand-label" htmlFor="project-demand">
            Project Demand (tons)
          </label>
          <input
            id="project-demand"
            type="number"
            className="demand-input"
            min={AVG_TONS_PER_RELEASE}
            step={1}
            value={projectDemandTons}
            onChange={(e) => onProjectDemandChange(Number(e.target.value))}
          />
        </div>
      </section>

      <section className="assumptions-box">
        <h3>Project Assumptions</h3>
        <ul>
          <li>Average truck delivery: {AVG_TONS_PER_RELEASE} tons per truck/release</li>
          <li>Project demand: {demandValid ? projectDemandTons : '—'} tons</li>
          <li>
            <strong>Estimated number of truck deliveries/releases: {demandValid ? releaseCount : '—'}</strong>
          </li>
        </ul>
        {demandValid && projectDemandTons !== DEFAULT_PROJECT_DEMAND_TONS && (
          <p className="assumptions-note">
            Example: {projectDemandTons} ÷ {AVG_TONS_PER_RELEASE} ≈ {releaseCount} releases
          </p>
        )}
      </section>

      <button
        type="button"
        className="btn btn--primary btn--large"
        onClick={onBegin}
        disabled={!demandValid}
      >
        Begin Simulation
      </button>
    </div>
  );
}
