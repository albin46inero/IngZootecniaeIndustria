// lib/api.ts

// 🔹 Variables de entorno (Next.js usa process.env)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
const INSTITUCION_ID = process.env.NEXT_PUBLIC_INSTITUCION_ID;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN;
const STORAGE_BASE = process.env.NEXT_PUBLIC_API_STORAGE || 'https://archivosminio.upea.bo/archivospaginasnode';

// Headers comunes con token
const getHeaders = () => ({
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json',
});

// 🔹 Función genérica para fetch
export const fetchAPI = async <T>(endpoint: string): Promise<T> => {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 3600 } // Cache por 1 hora (Next.js 13+)
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${url}`);
  }

  return await response.json();
};

// 🔹 Helper para construir URLs de imágenes/PDFs
export const getAssetUrl = (filename: string, folder: string): string => {
  if (!filename) return '';
  // Si ya es URL completa, retornarla
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  return `${STORAGE_BASE}/${folder}/${filename}`;
};

// 🔹 Función para obtener URL directa (usada en portadas, logos, etc.)
export const getDirectUrl = (urlOrPath: string | null | undefined, fallback?: string): string => {
  if (!urlOrPath) return fallback || '';
  
  // Si ya es URL completa (http/https), retornarla directa
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }
  
  // Si el path ya incluye una carpeta (imagenes/, convocatorias/, etc.)
  if (urlOrPath.includes('/')) {
    return `${STORAGE_BASE}/${urlOrPath}`;
  }
  
  // Por defecto, asumir que está en /imagenes/
  return `${STORAGE_BASE}/imagenes/${urlOrPath}`;
};

// 🔹 Función ESPECÍFICA para convocatorias (intenta múltiples rutas)
export const getConvocatoriaImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  
  // Si ya es URL completa, retornarla
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Si ya incluye carpeta, usar tal cual
  if (path.includes('/')) {
    return `${STORAGE_BASE}/${path}`;
  }
  
  // Intentar en orden: convocatorias/, imagenes/, root
  // Nota: Para producción idealmente verificar cuál existe realmente
  return `${STORAGE_BASE}/convocatorias/${path}`;
};

// 🔹 Función para cursos académicos
export const getCursoImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.includes('/')) return `${STORAGE_BASE}/${path}`;
  return `${STORAGE_BASE}/cursos/${path}`;
};

// 🔹 Endpoints específicos de la API
export const api = {
  // 👉 GET /api/v2/institucionesPrincipal/10
  getInstitucion: () => 
    fetchAPI<InstitucionResponse>(`/institucionesPrincipal/${INSTITUCION_ID}`),
  
  getCursos: () => 
    fetchAPI<CursosResponse>(`/institucion/${INSTITUCION_ID}/cursos-academicos`),
  
  // 👉 GET /api/v2/institucion/10/contenido
  getContenido: () => 
    fetchAPI<ContenidoResponse>(`/institucion/${INSTITUCION_ID}/contenido`),
  
  // 👉 GET /api/v2/institucion/10/gacetaEventos
  getGacetaEventos: () => 
    fetchAPI<GacetaEventosResponse>(`/institucion/${INSTITUCION_ID}/gacetaEventos`),
  
  // 👉 GET /api/v2/institucion/10/recursos
  getRecursos: () => 
    fetchAPI<RecursosResponse>(`/institucion/${INSTITUCION_ID}/recursos`),
};

// 🔹 Tipos para Links Externos/Internos
export interface LinkExternoInterno {
  id_link: number;
  imagen: string;
  nombre: string;
  url_link: string;
  estado: number;
  tipo: string;
}

export interface TipoConvComun {
  idtipo_conv_comun: number;
  tipo_conv_comun_titulo: string;
  tipo_conv_comun_estado: string;
}

export interface TipoCursoOtro {
  tipo_conv_curso_nombre: string;
  tipo_conv_curso_estado: string;
}

export interface Convocatoria {
  idconvocatorias: number;
  con_foto_portada: string;
  con_titulo: string;
  con_descripcion: string;
  con_estado: string;
  con_fecha_inicio: string;
  con_fecha_fin: string;
  tipo_conv_comun: TipoConvComun;
}

export interface Curso {
  iddetalle_cursos_academicos: number;
  det_img_portada: string;
  det_titulo: string;
  det_descripcion: string;
  det_costo: number;
  det_costo_ext: number;
  det_costo_profe: number;
  det_cupo_max: number;
  det_carga_horaria: number;
  det_lugar_curso: string;
  det_modalidad: string;
  det_fecha_ini: string;
  det_fecha_fin: string;
  det_codigo: string;
  det_hora_ini: string;
  det_grupo_whatssap: string;
  det_version: string;
  det_estado: string;
  idtipo_curso_otros: number;
  tipo_curso_otro: TipoCursoOtro;
  facilitadores: any[];
}

export interface Publicacion {
  publicaciones_id: number;
  publicaciones_titulo: string;
  publicaciones_imagen: string;
  publicaciones_descripcion: string;
  publicaciones_documento: string;
  publicaciones_fecha: string;
  publicaciones_autor: string;
  publicaciones_tipo: string;
}

export interface Evento {
  evento_id: number;
  evento_titulo: string;
  evento_imagen: string;
  evento_descripcion: string;
  evento_fecha: string;
  evento_hora: string;
  evento_lugar: string;
  tipo_evento: string;
  galeria: any[];
}

export interface OfertaAcademica {
  ofertas_id: number;
  ofertas_titulo: string;
  ofertas_descripcion: string;
  ofertas_inscripciones_ini: string;
  ofertas_inscripciones_fin: string;
  ofertas_fecha_examen: string;
  ofertas_imagen: string;
  ofertas_referencia: string;
  ofertas_estado: number;
}

export interface Servicio {
  serv_id: number;
  serv_imagen: string;
  serv_nombre: string;
  serv_descripcion: string;
  serv_nro_celular: number;
  serv_active: string;
  imagen: any[];
}

// 🔹 Respuestas de la API
export interface InstitucionData {
  institucion_id: number;
  institucion_nombre: string;
  institucion_iniciales: string;
  institucion_nombre_iniciales: string;
  institucion_logo: string;
  institucion_historia: string;
  institucion_mision: string;
  institucion_vision: string;
  institucion_objetivos: string;
  institucion_facebook: string;
  institucion_youtube: string;
  institucion_twitter: string;
  institucion_direccion: string;
  institucion_celular1: number;
  institucion_telefono1: number;
  institucion_correo1: string;
  institucion_correo2: string;
  institucion_sobre_ins: string;
  institucion_api_google_map: string;
  institucion_slogan?: string;
  colorinstitucion: Array<{
    id_color: number;
    color_primario: string;
    color_secundario: string;
    color_terciario: string;
  }>;
  [key: string]: any; 
}

export interface InstitucionResponse {
  Descripcion: InstitucionData;
}

export interface Portada {
  portada_id: number;
  portada_imagen: string;
  portada_titulo: string;
  portada_subtitulo: string;
}

export interface ContenidoResponse {
  autoridad: any[];
  portada: Portada[];
  ubicacion: any[];
  upea_videos: any[];
}

export interface CursosResponse {
  cursos: Curso[];
}

export interface RecursosResponse {
  upea_publicaciones: Publicacion[];
  linksExternoInterno: LinkExternoInterno[];
  links: any[];
}

export interface GacetaEventosResponse {
  upea_evento: Evento[];
  ofertasAcademicas: OfertaAcademica[];
  serviciosCarrera: Servicio[]; 
  cursos: Curso[];  
  convocatorias: Convocatoria[];
  upea_gaceta_universitaria?: any[];
  upea_videos?: any[];
}
export interface VideoInstitucional {
  video_id: number;
  video_enlace: string;
  video_titulo: string;
  video_breve_descripcion: string;
  video_estado: number;
  video_tipo: string;
}
