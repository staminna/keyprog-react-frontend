import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Component to handle redirects from hash-based URLs to route-based URLs
 * for backward compatibility
 */
const HashRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const hash = location.hash;
    const pathname = location.pathname;

    // Define hash to route mappings
    const hashToRouteMap: Record<string, string> = {
      '#reprogramacao': '/servicos/reprogramacao',
      '#desbloqueio': '/servicos/desbloqueio',
      '#clonagem': '/servicos/clonagem',
      '#airbag': '/servicos/airbag',
      '#adblue': '/servicos/adblue',
      '#Diagostico': '/servicos/diagnostico', // Note: keeping the typo for backward compatibility
      '#diagnostico': '/servicos/diagnostico',
      '#chaves': '/servicos/chaves',
      '#quadrantes': '/servicos/quadrantes',
      '#contacto': '/contactos', // For suporte#contacto
    };

    // Check if we have a hash that needs redirecting
    if (hash && hashToRouteMap[hash]) {
      const newRoute = hashToRouteMap[hash];
      
      // Special handling for suporte#contacto - redirect to contacts page
      if (pathname === '/suporte' && hash === '#contacto') {
        navigate('/contactos', { replace: true });
        return;
      }
      
      // For servicos hash redirects
      if (pathname === '/servicos' && hash.startsWith('#')) {
        navigate(newRoute, { replace: true });
        return;
      }
    }
  }, [location, navigate]);

  // This component doesn't render anything
  return null;
};

export default HashRedirect;