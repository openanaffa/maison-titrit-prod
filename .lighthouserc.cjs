module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/produit/E2E-LEGACY-001",
        "http://localhost:3000/panier",
        "http://localhost:3000/checkout",
        "http://localhost:3000/makteb/orders",
      ],
      startServerCommand: "cd web && bun run start",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 60000,
    },
    assert: {
      assertions: {
        // Lab CI runs on a 2-vCPU throttled runner — absolute performance
        // scores (category, LCP) are environment-dependent and belong to the
        // field-data release gate (docs/performance-budgets.md). CLS is
        // throttling-independent, so it is the enforced lab gate.
        "categories:performance": ["warn", { minScore: 0.9 }],
        "largest-contentful-paint": ["warn", { minScore: 0.9 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.25 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
