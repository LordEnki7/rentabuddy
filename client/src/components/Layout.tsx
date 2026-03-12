import { Link, useLocation } from "wouter";
import { ShieldCheck, HeartHandshake, Menu, X, Home, Search, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
const logoImage = "/media/logo.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <span className={`text-sm font-medium transition-colors hover:text-primary cursor-pointer ${isActive ? "text-primary font-bold" : "text-muted-foreground"}`}>
          {children}
        </span>
      </Link>
    );
  };

  const MobileNavItem = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <span className={`flex flex-col items-center justify-center w-full h-full space-y-1 cursor-pointer ${isActive ? "text-primary" : "text-muted-foreground"}`}>
          <Icon className={`h-6 w-6 ${isActive ? "fill-current" : ""}`} />
          <span className="text-[10px] font-medium">{label}</span>
        </span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans pb-16 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-24 md:h-28 flex items-center justify-between">
          <Link href="/">
            <span className="flex items-center gap-2 group cursor-pointer">
              <img src={logoImage} alt="Rent-A-Buddy" className="h-20 md:h-24 w-auto object-contain" />
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/buddies">Browse Buddies</NavLink>
            {user && <NavLink href="/messages">Messages</NavLink>}
            <NavLink href="/policies">Safety & Policies</NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="font-medium">
                    <User className="h-4 w-4 mr-2" />
                    {user.name}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setLocation("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  {user.role === "ADMIN" && (
                    <DropdownMenuItem onClick={() => setLocation("/admin")}>
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="font-medium">Log in</Button>
                </Link>
                <Link href="/register">
                  <Button className="font-medium rounded-full px-6 shadow-lg shadow-primary/20">Sign up</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle (Optional - can keep for full menu access) */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {user ? (
                    <>
                      <div className="px-4 py-2 bg-muted rounded-lg">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start">Dashboard</Button>
                      </Link>
                      <Button variant="outline" className="w-full justify-start" onClick={() => { handleLogout(); setIsOpen(false); }}>
                        <LogOut className="h-4 w-4 mr-2" />
                        Log out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full justify-start">Log in</Button>
                      </Link>
                      <Link href="/register" onClick={() => setIsOpen(false)}>
                        <Button className="w-full justify-start">Sign up</Button>
                      </Link>
                    </>
                  )}
                  <hr className="my-2 border-border" />
                  <Link href="/policies" onClick={() => setIsOpen(false)} className="text-lg font-medium">Safety & Policies</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 h-16 bg-white border-t border-border md:hidden flex items-center justify-around px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <MobileNavItem href="/" icon={Home} label="Home" />
        <MobileNavItem href="/buddies" icon={Search} label="Browse" />
        <MobileNavItem href="/dashboard" icon={User} label="Dashboard" />
        <MobileNavItem href="/policies" icon={ShieldCheck} label="Safety" />
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/50 py-4 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <img src={logoImage} alt="Rent-A-Buddy" className="h-32 w-auto object-contain" />
              </div>
              <p className="text-muted-foreground max-w-md leading-relaxed">
                A safety-first community for non-romantic companionship. 
                We connect people for events, activities, or just a friendly chat.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-4 text-foreground">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/buddies"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Find a Buddy</span></Link></li>
                <li><Link href="/register"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Become a Buddy</span></Link></li>
                <li><Link href="/login"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Log In</span></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-4 text-foreground">Legal & Safety</h4>
              <ul className="space-y-2">
                <li><Link href="/policies"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Safety Protocols</span></Link></li>
                <li><Link href="/policies"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Code of Conduct</span></Link></li>
                <li><Link href="/policies"><span className="text-muted-foreground hover:text-primary transition-colors cursor-pointer">Terms of Service</span></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-2 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-sm text-muted-foreground">© 2025 Rent-A-Buddy. All rights reserved.</p>
            <div className="px-4 py-2 bg-secondary/10 rounded-full border border-secondary/20">
              <p className="text-xs font-medium text-secondary-foreground flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-secondary block"></span>
                Strictly non-romantic, non-escort service.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
