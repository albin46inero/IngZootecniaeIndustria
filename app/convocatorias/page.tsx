'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowLeft, FileText, Download, Calendar, ChevronLeft, ChevronRight, Search, Bell, X, ZoomIn, Mail, AlertCircle } from 'lucide-react';
import { api, getDirectUrl, getConvocatoriaImageUrl, type InstitucionData, type Convocatoria } from '@/lib/api';
import Footer from '@/components/Footer';
import FloatingParticles from '@/components/FloatingParticles';

// 🔹 Tipos
interface Portada {
  portada_id: number;
  portada_imagen: string;
  portada_titulo: string;
  portada_subtitulo: string;
}

export default function ConvocatoriasPage() {
  const [institucionData, setInstitucionData] = useState<InstitucionData | null>(null);
  const [portadas, setPortadas] = useState<Portada[]>([]);
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [filteredConvocatorias, setFilteredConvocatorias] = useState<Convocatoria[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [colors, setColors] = useState({
    primario: '#6AA942',
    secundario: '#235F35',
    terciario: '#000000'
  });
  
  const [selectedConvocatoria, setSelectedConvocatoria] = useState<Convocatoria | null>(null);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.7]);

  // 🔹 Cargar datos desde la API
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔹 Cargando convocatorias...');
        
        const instResponse = await api.getInstitucion();
        const institucion = instResponse.Descripcion;
        setInstitucionData(institucion);
        
        // Cargar colores dinámicos
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
        
        const gacetaResponse = await api.getGacetaEventos();
        if (gacetaResponse.convocatorias && gacetaResponse.convocatorias.length > 0) {
          // Debug: Ver qué paths devuelve la API
          console.log('📋 Primera convocatoria:', gacetaResponse.convocatorias[0]);
          console.log('🔗 Path imagen:', gacetaResponse.convocatorias[0].con_foto_portada);
          console.log('🔗 URL construida (getDirectUrl):', getDirectUrl(gacetaResponse.convocatorias[0].con_foto_portada));
          console.log('🔗 URL construida (getConvocatoriaImageUrl):', getConvocatoriaImageUrl(gacetaResponse.convocatorias[0].con_foto_portada));
          
          const convocatoriasActivas = gacetaResponse.convocatorias.filter(
            (conv: Convocatoria) => conv.con_estado === "1"
          );
          setConvocatorias(convocatoriasActivas);
          setFilteredConvocatorias(convocatoriasActivas);
          console.log('✅ Convocatorias cargadas:', convocatoriasActivas.length);
        }
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 🔹 Filtrar convocatorias
  useEffect(() => {
    if (searchTerm) {
      const filtered = convocatorias.filter(conv => 
        conv.con_titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.tipo_conv_comun?.tipo_conv_comun_titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.con_descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredConvocatorias(filtered);
    } else {
      setFilteredConvocatorias(convocatorias);
    }
  }, [searchTerm, convocatorias]);

  // 🔹 Auto-rotación del slider
  useEffect(() => {
    if (portadas.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % portadas.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [portadas.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % portadas.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + portadas.length) % portadas.length);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = formatDate(start);
    const endDate = formatDate(end);
    return `${startDate} - ${endDate}`;
  };

  const openModal = (convocatoria: Convocatoria) => {
    setSelectedConvocatoria(convocatoria);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedConvocatoria(null);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

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
          <p className="text-muted-foreground font-medium">Cargando convocatorias...</p>
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

      <div className="min-h-screen bg-background font-forte">
        
        {/* ===== HERO SECTION - IGUAL QUE AUTORIDADES/CONTACTO ===== */}
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

        {/* ===== CONTENIDO PRINCIPAL ===== */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
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
              <Bell className="w-12 h-12" style={{ color: colors.primario }} />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Convocatorias</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Consulta las convocatorias, avisos y comunicados oficiales de la carrera de <span className="font-semibold" style={{ color: colors.primario }}>{institucionData?.institucion_nombre || 'Ciencias del Desarrollo'}</span>
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] mx-auto mt-4 rounded-full"></div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative max-w-xl mx-auto mb-12"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar convocatorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]"
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 mb-8 max-w-sm mx-auto"
          >
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: colors.primario }}>{filteredConvocatorias.length}</p>
              <p className="text-sm text-muted-foreground">Convocatorias</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold" style={{ color: colors.secundario }}>{convocatorias.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </motion.div>

          {filteredConvocatorias.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {filteredConvocatorias.map((convocatoria, index) => {
                const isBroken = brokenImages.has(convocatoria.idconvocatorias.toString());
                
                return (
                  <motion.div 
                    key={convocatoria.idconvocatorias}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer"
                    onClick={() => openModal(convocatoria)}
                  >
                    {/* 🔹 IMAGEN CON MANEJO DE ERRORES MEJORADO */}
                    <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[var(--color-primario)]/10 to-[var(--color-secundario)]/10 group-hover:scale-105 transition-transform duration-300">
                      {convocatoria.con_foto_portada && !isBroken ? (
                        <Image
                          src={getConvocatoriaImageUrl(convocatoria.con_foto_portada)}
                          alt={convocatoria.con_titulo}
                          fill
                          className="object-cover"
                          onError={() => {
                            console.error('❌ Imagen no encontrada:', {
                              id: convocatoria.idconvocatorias,
                              path: convocatoria.con_foto_portada,
                              url: getConvocatoriaImageUrl(convocatoria.con_foto_portada)
                            });
                            setBrokenImages(prev => new Set(prev).add(convocatoria.idconvocatorias.toString()));
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          {convocatoria.con_foto_portada ? (
                            <>
                              <AlertCircle className="w-10 h-10 text-gray-400 mb-2" />
                              <span className="text-xs text-gray-500">Imagen no disponible</span>
                            </>
                          ) : (
                            <Bell className="w-16 h-16" style={{ color: colors.primario }} />
                          )}
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-12 h-12 text-white" />
                      </div>
                    </div>

                    <div className="p-6">
                      {convocatoria.tipo_conv_comun && (
                        <span 
                          className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3"
                          style={{ backgroundColor: `${colors.primario}15`, color: colors.primario }}
                        >
                          {convocatoria.tipo_conv_comun.tipo_conv_comun_titulo}
                        </span>
                      )}

                      <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
                        {convocatoria.con_titulo}
                      </h3>

                      {convocatoria.con_descripcion && (
                        <div 
                          className="text-sm text-muted-foreground mb-4 line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: convocatoria.con_descripcion }}
                        />
                      )}

                      <div className="space-y-2 mb-6 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" style={{ color: colors.secundario }} />
                          <span>{formatDateRange(convocatoria.con_fecha_inicio, convocatoria.con_fecha_fin)}</span>
                        </div>
                      </div>

                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(convocatoria);
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
                        style={{ backgroundColor: colors.primario }}
                      >
                        <FileText className="w-4 h-4" />
                        Ver Detalles
                      </motion.button>
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
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"
              >
                <Bell className="w-10 h-10 text-muted-foreground/50" />
              </motion.div>
              <p className="text-muted-foreground text-lg">
                {searchTerm ? 'No se encontraron convocatorias.' : 'No hay convocatorias disponibles.'}
              </p>
            </motion.div>
          )}

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link href="/#contacto">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(106, 169, 66, 0.4)' }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition"
              >
                Solicitar Información
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </motion.button>
            </Link>
          </motion.div>
        </main>

        {/* ===== MODAL ===== */}
        <AnimatePresence>
          {selectedConvocatoria && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={closeModal}
                  className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full hover:bg-white transition shadow-lg"
                >
                  <X className="w-6 h-6" style={{ color: colors.primario }} />
                </button>

                {selectedConvocatoria.con_foto_portada && !brokenImages.has(selectedConvocatoria.idconvocatorias.toString()) && (
                  <div className="relative h-64 md:h-80 bg-gradient-to-br from-[var(--color-primario)]/10 to-[var(--color-secundario)]/10">
                    <Image
                      src={getConvocatoriaImageUrl(selectedConvocatoria.con_foto_portada)}
                      alt={selectedConvocatoria.con_titulo}
                      fill
                      className="object-contain md:object-cover p-4 md:p-0"
                      onError={() => {
                        console.error('❌ Imagen modal no encontrada:', selectedConvocatoria.con_foto_portada);
                        setBrokenImages(prev => new Set(prev).add(selectedConvocatoria.idconvocatorias.toString()));
                      }}
                    />
                  </div>
                )}

                <div className="p-6 md:p-8">
                  {selectedConvocatoria.tipo_conv_comun && (
                    <span 
                      className="inline-block px-4 py-2 text-sm font-semibold rounded-full mb-4"
                      style={{ backgroundColor: `${colors.primario}15`, color: colors.primario }}
                    >
                      {selectedConvocatoria.tipo_conv_comun.tipo_conv_comun_titulo}
                    </span>
                  )}

                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {selectedConvocatoria.con_titulo}
                  </h2>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 pb-4 border-b border-border">
                    <Calendar className="w-5 h-5" style={{ color: colors.secundario }} />
                    <span>
                      {formatDateRange(selectedConvocatoria.con_fecha_inicio, selectedConvocatoria.con_fecha_fin)}
                    </span>
                  </div>

                  <div 
                    className="prose prose-sm md:prose-base max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: selectedConvocatoria.con_descripcion }}
                  />

                  <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-border">
                    {selectedConvocatoria.con_foto_portada && !brokenImages.has(selectedConvocatoria.idconvocatorias.toString()) && (
                      <a
                        href={getConvocatoriaImageUrl(selectedConvocatoria.con_foto_portada)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition shadow-md hover:shadow-lg"
                        style={{ backgroundColor: colors.secundario }}
                      >
                        <ZoomIn className="w-5 h-5" />
                        Abrir Imagen
                      </a>
                    )}
                    <motion.button
                      onClick={closeModal}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground font-semibold rounded-lg hover:bg-muted/80 transition"
                    >
                      <X className="w-5 h-5" />
                      Cerrar
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </>
  );
}