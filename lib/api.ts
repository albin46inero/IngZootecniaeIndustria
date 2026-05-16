// lib/api.ts

// 🔹 Variables de entorno con valores por defecto
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://apiadministrador.upea.bo/api/v2';
const INSTITUCION_ID = process.env.NEXT_PUBLIC_INSTITUCION_ID || '39';
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';
const STORAGE_BASE = process.env.NEXT_PUBLIC_API_STORAGE || 'https://archivosminio.upea.bo/archivospaginasnode';

// Headers comunes con token
const getHeaders = () => ({
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json',
});

// 🔹 Fetch para CLIENTE ('use client') - SIN next: { revalidate }
export const fetchAPIClient = async <T>(endpoint: string): Promise<T> => {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
    cache: 'no-store', // Cliente: sin caché para datos dinámicos
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${url}`);
  }

  return await response.json();
};

// 🔹 Fetch para SERVIDOR (Server Components, Route Handlers) - CON revalidate
export const fetchAPIServer = async <T>(endpoint: string): Promise<T> => {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 3600 }, // ✅ Solo válido en servidor
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${url}`);
  }

  return await response.json();
};

// 🔹 Helper para construir URLs de imágenes/PDFs
export const getAssetUrl = (filename: string, folder: string): string => {
  if (!filename) return '';
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  return `${STORAGE_BASE}/${folder}/${filename}`;
};

// 🔹 Función para obtener URL directa (usada en portadas, logos, etc.)
export const getDirectUrl = (urlOrPath: string | null | undefined, fallback?: string): string => {
  if (!urlOrPath) return fallback || '';
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }
  if (urlOrPath.includes('/')) {
    return `${STORAGE_BASE}/${urlOrPath}`;
  }
  return `${STORAGE_BASE}/imagenes/${urlOrPath}`;
};

// 🔹 Función ESPECÍFICA para convocatorias
export const getConvocatoriaImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  if (path.includes('/')) {
    return `${STORAGE_BASE}/${path}`;
  }
  return `${STORAGE_BASE}/convocatorias/${path}`;
};

// 🔹 Función para cursos académicos
export const getCursoImageUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  if (path.includes('/')) return `${STORAGE_BASE}/${path}`;
  return `${STORAGE_BASE}/cursos/${path}`;
};

// 🔹 Endpoints específicos de la API - USAN fetchAPIClient por defecto
export const api = {
  getInstitucion: () => 
    fetchAPIClient<InstitucionResponse>(`/institucionesPrincipal/${INSTITUCION_ID}`),
  
  getCursos: () => 
    fetchAPIClient<CursosResponse>(`/institucion/${INSTITUCION_ID}/cursos-academicos`),
  
  getContenido: () => 
    fetchAPIClient<ContenidoResponse>(`/institucion/${INSTITUCION_ID}/contenido`),
  
  getGacetaEventos: () => 
    fetchAPIClient<GacetaEventosResponse>(`/institucion/${INSTITUCION_ID}/gacetaEventos`),
  
  getRecursos: () => 
    fetchAPIClient<RecursosResponse>(`/institucion/${INSTITUCION_ID}/recursos`),
};

// 🔹 Tipos (sin cambios)
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

export interface VideoInstitucional {
  video_id: number;
  video_enlace: string;
  video_titulo: string;
  video_breve_descripcion: string;
  video_estado: number;
  video_tipo: string;
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
  institucion_link_video_vision?: string;
  institucion_videos?: VideoInstitucional[];
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
  upea_videos: VideoInstitucional[];
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
  upea_videos?: VideoInstitucional[];
}