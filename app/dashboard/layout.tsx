"use client";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { BarChart3, Users, Mail, Settings, Home, Zap, FileText, UserCheck, Target, Send, Link as LinkIcon, Globe, Shield, Bell, TestTube, } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, } from "@/components/ui/sidebar";
import { QueueAutoProcessor } from "@/components/queue-auto-processor";
import type { Artist } from "@/lib/types";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { NotificationProvider } from "@/components/notifications/notification-provider";
const nav = [
    { href: "/dashboard", label: "Overview", icon: Home },
    { href: "/dashboard/campaigns", label: "Campaigns", icon: Mail },
    { href: "/dashboard/fans", label: "Audience", icon: Users },
    { href: "/dashboard/subscription", label: "Fan Signup", icon: LinkIcon },
    { href: "/dashboard/segments", label: "Segments", icon: Target },
    { href: "/dashboard/automations", label: "Automations", icon: Zap },
    { href: "/dashboard/templates", label: "Templates", icon: FileText },
    { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/queue", label: "Email Queue", icon: Send },
    { href: "/dashboard/domain", label: "Domain & Deliverability", icon: Globe },
    { href: "/dashboard/privacy", label: "Privacy Compliance", icon: Shield },
    { href: "/dashboard/team", label: "Team", icon: UserCheck },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];
export default function DashboardLayout({ children }: {
    children: ReactNode;
}) {
    const pathname = usePathname();
    const { user, isLoaded } = useUser();
    const [, setArtist] = useState<Artist | null>(null);
    useEffect(() => {
        async function fetchArtist() {
            if (!user)
                return;
            try {
                const response = await fetch("/api/artist/me");
                if (response.ok) {
                    const artistData = await response.json();
                    setArtist(artistData);
                }
                else {
                    console.error("Failed to fetch artist data:", response.statusText);
                }
            }
            catch (error) {
                console.error("Error fetching artist in layout:", error);
            }
        }
        if (isLoaded && user) {
            fetchArtist();
        }
    }, [user, isLoaded]);
    return (<NotificationProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center justify-between px-2 py-2">
              
              <div className="relative inline-block group cursor-pointer">
                <Image src="/newlogo.svg" alt="Loopletter" width={125} height={32} className="flex-shrink-0 block dark:invert"/>
                <Send className="absolute -bottom-1 -right-1 w-3 h-3 text-blue-500 opacity-70 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-12 group-hover:scale-110"/>
              </div>

              
              <NotificationBell />
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {nav.map((item) => {
            const isActive = pathname === item.href ||
                (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));
            return (<SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>);
        })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <div className="p-2 flex items-center justify-between">
              <UserButton appearance={{
            elements: {
                avatarBox: "w-8 h-8",
                userButtonPopoverCard: "shadow-lg border border-neutral-200 dark:border-neutral-700",
            },
        }}/>
              <ThemeToggle />
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1"/>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4">
            {children}
            
            <QueueAutoProcessor enabled={false} intervalMs={30000}/>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </NotificationProvider>);
}
