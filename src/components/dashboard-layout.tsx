"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart, FileText, Home, Menu, Settings, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: FileText,
  },
  {
    title: "Vendors",
    href: "/vendors",
    icon: Users,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <div className="flex items-center border-b pb-4">
                  <Link href="/" className="flex items-center gap-2 font-semibold">
                    <FileText className="h-6 w-6" />
                    <span className="text-lg font-bold">InvoiceParser</span>
                  </Link>
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-auto">
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close navigation menu</span>
                      </Button>
                    </SheetTrigger>
                  </Sheet>
                </div>
                <nav className="mt-4 flex flex-col gap-2">
                  {navItems.map((item) => (
                    <MobileNavLink key={item.href} item={item} />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <FileText className="h-6 w-6" />
              <span className="text-lg font-bold hidden md:inline-block">InvoiceParser</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <DesktopNavLink key={item.href} item={item} />
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              Help
            </Button>
            <Button size="sm">Account</Button>
          </div>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <SidebarNavLink key={item.href} item={item} />
            ))}
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}

function MobileNavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isActive = pathname === item.href

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <item.icon className="h-5 w-5" />
      {item.title}
    </Link>
  )
}

function DesktopNavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isActive = pathname === item.href

  return (
    <Link
      href={item.href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        isActive ? "text-primary" : "text-muted-foreground",
      )}
    >
      {item.title}
    </Link>
  )
}

function SidebarNavLink({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const isActive = pathname === item.href

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <item.icon className="h-5 w-5" />
      {item.title}
    </Link>
  )
}
