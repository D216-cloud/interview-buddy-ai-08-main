import { Link } from "react-router-dom";
import { Brain, LayoutDashboard, MessageSquare, History, User, Settings, LogOut, BookOpen, BarChart3, Lightbulb, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";

const brandName = "Intervu";

const navItems = [
  { title: "Dashboard",       url: "/dashboard",       icon: LayoutDashboard },
  { title: "Quick Interview", url: "/interview/setup",  icon: MessageSquare },
  { title: "Full Interview",  url: "/interview/full",   icon: FileText },
  { title: "Question Bank",   url: "/questions",        icon: BookOpen },
  { title: "Analytics",       url: "/analytics",        icon: BarChart3 },
  { title: "Tips & Guides",   url: "/tips",             icon: Lightbulb },
  { title: "History",         url: "/history",          icon: History },
  { title: "Profile",         url: "/profile",          icon: User },
  { title: "Settings",        url: "/settings",         icon: Settings },
];

function AppSidebar() {
  const { signOut } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col h-full bg-card/95 backdrop-blur">
        <div className="p-4 border-b border-border/70">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <Brain className="h-5 w-5 shrink-0 text-foreground" />
            {!collapsed && <span className="font-bold text-sm tracking-tight text-foreground" style={{ fontFamily: "Space Grotesk, sans-serif" }}>{brandName}</span>}
          </Link>
        </div>
        <SidebarGroup className="flex-1 py-3">
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-secondary/80 rounded-lg" activeClassName="bg-secondary font-medium text-foreground shadow-sm">
                      <item.icon className="h-4 w-4 mr-2.5 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="p-3 border-t border-border/70">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={signOut}>
            <LogOut className="h-4 w-4 mr-2.5 shrink-0" />
            {!collapsed && "Sign out"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-b from-background to-secondary/25">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/70 px-6 bg-card/90 backdrop-blur">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6 md:p-8 overflow-auto flex justify-center">
            <div className="w-full max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
