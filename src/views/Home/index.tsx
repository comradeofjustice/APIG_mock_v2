import { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { capabilityRouteMap, resolveCapabilityKey } from '@/views/AiCompliance/capabilityData';

export default function Home() {
  const location = useLocation();

  const targetPath = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('section');
    const key = resolveCapabilityKey(section);
    return capabilityRouteMap[key] ?? capabilityRouteMap['prompt-safety'];
  }, [location.search]);

  return <Navigate replace to={targetPath} />;
}
