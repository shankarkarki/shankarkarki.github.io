---
layout: post
title: "Building Energy Market Models from Scratch"
subtitle: "From theory to code - implementing shadow price optimization with open-source solvers"
date: 2025-02-01
author: "Shankar Karki"
reading_time: "18 min read"
excerpt: "In the previous article, we explored the mathematical theory behind shadow prices. Now let's build these models from scratch using Python and open-source optimization solvers."
---

In the [previous article](/blog/shadow-prices-demystified/), we explored the mathematical theory behind shadow prices. Now let's build these models from scratch using Python and open-source optimization solvers.

## Setting Up Our Development Environment

First, let's install the required packages:

```bash
pip install pulp pandas numpy matplotlib
```
