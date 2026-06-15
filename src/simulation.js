/**
 * Rebar Supply Chain Coordination — Phase 0 simulation kernel
 *
 * Two deviation concepts:
 *   Schedule Deviation      = actual delivery − early schedule delivery date
 *   Confirmed Due Deviation = actual delivery − confirmed delivery due date
 *
 * Push early schedule (~1.5–2 months old) freezes planned install → schedule
 * deviation stays meaningful even at High PPC. Pull look-ahead (3–4 weeks) is
 * fresher → lower schedule deviation.
 *
 * Confirmed due (~1 week before install) tracks actual install → confirmed
 * deviation reflects supplier execution vs firm commitment only (much smaller).
 * Production mismatch and fab constraints affect physical delivery (schedule
 * deviation + inventory) but not confirmed-due deviation.
 */

export const AVG_TONS_PER_RELEASE = 8.5;
export const DEFAULT_PROJECT_DEMAND_TONS = 340;

/** @deprecated Use DEFAULT_PROJECT_DEMAND_TONS — kept for CLI runner */
export const TOTAL_DEMAND_TONS = DEFAULT_PROJECT_DEMAND_TONS;

/** Release count at default demand (CLI / backward compat) */
export const TOTAL_RELEASES = calcReleaseCount(DEFAULT_PROJECT_DEMAND_TONS);

/** Round project demand ÷ 8.5 tons/truck to nearest whole release count */
export function calcReleaseCount(projectDemandTons) {
  return Math.max(1, Math.round(projectDemandTons / AVG_TONS_PER_RELEASE));
}

export const STRATEGIES = ['push', 'pull'];
export const PPC_LEVELS = ['high', 'medium', 'low'];

/**
 * PPC profile — install slip drives schedule deviation; confirmed-due noise is
 * tight. Inventory instability params unchanged from prior calibration.
 */
export const PPC_CONFIG = {
  high: {
    label: 'High (>85%)',
    ppc: 0.9,
    // Full install slip (Push: early schedule misses this)
    installSlipSigma: 9,
    installSlipMean: 0,
    // Residual slip after look-ahead refresh (Pull only)
    pullLookaheadSlipSigma: 2.5,
    pullLookaheadSlipFraction: 0.7,
    // Confirmed-due noise: negative mean → high OTD; Pull offset lower → higher Pull OTD
    confirmedDueMean: -0.62,
    confirmedDueSigma: 0.58,
    confirmedDueMin: -2.5,
    confirmedDueMax: 1.0,
    pushConfirmedDueFactor: 1.05,
    pullConfirmedDueFactor: 0.88,
    pushOtdMeanOffset: 0.10,
    pullOtdMeanOffset: -0.14,
    productionMismatchProb: 0.05,
    productionMismatchDaysMean: 1,
    productionMismatchDaysSigma: 0.5,
    extraFabricationLeadDays: 0,
    expediteThresholdDays: 5,
    expediteProbBoost: 0,
  },
  medium: {
    label: 'Medium (60–85%)',
    ppc: 0.75,
    installSlipSigma: 18,
    installSlipMean: 1,
    pullLookaheadSlipSigma: 5,
    pullLookaheadSlipFraction: 0.65,
    confirmedDueMean: -0.90,
    confirmedDueSigma: 1.72,
    confirmedDueMin: -4,
    confirmedDueMax: 4.5,
    pushConfirmedDueFactor: 1.08,
    pullConfirmedDueFactor: 0.88,
    pushOtdMeanOffset: 0.18,
    pullOtdMeanOffset: -0.22,
    productionMismatchProb: 0.36,
    productionMismatchDaysMean: 7,
    productionMismatchDaysSigma: 3,
    extraFabricationLeadDays: 8,
    expediteThresholdDays: 3,
    expediteProbBoost: 0.05,
    expediteRecoveryDays: 2.5,
  },
  low: {
    label: 'Low (<60%)',
    ppc: 0.5,
    installSlipSigma: 28,
    installSlipMean: 3,
    pullLookaheadSlipSigma: 10,
    pullLookaheadSlipFraction: 0.6,
    confirmedDueMean: -0.18,
    confirmedDueSigma: 2.55,
    confirmedDueMin: -3,
    confirmedDueMax: 5.5,
    pushConfirmedDueFactor: 1.08,
    pullConfirmedDueFactor: 0.85,
    pushOtdMeanOffset: 0.28,
    pullOtdMeanOffset: -0.35,
    productionMismatchProb: 0.55,
    productionMismatchDaysMean: 16,
    productionMismatchDaysSigma: 5,
    extraFabricationLeadDays: 21,
    expediteThresholdDays: 6,
    expediteProbBoost: 0.01,
    expediteRecoveryDays: 2,
  },
};

const TIMING = {
  pushScheduleLeadDays: 58,
  pullLookAheadDays: 26,
  fabricationDays: 5,
  confirmLeadDays: 7,
  daysBetweenReleases: 7,
  expediteRecoveryDays: 4, // default; per-PPC override via ppc.expediteRecoveryDays
};

export function createRng(seed = Date.now()) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function normalRandom(rng, mean, sigma) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  const standard = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  return mean + sigma * standard;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function meanAbsolute(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + Math.abs(v), 0) / values.length;
}

/**
 * Simulate one release.
 *
 * Timeline:
 *   Push — early schedule delivery date frozen at (planned install − 7 days)
 *          when schedule was issued ~2 months earlier.
 *   Pull — look-ahead delivery date uses fresher install estimate (~3–4 weeks).
 *   Confirmed due = actual install − 7 days (updated ~1 week before install).
 *   Confirmed due deviation = coordination delivery − confirmed due (supplier noise only)
 *   Schedule deviation      = physical delivery − early schedule delivery date
 */
function simulateRelease(releaseIndex, strategy, ppcKey, rng) {
  const ppc = PPC_CONFIG[ppcKey];
  const tons = AVG_TONS_PER_RELEASE;
  const plannedInstallDay = releaseIndex * TIMING.daysBetweenReleases;

  // How much actual install slipped from original plan (PPC-driven)
  const installSlip = normalRandom(rng, ppc.installSlipMean, ppc.installSlipSigma);
  const actualInstallDay = plannedInstallDay + installSlip;

  // --- Early schedule delivery date (frozen at schedule issue time) ---
  let earlyScheduleDeliveryDay;
  if (strategy === 'push') {
    // Push: early schedule tied to original planned install (~1.5–2 months stale)
    earlyScheduleDeliveryDay = plannedInstallDay - TIMING.confirmLeadDays;
  } else {
    // Pull: look-ahead captures partial knowledge of eventual install slip
    const observedSlip =
      installSlip * ppc.pullLookaheadSlipFraction +
      normalRandom(rng, 0, ppc.pullLookaheadSlipSigma);
    earlyScheduleDeliveryDay =
      plannedInstallDay + observedSlip - TIMING.confirmLeadDays;
  }

  // Confirmed delivery due (~1 week before actual installation)
  const confirmedDueDay = actualInstallDay - TIMING.confirmLeadDays;

  // --- Fabrication / inventory (unchanged logic) ---
  const invScale =
    strategy === 'push'
      ? { mismatch: 1.0, extraFab: 1.0 }
      : { mismatch: 0.18, extraFab: 0.2 };

  const fabLead =
    strategy === 'push'
      ? TIMING.pushScheduleLeadDays + ppc.extraFabricationLeadDays * invScale.extraFab
      : TIMING.pullLookAheadDays + ppc.extraFabricationLeadDays * invScale.extraFab;

  const fabricationCompleteDay =
    plannedInstallDay - fabLead + TIMING.fabricationDays;

  // Supplier delivery noise relative to confirmed due (tight; Push > Pull at same PPC)
  const dueFactor =
    strategy === 'push' ? ppc.pushConfirmedDueFactor : ppc.pullConfirmedDueFactor;
  const otdOffset =
    strategy === 'push'
      ? (ppc.pushOtdMeanOffset ?? 0)
      : (ppc.pullOtdMeanOffset ?? 0);

  let confirmedDueNoise = clamp(
    normalRandom(
      rng,
      ppc.confirmedDueMean * dueFactor + otdOffset,
      ppc.confirmedDueSigma * dueFactor
    ),
    ppc.confirmedDueMin,
    ppc.confirmedDueMax
  );

  let expedited = false;
  if (
    confirmedDueNoise > ppc.expediteThresholdDays ||
    (confirmedDueNoise > 0 && rng() < ppc.expediteProbBoost)
  ) {
    expedited = true;
    confirmedDueNoise -= ppc.expediteRecoveryDays ?? TIMING.expediteRecoveryDays;
  }

  // Coordination delivery — supplier performance vs confirmed due (~1 week firm)
  const coordinationDeliveryDay = confirmedDueDay + confirmedDueNoise;

  // Physical delivery — includes yard holding / fab readiness (inventory + schedule dev)
  let physicalDeliveryDay = coordinationDeliveryDay;

  if (rng() < ppc.productionMismatchProb * invScale.mismatch) {
    physicalDeliveryDay += Math.max(
      0,
      normalRandom(rng, ppc.productionMismatchDaysMean, ppc.productionMismatchDaysSigma)
    );
  }

  physicalDeliveryDay = Math.max(physicalDeliveryDay, fabricationCompleteDay);

  const scheduleDeviation = physicalDeliveryDay - earlyScheduleDeliveryDay;
  const confirmedDueDeviation = coordinationDeliveryDay - confirmedDueDay;

  // OTD: measured against confirmed delivery due only (not early schedule)
  const onTime = confirmedDueDeviation <= 0;

  return {
    tons,
    fabricationCompleteDay,
    deliveryDay: physicalDeliveryDay,
    earlyScheduleDeliveryDay,
    confirmedDueDay,
    scheduleDeviation,
    confirmedDueDeviation,
    onTime,
    expedited,
  };
}

/**
 * Compute average and maximum inventory in the supplier yard (tons).
 * Uses time-weighted average across the active project span.
 */
function computeInventoryMetrics(releases) {
  if (releases.length === 0) {
    return { averageInventory: 0, maxInventory: 0 };
  }

  const events = [];
  for (const r of releases) {
    events.push({ day: r.fabricationCompleteDay, delta: r.tons });
    events.push({ day: r.deliveryDay, delta: -r.tons });
  }
  events.sort((a, b) => a.day - b.day || a.delta - b.delta);

  let currentInventory = 0;
  let maxInventory = 0;
  let weightedInventorySum = 0;
  let previousDay = events[0].day;

  for (const event of events) {
    const duration = event.day - previousDay;
    if (duration > 0) {
      weightedInventorySum += currentInventory * duration;
    }
    currentInventory += event.delta;
    maxInventory = Math.max(maxInventory, currentInventory);
    previousDay = event.day;
  }

  const lastDay = releases.reduce((max, r) => Math.max(max, r.deliveryDay), 0);
  const firstDay = releases.reduce(
    (min, r) => Math.min(min, r.fabricationCompleteDay),
    Infinity
  );
  const projectSpan = Math.max(lastDay - firstDay, 1);

  return {
    averageInventory: weightedInventorySum / projectSpan,
    maxInventory,
  };
}

export function runTrial(strategy, ppcLevel, rng, projectDemandTons = DEFAULT_PROJECT_DEMAND_TONS) {
  const releaseCount = calcReleaseCount(projectDemandTons);
  const releases = [];
  for (let i = 0; i < releaseCount; i++) {
    releases.push(simulateRelease(i, strategy, ppcLevel, rng));
  }

  const { averageInventory, maxInventory } = computeInventoryMetrics(releases);

  return {
    totalProjectDemandTons: projectDemandTons,
    releaseCount,
    avgInventoryInYardTons: averageInventory,
    maxInventoryInYardTons: maxInventory,
    avgScheduleDeviation: meanAbsolute(releases.map((r) => r.scheduleDeviation)),
    avgConfirmedDueDeviation: meanAbsolute(
      releases.map((r) => r.confirmedDueDeviation)
    ),
    onTimePct:
      (releases.filter((r) => r.onTime).length / releaseCount) * 100,
    expediteShipments: releases.filter((r) => r.expedited).length,
  };
}

export function runMonteCarlo(
  strategy,
  ppcLevel,
  trialCount,
  seed,
  projectDemandTons = DEFAULT_PROJECT_DEMAND_TONS
) {
  const rng = createRng(seed);
  const totals = {
    avgInventoryInYardTons: 0,
    maxInventoryInYardTons: 0,
    avgScheduleDeviation: 0,
    avgConfirmedDueDeviation: 0,
    onTimePct: 0,
    expediteShipments: 0,
  };

  for (let t = 0; t < trialCount; t++) {
    const result = runTrial(strategy, ppcLevel, rng, projectDemandTons);
    totals.avgInventoryInYardTons += result.avgInventoryInYardTons;
    totals.maxInventoryInYardTons += result.maxInventoryInYardTons;
    totals.avgScheduleDeviation += result.avgScheduleDeviation;
    totals.avgConfirmedDueDeviation += result.avgConfirmedDueDeviation;
    totals.onTimePct += result.onTimePct;
    totals.expediteShipments += result.expediteShipments;
  }

  return {
    strategy,
    ppcLevel,
    trials: trialCount,
    totalProjectDemandTons: projectDemandTons,
    releaseCount: calcReleaseCount(projectDemandTons),
    avgInventoryInYardTons: totals.avgInventoryInYardTons / trialCount,
    maxInventoryInYardTons: totals.maxInventoryInYardTons / trialCount,
    avgScheduleDeviation: totals.avgScheduleDeviation / trialCount,
    avgConfirmedDueDeviation: totals.avgConfirmedDueDeviation / trialCount,
    onTimePct: totals.onTimePct / trialCount,
    expediteShipments: totals.expediteShipments / trialCount,
  };
}

export function runAllScenarios(trialCount = 1000, baseSeed = 42) {
  const results = [];

  for (const ppcLevel of PPC_LEVELS) {
    for (const strategy of STRATEGIES) {
      const seed =
        baseSeed + STRATEGIES.indexOf(strategy) * 100 + PPC_LEVELS.indexOf(ppcLevel);
      results.push(runMonteCarlo(strategy, ppcLevel, trialCount, seed));
    }
  }

  const ratios = {};
  for (const ppcLevel of PPC_LEVELS) {
    const push = results.find((r) => r.strategy === 'push' && r.ppcLevel === ppcLevel);
    const pull = results.find((r) => r.strategy === 'pull' && r.ppcLevel === ppcLevel);
    ratios[ppcLevel] = push.avgInventoryInYardTons / pull.avgInventoryInYardTons;
  }

  return { results, ratios };
}
