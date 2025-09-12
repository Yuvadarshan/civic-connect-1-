export const mockEnhancedSimulation = {
  summary: {
    prevented_damage: 1500000,
    complaints_reduction: 0.4,
    sla_breach_reduction: 0.18,
    budget_utilization: 0.96,
  },
  ranked: [
    {
      asset: "RD-102",
      ward: "W2",
      cost: 900000,
      prevented_damage: 450000,
      rop: 0.5,
      complaints_drop: 0.32,
      risk_drop: 0.41,
      post_fix_eta: 90,
    },
    {
      asset: "DR-12",
      ward: "W4",
      cost: 600000,
      prevented_damage: 360000,
      rop: 0.6,
      complaints_drop: 0.28,
      risk_drop: 0.37,
      post_fix_eta: 120,
    },
    {
      asset: "SL-78",
      ward: "W1",
      cost: 400000,
      prevented_damage: 280000,
      rop: 0.7,
      complaints_drop: 0.15,
      risk_drop: 0.25,
      post_fix_eta: 60,
    },
    {
      asset: "BN-45",
      ward: "W3",
      cost: 200000,
      prevented_damage: 150000,
      rop: 0.75,
      complaints_drop: 0.2,
      risk_drop: 0.3,
      post_fix_eta: 45,
    },
  ],
  sensitivity: [
    {
      asset: "RD-102",
      rank_vs_weight: [
        { w: 0.2, rank: 3 },
        { w: 0.5, rank: 1 },
        { w: 0.8, rank: 1 },
      ],
    },
    {
      asset: "DR-12",
      rank_vs_weight: [
        { w: 0.2, rank: 2 },
        { w: 0.5, rank: 2 },
        { w: 0.8, rank: 3 },
      ],
    },
    {
      asset: "SL-78",
      rank_vs_weight: [
        { w: 0.2, rank: 1 },
        { w: 0.5, rank: 3 },
        { w: 0.8, rank: 2 },
      ],
    },
  ],
}
