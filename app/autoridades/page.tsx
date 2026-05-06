'use client';

import Footer from '@/components/Footer';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Award, ChevronLeft, ChevronRight, Facebook, Twitter, Phone, MapPin, Mail, Sparkles } from 'lucide-react';
import { api, getDirectUrl, type InstitucionData } from '@/lib/api';
import FloatingParticles from '@/components/FloatingParticles';

// 🔹 Tipos
interface Portada {
  portada_id: number;
  portada_imagen: string;
  portada_titulo: string;
  portada_subtitulo: string;
}

interface Autoridad {
  id_autoridad: number;
  foto_autoridad: string;
  nombre_autoridad: string;
  cargo_autoridad: string;
  facebook_autoridad: string;
  celular_autoridad: string;
  twiter_autoridad: string;
}

export default function AutoridadesPage() {
  const [institucionData, setInstitucionData] = useState<InstitucionData | null>(null);
  const [portadas, setPortadas] = useState<Portada[]>([]);
  const [autoridades, setAutoridades] = useState<Autoridad[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState({
    primario: '#6AA942',
    secundario: '#235F35',
    terciario: '#000000'
  });

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.7]);

  // 🔹 Cargar datos desde API
  useEffect(() => {
    const loadData = async () => {
      try {
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
        
        if (contResponse.portada && contResponse.portada.length > 0) {
          setPortadas(contResponse.portada);
        }
        
        if (contResponse.autoridad && contResponse.autoridad.length > 0) {
          setAutoridades(contResponse.autoridad);
        }
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Auto-play slider
  useEffect(() => {
    if (portadas.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % portadas.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [portadas.length]);

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
          <p className="text-muted-foreground font-medium">Cargando autoridades...</p>
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
        
        {/* ===== HERO SECTION - CON NOMBRE DE CARRERA DESDE API ===== */}
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

        {/* ===== AUTORIDADES SECTION - DISEÑO 3D ===== */}
        <main className="relative py-20 overflow-hidden bg-gradient-to-b from-white to-gray-50">
          {/* Elementos decorativos 3D de fondo */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <motion.div 
              className="absolute top-20 left-10 w-32 h-32 rounded-full"
              style={{ background: `radial-gradient(circle, ${colors.primario}40, transparent)` }}
              animate={{ scale: [1, 1.3, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div 
              className="absolute bottom-20 right-10 w-24 h-24 rounded-full"
              style={{ background: `radial-gradient(circle, ${colors.secundario}40, transparent)` }}
              animate={{ scale: [1.3, 1, 1.3], rotate: [360, 180, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            
            {/* Título de sección */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="inline-block mb-4"
              >
                <Award className="w-12 h-12" style={{ color: colors.primario }} />
              </motion.div>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Nuestras Autoridades
              </h2>
              <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                Conoce a las autoridades que dirigen la Carrera de <span className="font-semibold" style={{ color: colors.primario }}>{institucionData?.institucion_nombre || 'Ciencias del Desarrollo'}</span>
              </p>
              <div className="w-20 h-1 bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] mx-auto mt-4 rounded-full"></div>
            </motion.div>

            {/* Grid de Autoridades 3D */}
            {autoridades.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {autoridades.map((autoridad, index) => (
                  <motion.div 
                    key={autoridad.id_autoridad}
                    initial={{ opacity: 0, y: 40, rotateX: -15 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6, delay: index * 0.1, type: 'spring' }}
                    whileHover={{ 
                      y: -12, 
                      rotateY: 5, 
                      rotateX: 5,
                      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                    style={{ 
                      transformStyle: 'preserve-3d',
                      perspective: '1000px'
                    }}
                  >
                    {/* Efecto de brillo 3D en hover */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    {/* Imagen con efecto 3D */}
                    <div className="relative h-72 overflow-hidden">
                      <motion.div
                        className="absolute inset-0"
                        whileHover={{ scale: 1.1, rotate: 2 }}
                        transition={{ duration: 0.4 }}
                      >
                        <Image
                          src={getDirectUrl(autoridad.foto_autoridad)}
                          alt={autoridad.nombre_autoridad}
                          fill
                          className="object-cover object-top"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop';
                          }}
                        />
                      </motion.div>
                      
                      {/* Overlay degradado */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      
                      {/* Badge de cargo flotante */}
                      <motion.div 
                        className="absolute bottom-4 left-4 right-4 px-4 py-2 rounded-lg backdrop-blur-sm"
                        style={{ backgroundColor: `${colors.primario}cc` }}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        <span className="text-white text-sm font-semibold flex items-center gap-2">
                          <Award className="w-4 h-4" />
                          {autoridad.cargo_autoridad}
                        </span>
                      </motion.div>
                    </div>

                    {/* Contenido de la tarjeta */}
                    <div className="p-6">
                      {/* Nombre con efecto 3D */}
                      <motion.h3 
                        className="text-xl font-bold text-gray-900 mb-4 text-center"
                        style={{ 
                          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transform: 'translateZ(20px)'
                        }}
                      >
                        {autoridad.nombre_autoridad}
                      </motion.h3>

                      {/* Redes sociales con animación 3D */}
                      <div className="flex justify-center gap-3 pt-4 border-t border-gray-100">
                        {autoridad.facebook_autoridad && (
                          <motion.a
                            href={autoridad.facebook_autoridad}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.2, rotate: 5, y: -3 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#1877F2] transition-colors group"
                            title="Facebook"
                          >
                            <Facebook className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                          </motion.a>
                        )}
                        
                        {autoridad.twiter_autoridad && (
                          <motion.a
                            href={autoridad.twiter_autoridad}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.2, rotate: -5, y: -3 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[#1DA1F2] transition-colors group"
                            title="Twitter"
                          >
                            <Twitter className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                          </motion.a>
                        )}
                        
                        {autoridad.celular_autoridad && autoridad.celular_autoridad !== '2147483647' && (
                          <motion.a
                            href={`tel:${autoridad.celular_autoridad}`}
                            whileHover={{ scale: 1.2, rotate: 5, y: -3 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-[var(--color-primario)] transition-colors group"
                            title="Teléfono"
                          >
                            <Phone className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                          </motion.a>
                        )}
                      </div>
                    </div>

                    {/* Borde animado en hover */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[var(--color-primario)] transition-colors duration-300 pointer-events-none" />
                  </motion.div>
                ))}
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
                  <Award className="w-10 h-10 text-gray-400" />
                </motion.div>
                <p className="text-muted-foreground text-lg">No hay autoridades registradas.</p>
              </motion.div>
            )}

            {/* ===== CONTACTO INSTITUCIONAL ===== */}
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-[var(--color-primario)]/5 to-[var(--color-secundario)]/5 rounded-2xl p-8 md:p-12 mb-16 relative overflow-hidden"
            >
              {/* Decoración 3D de fondo */}
              <motion.div 
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-20"
                style={{ background: colors.primario }}
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              />
              
              <h3 className="text-2xl font-bold text-foreground mb-8 text-center relative z-10">Contacto Institucional</h3>
              
              <div className="grid md:grid-cols-3 gap-6 relative z-10">
                {institucionData?.institucion_direccion && (
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <motion.div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md"
                      style={{ backgroundColor: colors.primario }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <MapPin className="w-6 h-6 text-white" />
                    </motion.div>
                    <h4 className="font-semibold text-foreground mb-2">Dirección</h4>
                    <p className="text-muted-foreground text-sm">{institucionData.institucion_direccion}</p>
                  </motion.div>
                )}

                {institucionData?.institucion_correo1 && (
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <motion.div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md"
                      style={{ backgroundColor: colors.secundario }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Mail className="w-6 h-6 text-white" />
                    </motion.div>
                    <h4 className="font-semibold text-foreground mb-2">Email</h4>
                    <a href={`mailto:${institucionData.institucion_correo1}`} className="text-[var(--color-primario)] hover:underline text-sm font-medium">
                      {institucionData.institucion_correo1}
                    </a>
                  </motion.div>
                )}

                {institucionData?.institucion_celular1 && institucionData.institucion_celular1 !== 2147483647 && (
                  <motion.div 
                    whileHover={{ y: -5, scale: 1.02 }}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all"
                  >
                    <motion.div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md"
                      style={{ backgroundColor: colors.terciario }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Phone className="w-6 h-6 text-white" />
                    </motion.div>
                    <h4 className="font-semibold text-foreground mb-2">Teléfono</h4>
                    <a href={`tel:${institucionData.institucion_celular1}`} className="text-[var(--color-primario)] hover:underline text-sm font-medium">
                      {institucionData.institucion_celular1}
                    </a>
                  </motion.div>
                )}
              </div>
            </motion.section>

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
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Solicitar Información
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </motion.button>
              </Link>
            </motion.div>

          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}