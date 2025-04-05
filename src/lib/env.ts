// src/lib/env.ts

// Function to safely get environment variables with fallback to build-time values
export function getEnv(key: string): string {
  // First try window.env (runtime)
  if (window.env && window.env[key] !== undefined) {
    return window.env[key];
  }
  
  // Then try import.meta.env (build time)
  if (import.meta.env[key] !== undefined) {
    return import.meta.env[key];
  }
  
  // Fallback to empty string if not found
  console.warn(`Environment variable ${key} not found`);
  return '';
}

// Add TypeScript type definition (if you're using TypeScript)
declare global {
  interface Window {
    env: Record<string, string>;
  }
}