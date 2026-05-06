'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ChevronRight, Sparkles } from 'lucide-react';
import { api, type InstitucionData } from '@/lib/api';

// 🔹 Obtener URL del servicio desde .env
const SERVICIO_ADMIN_URL = process.env.NEXT_PUBLIC_SERVICIO_ADMIN_URL || 'https://servicioadministrador.upea.bo/sign-in';

// 🔹 Función para obtener URL de imagen (directa o fallback)
const getImageUrl = (urlOrPath: string | null | undefined, fallback?: string): string => {
  if (!urlOrPath) return fallback || '';
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }
  return `https://archivosminio.upea.bo/archivospaginasnode/imagenes/logos/${urlOrPath}`;
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);
  
  // 🔹 Estados para Smart Header (auto-hide)
  const [headerVisible, setHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [mouseNearTop, setMouseNearTop] = useState(false);
  
  const [institucion, setInstitucion] = useState<InstitucionData | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Scroll hooks para animaciones
  const { scrollY } = useScroll();
  const headerY = useTransform(scrollY, [0, 100], [0, -10]);
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const logoRotate = useTransform(scrollY, [0, 500], [0, 360]);
  const logoScale = useTransform(scrollY, [0, 200], [1, 1.1]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLinkClick = (href: string) => {
    if (href === '/' || href === '#inicio') {
      scrollToTop();
    }
    if (mobileMenuOpen) {
      setMobileMenuOpen(false);
    }
    setActiveDropdown(null);
  };

  // 🔹 Detectar scroll para auto-hide del header
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrollThreshold = 100;
          
          if (currentScrollY > lastScrollY && currentScrollY > scrollThreshold) {
            if (!mouseNearTop) {
              setHeaderVisible(false);
            }
          } else if (currentScrollY < lastScrollY) {
            setHeaderVisible(true);
          }
          
          setIsScrolled(currentScrollY > 20);
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, mouseNearTop]);

  // 🔹 Detectar cuando el mouse está cerca del top
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 100) {
        setMouseNearTop(true);
        setHeaderVisible(true);
      } else {
        setMouseNearTop(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 🔹 Cargar institución
  useEffect(() => {
    const loadInstitucion = async () => {
      try {
        const response = await api.getInstitucion();
        setInstitucion(response.Descripcion);
        
        if (response.Descripcion.colorinstitucion?.[0]) {
          const colors = response.Descripcion.colorinstitucion[0];
          document.documentElement.style.setProperty('--color-primario', colors.color_primario);
          document.documentElement.style.setProperty('--color-secundario', colors.color_secundario);
          document.documentElement.style.setProperty('--color-terciario', colors.color_terciario);
        }
      } catch (error) {
        console.error('Error al cargar datos de la institución:', error);
        setInstitucion({
          institucion_nombre: 'Administración de Empresas',
          institucion_logo: '',
          institucion_correo1: 'admemp@upea.bo',
          institucion_celular1: 71257919,
          institucion_direccion: 'Campus UPEA',
        } as InstitucionData);
      } finally {
        setLoading(false);
      }
    };

    loadInstitucion();
  }, []);

  // 🔹 NAV ITEMS - SIN MODIFICAR (misma lógica)
  const navItems = [
    { name: 'Inicio', href: '/', submenu: null },
    { 
      name: 'La Institución', 
      href: '/sobre-la-carrera',
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
      href: '#',
      submenu: [
        { name: 'Publicaciones', href: '/publicaciones' },
        { name: 'Enlaces', href: '/enlaces' },
        { name: 'Convocatorias', href: '/convocatorias' },
      ]
    },
    { 
      name: 'Cursos', 
      href: '#',
      submenu: [
        { name: 'Seminarios', href: '/seminarios' },
        { name: 'Cursos', href: '/cursos' },
        { name: 'Diplomados', href: '/diplomados' },
      ]
    },
    { 
      name: 'Más', 
      href: '#',
      submenu: [
        { name: 'Servicios', href: '/servicios' },
        { name: 'Ofertas Académicas', href: '/ofertas' },
        { name: 'Gaceta', href: '/gaceta' },
        { name: 'Eventos', href: '/eventos' },
        { name: 'Videos', href: '/videos' },
      ]
    },
    { 
      name: 'Investigación', 
      href: '#',
      submenu: [
        { name: 'Instituto de Investigación', href: '/Instituto-investigacion' },
      ]
    },
    { name: 'Contacto', href: '/contacto', submenu: null },
  ];

  const logoUrl = getImageUrl(institucion?.institucion_logo);

  return (
    <>
      {/* ✅ CSS para rotación 3D del logo + Fuente Forte */}
      <style jsx global>{`
        /* Rotación 3D del logo */
        @keyframes logoRotate3D {
          0% { transform: perspective(1000px) rotateY(0deg) rotateX(10deg); }
          100% { transform: perspective(1000px) rotateY(360deg) rotateX(10deg); }
        }
        .logo-3d-rotate {
          animation: logoRotate3D 20s linear infinite;
          transform-style: preserve-3d;
          backface-visibility: visible;
        }
        .logo-3d-rotate:hover {
          animation-play-state: paused;
        }
        
        /* ✅ Fuente Forte - Configura según tu instalación */
        @font-face {
          font-family: 'Forte';
          src: url('/fonts/Forte.woff2') format('woff2'),
               url('/fonts/Forte.woff') format('woff');
          font-display: swap;
        }
        .font-forte {
          font-family: 'Forte', 'Brush Script MT', cursive, sans-serif;
        }
      `}</style>

      <AnimatePresence>
        {headerVisible && (
          <motion.header 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ 
              type: 'spring', 
              stiffness: 400, 
              damping: 30,
              mass: 0.5 
            }}
            // ✅ Header transparente + fuente Forte + full width
            className={`fixed top-0 w-full z-50 transition-all duration-500 font-forte ${
              isScrolled 
                ? 'bg-white/10 backdrop-blur-md shadow-lg py-2 border-b border-white/20' 
                : 'bg-transparent backdrop-blur-sm py-4'
            }`}
          >
            {/* ✅ CAMBIO: Contenedor full-width (sin max-w-7xl mx-auto) */}
            <nav className="w-full px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                
                {/* 🔹 LOGO CON ROTACIÓN 3D CONTINUA */}
                <Link 
                  href="/" 
                  className="flex items-center gap-3 group"
                  onClick={() => handleLinkClick('/')}
                >
                  <motion.div
                    style={{ scale: logoScale }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="relative"
                  >
                    {logoUrl ? (
                      <div className="logo-3d-rotate relative w-16 h-16 sm:w-20 sm:h-20">
                        <Image
                          src={logoUrl}
                          alt={institucion?.institucion_nombre || 'Logo'}
                          fill
                          className="object-contain p-1 shadow-lg group-hover:shadow-2xl transition-shadow"
                          onLoad={() => setLogoLoaded(true)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const fallback = (e.target as HTMLImageElement).parentElement?.querySelector('.logo-fallback');
                            if (fallback) fallback.classList.remove('hidden');
                          }}
                        />
                        <motion.div 
                          className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/40 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ filter: 'blur(8px)' }}
                        />
                      </div>
                    ) : null}
                    
                    <motion.div 
                      className={`logo-fallback logo-3d-rotate w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-gradient-to-br from-[var(--color-primario,#C00014)] to-[var(--color-secundario,#1167df)] flex items-center justify-center text-white font-bold text-2xl shadow-lg ${logoUrl ? 'hidden' : ''}`}
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      <motion.span
                        animate={{ rotate: [0, -10, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2, repeatDelay: 3 }}
                      >
                        {institucion?.institucion_iniciales || 'AE'}
                      </motion.span>
                    </motion.div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex flex-col"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.span 
                      className="font-bold text-xl sm:text-2xl text-white leading-none group-hover:text-[var(--color-primario,#C00014)] transition-colors drop-shadow-md"
                      whileHover={{ scale: 1.02 }}
                    >
                      {institucion?.institucion_nombre || 'Administración'}
                    </motion.span>
                    <motion.span 
                      className="text-xs text-white/80 font-medium tracking-wider flex items-center gap-1"
                      whileHover={{ letterSpacing: '2px' }}
                      transition={{ duration: 0.3 }}
                    >
                      UPEA
                      <Sparkles className="w-3 h-3 text-[var(--color-primario,#C00014)]" />
                    </motion.span>
                  </motion.div>
                </Link>

                {/* 🔹 MENÚ DESKTOP - Full width */}
                <div className="hidden lg:flex items-center gap-1">
                  {navItems.map((item, index) => (
                    <motion.div 
                      key={item.name}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                      onMouseEnter={() => setActiveDropdown(item.name)}
                      onMouseLeave={() => setActiveDropdown(null)}
                    >
                      {item.submenu ? (
                        <button
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 relative overflow-hidden cursor-default ${
                            activeDropdown === item.name 
                              ? 'text-[var(--color-primario,#C00014)]' 
                              : 'text-white/90 hover:text-[var(--color-primario,#C00014)]'
                          }`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          aria-haspopup="true"
                          aria-expanded={activeDropdown === item.name}
                        >
                          <motion.div
                            className="absolute inset-0 bg-white/10"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: activeDropdown === item.name ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ originX: 0 }}
                          />
                          <span className="relative z-10 flex items-center gap-1 font-forte">
                            {item.name}
                            <motion.div
                              animate={{ rotate: activeDropdown === item.name ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown size={14} />
                            </motion.div>
                          </span>
                        </button>
                      ) : (
                        <Link 
                          href={item.href}
                          onClick={() => handleLinkClick(item.href)}
                          className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1 relative overflow-hidden ${
                            activeDropdown === item.name 
                              ? 'text-[var(--color-primario,#C00014)]' 
                              : 'text-white/90 hover:text-[var(--color-primario,#C00014)]'
                          }`}
                        >
                          <motion.div
                            className="absolute inset-0 bg-white/10"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: activeDropdown === item.name ? 1 : 0 }}
                            transition={{ duration: 0.3 }}
                            style={{ originX: 0 }}
                          />
                          <span className="relative z-10 flex items-center gap-1 font-forte">
                            {item.name}
                          </span>
                        </Link>
                      )}

                      {/* Dropdown - SIN MODIFICAR */}
                      <AnimatePresence>
                        {item.submenu && activeDropdown === item.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                          >
                            <div className="py-2">
                              {item.submenu.map((subitem, subIndex) => (
                                <motion.div
                                  key={subitem.name}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: subIndex * 0.05 }}
                                >
                                  <Link
                                    href={subitem.href}
                                    onClick={() => handleLinkClick(subitem.href)}
                                    className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-blue-50 hover:text-[var(--color-primario,#C00014)] transition-all flex items-center justify-between group/item font-forte"
                                  >
                                    <span className="flex items-center gap-2">
                                      <motion.div
                                        className="w-1.5 h-1.5 rounded-full bg-[var(--color-primario,#C00014)]"
                                        whileHover={{ scale: 2 }}
                                      />
                                      {subitem.name}
                                    </span>
                                    <motion.div
                                      initial={{ opacity: 0, x: -10 }}
                                      whileHover={{ opacity: 1, x: 0 }}
                                      transition={{ duration: 0.2 }}
                                    >
                                      <ChevronRight size={14} className="text-[var(--color-primario,#C00014)]" />
                                    </motion.div>
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>

                {/* 🔹 BOTÓN INICIAR SESIÓN */}
                <motion.div 
                  className="hidden lg:block"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.a 
                    href={SERVICIO_ADMIN_URL}
                    target="_blank" 
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(192,0,20,0.3)' }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-[var(--color-primario,#C00014)] to-[var(--color-secundario,#1167df)] text-white px-6 py-2.5 rounded-full font-semibold text-sm inline-block shadow-lg hover:shadow-xl transition-all relative overflow-hidden group font-forte"
                  >
                    <span className="relative z-10">INICIAR SESIÓN</span>
                    <motion.div 
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.a>
                </motion.div>

                {/* 🔹 BOTÓN MENÚ MÓVIL */}
                <motion.button
                  className="lg:hidden p-2 text-white/90 hover:text-[var(--color-primario,#C00014)] transition relative"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle menu"
                  whileTap={{ scale: 0.9 }}
                >
                  <AnimatePresence mode="wait">
                    {mobileMenuOpen ? (
                      <motion.div
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <X size={28} />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="menu"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Menu size={28} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>
            </nav>

            {/* 🔹 MENÚ MÓVIL - Full width */}
            <AnimatePresence>
              {mobileMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="lg:hidden bg-white/95 backdrop-blur-lg border-t border-white/20 shadow-2xl overflow-hidden w-full"
                >
                  <div className="px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto">
                    {navItems.map((item, index) => (
                      <motion.div 
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {item.submenu ? (
                          <div className="border border-white/20 rounded-xl overflow-hidden">
                            <motion.button 
                              className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-800 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-red-50 hover:to-blue-50 transition-all cursor-default font-forte"
                              onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                              whileTap={{ scale: 0.98 }}
                              aria-haspopup="true"
                              aria-expanded={activeDropdown === item.name}
                            >
                              <span>{item.name}</span>
                              <motion.div
                                animate={{ rotate: activeDropdown === item.name ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ChevronDown size={18} />
                              </motion.div>
                            </motion.button>
                            <AnimatePresence>
                              {activeDropdown === item.name && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="bg-white border-t border-white/20"
                                >
                                  {item.submenu.map((subitem) => (
                                    <Link
                                      key={subitem.name}
                                      href={subitem.href}
                                      onClick={() => handleLinkClick(subitem.href)}
                                      className="block px-6 py-3 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-blue-50 hover:text-[var(--color-primario,#C00014)] transition-all border-b border-gray-50 last:border-0 font-forte"
                                    >
                                      {subitem.name}
                                    </Link>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          <Link
                            href={item.href}
                            onClick={() => handleLinkClick(item.href)}
                            className="block px-4 py-3 text-base font-medium text-gray-800 hover:bg-gradient-to-r hover:from-red-50 hover:to-blue-50 hover:text-[var(--color-primario,#C00014)] rounded-xl transition-all font-forte"
                          >
                            {item.name}
                          </Link>
                        )}
                      </motion.div>
                    ))}
                    
                    <motion.div 
                      className="pt-4 mt-4 border-t border-white/20"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.a 
                        href={SERVICIO_ADMIN_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full bg-gradient-to-r from-[var(--color-primario,#C00014)] to-[var(--color-secundario,#1167df)] text-white px-6 py-3 rounded-xl font-semibold shadow-lg inline-block text-center font-forte"
                      >
                        INICIAR SESIÓN
                      </motion.a>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.header>
        )}
      </AnimatePresence>
    </>
  );
}