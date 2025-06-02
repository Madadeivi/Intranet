// filepath: /Users/madadeivi/Developer/Coacharte/Intranet/client/src/pages/RequestPasswordResetPage.tsx
import React from 'react';
import { RequestPasswordResetForm } from '../components/RequestPasswordResetForm'; // Cambiado a importación nombrada
import './RequestPasswordResetPage.css';

export const RequestPasswordResetPage: React.FC = () => {
  return (
    <div className="request-password-reset-page">
      <RequestPasswordResetForm />
    </div>
  );
};
