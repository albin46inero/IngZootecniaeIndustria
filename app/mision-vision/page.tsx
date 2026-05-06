'use client';

import Footer from '@/components/Footer';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Award, Target, Eye, ChevronLeft, ChevronRight, Sparkles, Mail, MapPin, Phone, Calendar, Users, GraduationCap, AlertCircle } from 'lucide-react';
import { api, getDirectUrl, type InstitucionData } from '@/lib/api';
import FloatingParticles from '@/components/FloatingParticles';

// Tipo para la portada
interface Portada {
  portada_id: number;
  portada_imagen: string;
  portada_titulo: string;
  portada_subtitulo: string;
}

export default function MisionVisionPage() {
  const [institucionData, setInstitucionData] = useState<InstitucionData | null>(null);
  const [portadas, setPortadas] = useState<Portada[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState({
    primario: '#6AA942',
    secundario: '#235F35',
    terciario: '#000000'
  });
  
  // 🔹 Estado para rastrear imagen de portada rota
  const [heroImageBroken, setHeroImageBroken] = useState(false);
  
  // 🔹 Referencias para animaciones
  const heroRef = useRef<HTMLDivElement>(null);
  const contenidoRef = useRef<HTMLDivElement>(null);
  
  // 🔹 Scroll animations
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  const isHeroInView = useInView(heroRef, { once: true, margin: '-100px' });
  const isContenidoInView = useInView(contenidoRef, { once: true, margin: '-100px' });

  // 🔹 Cargar datos desde la API
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔹 Cargando misión y visión...');
        
        // Cargar institución (misión, visión, objetivos)
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
        
        // Cargar portadas desde contenido
        const contResponse = await api.getContenido();
        console.log('🔹 Portadas desde API:', contResponse.portada);
        
        if (contResponse.portada && contResponse.portada.length > 0) {
          setPortadas(contResponse.portada);
          console.log('✅ Portadas cargadas:', contResponse.portada.length);
        }
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        setPortadas([
          {
            portada_id: 0,
            portada_imagen: 'default.jpg',
            portada_titulo: 'Misión y Visión',
            portada_subtitulo: 'Ciencias del Desarrollo - UPEA'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 🔹 Auto-rotación del slider
  useEffect(() => {
    if (portadas.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % portadas.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [portadas.length]);

  // 🔹 Navegación manual
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % portadas.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + portadas.length) % portadas.length);

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
          <p className="text-muted-foreground font-medium">Cargando...</p>
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
                      console.error('❌ Error cargando imagen del hero:', heroImageUrl);
                      setHeroImageBroken(true);
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
        <motion.main 
          ref={contenidoRef}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
        >
          {/* Misión y Visión - Grid con animaciones */}
          <motion.section 
            className="grid md:grid-cols-2 gap-8 mb-16"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: { staggerChildren: 0.2 }
              }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {/* Misión */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              <div className="p-8">
                <motion.div 
                  className="flex items-center gap-4 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${colors.primario}15` }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Target className="w-7 h-7" style={{ color: colors.primario }} />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-foreground font-forte">Misión</h2>
                </motion.div>
                <motion.div 
                  className="prose prose-lg max-w-none text-muted-foreground font-forte"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  dangerouslySetInnerHTML={{ 
                    __html: institucionData?.institucion_mision || '<p>Información no disponible</p>' 
                  }}
                />
              </div>
            </motion.div>

            {/* Visión */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
            >
              <div className="p-8">
                <motion.div 
                  className="flex items-center gap-4 mb-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${colors.secundario}15` }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Eye className="w-7 h-7" style={{ color: colors.secundario }} />
                  </motion.div>
                  <h2 className="text-3xl font-bold text-foreground font-forte">Visión</h2>
                </motion.div>
                <motion.div 
                  className="prose prose-lg max-w-none text-muted-foreground font-forte"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  dangerouslySetInnerHTML={{ 
                    __html: institucionData?.institucion_vision || '<p>Información no disponible</p>' 
                  }}
                />
              </div>
            </motion.div>
          </motion.section>

          {/* Objetivos con animación */}
          {institucionData?.institucion_objetivos && (
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16"
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="p-8">
                  <motion.div 
                    className="flex items-center gap-4 mb-6"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${colors.terciario}15` }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Award className="w-7 h-7" style={{ color: colors.terciario }} />
                    </motion.div>
                    <h2 className="text-3xl font-bold text-foreground font-forte">Objetivos</h2>
                  </motion.div>
                  <motion.div 
                    className="prose prose-lg max-w-none text-muted-foreground font-forte"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    dangerouslySetInnerHTML={{ 
                      __html: institucionData.institucion_objetivos 
                    }}
                  />
                </div>
              </div>
            </motion.section>
          )}

          {/* Información Adicional con animación */}
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 md:p-12 mb-16 shadow-lg"
          >
            <motion.h2 
              className="text-2xl font-bold text-foreground mb-8 text-center font-forte"
              whileHover={{ scale: 1.02 }}
            >
              Información de la Carrera
            </motion.h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {/* Nombre */}
              {institucionData?.institucion_nombre && (
                <motion.div 
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ x: 5, scale: 1.02 }}
                >
                  <motion.div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${colors.primario}15` }}
                    whileHover={{ rotate: 10 }}
                  >
                    <Award className="w-5 h-5" style={{ color: colors.primario }} />
                  </motion.div>
                  <h4 className="font-semibold text-foreground mb-2 font-forte">Carrera</h4>
                  <p className="text-muted-foreground text-sm font-forte">{institucionData.institucion_nombre}</p>
                </motion.div>
              )}

              {/* Iniciales */}
              {institucionData?.institucion_iniciales && (
                <motion.div 
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ x: 5, scale: 1.02 }}
                >
                  <motion.div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${colors.secundario}15` }}
                    whileHover={{ rotate: -10 }}
                  >
                    <Target className="w-5 h-5" style={{ color: colors.secundario }} />
                  </motion.div>
                  <h4 className="font-semibold text-foreground mb-2 font-forte">Siglas</h4>
                  <p className="text-muted-foreground text-sm font-forte">{institucionData.institucion_iniciales}</p>
                </motion.div>
              )}

              {/* Dirección */}
              {institucionData?.institucion_direccion && (
                <motion.div 
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ x: 5, scale: 1.02 }}
                >
                  <motion.div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${colors.terciario}15` }}
                    whileHover={{ y: -3 }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: colors.terciario }} />
                  </motion.div>
                  <h4 className="font-semibold text-foreground mb-2 font-forte">Ubicación</h4>
                  <p className="text-muted-foreground text-sm font-forte">{institucionData.institucion_direccion}</p>
                </motion.div>
              )}

              {/* Email */}
              {institucionData?.institucion_correo1 && (
                <motion.div 
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ x: 5, scale: 1.02 }}
                >
                  <motion.div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${colors.primario}15` }}
                    whileHover={{ rotate: 15 }}
                  >
                    <Mail className="w-5 h-5" style={{ color: colors.primario }} />
                  </motion.div>
                  <h4 className="font-semibold text-foreground mb-2 font-forte">Correo</h4>
                  <a href={`mailto:${institucionData.institucion_correo1}`} className="hover:underline font-medium font-forte" style={{ color: colors.primario }}>
                    {institucionData.institucion_correo1}
                  </a>
                </motion.div>
              )}

              {/* Teléfono */}
              {institucionData?.institucion_celular1 && institucionData.institucion_celular1 !== 2147483647 && (
                <motion.div 
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                  whileHover={{ x: 5, scale: 1.02 }}
                >
                  <motion.div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${colors.secundario}15` }}
                    whileHover={{ rotate: -15 }}
                  >
                    <Phone className="w-5 h-5" style={{ color: colors.secundario }} />
                  </motion.div>
                  <h4 className="font-semibold text-foreground mb-2 font-forte">Teléfono</h4>
                  <a href={`tel:${institucionData.institucion_celular1}`} className="hover:underline font-medium font-forte" style={{ color: colors.primario }}>
                    {institucionData.institucion_celular1}
                  </a>
                </motion.div>
              )}
            </div>
          </motion.section>

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