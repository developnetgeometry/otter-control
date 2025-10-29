import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />
      
      <div className="flex flex-col flex-1 w-full">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};
