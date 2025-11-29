import { Link, useLocation } from "wouter";
import { ShieldCheck, HeartHandshake, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logoImage from "@assets/logo_1764395893254.png";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <a className={`text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary font-bold" : "text-muted-foreground"}`}>
          {children}
        </a>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center gap-2 group">
              <img src={logoImage} alt="Rent-A-Buddy" className="h-12 w-auto object-contain" />
            </a>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/buddies">Browse Buddies</NavLink>
            <NavLink href="/policies">Safety & Policies</NavLink>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">Log in</Button>
            </Link>
            <Link href="/register">
              <Button className="font-medium rounded-full px-6 shadow-lg shadow-primary/20">Sign up</Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link href="/" onClick={() => setIsOpen(false)} className="text-lg font-medium">Home</Link>
                  <Link href="/buddies" onClick={() => setIsOpen(false)} className="text-lg font-medium">Browse Buddies</Link>
                  <Link href="/policies" onClick={() => setIsOpen(false)} className="text-lg font-medium">Safety & Policies</Link>
                  <hr className="my-4 border-border" />
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full justify-start">Log in</Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)}>
                    <Button className="w-full justify-start">Sign up</Button>
                  </Link>
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

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/50 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src={logoImage} alt="Rent-A-Buddy" className="h-10 w-auto object-contain" />
              </div>
              <p className="text-muted-foreground max-w-md leading-relaxed">
                A safety-first community for non-romantic companionship. 
                We connect people for events, activities, or just a friendly chat.
              </p>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-4 text-foreground">Platform</h4>
              <ul className="space-y-2">
                <li><Link href="/buddies"><a className="text-muted-foreground hover:text-primary transition-colors">Find a Buddy</a></Link></li>
                <li><Link href="/register"><a className="text-muted-foreground hover:text-primary transition-colors">Become a Buddy</a></Link></li>
                <li><Link href="/login"><a className="text-muted-foreground hover:text-primary transition-colors">Log In</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-heading font-semibold mb-4 text-foreground">Legal & Safety</h4>
              <ul className="space-y-2">
                <li><Link href="/policies"><a className="text-muted-foreground hover:text-primary transition-colors">Safety Protocols</a></Link></li>
                <li><Link href="/policies"><a className="text-muted-foreground hover:text-primary transition-colors">Code of Conduct</a></Link></li>
                <li><Link href="/policies"><a className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
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
