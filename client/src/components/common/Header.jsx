import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  console.log(user);
  const navLinks = [
    { path: '/upload', label: 'Upload' },
    { path: '/wardrobe', label: 'Wardrobe' },
    { path: '/outfits', label: 'Outfits' },
  ];
  console.log(user.user);
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/upload" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">Thread Up</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-gray-700 hover:text-primary-600'
                  } pb-1`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user && (
              <>
                <div className="flex items-center space-x-3">
                  <img
                    src={user.picture || '/default-avatar.jpg'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900">
                  Logout
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-medium ${
                    isActive(link.path) ? 'text-primary-600' : 'text-gray-700'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t">
                {user && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={user.picture || '/default-avatar.png'}
                        alt={user.name}
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="text-sm text-gray-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
