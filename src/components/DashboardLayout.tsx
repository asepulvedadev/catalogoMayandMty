import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Bars3Icon,
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  DocumentTextIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import logo from '../assets/logo_mayand.png';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { 
    name: 'Productos', 
    href: '/dashboard/products', 
    icon: ShoppingBagIcon,
    submenu: [
      { name: 'Gestión de Productos', href: '/dashboard/products' },
      { name: 'Listado Completo', href: '/dashboard/products/list' }
    ]
  },
  { name: 'Clientes', href: '/dashboard/customers', icon: UsersIcon },
  { name: 'Cotizaciones', href: '/dashboard/quotes', icon: DocumentTextIcon },
  { name: 'Ventas', href: '/dashboard/sales', icon: CurrencyDollarIcon },
  { name: 'Reportes', href: '/dashboard/reports', icon: ChartPieIcon },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/admin');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const renderSidebarContent = () => (
    <nav className="flex flex-1 flex-col">
      <ul role="list" className="flex flex-1 flex-col gap-y-7">
        <li>
          <ul role="list" className="-mx-2 space-y-1">
            {navigation.map((item) => (
              <li key={item.name}>
                {item.submenu ? (
                  <div className="space-y-1">
                    <div
                      className={`
                        group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6
                        ${isActive(item.href) || item.submenu.some(sub => isActive(sub.href))
                          ? 'bg-primary-700 text-white'
                          : 'text-gray-200 hover:bg-primary-700 hover:text-white'
                        }
                      `}
                    >
                      <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                      {item.name}
                    </div>
                    <div className="ml-6 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className={`
                            block rounded-md px-2 py-2 text-sm leading-6
                            ${isActive(subItem.href)
                              ? 'bg-primary-600 text-white'
                              : 'text-gray-200 hover:bg-primary-700 hover:text-white'
                            }
                          `}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className={`
                      group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6
                      ${isActive(item.href)
                        ? 'bg-primary-700 text-white'
                        : 'text-gray-200 hover:bg-primary-700 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="h-6 w-6 shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </li>
      </ul>
    </nav>
  );

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primary px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center justify-center">
                    <img
                      className="h-8 w-auto"
                      src={logo}
                      alt="Mayand"
                    />
                  </div>
                  {renderSidebarContent()}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-primary px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center justify-center">
            <img
              className="h-8 w-auto"
              src={logo}
              alt="Mayand"
            />
          </div>
          {renderSidebarContent()}
        </div>
      </div>

      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Abrir menú</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                onClick={handleSignOut}
                className="text-gray-700 hover:text-gray-900"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}