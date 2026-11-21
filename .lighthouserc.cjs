module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/produit/[ref]",
        "http://localhost:3000/panier",
        "http://localhost:3000/checkout",
        "http://localhost:3000/makteb/orders",
      ],
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "LCP": ["error", { minScore: 0.9 }],
        "CLS": ["error", { minScore: 0.9 }],
        "INP": ["error", { minScore: 0.9 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
