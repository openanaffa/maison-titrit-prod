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
        "categories:performance": ["error", { minScore: 0.9 }],
        "largest-contentful-paint": ["error", { minScore: 0.9 }],
        "cumulative-layout-shift": ["error", { minScore: 0.9 }],
        "interaction-to-next-paint": ["error", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
