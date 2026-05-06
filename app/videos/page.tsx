'use client';

import Footer from '@/components/Footer';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Search, ChevronLeft, ChevronRight, X, Youtube, ExternalLink, Sparkles, Mail } from 'lucide-react';
import { api, getDirectUrl, type InstitucionData, type VideoInstitucional } from '@/lib/api';
import FloatingParticles from '@/components/FloatingParticles';

// Tipos
interface Portada {
  portada_id: number;
  portada_imagen: string;
  portada_titulo: string;
  portada_subtitulo: string;
}

// 🔹 Función para extraer el ID del video de YouTube
const getYouTubeId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// 🔹 Función para obtener el thumbnail de YouTube
const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

export default function VideosPage() {
  const [institucionData, setInstitucionData] = useState<InstitucionData | null>(null);
  const [portadas, setPortadas] = useState<Portada[]>([]);
  const [videos, setVideos] = useState<VideoInstitucional[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<VideoInstitucional[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState<string>('all');
  
  const [selectedVideo, setSelectedVideo] = useState<VideoInstitucional | null>(null);
  const [colors, setColors] = useState({
    primario: '#6AA942',
    secundario: '#235F35',
    terciario: '#000000'
  });
  
  // 🔹 Referencias para animaciones
  const heroRef = useRef<HTMLDivElement>(null);
  const videosRef = useRef<HTMLDivElement>(null);
  
  // 🔹 Scroll animations
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  const isHeroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const isVideosInView = useInView(videosRef, { once: true, margin: '-100px' });

  // 🔹 Cargar datos DESDE institucionesPrincipal (CORREGIDO)
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔹 Cargando videos desde institucionesPrincipal...');
        
        // 🔹 Cargar institución (incluye videos si existen)
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
        
        // Cargar portadas desde contenido (necesario para el hero)
        const contResponse = await api.getContenido();
        if (contResponse.portada && contResponse.portada.length > 0) {
          setPortadas(contResponse.portada);
          console.log('✅ Portadas cargadas:', contResponse.portada.length);
        }
        
        // 🔹 CONSTRUIR ARRAY DE VIDEOS DESDE LA INSTITUCIÓN
        const videosArray: VideoInstitucional[] = [];
        
        // 1. Si existe el campo institucion_videos (array), agregarlo
        if (institucion.institucion_videos && Array.isArray(institucion.institucion_videos)) {
          const videosActivos = institucion.institucion_videos.filter(
            (v: VideoInstitucional) => v.video_estado === 1
          );
          videosArray.push(...videosActivos);
          console.log('✅ Videos desde institucion_videos:', videosActivos.length);
        }
        
        // 2. Si existe institucion_link_video_vision (video único), agregarlo como primer video
        if (institucion.institucion_link_video_vision) {
          videosArray.unshift({
            video_id: 0,
            video_enlace: institucion.institucion_link_video_vision,
            video_titulo: "Nuestra Visión",
            video_breve_descripcion: "<p>Conoce la visión de la carrera de Ciencias del Desarrollo</p>",
            video_estado: 1,
            video_tipo: "Institucional"
          });
          console.log('✅ Video de visión agregado');
        }
        
        // 3. Establecer videos
        if (videosArray.length > 0) {
          setVideos(videosArray);
          setFilteredVideos(videosArray);
          console.log('✅ Total videos cargados:', videosArray.length);
        }
        
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 🔹 Filtrar por búsqueda y tipo
  useEffect(() => {
    let filtered = videos;
    
    if (selectedTipo !== 'all') {
      filtered = filtered.filter(v => v.video_tipo?.toLowerCase() === selectedTipo.toLowerCase());
    }
    
    if (searchTerm) {
      filtered = filtered.filter(v => 
        v.video_titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.video_breve_descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.video_tipo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredVideos(filtered);
  }, [searchTerm, selectedTipo, videos]);

  // 🔹 Slider de portadas
  useEffect(() => {
    if (portadas.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % portadas.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [portadas.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % portadas.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + portadas.length) % portadas.length);

  // 🔹 Obtener tipos únicos para filtros
  const getUniqueTypes = () => {
    const types = new Set(videos.map(v => v.video_tipo));
    return Array.from(types).filter(Boolean);
  };

  // 🔹 Abrir modal
  const openModal = (video: VideoInstitucional) => {
    setSelectedVideo(video);
    document.body.style.overflow = 'hidden';
  };

  // 🔹 Cerrar modal
  const closeModal = () => {
    setSelectedVideo(null);
    document.body.style.overflow = 'auto';
  };

  // 🔹 Cerrar con tecla ESC
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
          <p className="text-muted-foreground font-medium">Cargando videos...</p>
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
        
        {/* ===== HERO SECTION ===== */}
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

              {/* 🔹 TÍTULO - NOMBRE DE LA CARRERA DESDE API */}
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

              {/* 🔹 SUBTÍTULO - SLOGAN DESDE API */}
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.5 }} 
                className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl drop-shadow-md font-medium px-4"
              >
                {institucionData?.institucion_slogan || 'Universidad Pública de El Alto - UPEA'}
              </motion.p>

              {/* 🔹 CORREO DE LA CARRERA - DESDE API */}
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

        {/* ===== CONTENIDO - VIDEOS ===== */}
        <motion.main 
          ref={videosRef}
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
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">Videos Institucionales</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Conoce más sobre nuestra carrera a través de nuestros videos institucionales de <span className="font-semibold" style={{ color: colors.primario }}>{institucionData?.institucion_nombre || 'Ciencias del Desarrollo'}</span>
            </p>
            <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] mx-auto mt-4 rounded-full"></div>
          </motion.div>

          {/* Buscador con animación */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative max-w-xl mx-auto mb-8"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <motion.input 
              type="text"
              placeholder="Buscar videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              whileFocus={{ scale: 1.02, boxShadow: '0 0 0 3px rgba(106, 169, 66, 0.2)' }}
              className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)] bg-white/50 backdrop-blur-sm"
            />
          </motion.div>

          {/* Filtros con animación */}
          {getUniqueTypes().length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-2 mb-12"
            >
              {['all', ...getUniqueTypes()].map((tipo) => (
                <motion.button
                  key={tipo}
                  onClick={() => setSelectedTipo(tipo)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedTipo === tipo 
                      ? 'bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] text-white shadow-lg' 
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {tipo === 'all' ? 'Todos' : tipo}
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* Grid de Videos */}
          {filteredVideos.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {filteredVideos.map((video, index) => {
                const videoId = getYouTubeId(video.video_enlace);
                const thumbnailUrl = videoId ? getYouTubeThumbnail(videoId) : '';
                
                return (
                  <motion.div 
                    key={video.video_id} 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(106, 169, 66, 0.15)' }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer"
                    onClick={() => openModal(video)}
                  >
                    {/* Thumbnail del video */}
                    <div className="relative h-56 overflow-hidden bg-black group-hover:scale-105 transition-transform duration-300">
                      {thumbnailUrl ? (
                        <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.6 }}>
                          <Image 
                            src={thumbnailUrl} 
                            alt={video.video_titulo} 
                            fill 
                            className="object-cover transition-transform duration-700"
                            onError={(e) => {
                              console.error('❌ Error cargando thumbnail:', thumbnailUrl);
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </motion.div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <Youtube className="w-16 h-16 text-white/50" />
                        </div>
                      )}
                      
                      {/* Overlay con botón de play */}
                      <motion.div 
                        className="absolute inset-0 bg-black/40 hover:bg-black/50 transition-opacity flex items-center justify-center cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                      >
                        <motion.div 
                          className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: colors.primario }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </motion.div>
                      </motion.div>
                      
                      {/* Botón "Mirar en YouTube" */}
                      <motion.a 
                        href={video.video_enlace} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-black/80 text-white text-sm font-medium rounded-lg hover:bg-black/90 transition opacity-0 group-hover:opacity-100"
                        whileHover={{ scale: 1.05 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Youtube className="w-4 h-4" />
                        Mirar en YouTube
                      </motion.a>
                    </div>

                    <div className="p-6">
                      {video.video_tipo && (
                        <motion.span 
                          className="inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3"
                          style={{ backgroundColor: `${colors.primario}15`, color: colors.primario }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {video.video_tipo}
                        </motion.span>
                      )}
                      
                      <motion.h3 
                        className="text-xl font-bold text-foreground mb-3 line-clamp-2 group-hover:text-[var(--color-primario)] transition-colors font-forte"
                        whileHover={{ x: 5 }}
                      >
                        {video.video_titulo}
                      </motion.h3>
                      
                      {video.video_breve_descripcion && (
                        <motion.div 
                          className="text-sm text-muted-foreground line-clamp-3 font-forte"
                          dangerouslySetInnerHTML={{ __html: video.video_breve_descripcion }}
                        />
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
                <Youtube className="w-full h-full" />
              </motion.div>
              <p className="text-muted-foreground text-lg font-forte">
                {searchTerm ? 'No se encontraron videos.' : 'No hay videos disponibles en este momento.'}
              </p>
            </motion.div>
          )}

          {/* Botón de acción */}
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

        {/* ===== MODAL PARA VER VIDEO ===== */}
        <AnimatePresence>
          {selectedVideo && (
            <motion.div 
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
            >
              <motion.div 
                className="relative bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Botón cerrar */}
                <motion.button 
                  onClick={closeModal} 
                  className="absolute -top-12 right-0 z-10 p-2 bg-white/20 rounded-full hover:bg-white/30 transition shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6 text-white" />
                </motion.button>

                {/* Reproductor de video */}
                <motion.div 
                  className="relative aspect-video bg-black"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <iframe
                    src={selectedVideo.video_enlace}
                    title={selectedVideo.video_titulo}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </motion.div>

                {/* Información */}
                <div className="p-6 md:p-8">
                  {selectedVideo.video_tipo && (
                    <motion.span 
                      className="inline-block px-4 py-2 text-sm font-semibold rounded-full mb-4"
                      style={{ backgroundColor: `${colors.primario}15`, color: colors.primario }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      {selectedVideo.video_tipo}
                    </motion.span>
                  )}
                  
                  <motion.h2 
                    className="text-2xl md:text-3xl font-bold text-foreground mb-4 font-forte"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {selectedVideo.video_titulo}
                  </motion.h2>
                  
                  {selectedVideo.video_breve_descripcion && (
                    <motion.div 
                      className="prose prose-sm md:prose-base max-w-none text-muted-foreground font-forte"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      dangerouslySetInnerHTML={{ __html: selectedVideo.video_breve_descripcion }}
                    />
                  )}
                  
                  {/* Botones de acción */}
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-4 mt-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <motion.a
                      href={selectedVideo.video_enlace}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
                      style={{ backgroundColor: colors.secundario }}
                    >
                      <Youtube className="w-5 h-5" /> Ver en YouTube
                    </motion.a>
                    <motion.button 
                      onClick={closeModal}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-muted text-foreground font-semibold rounded-xl hover:bg-muted/80 transition"
                    >
                      <X className="w-5 h-5" /> Cerrar
                    </motion.button>
                  </motion.div>
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