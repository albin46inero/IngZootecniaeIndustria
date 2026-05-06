/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔹 TypeScript - Ignorar errores de build (opcional)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 🔹 Imágenes - Configuración básica sin errores
  images: {
    unoptimized: true, // ✅ Esto deshabilita optimización (funciona siempre)
    // Si quieres optimización, usa esto en su lugar:
    /*
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'archivosminio.upea.bo',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    */
  },
  
  // 🔹 Headers de seguridad (solo en producción)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
        ]
      }
    ];
  },
  
  // 🔹 Deshabilitar X-Powered-By
  poweredByHeader: false,
};

export default nextConfig;