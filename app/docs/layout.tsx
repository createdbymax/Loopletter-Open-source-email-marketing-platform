import type { ReactNode } from "react";
import { RootProvider } from 'fumadocs-ui/provider';
import { Sidebar } from "@/components/docs/sidebar";
import { Header } from "@/components/docs/header";

export default function RootDocsLayout({ children }: { children: ReactNode }) {
  return (
    <RootProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </RootProvider>
  );
}
