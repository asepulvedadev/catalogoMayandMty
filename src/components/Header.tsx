import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo_mayand.png';

interface HeaderProps {
  searchTerm?: string;
  onSearch?: (term: string) => void;
}

const Header = ({ searchTerm = '', onSearch }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isHome = location.pathname === '/';

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };

  return (
    <header className="bg-primary text-white w-full sticky top-0 z-50">
      <div className="w-4/5 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src={logo} alt="Mayand Logo" className="h-10 w-auto object-contain" />
          </div>
          
          <div className="hidden md:flex md:items-center md:justify-between md:w-full md:ml-8">
            <div className="flex-1"></div>
            <div className="flex items-center space-x-4 flex-1 justify-end">
              {isHome && (
                <div className="relative">
                  <button
                    className="p-2 hover:bg-primary-700 rounded-full"
                    onClick={toggleSearch}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  {isSearchVisible && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-2">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearch?.(e.target.value)}
                        placeholder="Buscar productos..."
                        className="w-full p-2 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              )}
              {!isHome && (
                <button onClick={() => navigate('/')} className="p-2 hover:bg-primary-700 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md hover:bg-primary-700 focus:outline-none"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden w-4/5 mx-auto">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {isHome && (
              <div className="relative p-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearch?.(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full p-2 text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}
            {!isHome && (
              <button
                onClick={() => navigate('/')}
                className="block w-full text-left px-3 py-2 hover:bg-primary-700 rounded-md"
              >
                Inicio
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;