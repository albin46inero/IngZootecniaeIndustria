'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import { api, type InstitucionData } from '@/lib/api';

const SERVICIO_ADMIN_URL = process.env.NEXT_PUBLIC_SERVICIO_ADMIN_URL || 'https://servicioadministrador.upea.bo/sign-in';

const getImageUrl = (urlOrPath: string | null | undefined): string => {
  if (!urlOrPath) return '';
  if (urlOrPath.startsWith('http')) return urlOrPath;
  return `https://archivosminio.upea.bo/archivospaginasnode/imagenes/logos/${urlOrPath}`;
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [institucion, setInstitucion] = useState<InstitucionData | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveDropdown(null);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getInstitucion();
        setInstitucion(res.Descripcion);
        if (res.Descripcion.colorinstitucion?.[0]) {
          const c = res.Descripcion.colorinstitucion[0];
          document.documentElement.style.setProperty('--color-primario', c.color_primario);
          document.documentElement.style.setProperty('--color-secundario', c.color_secundario);
          document.documentElement.style.setProperty('--color-terciario', c.color_terciario);
        }
      } catch (e) {
        console.error('Error:', e);
      }
    };
    load();
  }, []);

  // 🔹 Manejar dropdown CON DELAY para que no se cierre rápido
  const handleDropdownEnter = (name: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(name);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 300); // Delay de 300ms antes de cerrar
  };

  const navItems = [
    { name: 'Inicio', href: '/', submenu: null },
    { 
      name: 'La Institución', 
      href: '/historia',
      submenu: [
        { name: 'Historia', href: '/historia' },
        { name: 'Misión y Visión', href: '/mision-vision' },
        { name: 'Autoridades', href: '/autoridades' },
      ]
    },
    { 
      name: 'Académico', 
      href: '/plan-estudios',
      submenu: [
        { name: 'Plan de Estudios', href: '/plan-estudios' },
        { name: 'Malla Curricular', href: '/malla-curricular' },
        { name: 'Perfil Profesional', href: '/perfil-profesional' },
      ]
    },
    { 
      name: 'Convocatorias', 
      href: '/convocatorias',
      submenu: [
        { name: 'Publicaciones', href: '/publicaciones' },
        { name: 'Convocatorias', href: '/convocatorias' },
      ]
    },
    { 
      name: 'Cursos', 
      href: '/cursos',
      submenu: [
        { name: 'Seminarios', href: '/seminarios' },
        { name: 'Cursos', href: '/cursos' },
      ]
    },
    { 
      name: 'Más', 
      href: '/servicios',
      submenu: [
        { name: 'Servicios', href: '/servicios' },
        { name: 'Ofertas', href: '/ofertas-academicas' },
        { name: 'Videos', href: '/videos' },
      ]
    },
    { name: 'Investigación', href: '/instituto-investigacion', submenu: null },
    { name: 'Contacto', href: '/contacto', submenu: null },
  ];

  const logoUrl = getImageUrl(institucion?.institucion_logo);

  return (
    <>
      <style jsx global>{`
        /* ✅ Rotación 3D del logo - CONSERVADA */
        @keyframes logoRotate3D {
          0% { transform: perspective(1000px) rotateY(0deg); }
          100% { transform: perspective(1000px) rotateY(360deg); }
        }
        .logo-3d-rotate {
          animation: logoRotate3D 20s linear infinite;
          transform-style: preserve-3d;
        }
        .logo-3d-rotate:hover {
          animation-play-state: paused;
        }
        
        /* ✅ Dropdown mejorado - Se mantiene abierto */
        .dropdown-wrapper {
          position: relative;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.25rem;
          min-width: 14rem;
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          border: 1px solid #f3f4f6;
          padding: 0.25rem 0;
          z-index: 50;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-10px);
          transition: all 0.2s ease;
        }
        .dropdown-wrapper:hover .dropdown-menu,
        .dropdown-menu:hover {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .dropdown-item {
          display: block;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          color: #374151;
          transition: all 0.2s;
        }
        .dropdown-item:hover {
          background: rgba(106, 169, 66, 0.1);
          color: var(--color-primario, #6AA942);
        }
        
        @font-face {
          font-family: 'Forte';
          src: url('/fonts/Forte.woff2') format('woff2');
          font-display: swap;
        }
        .font-forte {
          font-family: 'Forte', cursive, sans-serif;
        }
      `}</style>

      <header className={`fixed top-0 w-full z-50 transition-all duration-300 font-forte ${
        isScrolled 
          ? 'bg-[var(--color-terciario)]/95 backdrop-blur-md shadow-lg' 
          : 'bg-[var(--color-terciario)]'
      }`}>
        <nav className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* LOGO CON ROTACIÓN 3D - CONSERVADA */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                {logoUrl ? (
                  <div className="logo-3d-rotate relative w-10 h-10 sm:w-12 sm:h-12">
                    <Image
                      src={logoUrl}
                      alt={institucion?.institucion_nombre || 'Logo'}
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                ) : (
                  <div className="logo-3d-rotate w-10 h-10 sm:w-12 sm:h-12 rounded bg-gradient-to-br from-[var(--color-primario)] to-[var(--color-secundario)] flex items-center justify-center text-white font-bold">
                    {institucion?.institucion_iniciales || 'CD'}
                  </div>
                )}
              </div>
              <div className="hidden sm:block text-white">
                <div className="font-bold text-sm leading-tight group-hover:text-[var(--color-primario)] transition-colors">
                  {institucion?.institucion_nombre || 'CIENCIAS DEL DESARROLLO'}
                </div>
                <div className="text-xs text-white/70">UPEA</div>
              </div>
            </Link>

            {/* DESKTOP MENU */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div 
                  key={item.name}
                  className="dropdown-wrapper"
                  onMouseEnter={() => item.submenu && handleDropdownEnter(item.name)}
                  onMouseLeave={() => item.submenu && handleDropdownLeave()}
                >
                  {item.submenu ? (
                    <>
                      <button
                        className={`px-3 py-2 text-white/90 hover:text-white rounded-lg text-sm flex items-center gap-1 transition-colors ${
                          activeDropdown === item.name ? 'text-[var(--color-primario)]' : ''
                        }`}
                        aria-haspopup="true"
                        aria-expanded={activeDropdown === item.name}
                      >
                        {item.name}
                        <ChevronDown 
                          size={14} 
                          className={`transition-transform duration-200 ${
                            activeDropdown === item.name ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      
                      {/* Dropdown mejorado - Se mantiene abierto */}
                      <div className="dropdown-menu">
                        {item.submenu.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="dropdown-item font-forte"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link 
                      href={item.href}
                      className="px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* LOGIN BUTTON */}
            <div className="hidden lg:block">
              <a 
                href={SERVICIO_ADMIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] text-white px-5 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:scale-105 transition-all"
              >
                INICIAR SESIÓN
              </a>
            </div>

            {/* MOBILE MENU BUTTON */}
            <button 
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <div>
                      <button
                        className="w-full flex items-center justify-between px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                      >
                        <span className="font-medium">{item.name}</span>
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform ${
                            activeDropdown === item.name ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      {activeDropdown === item.name && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setActiveDropdown(null);
                              }}
                              className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-forte"
                            >
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setActiveDropdown(null);
                      }}
                      className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-forte"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              
              <div className="pt-4 mt-4 border-t border-gray-200">
                <a 
                  href={SERVICIO_ADMIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] text-white px-6 py-3 rounded-lg font-semibold text-center block hover:shadow-lg transition-all"
                >
                  INICIAR SESIÓN
                </a>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}