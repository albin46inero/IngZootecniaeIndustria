/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔒 Headers de seguridad (SIN rewrites de proxy)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.youtube.com https://www.googletagmanager.com https://va.vercel-scripts.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              img-src 'self' data: https: blob: https://archivosminio.upea.bo https://img.youtube.com https://images.unsplash.com https://via.placeholder.com;
              font-src 'self' https://fonts.gstatic.com;
              connect-src 'self' https://apiadministrador.upea.bo https://archivosminio.upea.bo;
              frame-src 'self' https://www.youtube.com https://www.google.com;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
            `.replace(/\s{2,}/g, ' ').trim(),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // 🖼️ Configuración de imágenes remotas
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'archivosminio.upea.bo', pathname: '/**' },
      { protocol: 'https', hostname: 'img.youtube.com', pathname: '/vi/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
      { protocol: 'https', hostname: 'apiadministrador.upea.bo', pathname: '/**' },
    ],
    // ❌ ELIMINAR: unoptimized puede causar problemas
    // unoptimized: process.env.NODE_ENV === 'development',
  },

  // 🔇 Ocultar headers que exponen tecnología
  poweredByHeader: false,
  
  // ✅ Compresión habilitada
  compress: true,

  // ❌ ASEGÚRATE DE NO TENER ESTO (rewrites de proxy):
  // async rewrites() { ... },  ← ELIMINAR SI EXISTE
};

module.exports = nextConfig;