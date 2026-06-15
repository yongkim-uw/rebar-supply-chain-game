export function WelcomeScreen({ onStart }) {
  return (
    <div className="screen welcome">
      <div className="welcome__hero">
        <h1>Rebar Supply Chain Coordination Game</h1>
        <p className="subtitle">
          How planning reliability affects supplier inventory and delivery performance
        </p>
      </div>

      <div className="agent-cards">
        <div className="agent-card agent-card--contractor">
          <span className="agent-icon" aria-hidden="true">
            🏗️
          </span>
          <h2>Contractor</h2>
          <p>You plan pours, release schedules, and confirm delivery dates.</p>
        </div>
        <div className="agent-arrow" aria-hidden="true">
          ⇄
        </div>
        <div className="agent-card agent-card--supplier">
          <span className="agent-icon" aria-hidden="true">
            🏭
          </span>
          <h2>Supplier</h2>
          <p>Prepares shop drawings, fabricates rebar, and manages the yard.</p>
        </div>
      </div>

      <button type="button" className="btn btn--primary btn--large" onClick={onStart}>
        Start Game
      </button>
    </div>
  );
}
