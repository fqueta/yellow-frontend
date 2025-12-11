/**
 * Brand constants
 * pt-BR: Constantes de marca usadas no painel e exportação de PDF.
 * en-US: Brand constants used across the panel UI and PDF export.
 */
export const BRAND_TITLE = 'Painel Yellow BC';
export const BRAND_SUBTITLE = 'Gestão de Loja de pontos';
// Prefer SVG for crisp rendering in UI; PDF converter tratará SVG.
export const BRAND_LOGO_URL = '/favicon.svg';

/**
 * getBrandLabel
 * pt-BR: Retorna o label completo combinando título e subtítulo.
 * en-US: Returns the full brand label combining title and subtitle.
 */
export function getBrandLabel(): string {
  return `${BRAND_TITLE} — ${BRAND_SUBTITLE}`;
}