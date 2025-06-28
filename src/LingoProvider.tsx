import React from 'react';
import { LingoProvider as LingoProviderBase } from '@lingo.dev/react';

interface LingoProviderProps {
  children: React.ReactNode;
}

export const LingoProvider: React.FC<LingoProviderProps> = ({ children }) => {
  return (
    <LingoProviderBase projectId="safety-aware-circle">
      {children}
    </LingoProviderBase>
  );
};