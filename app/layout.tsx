import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Intranet Coacharte',
  description: 'API para la Intranet de Coacharte',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}