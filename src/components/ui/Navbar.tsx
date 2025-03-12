import { useState, useContext, useEffect } from "react";
import { NavLink, useNavigate } from "react-router";
import ThemeSwitch from "./ThemeSwitch";
import { AuthContext } from "@/contexts";
import { IoMdClose } from "react-icons/io";
import { CiUser } from "react-icons/ci";
import {
  Calendar,
  FileText,
  Menu,
  User,
  Home,
  Map,
  Building2,
  LogOut,
  ChevronDown,
  Settings,
  Group
} from "lucide-react";
import Button from "./Button";
import useIsMobile from "@/lib/hooks/useIsMobile";
import { motion, AnimatePresence } from "framer-motion";
import { BsPeople } from "react-icons/bs";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { user } = useContext(AuthContext);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const userInitials = user ? `${user.firstname[0]}${user.lastname[0]}` : "";

  // Close the navbar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close user dropdown when clicking outside
      if (showUserDropdown && !(event.target as Element).closest('#user-menu-container')) {
        setShowUserDropdown(false);
      }

      // Close mobile menu when clicking outside
      if (isMobile && isOpen && !(event.target as Element).closest('#mobile-nav') && !(event.target as Element).closest('#mobile-nav-toggle')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown, isMobile, isOpen]);

  // Close the mobile nav when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [navigate]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    navigate('/login');
  };

  // Nav links configuration
  const navLinks = [
    { to: "/", text: "Inicio", Icon: Home },
    { to: "/pacientes", text: "Pacientes", Icon: User },
    { to: "/turnos", text: "Turnos", Icon: Calendar },
    { to: "/servicios", text: "Servicios", Icon: FileText },
    { to: "/obras-sociales", text: "Obras Sociales", Icon: Building2 },
    { to: "/areas", text: "Áreas", Icon: Map },
    { to: "/profesionales", text: "Profesionales", Icon: BsPeople }
  ];

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="h-16 hidden sm:flex w-full bg-white dark:bg-gray-800 justify-between px-6 py-0 sticky top-0 shadow-md z-50 border-b border-gray-200 dark:border-gray-700">
        {/* Logo and Brand */}
        <div className="flex items-center">
          <span className="font-bold text-xl text-primary dark:text-white">FisioApp</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center">
          {navLinks.map(({ to, text, Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `px-3 py-2 mx-1 flex items-center text-sm font-medium rounded-md transition-colors ${isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`
              }
            >
              <Icon className="mr-1.5 h-4 w-4" />
              {text}
            </NavLink>
          ))}
        </div>

        {/* User and Theme Controls */}
        <div className="flex items-center gap-1 relative" id="user-menu-container">

          <div
            className="flex items-center ml-2 cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            {user ? (
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-medium text-sm mr-2">
                  {userInitials}
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-1">
                  {user.firstname}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            ) : (
              <CiUser className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            )}
          </div>

          {/* User dropdown menu */}
          <AnimatePresence>
            {showUserDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-full mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
              >
                <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.firstname} {user?.lastname}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Settings className="h-4 w-4 mr-2 text-gray-500" />
                  Configuración
                </a>

                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Mobile Navbar */}
      <nav className="h-16 flex sm:hidden w-full bg-white dark:bg-gray-800 justify-between items-center px-4 py-0 sticky top-0 shadow-md z-50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Button
            id="mobile-nav-toggle"
            variant="ghost"
            className="p-2 mr-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
          </Button>
          <span className="font-bold text-xl text-primary dark:text-white">FisioApp</span>
        </div>

        <div className="flex items-center">

          <div
            className="flex items-center ml-1 p-1"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
          >
            {user ? (
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-medium text-sm">
                {userInitials}
              </div>
            ) : (
              <CiUser className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-nav"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            className="fixed inset-0 z-50 flex sm:hidden"
          >
            {/* Semi-transparent backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer content */}
            <div className="relative w-4/5 max-w-sm bg-white dark:bg-gray-800 h-full shadow-xl flex flex-col overflow-y-auto">
              <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                <span className="font-bold text-xl text-primary dark:text-white">FisioApp</span>
                <Button
                  variant="ghost"
                  className="p-1"
                  onClick={() => setIsOpen(false)}
                >
                  <IoMdClose className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                </Button>
              </div>

              {/* User profile section */}
              {user && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center mb-3">
                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-medium mr-3">
                      {userInitials}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.firstname} {user.lastname}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation links */}
              <div className="py-2 flex-1">
                {navLinks.map(({ to, text, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `px-4 py-3 mx-2 my-1 flex items-center text-sm font-medium rounded-md ${isActive
                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-white"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      }`
                    }
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {text}
                  </NavLink>
                ))}
              </div>

              {/* Bottom actions */}
              <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="ghost"
                  className="w-full justify-start px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleLogout}
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;