/**
 * Terminal runner — executes Monte Carlo batch and prints validation report.
 *
 * Usage: npm run simulate
 */

import {
  runAllScenarios,
  PPC_CONFIG,
  PPC_LEVELS,
  TOTAL_RELEASES,
  AVG_TONS_PER_RELEASE,
  TOTAL_DEMAND_TONS,
} from './simulation.js';

const TRIALS = 1000;

const OTD_TARGETS = {
  push: {
    high: [78, 89],
    medium: [65, 80],
    low: [45, 65],
  },
  pull: {
    high: [82, 93],
    medium: [72, 85],
    low: [55, 75],
  },
};

const THRESHOLDS = {
  pushPullRatioMin: 2.5,
  pushPullRatioMax: 3.0,
  inventoryMediumVsHigh: 1.15,
  inventoryLowVsHigh: 1.30,
};

function fmt(n, decimals = 2) {
  return n.toFixed(decimals);
}

function pad(str, width) {
  return String(str).padEnd(width);
}

function printHeader() {
  console.log('');
  console.log('═'.repeat(80));
  console.log('  Rebar Supply Chain Coordination — Phase 0 Monte Carlo Report');
  console.log('═'.repeat(80));
  console.log(
    `  Releases: ${TOTAL_RELEASES}  |  Avg tons/release: ${AVG_TONS_PER_RELEASE}  |  Total project demand: ${TOTAL_DEMAND_TONS} tons`
  );
  console.log(`  Trials per scenario: ${TRIALS}`);
  console.log('');
}

function printScenarioResults(results) {
  console.log('Final Results — by Scenario');
  console.log('─'.repeat(80));

  for (const r of results) {
    const label = `${r.strategy.toUpperCase()} + ${PPC_CONFIG[r.ppcLevel].label}`;
    console.log('');
    console.log(`  ${label}`);
    console.log(`    Total Project Demand (tons)                  ${fmt(r.totalProjectDemandTons, 0)}`);
    console.log(`    Average Inventory in Supplier Yard (tons)    ${fmt(r.avgInventoryInYardTons)}`);
    console.log(`    Maximum Inventory in Supplier Yard (tons)    ${fmt(r.maxInventoryInYardTons)}`);
    console.log(`    Average Schedule Deviation (days)            ${fmt(r.avgScheduleDeviation)}`);
    console.log(`    Average Confirmed Due Deviation (days)       ${fmt(r.avgConfirmedDueDeviation)}`);
    console.log(`    On-Time Delivery (%)                         ${fmt(r.onTimePct, 1)}`);
    console.log(`    Expedite Shipments                           ${fmt(r.expediteShipments, 1)}`);
  }
  console.log('');
}

function printResultsSummaryTable(results) {
  const header =
    pad('Scenario', 22) +
    pad('Avg Yard(t)', 12) +
    pad('Max Yard(t)', 12) +
    pad('Sched Dev', 11) +
    pad('Due Dev', 10) +
    pad('OTD %', 8) +
    pad('Exped', 7);

  console.log('Summary Table');
  console.log('─'.repeat(80));
  console.log(header);
  console.log('─'.repeat(80));

  for (const r of results) {
    const label = `${r.strategy.toUpperCase()} + ${PPC_CONFIG[r.ppcLevel].label}`;
    console.log(
      pad(label, 22) +
        pad(fmt(r.avgInventoryInYardTons), 12) +
        pad(fmt(r.maxInventoryInYardTons), 12) +
        pad(fmt(r.avgScheduleDeviation), 11) +
        pad(fmt(r.avgConfirmedDueDeviation), 10) +
        pad(fmt(r.onTimePct, 1), 8) +
        pad(fmt(r.expediteShipments, 1), 7)
    );
  }
  console.log('');
  console.log('  (All scenarios: Total Project Demand = 340 tons)');
  console.log('');
}

function getByStrategyAndPpc(results, strategy, ppcLevel) {
  return results.find((r) => r.strategy === strategy && r.ppcLevel === ppcLevel);
}

function validatePushPullRatios(ratios) {
  console.log('Validation — Push / Pull yard inventory ratio (target 2.5×–3.0×)');
  console.log('  (Average Inventory in Supplier Yard — Push vs Pull, same PPC)');
  console.log('─'.repeat(80));

  let allPass = true;
  for (const ppcLevel of PPC_LEVELS) {
    const ratio = ratios[ppcLevel];
    const pass =
      ratio >= THRESHOLDS.pushPullRatioMin && ratio <= THRESHOLDS.pushPullRatioMax;
    if (!pass) allPass = false;
    console.log(
      `  ${pass ? '✓' : '✗'} ${PPC_CONFIG[ppcLevel].label}: ${fmt(ratio, 2)}×`
    );
  }
  console.log('');
  return allPass;
}

function validateInventoryByPpc(results) {
  console.log('Validation — PPC yard inventory escalation (Push and Pull)');
  console.log('─'.repeat(80));

  let allPass = true;

  for (const strategy of ['push', 'pull']) {
    const high = getByStrategyAndPpc(results, strategy, 'high');
    const medium = getByStrategyAndPpc(results, strategy, 'medium');
    const low = getByStrategyAndPpc(results, strategy, 'low');

    const mediumRatio = medium.avgInventoryInYardTons / high.avgInventoryInYardTons;
    const lowRatio = low.avgInventoryInYardTons / high.avgInventoryInYardTons;
    const mediumPass = mediumRatio >= THRESHOLDS.inventoryMediumVsHigh;
    const lowPass = lowRatio >= THRESHOLDS.inventoryLowVsHigh;

    if (!mediumPass || !lowPass) allPass = false;

    console.log(`  ${strategy.toUpperCase()}:`);
    console.log(
      `    ${mediumPass ? '✓' : '✗'} Medium vs High: ${fmt(mediumRatio, 2)}×  (≥ ${THRESHOLDS.inventoryMediumVsHigh}×)  [${fmt(high.avgInventoryInYardTons)} → ${fmt(medium.avgInventoryInYardTons)} t]`
    );
    console.log(
      `    ${lowPass ? '✓' : '✗'} Low vs High:    ${fmt(lowRatio, 2)}×  (≥ ${THRESHOLDS.inventoryLowVsHigh}×)  [${fmt(high.avgInventoryInYardTons)} → ${fmt(low.avgInventoryInYardTons)} t]`
    );
  }
  console.log('');
  return allPass;
}

function validateScheduleDeviationTrend(results) {
  console.log('Validation — Schedule deviation trend (Push >> Pull; High < Med < Low)');
  console.log('─'.repeat(80));

  let allPass = true;

  for (const strategy of ['push', 'pull']) {
    const high = getByStrategyAndPpc(results, strategy, 'high');
    const medium = getByStrategyAndPpc(results, strategy, 'medium');
    const low = getByStrategyAndPpc(results, strategy, 'low');

    const increasing =
      high.avgScheduleDeviation < medium.avgScheduleDeviation &&
      medium.avgScheduleDeviation < low.avgScheduleDeviation;

    if (!increasing) allPass = false;

    console.log(
      `  ${increasing ? '✓' : '✗'} ${strategy.toUpperCase()} schedule dev: ${fmt(high.avgScheduleDeviation)} → ${fmt(medium.avgScheduleDeviation)} → ${fmt(low.avgScheduleDeviation)} days`
    );
  }

  const pushHigh = getByStrategyAndPpc(results, 'push', 'high');
  const pullHigh = getByStrategyAndPpc(results, 'pull', 'high');
  const pushGtPull = pushHigh.avgScheduleDeviation > pullHigh.avgScheduleDeviation * 1.5;
  if (!pushGtPull) allPass = false;
  console.log(
    `  ${pushGtPull ? '✓' : '✗'} Push schedule dev (${fmt(pushHigh.avgScheduleDeviation)} d) >> Pull (${fmt(pullHigh.avgScheduleDeviation)} d)`
  );

  console.log('');
  return allPass;
}

function validateConfirmedDueSmaller(results) {
  console.log('Validation — Confirmed due deviation < schedule deviation');
  console.log('─'.repeat(80));

  let allPass = true;
  for (const r of results) {
    const pass = r.avgConfirmedDueDeviation < r.avgScheduleDeviation;
    if (!pass) allPass = false;
    const label = `${r.strategy.toUpperCase()} + ${PPC_CONFIG[r.ppcLevel].label}`;
    console.log(
      `  ${pass ? '✓' : '✗'} ${pad(label, 22)} due ${fmt(r.avgConfirmedDueDeviation)} d  <  sched ${fmt(r.avgScheduleDeviation)} d`
    );
  }
  console.log('');
  return allPass;
}

function validateOtdTargets(results) {
  console.log('Validation — On-Time Delivery vs confirmed due (target ranges)');
  console.log('─'.repeat(80));

  let allPass = true;

  for (const strategy of ['push', 'pull']) {
    for (const ppcLevel of PPC_LEVELS) {
      const r = getByStrategyAndPpc(results, strategy, ppcLevel);
      const [min, max] = OTD_TARGETS[strategy][ppcLevel];
      const pass = r.onTimePct >= min && r.onTimePct <= max;
      if (!pass) allPass = false;
      const label = `${strategy.toUpperCase()} + ${PPC_CONFIG[ppcLevel].label}`;
      console.log(
        `  ${pass ? '✓' : '✗'} ${pad(label, 22)} ${fmt(r.onTimePct, 1)}%  (target ${min}–${max}%)`
      );
    }
  }
  console.log('');
  return allPass;
}

function validateOtdTrend(results) {
  console.log('Validation — On-time delivery trend (High > Medium > Low)');
  console.log('─'.repeat(80));

  let allPass = true;
  for (const strategy of ['push', 'pull']) {
    const subset = PPC_LEVELS.map((level) => getByStrategyAndPpc(results, strategy, level));
    const pass =
      subset[0].onTimePct > subset[1].onTimePct && subset[1].onTimePct > subset[2].onTimePct;
    if (!pass) allPass = false;
    console.log(
      `  ${pass ? '✓' : '✗'} ${strategy.toUpperCase()}: ${fmt(subset[0].onTimePct, 1)}% → ${fmt(subset[1].onTimePct, 1)}% → ${fmt(subset[2].onTimePct, 1)}%`
    );
  }
  console.log('');
  return allPass;
}

function printInventoryRatios(ratios) {
  console.log('Yard Inventory Ratio — Push avg / Pull avg (same PPC level)');
  console.log('─'.repeat(80));
  for (const ppcLevel of PPC_LEVELS) {
    console.log(`  ${PPC_CONFIG[ppcLevel].label}: ${fmt(ratios[ppcLevel], 2)}×`);
  }
  console.log('');
}

function printSummary(checks) {
  const allPass = Object.values(checks).every(Boolean);
  console.log('═'.repeat(80));
  console.log(
    allPass
      ? '  Overall: ALL validation checks PASSED.'
      : '  Overall: Some validation checks FAILED — tune PPC_CONFIG in simulation.js'
  );
  console.log('═'.repeat(80));
  console.log('');
}

// --- Main ---

printHeader();
const { results, ratios } = runAllScenarios(TRIALS);
printScenarioResults(results);
printResultsSummaryTable(results);
printInventoryRatios(ratios);

const checks = {
  pushPullRatio: validatePushPullRatios(ratios),
  inventoryByPpc: validateInventoryByPpc(results),
  scheduleDeviationTrend: validateScheduleDeviationTrend(results),
  confirmedDueSmaller: validateConfirmedDueSmaller(results),
  otdTargets: validateOtdTargets(results),
  otdTrend: validateOtdTrend(results),
};

printSummary(checks);
