
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, LogOut, User, Heart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : '';
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
      document.body.style.overflow = '';
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    if (isMobileMenuOpen) {
      document.body.style.overflow = '';
    }
  };

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300 menu-container",
      isScrolled 
        ? "bg-background/95 backdrop-blur-md border-b border-border/60 shadow-lg dark:shadow-2xl" 
        : "bg-background/80 backdrop-blur-sm border-b border-border/30"
    )}>
      <div className="container flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Completely empty left side */}
        <div></div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {user ? (
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3 px-4 py-2 rounded-full bg-primary/5 border border-primary/20">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="font-medium text-foreground text-sm">
                  {profile?.full_name || 'User'}
                </span>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline" 
                size="sm"
                className="text-foreground border-border hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 rounded-full px-4"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <>
              <a 
                href="#" 
                className="text-foreground hover:text-primary transition-all duration-300 font-medium relative group"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTop();
                }}
              >
                Home
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#features" className="text-foreground hover:text-primary transition-all duration-300 font-medium relative group">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a href="#details" className="text-foreground hover:text-primary transition-all duration-300 font-medium relative group">
                Contact
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
              </a>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={toggleMobileMenu}
          className="md:hidden p-2 rounded-full text-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 border border-border/50 hover:border-primary/30"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div className={cn(
        "md:hidden fixed inset-0 z-40 transition-all duration-300",
        isMobileMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
      )}>
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
        <div className={cn(
          "absolute top-16 left-0 right-0 bg-background/95 backdrop-blur-md border-b border-border/60 shadow-lg dark:shadow-2xl transition-all duration-300 menu-container",
          isMobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        )}>
          <nav className="flex flex-col space-y-4 p-6">
            {user ? (
              <>
                <div className="flex items-center space-x-2 text-lg font-medium py-3 px-6 w-full text-center rounded-lg bg-accent">
                  <User className="h-5 w-5" />
                  <span>{profile?.full_name || 'User'}</span>
                  <span className="text-muted-foreground">{profile?.email}</span>
                </div>
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2 py-3 text-lg border-border hover:bg-accent hover:text-accent-foreground"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Button>
              </>
            ) : (
              <>
                <a 
                  href="#" 
                  className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-accent hover:text-accent-foreground nav-item" 
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToTop();
                    setIsMobileMenuOpen(false);
                    document.body.style.overflow = '';
                  }}
                >
                  Home
                </a>
                <a 
                  href="#features" 
                  className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-accent hover:text-accent-foreground nav-item" 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    document.body.style.overflow = '';
                  }}
                >
                  About
                </a>
                <a 
                  href="#details" 
                  className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-accent hover:text-accent-foreground nav-item" 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    document.body.style.overflow = '';
                  }}
                >
                  Contact
                </a>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
