import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  // Silently handle 404 - no need to log to console
  useEffect(() => {
    // Track 404 for analytics if needed
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-2">404</h1>
        <p className="text-lg text-muted-foreground mb-4">Oops! Página não encontrada</p>
        <a href="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:brightness-110 transition">
          Voltar à Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
