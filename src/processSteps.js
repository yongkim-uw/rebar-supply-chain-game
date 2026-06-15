/** Process steps shown during the interactive simulation walkthrough */

export const PUSH_STEPS = [
  {
    id: 'schedule',
    title: 'Release Early Delivery Schedule',
    contractor: 'Contractor releases delivery schedule ~1.5–2 months before installation.',
    supplier: 'Supplier receives the early schedule.',
    flow: 'schedule',
  },
  {
    id: 'drawings',
    title: 'Shop Drawings Prepared',
    contractor: 'Contractor reviews returned shop drawings.',
    supplier: 'Supplier prepares shop drawings from the early schedule.',
    flow: 'drawings-return',
  },
  {
    id: 'fabrication',
    title: 'Fabrication Starts (Early Schedule)',
    contractor: 'Contractor waits while supplier fabricates to the early plan.',
    supplier: 'Fabrication begins immediately based on the early schedule.',
    flow: 'fabrication',
  },
  {
    id: 'inventory',
    title: 'Inventory Yard Builds Up',
    contractor: 'Schedule changes may strand rebar at the supplier yard.',
    supplier: 'Finished rebar accumulates in the supplier yard.',
    flow: 'inventory-high',
  },
  {
    id: 'confirm',
    title: 'Confirm Delivery Due',
    contractor: 'Contractor confirms delivery due ~1 week before installation.',
    supplier: 'Supplier aligns shipment to the confirmed due date.',
    flow: 'confirm',
  },
  {
    id: 'deliver',
    title: 'Supplier Delivers Rebar',
    contractor: 'Rebar arrives at the construction site.',
    supplier: 'Truck departs the yard with fabricated rebar.',
    flow: 'deliver',
  },
  {
    id: 'measure',
    title: 'Measure Performance',
    contractor: 'Compare actual delivery vs confirmed due and vs early schedule.',
    supplier: 'Delivery deviation and yard inventory are recorded.',
    flow: 'measure',
  },
];

export const PULL_STEPS = [
  {
    id: 'initial-schedule',
    title: 'Release Initial Delivery Schedule',
    contractor: 'Contractor releases the project delivery schedule.',
    supplier: 'Supplier receives the initial schedule.',
    flow: 'schedule',
  },
  {
    id: 'drawings',
    title: 'Shop Drawings Prepared',
    contractor: 'Contractor reviews shop drawings from the initial schedule.',
    supplier: 'Supplier prepares shop drawings from the initial delivery schedule.',
    flow: 'drawings-return',
  },
  {
    id: 'lookahead',
    title: 'Share Look-Ahead Schedule',
    contractor: 'Contractor shares a 3–4 week look-ahead before fabrication can start.',
    supplier: 'Supplier waits — fabrication is blocked until look-ahead arrives.',
    flow: 'lookahead-gate',
    requiresLookAhead: true,
  },
  {
    id: 'fabrication',
    title: 'Fabrication Starts (After Look-Ahead)',
    contractor: 'Fabrication uses recent look-ahead planning information.',
    supplier: 'Fabrication begins only after look-ahead is shared.',
    flow: 'fabrication',
  },
  {
    id: 'inventory',
    title: 'Lower Inventory Yard',
    contractor: 'Less speculative rebar sits in the yard.',
    supplier: 'Yard inventory stays much lower than Push.',
    flow: 'inventory-low',
  },
  {
    id: 'confirm',
    title: 'Confirm Delivery Due',
    contractor: 'Contractor confirms delivery due ~1 week before installation.',
    supplier: 'Supplier ships to the confirmed due date.',
    flow: 'confirm',
  },
  {
    id: 'deliver',
    title: 'Supplier Delivers Rebar',
    contractor: 'Rebar arrives at the construction site.',
    supplier: 'Truck departs the yard with fabricated rebar.',
    flow: 'deliver',
  },
];

export const LEARNING_POINTS = [
  'Early delivery schedules can create large schedule deviation.',
  'Confirmed delivery due is more reliable because it is set closer to installation.',
  'Push coordination can create large supplier inventory.',
  'Pull coordination with look-ahead planning reduces inventory.',
  'Higher PPC improves information reliability and supply chain performance.',
  'Pull is not magic; poor PPC still hurts performance.',
];
