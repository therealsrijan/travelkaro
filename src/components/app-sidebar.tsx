'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarSeparator } from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Home, Briefcase, Users, Wand2, AlertCircle, X } from 'lucide-react';
import { Button } from './ui/button';

const menuItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/my-trips', label: 'My Trips', icon: Briefcase },
  { href: '/coming-soon', label: 'Friends', icon: Users },
  { href: '/coming-soon', label: 'AI Planner', icon: Wand2 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [showIssue, setShowIssue] = useState(true);

  return (
    <Sidebar>
        <SidebarHeader>
            <Logo />
        </SidebarHeader>
        <SidebarContent>
            <SidebarMenu>
                {menuItems.map((item) => (
                    <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname === item.href}
                        >
                            <Link href={item.href}>
                                <item.icon />
                                {item.label}
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarSeparator />
            {showIssue && (
                <div className="p-2">
                    <Button 
                        variant="destructive" 
                        className="w-full justify-between items-center h-auto py-2 px-3"
                        onClick={() => setShowIssue(false)}
                    >
                        <div className="flex items-center gap-2">
                            <div className="bg-destructive-foreground/20 text-destructive-foreground rounded-full p-1">
                               <AlertCircle className="h-4 w-4" />
                            </div>
                            <span className="text-sm">1 Issue</span>
                        </div>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </SidebarFooter>
    </Sidebar>
  );
}
