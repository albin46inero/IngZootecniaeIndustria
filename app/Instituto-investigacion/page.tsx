'use client';

import Footer from '@/components/Footer';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, FileText, Download, Calendar, User, ChevronLeft, ChevronRight, Sparkles, ExternalLink, Mail, AlertCircle } from 'lucide-react';
import { api, getDirectUrl, type InstitucionData } from '@/lib/api';
import FloatingParticles from '@/components/FloatingParticles';

// 🔹 Tipos
interface Portada {
  portada_id: number;
  portada_imagen: string;
  portada_titulo: string;
  portada_subtitulo: string;
}

interface Publicacion {
  publicaciones_id: number;
  publicaciones_titulo: string;
  publicaciones_imagen: string;
  publicaciones_descripcion: string;
  publicaciones_documento: string;
  publicaciones_fecha: string;
  publicaciones_autor: string;
  publicaciones_tipo: string;
}

export default function InstitutoInvestigacionPage() {
  const [institucionData, setInstitucionData] = useState<InstitucionData | null>(null);
  const [portadas, setPortadas] = useState<Portada[]>([]);
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [filteredPublicaciones, setFilteredPublicaciones] = useState<Publicacion[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [colors, setColors] = useState({
    primario: '#6AA942',
    secundario: '#235F35',
    terciario: '#000000'
  });
  
  // 🔹 Estado para rastrear imágenes rotas
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  
  // 🔹 Referencias para animaciones
  const heroRef = useRef<HTMLDivElement>(null);
  const publicacionesRef = useRef<HTMLDivElement>(null);
  
  // 🔹 Scroll animations
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  const isHeroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const isPublicacionesInView = useInView(publicacionesRef, { once: true, margin: '-100px' });

  // 🔹 Cargar datos desde API
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔹 Cargando Instituto de Investigación...');
        
        const instResponse = await api.getInstitucion();
        const institucion = instResponse.Descripcion;
        setInstitucionData(institucion);
        
        // 🔹 Cargar colores dinámicos
        if (institucion.colorinstitucion?.[0]) {
          const colors = institucion.colorinstitucion[0];
          setColors({
            primario: colors.color_primario || '#6AA942',
            secundario: colors.color_secundario || '#235F35',
            terciario: colors.color_terciario || '#000000'
          });
          document.documentElement.style.setProperty('--color-primario', colors.color_primario);
          document.documentElement.style.setProperty('--color-secundario', colors.color_secundario);
          document.documentElement.style.setProperty('--color-terciario', colors.color_terciario);
        }
        
        const contResponse = await api.getContenido();
        console.log('🔹 Portadas desde API:', contResponse.portada);
        
        if (contResponse.portada && contResponse.portada.length > 0) {
          setPortadas(contResponse.portada);
          console.log('✅ Portadas cargadas:', contResponse.portada.length);
        }
        
        // 🔹 Cargar publicaciones y FILTRAR por INSTITUTO DE INVESTIGACION
        const recursosResponse = await api.getRecursos();
        if (recursosResponse.upea_publicaciones && recursosResponse.upea_publicaciones.length > 0) {
          const investigaciones = recursosResponse.upea_publicaciones.filter(
            (pub: Publicacion) => 
              pub.publicaciones_tipo?.toUpperCase() === 'INSTITUTO DE INVESTIGACION'
          );
          setPublicaciones(investigaciones);
          setFilteredPublicaciones(investigaciones);
          console.log('✅ Investigaciones cargadas:', investigaciones.length);
        }
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 🔹 Filtrar por búsqueda
  useEffect(() => {
    if (searchTerm) {
      const filtered = publicaciones.filter(pub => 
        pub.publicaciones_titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.publicaciones_autor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.publicaciones_descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPublicaciones(filtered);
    } else {
      setFilteredPublicaciones(publicaciones);
    }
  }, [searchTerm, publicaciones]);

  // 🔹 Slider
  useEffect(() => {
    if (portadas.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % portadas.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [portadas.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % portadas.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + portadas.length) % portadas.length);

  // 🔹 Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const currentPortada = portadas[currentSlide];
  const heroImageUrl = currentPortada?.portada_imagen || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <motion.div 
          className="animate-pulse text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div 
            className="w-20 h-20 bg-[var(--color-primario)]/20 rounded-full mx-auto mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-muted-foreground font-medium">Cargando investigaciones...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* ✅ FUENTE FORTE */}
      <style jsx global>{`
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

      <div className="min-h-screen bg-background font-forte overflow-x-hidden">
        
        {/* ===== HERO SECTION - IGUAL QUE LAS DEMÁS PÁGINAS ===== */}
        <motion.section 
          ref={heroRef}
          className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {/* 🔹 DEGRADADO ANIMADO DE FONDO */}
          <motion.div 
            className="absolute inset-0 z-0"
            animate={{
              background: [
                `linear-gradient(135deg, ${colors.primario} 0%, ${colors.secundario} 50%, ${colors.terciario} 100%)`,
                `linear-gradient(135deg, ${colors.secundario} 0%, ${colors.terciario} 50%, ${colors.primario} 100%)`,
                `linear-gradient(135deg, ${colors.terciario} 0%, ${colors.primario} 50%, ${colors.secundario} 100%)`,
                `linear-gradient(135deg, ${colors.primario} 0%, ${colors.secundario} 50%, ${colors.terciario} 100%)`
              ]
            }}
            transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
          />
          
          {/* Overlay de imagen con parallax */}
          <div className="absolute inset-0 z-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPortada?.portada_id}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2 }}
              >
                <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
                  <Image
                    src={heroImageUrl}
                    alt={institucionData?.institucion_nombre || 'Hero'}
                    fill
                    className="object-cover object-center mix-blend-overlay"
                    priority
                    quality={75}
                    sizes="100vw"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1920&h=1080&fit=crop';
                    }}
                  />
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Partículas animadas */}
          <FloatingParticles count={15} className="z-0" />

          {/* Controles Slider */}
          {portadas.length > 1 && (
            <>
              <motion.button 
                onClick={prevSlide} 
                whileHover={{ scale: 1.2 }} 
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 rounded-full text-white backdrop-blur-sm"
              >
                <ChevronLeft size={24} />
              </motion.button>
              <motion.button 
                onClick={nextSlide} 
                whileHover={{ scale: 1.2 }} 
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 rounded-full text-white backdrop-blur-sm"
              >
                <ChevronRight size={24} />
              </motion.button>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {portadas.map((_, index) => (
                  <button 
                    key={index} 
                    onClick={() => setCurrentSlide(index)} 
                    className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'}`} 
                  />
                ))}
              </div>
            </>
          )}

          {/* ✅ CONTENIDO CON DATOS DINÁMICOS DE LA CARRERA */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 w-full">
            <div className="flex flex-col items-center justify-center text-center gap-8">
              
              {/* 🔹 LOGO DE LA CARRERA CON ROTACIÓN 3D */}
              <motion.div 
                initial={{ opacity: 0, scale: 0 }} 
                animate={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.8, type: 'spring' }} 
                className="relative"
              >
                {institucionData?.institucion_logo ? (
                  <motion.div 
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden shadow-2xl border-4 border-white/30"
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <Image 
                      src={getDirectUrl(institucionData.institucion_logo)} 
                      alt={institucionData.institucion_nombre || 'Logo'} 
                      fill 
                      className="object-cover" 
                      style={{ backfaceVisibility: 'hidden' }}
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-white to-gray-200 flex items-center justify-center shadow-2xl border-4 border-white/30"
                    animate={{ rotateY: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  >
                    <span className="text-2xl sm:text-3xl font-bold text-gray-800">
                      {institucionData?.institucion_iniciales || 'CD'}
                    </span>
                  </motion.div>
                )}
              </motion.div>

              {/* 🔹 TÍTULO - NOMBRE DE LA CARRERA DESDE API ✅ */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="px-4">
                <motion.h1 
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white whitespace-nowrap"
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}
                  animate={{ opacity: [1, 0.4, 1], filter: ['blur(0px)', 'blur(3px)', 'blur(0px)'] }}
                  transition={{ duration: 5, repeat: Infinity, repeatType: 'reverse' }}
                >
                  {institucionData?.institucion_nombre || 'Ciencias del Desarrollo'}
                </motion.h1>
              </motion.div>

              {/* 🔹 SUBTÍTULO - SLOGAN DESDE API ✅ */}
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.5 }} 
                className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl drop-shadow-md font-medium px-4"
              >
                {institucionData?.institucion_slogan || 'Universidad Pública de El Alto - UPEA'}
              </motion.p>

              {/* 🔹 CORREO DE LA CARRERA - DESDE API ✅ */}
              {institucionData?.institucion_correo1 && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: 0.6 }} 
                  className="text-sm text-white/80 max-w-md drop-shadow-md px-4 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {institucionData.institucion_correo1}
                </motion.p>
              )}

              {/* Botón Volver */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
                <Link href="/">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white font-semibold rounded-xl backdrop-blur-sm border border-white/30 hover:bg-white/30 transition"
                  >
                    <ArrowLeft size={18} />
                    Volver al inicio
                  </motion.button>
                </Link>
              </motion.div>

            </div>
          </div>
        </motion.section>

        {/* ===== CONTENIDO - INVESTIGACIONES ===== */}
        <motion.main 
          ref={publicacionesRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          {/* Título con animación */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-block mb-4"
            >
              <Sparkles className="w-12 h-12" style={{ color: colors.primario }} />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Instituto de Investigación</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Proyectos y publicaciones del Instituto de Investigación de la carrera de <span className="font-semibold" style={{ color: colors.primario }}>{institucionData?.institucion_nombre || 'Ciencias del Desarrollo'}</span>
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] mx-auto mt-4 rounded-full"></div>
          </motion.div>

          {/* Buscador con animación */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative max-w-xl mx-auto mb-12"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <motion.input 
              type="text"
              placeholder="Buscar investigaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              whileFocus={{ scale: 1.02, boxShadow: '0 0 0 3px rgba(106, 169, 66, 0.2)' }}
              className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] bg-white/50 backdrop-blur-sm"
            />
          </motion.div>

          {/* Grid de Investigaciones con animaciones stagger */}
          {filteredPublicaciones.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {filteredPublicaciones.map((pub, index) => {
                const isBroken = brokenImages.has(pub.publicaciones_id.toString());
                
                return (
                  <motion.div 
                    key={pub.publicaciones_id} 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(106, 169, 66, 0.15)' }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                  >
                    {/* 🔹 IMAGEN DE LA INVESTIGACIÓN CON MANEJO DE ERRORES */}
                    <div className="relative h-56 overflow-hidden bg-gradient-to-br from-[var(--color-primario)]/10 to-[var(--color-secundario)]/10 group-hover:scale-105 transition-transform duration-300">
                      {pub.publicaciones_imagen && !isBroken ? (
                        <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.6 }}>
                          <Image
                            src={getDirectUrl(pub.publicaciones_imagen)}
                            alt={pub.publicaciones_titulo}
                            fill
                            className="object-cover transition-transform duration-700"
                            onError={() => {
                              console.error('❌ Imagen de investigación no encontrada:', {
                                id: pub.publicaciones_id,
                                titulo: pub.publicaciones_titulo,
                                path: pub.publicaciones_imagen
                              });
                              setBrokenImages(prev => new Set(prev).add(pub.publicaciones_id.toString()));
                            }}
                          />
                        </motion.div>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          {pub.publicaciones_imagen ? (
                            <>
                              <AlertCircle className="w-10 h-10 text-gray-400 mb-2" />
                              <span className="text-xs text-gray-500">Imagen no disponible</span>
                            </>
                          ) : (
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                              <FileText className="w-16 h-16" style={{ color: colors.primario }} />
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <motion.h3 
                        className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-[var(--color-primario)] transition-colors"
                        whileHover={{ x: 5 }}
                      >
                        {pub.publicaciones_titulo}
                      </motion.h3>
                      
                      {pub.publicaciones_descripcion && (
                        <motion.div 
                          className="text-sm text-muted-foreground mb-4 line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: pub.publicaciones_descripcion }}
                        />
                      )}
                      
                      <div className="space-y-2 pt-4 border-t border-gray-200">
                        {pub.publicaciones_autor && (
                          <motion.div className="flex items-center gap-2 text-sm text-muted-foreground" whileHover={{ x: 3 }}>
                            <User className="w-4 h-4" style={{ color: colors.primario }} />
                            <span className="line-clamp-1 font-forte">{pub.publicaciones_autor}</span>
                          </motion.div>
                        )}
                        {pub.publicaciones_fecha && (
                          <motion.div className="flex items-center gap-2 text-sm text-muted-foreground" whileHover={{ x: 3 }}>
                            <Calendar className="w-4 h-4" style={{ color: colors.secundario }} />
                            <span className="font-forte">{formatDate(pub.publicaciones_fecha)}</span>
                          </motion.div>
                        )}
                      </div>
                      
                      {pub.publicaciones_documento && (
                        <motion.a
                          href={getDirectUrl(pub.publicaciones_documento)}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
                          style={{ backgroundColor: colors.primario }}
                        >
                          <Download className="w-4 h-4" />
                          Descargar Documento
                        </motion.a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 mb-16"
            >
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} 
                className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4"
              >
                <Search className="w-full h-full" />
              </motion.div>
              <p className="text-muted-foreground text-lg font-forte">
                {searchTerm ? 'No se encontraron investigaciones.' : 'No hay investigaciones disponibles en este momento.'}
              </p>
            </motion.div>
          )}

          {/* Botón de acción con animación */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center"
          >
            <Link href="/#contacto">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(106, 169, 66, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition"
              >
                Solicitar Información
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
            </Link>
          </motion.div>
        </motion.main>

        <Footer />
      </div>
    </>
  );
}