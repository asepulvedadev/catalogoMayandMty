import { useState } from 'react';
import logo from '../assets/logo_mayand.png';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-primary text-white w-full">
      <div className="w-4/5 mx-auto">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src={logo} alt="Mayand Logo" className="h-8" />
          </div>
          
          <div className="hidden md:flex md:items-center md:justify-between md:w-full md:ml-8">
            <div className="flex-1"></div>
            <div className="text-sm flex-1 text-center">
              <span>8-9/518</span>
            </div>
            <div className="flex items-center space-x-4 flex-1 justify-end">
              <button className="p-2 hover:bg-primary-700 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              <button className="p-2 hover:bg-primary-700 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
              <button className="p-2 hover:bg-primary-700 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
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
            <button className="block w-full text-left px-3 py-2 hover:bg-primary-700 rounded-md">Menu</button>
            <button className="block w-full text-left px-3 py-2 hover:bg-primary-700 rounded-md">Search</button>
            <button className="block w-full text-left px-3 py-2 hover:bg-primary-700 rounded-md">Favorites</button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;