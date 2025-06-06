import { Fragment } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Transacciones', href: '/transactions' },
];

const getRoleText = (role: string) => {
  switch (role) {
    case 'seller':
      return 'Vendedor';
    case 'buyer':
      return 'Comprador';
    default:
      return role;
  }
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNavigation = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-erco-primary via-erco-tertiary to-erco-secondary">
      <Disclosure as="nav" className="glass sticky top-0 z-50">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <a 
                      href="/dashboard" 
                      onClick={(e) => handleNavigation('/dashboard', e)}
                      className="text-2xl font-bold text-white"
                    >
                      ERCO
                    </a>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={(e) => handleNavigation(item.href, e)}
                        className={`inline-flex items-center border-b-2 ${
                          location.pathname === item.href
                            ? 'border-erco-secondary text-white'
                            : 'border-transparent text-white/80 hover:text-white hover:border-erco-secondary'
                        } px-1 pt-1 text-sm font-medium transition-colors duration-200`}
                      >
                        {item.name}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  <Menu as="div" className="relative ml-3">
                    <Menu.Button className="flex rounded-full bg-white/10 p-1 text-sm focus:outline-none focus:ring-2 focus:ring-erco-secondary">
                      <UserCircleIcon className="h-8 w-8 text-white" aria-hidden="true" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-200"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-xl bg-gray-900/95 backdrop-blur-lg py-1 shadow-lg ring-1 ring-white/10 focus:outline-none">
                        {/* Información del usuario */}
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm text-white font-medium truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-white/80 truncate mt-1">
                            {user?.email}
                          </p>
                          <div className="mt-2">
                            <span className="inline-flex items-center rounded-full bg-erco-secondary/20 px-2 py-1 text-xs font-medium text-erco-secondary ring-1 ring-erco-secondary/30">
                              {getRoleText(user?.role || '')}
                            </span>
                          </div>
                        </div>
                        {/* Botón de cerrar sesión */}
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={handleLogout}
                              className={`${
                                active ? 'bg-white/10' : ''
                              } block w-full px-4 py-2 text-left text-sm text-white hover:text-white transition-colors duration-200`}
                            >
                              Cerrar sesión
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>

                <div className="-mr-2 flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-erco-secondary">
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleNavigation(item.href, e)}
                    className={`block border-l-4 ${
                      location.pathname === item.href
                        ? 'border-erco-secondary text-white'
                        : 'border-transparent text-white/80 hover:text-white hover:border-erco-secondary'
                    } py-2 pl-3 pr-4 text-base font-medium transition-colors duration-200`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="border-t border-white/10 pb-3 pt-4">
                {/* Información del usuario en móvil */}
                <div className="px-4 py-3">
                  <p className="text-base font-medium text-white">
                    {user?.name}
                  </p>
                  <p className="text-sm text-white/70 mt-1">
                    {user?.email}
                  </p>
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-erco-secondary/20 px-2 py-1 text-xs font-medium text-erco-secondary">
                      {getRoleText(user?.role || '')}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <button
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-base font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors duration-200"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <main className="flex-1 w-full py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="glass h-full p-6 rounded-2xl shadow-xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
} 