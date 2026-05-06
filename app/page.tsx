'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Menu, X, ArrowRight, CheckCircle, Users, Briefcase, Globe, ChevronLeft, ChevronRight, Play, MapPin, Phone, Mail, Sparkles, Download } from 'lucide-react';
import { api, getAssetUrl, getDirectUrl, type Portada } from '@/lib/api';
import Footer from '@/components/Footer';
import FloatingParticles from '@/components/FloatingParticles';

// 🔹 Helper para extraer ID de YouTube
function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const embedMatch = url.match(/youtube\.com\/embed\/([^&?/]+)/);
  if (embedMatch) return embedMatch[1];
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch) return shortMatch[1];
  return null;
}

export default function Home() {
  // Estados principales
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [portadas, setPortadas] = useState<Portada[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingPortada, setLoadingPortada] = useState(true);
  const [institucionData, setInstitucionData] = useState<any>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [publicaciones, setPublicaciones] = useState<any[]>([]);
  const [loadingPublicaciones, setLoadingPublicaciones] = useState(true);
  
  // Estados para modales
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedPublicacion, setSelectedPublicacion] = useState<any>(null);
  
  const [colors, setColors] = useState({
    primario: '#6AA942',
    secundario: '#235F35',
    terciario: '#000000'
  });

  const heroRef = useRef(null);
  const programaRef = useRef(null);
  const videosRef = useRef(null);
  const publicacionesRef = useRef(null);
  const contactoRef = useRef(null);

  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.7]);
  
  const isHeroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const isProgramaInView = useInView(programaRef, { once: true, margin: '-100px' });
  const isVideosInView = useInView(videosRef, { once: true, margin: '-100px' });
  const isPublicacionesInView = useInView(publicacionesRef, { once: true, margin: '-100px' });
  const isContactoInView = useInView(contactoRef, { once: true, margin: '-100px' });

  // Funciones para modales
  const openImageModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    setImageModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage('');
  };

  const openPublicacionModal = (pub: any) => {
    setSelectedPublicacion(pub);
  };

  const closePublicacionModal = () => {
    setSelectedPublicacion(null);
  };

  // Cargar institución
  useEffect(() => {
    const loadInstitucion = async () => {
      try {
        const response = await api.getInstitucion();
        const institucion = response.Descripcion;
        setInstitucionData(institucion);
        
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
      } catch (error) {
        console.error('❌ Error al cargar institución:', error);
      }
    };
    loadInstitucion();
  }, []);

  // Cargar videos
  useEffect(() => {
    if (!institucionData) return;
    
    const loadVideos = () => {
      try {
        setLoadingVideos(true);
        const videosData: any[] = [];
        
        Object.keys(institucionData).forEach(key => {
          if (key.startsWith('institucion_link_video_') && institucionData[key]) {
            const videoUrl = institucionData[key];
            const videoType = key.replace('institucion_link_video_', '');
            const youtubeId = extractYouTubeId(videoUrl);
            
            videosData.push({
              video_id: videosData.length + 1,
              video_titulo: `${videoType.charAt(0).toUpperCase() + videoType.slice(1)} - ${institucionData.institucion_nombre || 'Ciencias del Desarrollo'}`,
              video_enlace: videoUrl,
              video_imagen: youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null,
              video_breve_descripcion: institucionData.institucion_slogan || `Video sobre ${videoType}`,
              video_fecha: new Date().toISOString(),
              video_tipo: videoType.charAt(0).toUpperCase() + videoType.slice(1)
            });
          }
        });
        
        setVideos(videosData);
        console.log('✅ Videos cargados:', videosData.length);
      } catch (error) {
        console.error('❌ Error al cargar videos:', error);
        setVideos([]);
      } finally {
        setLoadingVideos(false);
      }
    };
    
    loadVideos();
  }, [institucionData]);

  // Cargar publicaciones
  useEffect(() => {
    const loadPublicaciones = async () => {
      try {
        setLoadingPublicaciones(true);
        const recursosRes = await api.getRecursos();
        
        let publicacionesData: any[] = [];
        
        if (recursosRes?.upea_publicaciones && Array.isArray(recursosRes.upea_publicaciones)) {
          publicacionesData = recursosRes.upea_publicaciones
            .filter((p: any) => p.publicaciones_estado === 1 || p.publicaciones_estado === '1' || !p.publicaciones_estado)
            .map((p: any) => ({
              ...p,
              publicaciones_imagen_url: p.publicaciones_imagen 
                ? getDirectUrl(p.publicaciones_imagen)
                : null
            }));
        }
        
        setPublicaciones(publicacionesData);
        console.log('✅ Publicaciones cargadas:', publicacionesData.length);
      } catch (error) {
        console.error('❌ Error al cargar publicaciones:', error);
        setPublicaciones([]);
      } finally {
        setLoadingPublicaciones(false);
      }
    };
    
    loadPublicaciones();
  }, []);

  // Cargar portadas
  useEffect(() => {
    const loadPortadas = async () => {
      try {
        const response = await api.getContenido();
        if (response.portada && response.portada.length > 0) {
          setPortadas(response.portada);
        } else {
          setPortadas([{
            portada_id: 0,
            portada_imagen: 'default-hero.jpg',
            portada_titulo: 'Ciencias del Desarrollo',
            portada_subtitulo: 'Universidad Pública de El Alto - UPEA'
          }]);
        }
      } catch (error) {
        console.error('❌ Error al cargar portadas:', error);
        setPortadas([{
          portada_id: 0,
          portada_imagen: 'default-hero.jpg',
          portada_titulo: 'Ciencias del Desarrollo',
          portada_subtitulo: 'Universidad Pública de El Alto - UPEA'
        }]);
      } finally {
        setLoadingPortada(false);
      }
    };
    loadPortadas();
  }, []);

  // Auto-play slider
  useEffect(() => {
    if (portadas.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % portadas.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [portadas.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % portadas.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + portadas.length) % portadas.length);

  const currentPortada = portadas[currentSlide];
  const heroImageUrl = currentPortada?.portada_imagen || 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&h=1080&fit=crop';

  return (
    <>
      {/* ✅ FUENTE FORTE - con fallback si no existe */}
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

      <div className="min-h-screen bg-background text-foreground overflow-x-hidden font-forte">
        
        {/* ===== HERO SECTION ===== */}
        <motion.section 
          ref={heroRef}
          id="inicio" 
          className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
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
          
          <div className="absolute inset-0 z-0">
            <motion.div
              key={currentPortada?.portada_id}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2 }}
            >
              <motion.div style={{ y: heroY, opacity: heroOpacity }} className="absolute inset-0">
                <Image
                  src={heroImageUrl}
                  alt={currentPortada?.portada_titulo || 'Hero'}
                  fill
                  className="object-cover object-center mix-blend-overlay"
                  priority
                  quality={75}
                  sizes="100vw"
                />
              </motion.div>
            </motion.div>
          </div>

          <FloatingParticles count={15} className="z-0" />

          {portadas.length > 1 && (
            <>
              <motion.button onClick={prevSlide} whileHover={{ scale: 1.2 }} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 rounded-full text-white backdrop-blur-sm">
                <ChevronLeft size={24} />
              </motion.button>
              <motion.button onClick={nextSlide} whileHover={{ scale: 1.2 }} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 rounded-full text-white backdrop-blur-sm">
                <ChevronRight size={24} />
              </motion.button>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {portadas.map((_, index) => (
                  <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'}`} />
                ))}
              </div>
            </>
          )}

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 w-full">
            <div className="flex flex-col items-center justify-center text-center gap-8">
              {loadingPortada || !institucionData ? (
                <div className="animate-pulse">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/20 rounded-full mb-6 mx-auto"></div>
                  <div className="h-12 sm:h-16 bg-white/20 rounded w-3/4 mb-4 mx-auto"></div>
                </div>
              ) : (
                <>
                  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: 'spring' }} className="relative">
                    {institucionData.institucion_logo ? (
                      <motion.div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white/30" animate={{ rotateY: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} style={{ transformStyle: 'preserve-3d' }}>
                        <Image src={getDirectUrl(institucionData.institucion_logo)} alt={institucionData.institucion_nombre || 'Logo'} fill className="object-cover" style={{ backfaceVisibility: 'hidden' }} />
                      </motion.div>
                    ) : (
                      <motion.div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-white to-gray-200 flex items-center justify-center shadow-2xl border-4 border-white/30" animate={{ rotateY: 360 }} transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                        <span className="text-3xl sm:text-4xl font-bold text-gray-800">{institucionData.institucion_iniciales || 'CD'}</span>
                      </motion.div>
                    )}
                  </motion.div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="px-4">
                    <motion.h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white whitespace-nowrap" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }} animate={{ opacity: [1, 0.3, 1], filter: ['blur(0px)', 'blur(2px)', 'blur(0px)'] }} transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}>
                      {institucionData.institucion_nombre || 'CIENCIAS DEL DESARROLLO'}
                    </motion.h1>
                  </motion.div>

                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-base sm:text-lg md:text-xl text-white/90 max-w-2xl drop-shadow-md font-medium px-4">
                    {institucionData.institucion_slogan || 'Universidad Pública de El Alto - UPEA'}
                  </motion.p>
                </>
              )}
            </div>
          </div>
        </motion.section>

        {/* ===== PROGRAM OVERVIEW ===== */}
        <motion.section ref={programaRef} id="programa" className="py-20 relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Un programa diseñado para el éxito</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">De la Universidad Pública de El Alto.</p>
              <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] mx-auto mt-4 rounded-full"></div>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} whileHover={{ y: -8 }} className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4" style={{ color: colors.primario }}>Misión</h3>
                <div className="text-gray-600 text-sm lg:text-base leading-relaxed overflow-y-auto max-h-[280px] pr-2 scrollbar-thin" dangerouslySetInnerHTML={{ __html: institucionData?.institucion_mision || '<p>Somos una carrera con identidad propia que forma profesionales en Ciencias del Desarrollo.</p>' }} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} whileHover={{ y: -8 }} className="bg-white rounded-2xl p-6 lg:p-8 shadow-xl hover:shadow-2xl transition-all border-2 relative overflow-hidden" style={{ borderColor: colors.secundario }}>
                <div className="absolute top-0 right-0 w-20 h-20 opacity-10" style={{ backgroundColor: colors.secundario, borderRadius: '0 0 0 100%' }}></div>
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4" style={{ color: colors.secundario }}>Visión</h3>
                <div className="text-gray-600 text-sm lg:text-base leading-relaxed overflow-y-auto max-h-[280px] pr-2 scrollbar-thin" dangerouslySetInnerHTML={{ __html: institucionData?.institucion_vision || '<p>La carrera Ciencias del Desarrollo es una comunidad académica profesional.</p>' }} />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} whileHover={{ y: -8 }} className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg hover:shadow-2xl transition-all border border-gray-100">
                <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4" style={{ color: colors.terciario }}>Objetivos</h3>
                <div className="text-gray-600 text-sm lg:text-base leading-relaxed overflow-y-auto max-h-[280px] pr-2 scrollbar-thin" dangerouslySetInnerHTML={{ __html: institucionData?.institucion_objetivos || '<p>Mejorar la forma sostenible las condiciones de la calidad de vida.</p>' }} />
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ===== SOBRE NOSOTROS ===== */}
        <motion.section className="py-20 relative overflow-hidden bg-gradient-to-br from-white via-gray-50 to-white">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--color-primario)]/5 to-[var(--color-secundario)]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[var(--color-secundario)]/5 to-[var(--color-terciario)]/5 rounded-full blur-3xl"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                <motion.div className="absolute -top-4 -right-4 z-20 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">✓ Acreditada</motion.div>
                <motion.div className="relative bg-white rounded-3xl shadow-2xl p-8 lg:p-12" whileHover={{ scale: 1.02 }}>
                  {institucionData?.institucion_logo ? (
                    <div className="relative aspect-square">
                      <Image src={getDirectUrl(institucionData.institucion_logo)} alt={institucionData.institucion_nombre || 'Logo'} fill className="object-contain" />
                    </div>
                  ) : (
                    <div className="aspect-square flex items-center justify-center">
                      <div className="text-8xl font-bold bg-gradient-to-br from-[var(--color-primario)] to-[var(--color-secundario)] bg-clip-text text-transparent">{institucionData?.institucion_iniciales || 'CD'}</div>
                    </div>
                  )}
                </motion.div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">Sobre la Carrera de <span className="bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] bg-clip-text text-transparent">{institucionData?.institucion_nombre || 'Ciencias del Desarrollo'}</span></h2>
                <div className="text-gray-700 text-base leading-relaxed space-y-4" dangerouslySetInnerHTML={{ __html: institucionData?.institucion_sobre_ins || '<p><strong>PERFIL PROFESIONAL</strong><br/>El profesional en Ciencias del Desarrollo es investigador, planificador y gestor de proyectos.</p><p><strong>CAMPO DE TRABAJO</strong><br/>• Instituciones públicas y privadas<br/>• Gobierno nacional<br/>• Ministerios<br/>• Universidades</p>' }} />
                <Link href="/plan-estudios">
                  <motion.button whileHover={{ scale: 1.05 }} className="px-8 py-4 bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] text-white font-bold rounded-xl shadow-lg inline-flex items-center gap-3">
                    Descargar Plan de Estudio <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ===== VIDEOS SECTION ===== */}
        <motion.section ref={videosRef} id="videos" className="py-20 relative overflow-hidden bg-gradient-to-b from-white to-gray-50">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--color-primario)]/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-[var(--color-secundario)]/20 to-transparent rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} className="inline-block mb-4">
                <Play className="w-10 h-10" style={{ color: colors.primario }} />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Videos de la Carrera</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Conoce más sobre <span className="font-semibold" style={{ color: colors.primario }}>{institucionData?.institucion_nombre || 'Ciencias del Desarrollo'}</span></p>
              <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] mx-auto mt-4 rounded-full"></div>
            </motion.div>

            {loadingVideos ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <motion.div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="aspect-video bg-gray-200"></div>
                    <div className="p-5">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : videos.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video: any, index: number) => (
                  <motion.div key={video.video_id || index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} whileHover={{ y: -6 }} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all group cursor-pointer">
                    <div className="relative aspect-video overflow-hidden bg-gray-900">
                      {video.video_imagen ? (
                        <Image src={video.video_imagen} alt={video.video_titulo || 'Video'} fill className="object-cover transition-transform group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900"><Play className="w-16 h-16 text-white/50" /></div>
                      )}
                      <motion.div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { if (video.video_enlace) window.open(video.video_enlace, '_blank'); }}>
                        <motion.div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl" style={{ backgroundColor: colors.primario }} whileHover={{ scale: 1.1 }}>
                          <Play className="w-6 h-6 text-white fill-white" />
                        </motion.div>
                      </motion.div>
                      {video.video_tipo && (<span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: `${colors.primario}cc` }}>{video.video_tipo}</span>)}
                    </div>
                    <div className="p-5">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2" style={{ color: colors.secundario }}>{video.video_titulo}</h3>
                      {video.video_breve_descripcion && (<p className="text-sm text-gray-600 line-clamp-2 mb-3">{video.video_breve_descripcion.replace(/<[^>]*>/g, '')}</p>)}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <span className="text-xs text-gray-500">{video.video_fecha ? new Date(video.video_fecha).toLocaleDateString('es-BO', { year: 'numeric', month: 'short' }) : ''}</span>
                        <span className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: colors.primario }}>Ver video <ArrowRight className="w-3 h-3" /></span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"><Play className="w-10 h-10 text-gray-400" /></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No hay videos disponibles</h3>
                <p className="text-gray-600 max-w-md mx-auto">Pronto subiremos contenido audiovisual sobre {institucionData?.institucion_nombre || 'la carrera'}.</p>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* ===== PUBLICACIONES SECTION ===== */}
        <motion.section ref={publicacionesRef} id="publicaciones" className="py-20 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[var(--color-primario)]/20 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-gradient-to-tr from-[var(--color-secundario)]/20 to-transparent rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <motion.div initial={{ scale: 0, rotate: -180 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }} className="inline-block mb-4">
                <Briefcase className="w-10 h-10" style={{ color: colors.primario }} />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Publicaciones y Noticias</h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">Mantente informado sobre las últimas novedades de <span className="font-semibold" style={{ color: colors.primario }}>{institucionData?.institucion_nombre || 'Ciencias del Desarrollo'}</span></p>
              <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] mx-auto mt-4 rounded-full"></div>
            </motion.div>

            {loadingPublicaciones ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <motion.div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="aspect-video bg-gray-200"></div>
                    <div className="p-5">
                      <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : publicaciones.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicaciones.slice(0, 6).map((pub: any, index: number) => (
                  <motion.article key={pub.publicaciones_id || index} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ y: -6 }} className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer flex flex-col">
                    <div className="relative aspect-video overflow-hidden bg-gray-100 cursor-zoom-in" onClick={() => pub.publicaciones_imagen_url && openImageModal(pub.publicaciones_imagen_url)}>
                      {pub.publicaciones_imagen_url ? (
                        <Image src={pub.publicaciones_imagen_url} alt={pub.publicaciones_titulo || 'Publicación'} fill className="object-cover transition-transform duration-500 group-hover:scale-105" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/640x360?text=Publicación'; }} />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300"><Briefcase className="w-16 h-16 text-gray-400" /></div>
                      )}
                      
                      {pub.publicaciones_imagen_url && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                            <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" /></svg>
                          </div>
                        </div>
                      )}
                      
                      {pub.publicaciones_tipo && (<span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm text-white" style={{ backgroundColor: `${colors.primario}cc` }}>{pub.publicaciones_tipo}</span>)}
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:transition-colors" style={{ color: colors.secundario }}>{pub.publicaciones_titulo || 'Sin título'}</h3>
                      {pub.publicaciones_descripcion && (<p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">{pub.publicaciones_descripcion.replace(/<[^>]*>/g, '')}</p>)}
                      
                      <div className="pt-4 border-t border-gray-100 space-y-3">
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{pub.publicaciones_fecha ? new Date(pub.publicaciones_fecha).toLocaleDateString('es-BO', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}</span>
                          {pub.publicaciones_autor && pub.publicaciones_autor !== '0' && (<span>Por: {pub.publicaciones_autor}</span>)}
                        </div>
                        
                        <div className="flex gap-2">
                          <motion.button onClick={(e) => { e.stopPropagation(); openPublicacionModal(pub); }} className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: `${colors.primario}15`, color: colors.primario }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            Leer más <ArrowRight className="w-4 h-4" />
                          </motion.button>
                          
                          {pub.publicaciones_documento && pub.publicaciones_documento !== '0' && (
                            <a href={`https://archivosminio.upea.bo/archivospaginasnode/documentos/${pub.publicaciones_documento}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-colors" style={{ backgroundColor: colors.primario, color: 'white' }} onClick={(e) => e.stopPropagation()}>
                              <Download className="w-4 h-4" /> PDF
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center"><Briefcase className="w-10 h-10 text-gray-400" /></div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No hay publicaciones disponibles</h3>
                <p className="text-gray-600 max-w-md mx-auto">Pronto publicaremos nuevas noticias y documentos sobre {institucionData?.institucion_nombre || 'la carrera'}.</p>
              </motion.div>
            )}
            
            {publicaciones.length > 6 && (
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-12">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="px-8 py-3 bg-white border-2 font-semibold rounded-xl shadow-md transition-all inline-flex items-center gap-2" style={{ borderColor: colors.primario, color: colors.primario }}>
                  Ver todas las publicaciones <ArrowRight className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* MODAL DE IMAGEN - SIN AnimatePresence para evitar error */}
          {imageModalOpen && selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4"
              onClick={closeImageModal}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="relative max-w-5xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <button onClick={closeImageModal} className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors p-2" aria-label="Cerrar">
                  <X className="w-8 h-8" />
                </button>
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl">
                  <Image src={selectedImage} alt="Vista ampliada" fill className="object-contain" />
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* MODAL DE DETALLES - SIN AnimatePresence para evitar error */}
          {selectedPublicacion && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              onClick={closePublicacionModal}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedPublicacion.publicaciones_imagen_url && (
                  <div className="relative aspect-video">
                    <Image src={selectedPublicacion.publicaciones_imagen_url} alt={selectedPublicacion.publicaciones_titulo || 'Publicación'} fill className="object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <button onClick={closePublicacionModal} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white flex items-center justify-center transition-colors shadow-lg" aria-label="Cerrar">
                      <X className="w-5 h-5 text-gray-800" />
                    </button>
                    {selectedPublicacion.publicaciones_tipo && (<span className="absolute bottom-4 left-4 px-4 py-1.5 text-sm font-semibold rounded-full text-white" style={{ backgroundColor: colors.primario }}>{selectedPublicacion.publicaciones_tipo}</span>)}
                  </div>
                )}
                
                <div className="p-6 lg:p-8">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4" style={{ color: colors.secundario }}>{selectedPublicacion.publicaciones_titulo || 'Sin título'}</h2>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-200">
                    {selectedPublicacion.publicaciones_fecha && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>{new Date(selectedPublicacion.publicaciones_fecha).toLocaleDateString('es-BO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}
                    {selectedPublicacion.publicaciones_autor && selectedPublicacion.publicaciones_autor !== '0' && (
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        <span>Por: {selectedPublicacion.publicaciones_autor}</span>
                      </div>
                    )}
                  </div>
                  
                  {selectedPublicacion.publicaciones_descripcion && (
                    <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: selectedPublicacion.publicaciones_descripcion }} />
                  )}
                  
                  <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200">
                    {selectedPublicacion.publicaciones_documento && selectedPublicacion.publicaciones_documento !== '0' && (
                      <a href={`https://archivosminio.upea.bo/archivospaginasnode/documentos/${selectedPublicacion.publicaciones_documento}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg transition-all" style={{ backgroundColor: colors.primario }} onClick={(e) => e.stopPropagation()}>
                        <Download className="w-5 h-5" /> Descargar PDF
                      </a>
                    )}
                    <button onClick={closePublicacionModal} className="inline-flex items-center gap-2 px-6 py-3 border-2 font-semibold rounded-xl transition-all" style={{ borderColor: colors.primario, color: colors.primario }}>Cerrar</button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.section>

      {/* ===== UBICACIÓN CON GOOGLE MAPS - PANTALLA COMPLETA ===== */}
<motion.section 
  ref={contactoRef}
  id="ubicacion" 
  className="relative w-full min-h-screen overflow-hidden"
>
  {/* Mapa de Google Maps - Fondo completo */}
  <div className="absolute inset-0 z-0">
    {institucionData?.institucion_api_google_map ? (
      <iframe
        src={institucionData.institucion_api_google_map}
        width="100%"
        height="100%"
        style={{ border: 0, filter: 'grayscale(20%) contrast(1.1) saturate(0.9)' }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Ubicación de la institución"
      />
    ) : (
      /* Fallback si no hay mapa */
      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <div className="text-center p-8">
          <MapPin className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Mapa no disponible</p>
          <p className="text-gray-500 text-sm mt-2">{institucionData?.institucion_direccion || 'Dirección no especificada'}</p>
        </div>
      </div>
    )}
    
    {/* Overlay degradado para legibilidad */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
  </div>

  {/* Contenido superpuesto */}
  <div className="relative z-10 min-h-screen flex items-center">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        
        {/* 🔹 LADO IZQUIERDO - Información de Contacto */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white/95 backdrop-blur-md rounded-3xl p-8 lg:p-10 shadow-2xl border border-white/20"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <MapPin className="w-12 h-12" style={{ color: colors.primario }} />
          </motion.div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
            Visítanos en nuestras instalaciones
          </h2>
          
          <div className="space-y-6">
            {/* Dirección */}
            {institucionData?.institucion_direccion && (
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-100"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ backgroundColor: colors.primario }}>
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-gray-900">Dirección</h4>
                  <p className="text-gray-700 leading-relaxed">{institucionData.institucion_direccion}</p>
                </div>
              </motion.div>
            )}

            {/* Teléfono */}
            {institucionData?.institucion_celular1 && institucionData.institucion_celular1 !== 2147483647 && (
              <motion.a 
                href={`tel:${institucionData.institucion_celular1}`}
                whileHover={{ x: 5 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-100 transition-colors hover:bg-gray-100/80"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ backgroundColor: colors.secundario }}>
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-gray-900">Teléfono</h4>
                  <p className="text-gray-700 hover:text-[var(--color-primario)] transition-colors font-medium">
                    {institucionData.institucion_celular1}
                  </p>
                </div>
              </motion.a>
            )}

            {/* Correo */}
            {institucionData?.institucion_correo1 && (
              <motion.a 
                href={`mailto:${institucionData.institucion_correo1}`}
                whileHover={{ x: 5 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50/80 border border-gray-100 transition-colors hover:bg-gray-100/80"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ backgroundColor: colors.terciario }}>
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold mb-1 text-gray-900">Correo electrónico</h4>
                  <p className="text-gray-700 hover:text-[var(--color-primario)] transition-colors font-medium">
                    {institucionData.institucion_correo1}
                  </p>
                </div>
              </motion.a>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-wrap gap-4 mt-8 pt-6 border-t border-gray-200">
            {institucionData?.institucion_api_google_map && (
              <motion.a
                href={`https://www.google.com/maps?q=${institucionData.institucion_direccion || ''}`}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-xl shadow-lg transition-all"
                style={{ backgroundColor: colors.primario }}
              >
                <MapPin className="w-5 h-5" />
                Cómo llegar
              </motion.a>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 border-2 font-semibold rounded-xl transition-all bg-white"
              style={{ borderColor: colors.primario, color: colors.primario }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <ArrowRight className="w-5 h-5 rotate-180" />
              Volver arriba
            </motion.button>
          </div>
        </motion.div>

        {/* 🔹 LADO DERECHO - Card informativa (opcional, se puede quitar) */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block"
        >
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
              className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: colors.primario }}
            >
              <Globe className="w-10 h-10 text-white" />
            </motion.div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {institucionData?.institucion_nombre || 'Ciencias del Desarrollo'}
            </h3>
            
            <p className="text-gray-600 leading-relaxed mb-6">
              {institucionData?.institucion_slogan || 'Universidad Pública de El Alto - UPEA'}
            </p>
            
            {/* Redes sociales */}
            <div className="flex justify-center gap-4">
              {institucionData?.institucion_facebook && (
                <motion.a
                  href={institucionData.institucion_facebook}
                  target="_blank"
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-[#1877F2] transition-colors group"
                >
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </motion.a>
              )}
              {institucionData?.institucion_youtube && (
                <motion.a
                  href={institucionData.institucion_youtube}
                  target="_blank"
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-[#FF0000] transition-colors group"
                >
                  <svg className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </motion.a>
              )}
            </div>
          </div>
        </motion.div>
        
      </div>
    </div>
  </div>

  {/* Scroll indicator */}
  <motion.div 
    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
    animate={{ y: [0, 10, 0] }}
    transition={{ repeat: Infinity, duration: 2 }}
  >
    <div className="w-8 h-12 border-2 border-white/60 rounded-full flex justify-center">
      <div className="w-1.5 h-4 bg-white/80 rounded-full mt-2"></div>
    </div>
  </motion.div>
</motion.section>

        <Footer />
      </div>
    </>
  );
}