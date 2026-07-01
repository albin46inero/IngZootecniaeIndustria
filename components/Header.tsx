'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, ChevronDown } from 'lucide-react';
import { api, type InstitucionData, getDirectUrl } from '@/lib/api';

const SERVICIO_ADMIN_URL = process.env.NEXT_PUBLIC_SERVICIO_ADMIN_URL || 'https://servicioadministrador.upea.bo/sign-in';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [institucion, setInstitucion] = useState<InstitucionData | null>(null);

  // 🔹 Detectar scroll
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 🔹 Cerrar menús al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenMobileSubmenu(null);
  }, []);

  // 🔹 Cargar datos de la institución y colores
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getInstitucion();
        setInstitucion(res.Descripcion);
        if (res.Descripcion.colorinstitucion?.[0]) {
          const c = res.Descripcion.colorinstitucion[0];
          document.documentElement.style.setProperty('--color-primario', c.color_primario || '#6AA942');
          document.documentElement.style.setProperty('--color-secundario', c.color_secundario || '#235F35');
          document.documentElement.style.setProperty('--color-terciario', c.color_terciario || '#000000');
        }
      } catch (e) {
        console.error('Error cargando institución:', e);
      }
    };
    load();
  }, []);

  // 🔹 Limpiar variables CSS al desmontar
  useEffect(() => {
    return () => {
      document.documentElement.style.removeProperty('--color-primario');
      document.documentElement.style.removeProperty('--color-secundario');
      document.documentElement.style.removeProperty('--color-terciario');
    };
  }, []);

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
        { name: 'Ofertas', href: '/ofertas' },
        { name: 'Videos', href: '/videos' },
      ]
    },
   
    { name: 'Contacto', href: '/contacto', submenu: null },
  ];

  const logoUrl = institucion?.institucion_logo ? getDirectUrl(institucion.institucion_logo) : '';

  return (
    <>
      <style jsx global>{`
        /* ✅ Animación 3D del logo */
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

        /* ✅ DROPDOWN DESKTOP - CSS puro estable */
        .nav-item {
          position: relative;
        }
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          margin-top: 0.5rem;
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
          pointer-events: none;
        }
        /* Puente invisible para que el mouse no pierda el hover al bajar */
        .nav-item::after {
          content: '';
          position: absolute;
          top: 100%;
          left: 0;
          width: 100%;
          height: 0.75rem;
          background: transparent;
        }
        .nav-item:hover .dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
          pointer-events: auto;
        }
        .dropdown-link {
          display: block;
          padding: 0.625rem 1rem;
          font-size: 0.875rem;
          color: #374151;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        .dropdown-link:hover {
          background: rgba(106, 169, 66, 0.1);
          color: var(--color-primario, #6AA942);
        }

        /* ✅ Fuente Forte */
        @font-face {
          font-family: 'Forte';
          src: url('/fonts/Forte.woff2') format('woff2'),
               url('/fonts/Forte.woff') format('woff');
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
            
            {/* LOGO */}
            <Link href="/" className="flex items-center gap-3 group cursor-pointer" aria-label="Ir al inicio">
              <div className="relative">
                {logoUrl ? (
                  <div className="logo-3d-rotate relative w-10 h-10 sm:w-12 sm:h-12">
                    <Image
                      src={logoUrl}
                      alt={institucion?.institucion_nombre || 'Logo'}
                      fill
                      className="object-contain"
                      sizes="(max-width: 640px) 40px, 48px"
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

            {/* MENÚ DESKTOP */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div key={item.name} className="nav-item">
                  {item.submenu ? (
                    <>
                      <button
                        type="button"
                        className="px-3 py-2 text-white/90 hover:text-white rounded-lg text-sm flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {item.name}
                        <ChevronDown size={14} className="transition-transform" />
                      </button>
                      <div className="dropdown-menu">
                        {item.submenu.map((sub) => (
                          <Link key={sub.name} href={sub.href} className="dropdown-link font-forte">
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link 
                      href={item.href}
                      className="px-3 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors cursor-pointer"
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* BOTÓN INICIAR SESIÓN */}
            <div className="hidden lg:block">
              <a 
                href={SERVICIO_ADMIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] text-white px-5 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition-all cursor-pointer"
              >
                INICIAR SESIÓN
              </a>
            </div>

            {/* BOTÓN MENÚ MÓVIL */}
            <button 
              type="button"
              className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* MENÚ MÓVIL */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-200">
            <div className="px-4 py-3 space-y-1 max-h-[80vh] overflow-y-auto">
              {navItems.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <div>
                      <button
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        onClick={() => setOpenMobileSubmenu(openMobileSubmenu === item.name ? null : item.name)}
                      >
                        <span className="font-medium">{item.name}</span>
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform ${openMobileSubmenu === item.name ? 'rotate-180' : ''}`} 
                        />
                      </button>
                      {openMobileSubmenu === item.name && (
                        <div className="ml-4 mt-1 space-y-1">
                          {item.submenu.map((sub) => (
                            <Link
                              key={sub.name}
                              href={sub.href}
                              onClick={() => {
                                setMobileMenuOpen(false);
                                setOpenMobileSubmenu(null);
                              }}
                              className="block px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-forte cursor-pointer"
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
                        setOpenMobileSubmenu(null);
                      }}
                      className="block px-3 py-2 text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-forte cursor-pointer"
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
                  className="w-full bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] text-white px-6 py-3 rounded-lg font-semibold text-center block hover:shadow-lg transition-all cursor-pointer"
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