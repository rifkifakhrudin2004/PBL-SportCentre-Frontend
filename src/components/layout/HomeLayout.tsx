import { ReactNode } from 'react';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

interface MainLayoutProps {
  children: ReactNode;
}

export function HomeLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <main className="flex-1 w-full m-0 justify-center items-center pt-0 py-8">{children}</main>
      <Footer />
    </div>
  );
} 