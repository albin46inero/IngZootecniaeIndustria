'use client';

import { useEffect } from 'react';
import { api, type InstitucionData } from '@/lib/api';

// 🔹 Función para obtener URL de imagen (directa o fallback)
const getImageUrl = (urlOrPath: string | null | undefined, fallback?: string): string => {
  if (!urlOrPath) return fallback || '';
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }
  return `https://archivosminio.upea.bo/archivospaginasnode/imagenes/logos/${urlOrPath}`;
};

export default function Favicon() {
  useEffect(() => {
    const loadFavicon = async () => {
      try {
        console.log('🔹 Cargando favicon desde API...');
        
        const response = await api.getInstitucion();
        const institucion = response.Descripcion as InstitucionData;
        
        if (institucion.institucion_logo) {
          // 🔹 Obtener URL directa desde API
          const logoUrl = getImageUrl(institucion.institucion_logo);
          
          console.log('✅ Favicon URL:', logoUrl);
          
          // Remover TODOS los favicons existentes
          const existingLinks = document.querySelectorAll(`
            link[rel='icon'],
            link[rel='shortcut icon'],
            link[rel='apple-touch-icon']
          `);
          existingLinks.forEach(link => link.remove());
          
          // Crear favicon principal
          const link = document.createElement('link');
          link.rel = 'icon';
          link.type = 'image/png';
          link.href = logoUrl;
          document.head.appendChild(link);
          
          // Apple touch icon
          const appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          appleLink.href = logoUrl;
          document.head.appendChild(appleLink);
          
          // Shortcut icon
          const shortcutLink = document.createElement('link');
          shortcutLink.rel = 'shortcut icon';
          shortcutLink.href = logoUrl;
          document.head.appendChild(shortcutLink);
          
          // Guardar en localStorage para cargar más rápido la próxima vez
          localStorage.setItem('favicon_url', logoUrl);
        }
      } catch (error) {
        console.error('❌ Error al cargar favicon:', error);
        
        // Intentar cargar desde localStorage si falla la API
        const cachedUrl = localStorage.getItem('favicon_url');
        if (cachedUrl) {
          console.log('✅ Usando favicon desde caché:', cachedUrl);
          updateFavicon(cachedUrl);
        }
      }
    };

    const updateFavicon = (url: string) => {
      const existingLinks = document.querySelectorAll(`
        link[rel='icon'],
        link[rel='shortcut icon'],
        link[rel='apple-touch-icon']
      `);
      existingLinks.forEach(link => link.remove());
      
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/png';
      link.href = url;
      document.head.appendChild(link);
      
      const appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      appleLink.href = url;
      document.head.appendChild(appleLink);
    };

    // 🔹 Cargar inmediatamente desde caché si existe (para evitar parpadeo)
    const cachedUrl = localStorage.getItem('favicon_url');
    if (cachedUrl) {
      console.log('✅ Cargando favicon desde caché primero:', cachedUrl);
      updateFavicon(cachedUrl);
    }
    
    // Luego cargar desde API para actualizar si cambió
    loadFavicon();
  }, []);

  return null;
}