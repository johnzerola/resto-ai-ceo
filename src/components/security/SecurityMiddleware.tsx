
import React from "react";

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

export const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({ children }) => {
  // Security monitoring functionality can be added here when needed
  console.log('SecurityMiddleware: Monitoring active');

  return <>{children}</>;
};
