'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Youtube, Send, ChevronLeft, ChevronRight, ArrowLeft, Sparkles } from 'lucide-react';
import { api, getDirectUrl, type InstitucionData } from '@/lib/api';
import Footer from '@/components/Footer';
import FloatingParticles from '@/components/FloatingParticles';

// 🔹 Tipos
interface Portada {
  portada_id: number;
  portada_imagen: string;
  portada_titulo: string;
  portada_subtitulo: string;
}

interface FormularioContacto {
  nombre: string;
  email: string;
  telefono: string;
  asunto: string;
  mensaje: string;
}

export default function ContactoPage() {
  const [institucionData, setInstitucionData] = useState<InstitucionData | null>(null);
  const [portadas, setPortadas] = useState<Portada[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState({
    primario: '#6AA942',
    secundario: '#235F35',
    terciario: '#000000'
  });
  
  const [formData, setFormData] = useState<FormularioContacto>({
    nombre: '',
    email: '',
    telefono: '',
    asunto: '',
    mensaje: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [mensajeEnviado, setMensajeEnviado] = useState(false);

  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 200]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.7]);

  // 🔹 Cargar datos desde API
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔹 Cargando datos de contacto...');
        
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
      } catch (error) {
        console.error('❌ Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 🔹 Slider auto-play
  useEffect(() => {
    if (portadas.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % portadas.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [portadas.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % portadas.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + portadas.length) % portadas.length);

  // 🔹 Manejar cambio en formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 🔹 Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Formulario enviado:', formData);
    setEnviando(false);
    setMensajeEnviado(true);
    setFormData({ nombre: '', email: '', telefono: '', asunto: '', mensaje: '' });
    
    setTimeout(() => setMensajeEnviado(false), 5000);
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
          <p className="text-muted-foreground font-medium">Cargando información de contacto...</p>
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
        
        {/* ===== HERO SECTION - IGUAL QUE AUTORIDADES/INICIO ===== */}
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

        {/* ===== CONTENIDO - CONTACTO ===== */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          
          {/* Información de contacto */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {institucionData?.institucion_direccion && (
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-sm border border-border p-6 text-center hover:shadow-lg transition"
              >
                <motion.div 
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
                  style={{ backgroundColor: colors.primario }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <MapPin className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="font-bold text-foreground mb-2">Dirección</h3>
                <p className="text-sm text-muted-foreground">{institucionData.institucion_direccion}</p>
              </motion.div>
            )}

            {institucionData?.institucion_correo1 && (
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-sm border border-border p-6 text-center hover:shadow-lg transition"
              >
                <motion.div 
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
                  style={{ backgroundColor: colors.secundario }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Mail className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="font-bold text-foreground mb-2">Email</h3>
                <a href={`mailto:${institucionData.institucion_correo1}`} className="text-sm text-[var(--color-primario)] hover:underline">{institucionData.institucion_correo1}</a>
              </motion.div>
            )}

            {institucionData?.institucion_celular1 && institucionData.institucion_celular1 !== 2147483647 && (
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl shadow-sm border border-border p-6 text-center hover:shadow-lg transition"
              >
                <motion.div 
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
                  style={{ backgroundColor: colors.terciario }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Phone className="w-7 h-7 text-white" />
                </motion.div>
                <h3 className="font-bold text-foreground mb-2">Teléfono</h3>
                <a href={`tel:${institucionData.institucion_celular1}`} className="text-sm text-[var(--color-primario)] hover:underline">{institucionData.institucion_celular1}</a>
              </motion.div>
            )}

            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-sm border border-border p-6 text-center hover:shadow-lg transition"
            >
              <motion.div 
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md"
                style={{ backgroundColor: '#10B981' }}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <Clock className="w-7 h-7 text-white" />
              </motion.div>
              <h3 className="font-bold text-foreground mb-2">Horario de Atención</h3>
              <p className="text-sm text-muted-foreground">Lun - Vie: 8:00 - 18:00</p>
            </motion.div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            
            {/* Formulario de contacto */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-sm border border-border p-8"
            >
              <h2 className="text-3xl font-bold text-foreground mb-2">Envíanos un mensaje</h2>
              <p className="text-muted-foreground mb-8">Completa el formulario y nos pondremos en contacto contigo</p>

              {mensajeEnviado && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg"
                >
                  ¡Mensaje enviado con éxito! Te contactaremos pronto.
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-foreground mb-2">Nombre completo *</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]"
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">Correo electrónico *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]"
                    placeholder="tu@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-foreground mb-2">Teléfono</label>
                  <input
                    type="tel"
                    id="telefono"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]"
                    placeholder="Tu número de teléfono"
                  />
                </div>

                <div>
                  <label htmlFor="asunto" className="block text-sm font-medium text-foreground mb-2">Asunto *</label>
                  <input
                    type="text"
                    id="asunto"
                    name="asunto"
                    value={formData.asunto}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]"
                    placeholder="¿Sobre qué quieres consultarnos?"
                  />
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-foreground mb-2">Mensaje *</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primario)]"
                    placeholder="Escribe tu mensaje aquí..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={enviando}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[var(--color-primario)] to-[var(--color-secundario)] text-white font-bold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {enviando ? (
                    <>Enviando...</>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Enviar mensaje
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>

            {/* Mapa y redes sociales */}
            <div className="space-y-8">
              {institucionData?.institucion_api_google_map && (
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden"
                >
                  <div className="p-6 border-b border-border">
                    <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                      <MapPin className="w-5 h-5" style={{ color: colors.primario }} />
                      Ubicación
                    </h3>
                  </div>
                  <div className="h-80">
                    <iframe
                      src={institucionData.institucion_api_google_map}
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: 'grayscale(15%) contrast(1.05)' }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full"
                    />
                  </div>
                </motion.div>
              )}

              {/* Redes sociales */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-2xl shadow-sm border border-border p-8"
              >
                <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: colors.primario }} />
                  Síguenos en redes sociales
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {institucionData?.institucion_facebook && (
                    <motion.a
                      href={institucionData.institucion_facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 bg-[#1877F2]/10 rounded-lg hover:bg-[#1877F2]/20 transition"
                    >
                      <Facebook className="w-6 h-6 text-[#1877F2]" />
                      <span className="text-sm font-medium text-foreground">Facebook</span>
                    </motion.a>
                  )}
                  {institucionData?.institucion_twitter && (
                    <motion.a
                      href={institucionData.institucion_twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 bg-[#1DA1F2]/10 rounded-lg hover:bg-[#1DA1F2]/20 transition"
                    >
                      <Twitter className="w-6 h-6 text-[#1DA1F2]" />
                      <span className="text-sm font-medium text-foreground">Twitter</span>
                    </motion.a>
                  )}
                  {institucionData?.institucion_youtube && (
                    <motion.a
                      href={institucionData.institucion_youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, y: -3 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 bg-[#FF0000]/10 rounded-lg hover:bg-[#FF0000]/20 transition"
                    >
                      <Youtube className="w-6 h-6 text-[#FF0000]" />
                      <span className="text-sm font-medium text-foreground">YouTube</span>
                    </motion.a>
                  )}
                  <motion.a
                    href="#"
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-3 p-4 bg-[#E4405F]/10 rounded-lg hover:bg-[#E4405F]/20 transition"
                  >
                    <Instagram className="w-6 h-6 text-[#E4405F]" />
                    <span className="text-sm font-medium text-foreground">Instagram</span>
                  </motion.a>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Información adicional */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-[var(--color-primario)]/5 to-[var(--color-secundario)]/5 rounded-2xl p-8 md:p-12"
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">¿Necesitas más información?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Estamos aquí para ayudarte. No dudes en contactarnos por cualquiera de nuestros canales de comunicación.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-bold text-foreground mb-2">Carrera</h4>
                <p className="text-muted-foreground text-sm">{institucionData?.institucion_nombre || 'Ciencias del Desarrollo'}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-bold text-foreground mb-2">Siglas</h4>
                <p className="text-muted-foreground text-sm">{institucionData?.institucion_iniciales || 'CD'}</p>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-bold text-foreground mb-2">Universidad</h4>
                <p className="text-muted-foreground text-sm">Universidad Pública de El Alto</p>
              </div>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </>
  );
}