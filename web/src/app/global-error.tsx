"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fr">
      <meta name="robots" content="noindex" />
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          backgroundColor: "#f4ead5",
          color: "#1c1a17",
          fontFamily:
            "Georgia, 'Times New Roman', 'Noto Sans Tifinagh', system-ui, serif",
        }}
      >
        <style>{`
          button:focus-visible {
            outline: 2px solid #b0532f;
            outline-offset: 2px;
          }
        `}</style>
        <div
          style={{
            textAlign: "center",
            maxWidth: "40rem",
            padding: "2rem 1rem",
          }}
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 100 100"
            fill="none"
            aria-hidden="true"
            style={{ margin: "0 auto 1rem", display: "block", color: "#b0532f" }}
          >
            <rect x="20" y="20" width="60" height="60" stroke="currentColor" strokeWidth="1.5" />
            <rect x="20" y="20" width="60" height="60" stroke="currentColor" strokeWidth="1.5" transform="rotate(45 50 50)" />
            <circle cx="50" cy="50" r="6" fill="currentColor" />
          </svg>
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#1c1a17",
            }}
          >
            Une erreur est survenue
          </h1>
          <p
            style={{
              margin: "1.25rem auto 0",
              maxWidth: "28rem",
              fontSize: "1.1rem",
              lineHeight: 1.6,
              color: "#3a352c",
            }}
          >
            Quelque chose a mal tourné de notre côté. Réessayez dans un
            instant — nos ateliers font toujours preuve de patience.
          </p>
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <button
              type="button"
              onClick={reset}
              style={{
                display: "inline-block",
                marginRight: "0.75rem",
                marginBottom: "0.75rem",
                padding: "0.9rem 1.5rem",
                cursor: "pointer",
                borderRadius: "999px",
                border: "none",
                backgroundColor: "#1c1a17",
                color: "#f4ead5",
                fontFamily: "inherit",
                fontSize: "0.75rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Réessayer
            </button>
            <a
              href="/"
              style={{
                display: "inline-block",
                padding: "0.9rem 1.5rem",
                borderRadius: "999px",
                border: "1px solid #9a6a3a",
                color: "#1c1a17",
                textDecoration: "none",
                fontFamily: "inherit",
                fontSize: "0.75rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Retour à l'accueil
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
