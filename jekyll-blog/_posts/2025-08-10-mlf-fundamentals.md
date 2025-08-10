---
layout: post
title: "The Fundamentals of Transmission Loss Pricing"
subtitle: "Why Generators Pay Double the Actual Costs"
date: 2025-01-16
author: "Shankar Karki"
math: true
reading_time: "12 min read"
tags: [MLF, transmission-losses, electricity-markets, fundamentals]
---

## The Problem Every Generator Faces

When you transport electricity across power lines, some energy is lost as heat. This is basic physics. But here's what's not obvious: generators are being charged roughly twice the actual system losses.

## The Official Numbers

The data tells a clear story:

**United States:** The EIA reports transmission and distribution losses at around 7% of total generation, with recent efficiency improvements bringing some regions below 5%.

**Australia:** AEMO states that total network losses are "approximately 10% of the total electricity transported between power stations and market customers."

Yet both pricing systems charge generators based on **marginal losses** rather than these **average losses**.

## Why This Mathematical Difference Matters

{% include chart.html type="merit-order" title="How Loss Pricing Affects Generator Revenue" %}

The relationship is rooted in basic electrical engineering. Power losses increase with the square of current flow (I²R losses). This means the marginal impact of additional generation is always higher than the average loss rate.

Think of it like traffic congestion. The average delay might be 10 minutes, but adding one more car during rush hour might cause 15 minutes of additional delay system-wide.

## Real-World Impact

### In Australia

Solar and wind projects face unpredictable revenue swings year after year as MLFs change. Projects like Broken Hill Solar have seen factors drop from above 1.0 to 0.73 over just a few years.

### In the United States

Wind farms literally pay to generate electricity during high output periods due to negative pricing. The marginal loss calculations exacerbate these extreme pricing events.

## Interactive Analysis

{% include shadow-price-calculator.html
   title="Explore Loss Factor Impact"
   description="Adjust system parameters to see how different conditions affect generator charges vs actual system losses" %}

## The Path Forward

This fundamental gap between marginal and average loss allocation affects investment decisions across both markets. The mathematical optimization theory behind these pricing mechanisms reveals alternative approaches that could maintain efficiency signals while eliminating systematic over-recovery.

Location-specific average loss factors represent one promising solution that works for both static annual (Australia) and dynamic real-time (USA) systems.

## Key Takeaways

- Both US and Australian systems overcharge generators relative to actual losses
- The problem stems from using marginal instead of average loss calculations
- This affects renewable energy investment in both static and dynamic markets
- Mathematical solutions exist that maintain efficiency signals while eliminating over-charging

---

_Data sources: EIA Electric Power Annual, AEMO Loss Factors and Regional Boundaries_

_Next: Mathematical optimization analysis of shadow price formation in electricity markets_
