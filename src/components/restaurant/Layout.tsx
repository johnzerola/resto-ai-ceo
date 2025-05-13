
import { Sidebar } from "./Sidebar";
import { AIAssistant } from "./AIAssistant";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:ml-64 p-4 md:p-6 lg:p-8">
        {children}
      </div>
      <AIAssistant />
    </div>
  );
}
