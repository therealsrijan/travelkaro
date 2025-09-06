import type {Metadata} from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { Toaster } from '@/components/ui/toaster';
import { TripsProvider } from '@/contexts/trips-context';

export const metadata: Metadata = {
  title: 'TravelKaro',
  description: 'Plan your next adventure with TravelKaro, your AI-powered itinerary planner.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <AuthProvider>
          <TripsProvider>
            {children}
            <Toaster />
          </TripsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
