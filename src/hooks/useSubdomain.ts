import { useState, useEffect } from 'react';

export const useSubdomain = () => {
  const [subdomain, setSubdomain] = useState<string | null>(null);

  useEffect(() => {
    const host = window.location.host;
    const parts = host.split('.');

    // Logic for localhost handled differently
    // Case 1: localhost:5173 -> no subdomain (development)
    // Case 2: teacher.localhost:5173 -> teacher (development)
    // Case 3: app.edrak.com -> app
    // Case 4: www.edrak.com -> www (or null)
    
    // We assume 2 parts for main domain (edrak.com) or 1 part for localhost
    const isLocalhost = parts.includes('localhost');
    const mainDomainParts = isLocalhost ? 1 : 2; // localhost vs edrak.com

    if (parts.length > mainDomainParts) {
        // We have a subdomain
        const sub = parts[0];
        if (sub === 'www') {
            setSubdomain(null);
        } else {
            setSubdomain(sub);
        }
    } else {
        setSubdomain(null);
    }
  }, []);

  return subdomain;
};
