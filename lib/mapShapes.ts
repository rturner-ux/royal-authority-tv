import type { IncidentCategory } from './types'

// Shape is a secondary, colorblind-friendly differentiator alongside
// CATEGORY_COLORS -- a few categories intentionally share a shape since
// their colors are already far apart.
export const CATEGORY_SHAPES: Record<IncidentCategory, string> = {
  amber_alert: 'triangle',
  silver_alert: 'circle',
  blue_alert: 'square',
  endangered_missing_person: 'diamond',
  camo_alert: 'hexagon',
  missing_person: 'pentagon',
  drowning_report: 'drop',
  death_investigation: 'cross',
  criminal_investigation: 'square',
  murder: 'star',
  sex_trafficking: 'diamond',
}

// Inner SVG markup for each shape, drawn inside a 24x24 viewBox. Returned as
// a plain string since Leaflet's divIcon needs raw HTML, not JSX -- the same
// string is reused as-is inside a small <svg> in the legend.
export function shapeSvgInner(shape: string, fill: string): string {
  const common = `fill="${fill}" stroke="rgba(255,255,255,0.9)" stroke-width="1.4"`
  switch (shape) {
    case 'square':
      return `<rect x="4" y="4" width="16" height="16" rx="2" ${common} />`
    case 'triangle':
      return `<polygon points="12,3 21,20 3,20" ${common} />`
    case 'diamond':
      return `<polygon points="12,2 22,12 12,22 2,12" ${common} />`
    case 'pentagon':
      return `<polygon points="12,2 22,9.5 18,21 6,21 2,9.5" ${common} />`
    case 'hexagon':
      return `<polygon points="12,2 20,7 20,17 12,22 4,17 4,7" ${common} />`
    case 'star':
      return `<polygon points="12,1.5 14.9,9 22,9.5 16.5,14.3 18.3,21.5 12,17.4 5.7,21.5 7.5,14.3 2,9.5 9.1,9" ${common} />`
    case 'cross':
      return `<path d="M9,2 H15 V9 H22 V15 H15 V22 H9 V15 H2 V9 H9 Z" ${common} />`
    case 'drop':
      return `<path d="M12,2 C12,2 4,12.5 4,17 A8,8 0 0,0 20,17 C20,12.5 12,2 12,2 Z" ${common} />`
    case 'circle':
    default:
      return `<circle cx="12" cy="12" r="9.5" ${common} />`
  }
}

export function shapeSvg(shape: string, fill: string, size: number): string {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">${shapeSvgInner(shape, fill)}</svg>`
}
