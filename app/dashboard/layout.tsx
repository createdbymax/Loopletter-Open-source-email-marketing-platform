"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import {
  BarChart3,
  Users,
  Mail,
  Settings,
  Home,
  Zap,
  FileText,
  UserCheck,
  Target,
  Send,
  Link as LinkIcon,
  Globe,
  ChevronsUpDown,
  Check,
  User,
  Palette,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { QueueAutoProcessor } from "@/components/queue-auto-processor";
import { getOrCreateArtistByClerkId } from "@/lib/db";
import type { Artist } from "@/lib/types";
import { ArtistLogo } from "@/components/ui/artist-logo";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ui/theme-toggle";

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
  { href: "/dashboard/team", label: "Team", icon: UserCheck },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const [artist, setArtist] = useState<Artist | null>(null);

  useEffect(() => {
    async function fetchArtist() {
      if (!user) return;
      try {
        const artistData = await getOrCreateArtistByClerkId(
          user.id,
          user.primaryEmailAddress?.emailAddress || "",
          user.fullName || user.username || "Artist"
        );
        setArtist(artistData);
      } catch (error) {
        console.error("Error fetching artist in layout:", error);
      }
    }

    if (isLoaded && user) {
      fetchArtist();
    }
  }, [user, isLoaded]);

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="space-y-2">
              {/* Loopletter Logo */}
              <div className="relative inline-block group cursor-pointer">
                <Image
                  src="/newlogo.svg"
                  alt="Loopletter"
                  width={125}
                  height={32}
                  className="flex-shrink-0 block dark:invert"
                />
                <Send className="absolute -bottom-1 -right-1 w-3 h-3 text-blue-500 opacity-70 transition-all duration-500 ease-in-out group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:rotate-12 group-hover:scale-110" />
              </div>

              {/* Workspace Dropdown */}
              {artist && (
                <div className="pt-1 border-t border-gray-100 dark:border-neutral-700">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-800-colors">
                        <ArtistLogo
                          logoUrl={artist.settings?.logo_url}
                          artistName={artist.name}
                          size="sm"
                          className="flex-shrink-0 dark:invert"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {artist.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Personal workspace
                          </p>
                        </div>
                        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-64"
                      align="start"
                      side="right"
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {artist.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            Personal workspace
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                        <div className="flex items-center gap-3 w-full">
                          <ArtistLogo
                            logoUrl={artist.settings?.logo_url}
                            artistName={artist.name}
                            size="sm"
                            className="flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {artist.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              Personal workspace
                            </p>
                          </div>
                          <Check className="h-4 w-4 text-blue-600" />
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/settings?tab=profile"
                          className="cursor-pointer"
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          href="/dashboard/settings?tab=branding"
                          className="cursor-pointer"
                        >
                          <Palette className="h-4 w-4 mr-2" />
                          Branding
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href));

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.href}>
                          <item.icon />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="p-2 flex items-center justify-between">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-8 h-8",
                  userButtonPopoverCard:
                    "shadow-lg border border-neutral-200 dark:border-neutral-700",
                },
              }}
            />
            <ThemeToggle />
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
          {/* Auto-process queue every 30 seconds when dashboard is active */}
          <QueueAutoProcessor enabled={false} intervalMs={30000} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
