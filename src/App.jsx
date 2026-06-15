import { useState, useCallback } from 'react';
import { runMonteCarlo, DEFAULT_PROJECT_DEMAND_TONS } from './simulation.js';
import { WelcomeScreen } from './components/WelcomeScreen.jsx';
import { ScenarioSetup } from './components/ScenarioSetup.jsx';
import { ProcessSimulation } from './components/ProcessSimulation.jsx';
import { ResultsAnimation } from './components/ResultsAnimation.jsx';
import { ResultsScreen } from './components/ResultsScreen.jsx';

const SIM_SEED = 42;
const TRIALS = 1000;

export default function App() {
  const [screen, setScreen] = useState('welcome');
  const [strategy, setStrategy] = useState('push');
  const [ppcLevel, setPpcLevel] = useState('high');
  const [projectDemandTons, setProjectDemandTons] = useState(DEFAULT_PROJECT_DEMAND_TONS);
  const [stepIndex, setStepIndex] = useState(0);
  const [lookAheadShared, setLookAheadShared] = useState(false);
  const [results, setResults] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareResults, setCompareResults] = useState(null);
  const [showInventoryExplanation, setShowInventoryExplanation] = useState(false);

  const resetProcess = useCallback(() => {
    setStepIndex(0);
    setLookAheadShared(false);
  }, []);

  const runSimulation = useCallback(
    (strat, ppc) => {
      const seed = SIM_SEED + (strat === 'push' ? 0 : 100) + ['high', 'medium', 'low'].indexOf(ppc);
      return runMonteCarlo(strat, ppc, TRIALS, seed, projectDemandTons);
    },
    [projectDemandTons]
  );

  const handleProjectDemandChange = (value) => {
    if (Number.isNaN(value)) return;
    setProjectDemandTons(value);
  };

  const handleBegin = () => {
    resetProcess();
    setScreen('process');
  };

  const handleShareLookAhead = () => {
    setLookAheadShared(true);
  };

  const handleNextStep = () => {
    setStepIndex((i) => i + 1);
  };

  const handleFinishProcess = () => {
    setCompareMode(false);
    setCompareResults(null);
    setScreen('animating');
  };

  const handleAnimationComplete = useCallback((simResults) => {
    setResults(simResults);
    setScreen('results');
  }, []);

  const handleCompare = () => {
    const push = runSimulation('push', ppcLevel);
    const pull = runSimulation('pull', ppcLevel);
    setCompareResults({ push, pull });
    setCompareMode(true);
  };

  const handleRunAgain = () => {
    resetProcess();
    setResults(null);
    setCompareMode(false);
    setCompareResults(null);
    setShowInventoryExplanation(false);
    setScreen('setup');
  };

  const handleBackToWelcome = () => {
    resetProcess();
    setResults(null);
    setCompareMode(false);
    setCompareResults(null);
    setShowInventoryExplanation(false);
    setScreen('welcome');
  };

  const simSeed =
    SIM_SEED + (strategy === 'push' ? 0 : 100) + ['high', 'medium', 'low'].indexOf(ppcLevel);

  return (
    <div className="app">
      <header className="app-bar">
        <span className="app-bar__logo">⬡ Rebar Supply Chain</span>
        <div className="app-bar__right">
          {screen !== 'welcome' && (
            <span className="app-bar__badge">
              {strategy === 'push' ? 'Push' : 'Pull'} · PPC {ppcLevel}
            </span>
          )}
          <span className="app-bar__credit">Kim Consulting</span>
        </div>
      </header>

      <main className="app-main">
        {screen === 'welcome' && <WelcomeScreen onStart={() => setScreen('setup')} />}

        {screen === 'setup' && (
          <ScenarioSetup
            strategy={strategy}
            ppcLevel={ppcLevel}
            projectDemandTons={projectDemandTons}
            onStrategyChange={setStrategy}
            onPpcChange={setPpcLevel}
            onProjectDemandChange={handleProjectDemandChange}
            onBegin={handleBegin}
          />
        )}

        {screen === 'process' && (
          <ProcessSimulation
            strategy={strategy}
            stepIndex={stepIndex}
            lookAheadShared={lookAheadShared}
            onShareLookAhead={handleShareLookAhead}
            onNextStep={handleNextStep}
            onFinish={handleFinishProcess}
          />
        )}

        {screen === 'animating' && (
          <ResultsAnimation
            strategy={strategy}
            ppcLevel={ppcLevel}
            projectDemandTons={projectDemandTons}
            simSeed={simSeed}
            onComplete={handleAnimationComplete}
          />
        )}

        {screen === 'results' && (
          <ResultsScreen
            strategy={strategy}
            ppcLevel={ppcLevel}
            results={results}
            compareMode={compareMode}
            compareResults={compareResults}
            showInventoryExplanation={showInventoryExplanation}
            onToggleInventoryExplanation={() => setShowInventoryExplanation((v) => !v)}
            onRunAgain={handleRunAgain}
            onCompare={handleCompare}
            onBackToWelcome={handleBackToWelcome}
          />
        )}
      </main>
    </div>
  );
}
