
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    // Prevent background scrolling when menu is open
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
      document.body.style.overflow = '';
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    // Close mobile menu if open
    if (isMenuOpen) {
      setIsMenuOpen(false);
      document.body.style.overflow = '';
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 py-2 sm:py-3 md:py-4 transition-all duration-300",
        isScrolled 
          ? "bg-white/80 backdrop-blur-md shadow-sm" 
          : "bg-transparent"
      )}
    >
      <div className="container flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <a 
          href="#" 
          className="flex items-center space-x-2"
          onClick={(e) => {
            e.preventDefault();
            scrollToTop();
          }}
          aria-label="Nexion"
        >
          <img 
            src="/logo.svg" 
            alt="Nexion Logo"
            className="h-7 sm:h-8" 
          />
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {user ? (
            // Authenticated user navigation
            <>
              <div className="flex items-center space-x-2 text-sm text-gray-700">
                <User className="h-4 w-4" />
                <span className="font-medium">{profile?.full_name}</span>
                <span className="text-gray-500">({profile?.role})</span>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            // Guest navigation
            <>
              <a 
                href="#" 
                className="nav-link"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTop();
                }}
              >
                Home
              </a>
              <a href="#features" className="nav-link">About</a>
              <a href="#details" className="nav-link">Contact</a>
            </>
          )}
        </nav>

        {/* Mobile menu button - increased touch target */}
        <button 
          className="md:hidden text-gray-700 p-3 focus:outline-none" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation - improved for better touch experience */}
      <div className={cn(
        "fixed inset-0 z-40 bg-white flex flex-col pt-16 px-6 md:hidden transition-all duration-300 ease-in-out",
        isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
      )}>
        <nav className="flex flex-col space-y-8 items-center mt-8">
          {user ? (
            // Authenticated user mobile navigation
            <>
              <div className="flex items-center space-x-2 text-lg font-medium py-3 px-6 w-full text-center rounded-lg bg-gray-50">
                <User className="h-5 w-5" />
                <span>{profile?.full_name}</span>
                <span className="text-gray-500">({profile?.role})</span>
              </div>
              <Button 
                onClick={handleLogout}
                variant="outline"
                className="w-full flex items-center justify-center space-x-2 py-3 text-lg border-gray-300 hover:bg-gray-50"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            // Guest mobile navigation
            <>
              <a 
                href="#" 
                className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToTop();
                  setIsMenuOpen(false);
                  document.body.style.overflow = '';
                }}
              >
                Home
              </a>
              <a 
                href="#features" 
                className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" 
                onClick={() => {
                  setIsMenuOpen(false);
                  document.body.style.overflow = '';
                }}
              >
                About
              </a>
              <a 
                href="#details" 
                className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100" 
                onClick={() => {
                  setIsMenuOpen(false);
                  document.body.style.overflow = '';
                }}
              >
                Contact
              </a>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
