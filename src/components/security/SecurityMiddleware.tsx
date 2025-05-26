
import React from "react";
import { useSimpleSecurityMonitoring } from "@/hooks/useSimpleSecurityMonitoring";

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

export const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({ children }) => {
  useSimpleSecurityMonitoring();

  return <>{children}</>;
};
