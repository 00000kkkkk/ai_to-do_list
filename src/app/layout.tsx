import { Inter, JetBrains_Mono } from 'next/font/google';
import { Modal } from '../components/Modal';
import { ThemeToggle } from '../components/ThemeToggle';
import { MobileMenuProvider } from '../components/MobileMenuProvider';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata = {
  title: 'AI Todo Lists - Розумний планувальник завдань',
  description: 'Організуйте свої завдання з допомогою штучного інтелекту',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'AI Todo Lists - Розумний планувальник завдань',
    description: 'Організуйте свої завдання з допомогою штучного інтелекту',
    type: 'website',
    locale: 'uk_UA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Todo Lists',
    description: 'Організуйте свої завдання з допомогою штучного інтелекту',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#f8fafc',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="uk" 
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className={`${inter.className} antialiased`}>
        <MobileMenuProvider>
          <div className="min-h-screen relative overflow-hidden" suppressHydrationWarning>
            <div className="absolute inset-0 bg-neutral-50 dark:bg-neutral-100" suppressHydrationWarning></div>
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <div className="relative z-10">
              {children}
            </div>
          </div>
          <Modal />
        </MobileMenuProvider>
      </body>
    </html>
  );
}
