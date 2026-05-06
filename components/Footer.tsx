'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api, type InstitucionData, getDirectUrl } from '@/lib/api';
import FloatingParticles from './FloatingParticles';

export default function Footer() {
  const [institucionData, setInstitucionData] = useState<InstitucionData | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [colors, setColors] = useState({
    primario: '#6AA942',
    secundario: '#235F35',
    terciario: '#000000'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await api.getInstitucion();
        const institucion = response.Descripcion;
        setInstitucionData(institucion);
        
        // 🔹 Cargar colores dinámicos
        if (institucion.colorinstitucion?.[0]) {
          const colors = institucion.colorinstitucion[0];
          setColors({
            primario: colors.color_primario || '#6AA942',
            secundario: colors.color_secundario || '#235F35',
            terciario: colors.color_terciario || '#000000'
          });
        }
        
        // 🔹 Obtener URL directa del logo de la carrera desde API
        if (institucion?.institucion_logo) {
          const url = getDirectUrl(institucion.institucion_logo);
          setLogoUrl(url);
          setLogoLoaded(true);
        }
      } catch (error) {
        console.error('❌ Error al cargar datos del footer:', error);
        setLogoLoaded(false);
      }
    };
    
    loadData();
  }, []);

  return (
    <>
      {/* ✅ FUENTE FORTE para el footer */}
      <style jsx global>{`
        @font-face {
          font-family: 'Forte';
          src: url('/fonts/Forte.woff2') format('woff2'),
               url('/fonts/Forte.woff') format('woff');
          font-display: swap;
        }
        .footer-forte {
          font-family: 'Forte', 'Brush Script MT', cursive, sans-serif;
        }
      `}</style>

      <footer className="relative overflow-hidden">
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
        
        {/* Overlay para legibilidad */}
        <div className="absolute inset-0 z-0 bg-black/30"></div>

        {/* Partículas animadas */}
        <FloatingParticles count={12} className="z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          
          {/* LOGOS - Centro dinámico con logo de la carrera */}
          <motion.div 
            className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            
            {/* Logo UPEA */}
            <motion.div 
              className="flex flex-col items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link 
                href="https://www.upea.edu.bo/"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:scale-110 transition-transform"
              >
                <Image
                  src="/logo-upea.png"
                  alt="UPEA"
                  width={80}
                  height={80}
                  className="object-contain drop-shadow-lg"
                />
              </Link>
              <Link 
                href="https://www.upea.edu.bo/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm footer-forte font-semibold text-white/90 text-center hover:text-white transition leading-tight"
              >
                Universidad Pública<br />de El Alto
              </Link>
            </motion.div>

            {/* 🔹 LOGO DE LA CARRERA - DINÁMICO DESDE API */}
            <motion.div 
              className="flex flex-col items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {logoLoaded && logoUrl ? (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="relative w-20 h-20"
                >
                  <Image
                    src={logoUrl}
                    alt={institucionData?.institucion_nombre || 'Logo carrera'}
                    fill
                    className="object-contain drop-shadow-lg"
                    onError={() => setLogoLoaded(false)}
                  />
                </motion.div>
              ) : (
                <motion.div 
                  className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 rounded-lg flex items-center justify-center text-white font-bold text-base shadow-lg backdrop-blur-sm border border-white/20 footer-forte"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.3 }}
                >
                  {institucionData?.institucion_iniciales || 'CD'}
                </motion.div>
              )}
              
              {/* Nombre de la carrera - DINÁMICO */}
              <span className="text-sm footer-forte font-semibold text-white/90 text-center leading-tight">
                {institucionData?.institucion_nombre || 'Ciencias del Desarrollo'}
              </span>
            </motion.div>

            {/* Logo UTIC */}
            <motion.div 
              className="flex flex-col items-center gap-3"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              <Link 
                href="https://utic.upea.bo/"
                target="_blank"
                rel="noopener noreferrer"
                className="block hover:scale-110 transition-transform"
              >
                <Image
                  src="/UTICC.png"
                  alt="UTIC"
                  width={80}
                  height={80}
                  className="object-contain drop-shadow-lg"
                />
              </Link>
              <Link 
                href="https://utic.upea.bo/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm footer-forte font-semibold text-white/90 text-center hover:text-white transition leading-tight"
              >
                Unidad de<br />Tecnologías
              </Link>
            </motion.div>

          </motion.div>

          {/* COPYRIGHT - CON FUENTE FORTE */}
          <motion.div 
            className="text-center pt-8 border-t border-white/20"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-sm text-white/80 footer-forte leading-relaxed">
              © {institucionData?.institucion_nombre || 'Ciencias del Desarrollo'} | UPEA | {new Date().getFullYear()} - UTIC{' '}
              <span className="font-semibold"></span> || Web Developers{' '}
              <a 
                href="https://www.linkedin.com/in/albieri-laura-308686397/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-semibold text-blue-300 hover:text-yellow-200 underline transition-colors footer-forte"
              >
                Albiery
              </a>
            </p>
          </motion.div>
        </div>
      </footer>
    </>
  );
}