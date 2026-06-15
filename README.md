# Rebar Supply Chain Coordination Game

An educational simulation game designed to teach the impact of planning reliability and supply chain coordination on construction material deliveries.

Developed for Lean Construction and Supply Chain Management education.

Created by Kim Consulting, Inc.

---

## Purpose

This simulation demonstrates how different coordination strategies influence:

- Supplier Inventory
- Delivery Deviation
- On-Time Delivery (OTD)
- Expedited Shipments
- Supply Chain Performance

The game focuses on rebar supply coordination between a Contractor and a Supplier.

---

## Learning Objectives

Students will learn:

1. Differences between Push and Pull coordination systems
2. How planning reliability (PPC) influences supply chain performance
3. Why look-ahead planning reduces supplier inventory
4. The relationship between schedule deviation and delivery performance
5. How unreliable plans create waste throughout the supply chain

---

## Game Structure

### Agent 1: Contractor (Player)

The Contractor:

- Releases delivery schedules
- Chooses Push or Pull coordination
- Determines PPC level
- Shares look-ahead schedules (Pull only)
- Confirms delivery due dates

### Agent 2: Supplier

The Supplier:

- Prepares shop drawings
- Fabricates rebar
- Manages inventory
- Delivers material

---

## Scenarios

### Push Coordination

- Fabrication starts based on an early delivery schedule.
- Supplier inventory accumulates.
- Schedule changes create excess inventory.

### Pull Coordination

- Fabrication is triggered by a look-ahead schedule.
- Supplier inventory remains low.
- Better alignment with installation needs.

---

## PPC Levels

Three planning reliability levels are available:

| PPC Level | Description |
|------------|-------------|
| High | > 85% |
| Medium | 60% - 85% |
| Low | < 60% |

---

## Simulation Outputs

The game reports:

- Total Project Demand (tons)
- Average Inventory in Supplier Yard (tons)
- Maximum Inventory in Supplier Yard (tons)
- Average Schedule Deviation (days)
- Average Confirmed Due Deviation (days)
- On-Time Delivery (%)
- Expedited Shipments

---

## Monte Carlo Simulation

Results are generated using 1,000 simulation trials.

Random variability is applied to:

- Planning reliability
- Schedule changes
- Supplier performance
- Fabrication delays
- Delivery variability

---

## Technology

Built using:

- React
- Vite
- JavaScript
- Monte Carlo Simulation

No backend services required.

---

## Educational Use

This application was developed for classroom demonstrations, Lean Construction education, and supply chain management training.

---

## Author

Yong-Woo Kim, Ph.D.

Professor

Department of Construction Management

University of Washington

Kim Consulting, Inc.
