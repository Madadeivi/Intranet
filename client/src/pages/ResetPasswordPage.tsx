// filepath: /Users/madadeivi/Developer/Coacharte/Intranet/client/src/pages/ResetPasswordPage.tsx
import React from 'react';
import { ResetPasswordForm } from '../components/ResetPasswordForm'; // Cambiado a importación nombrada
import './ResetPasswordPage.css';

export const ResetPasswordPage: React.FC = () => {
  return (
    <div className="reset-password-page">
      <ResetPasswordForm />
    </div>
  );
};
