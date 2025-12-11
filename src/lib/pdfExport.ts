/**
 * exportTablePdf
 * pt-BR: Gera um PDF com uma tabela baseada em `headers` e `rows`,
 *         adiciona título e metadados opcionais, e abre o PDF em
 *         uma nova aba sem usar o recurso de impressão do navegador.
 * en-US: Generates a PDF with a table from `headers` and `rows`,
 *         adds title and optional metadata, and opens the PDF in
 *         a new tab without using the browser print feature.
 */
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BRAND_LOGO_URL, BRAND_TITLE } from '@/lib/brand';

export type PdfTableOptions = {
  title: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
  filtersLegend?: string; // e.g., "Status: Ativo | Busca: João"
  orientation?: 'portrait' | 'landscape';
  logoUrl?: string; // URL pública (ex.: "/favicon.svg")
  logoDataUrl?: string; // Base64 data URL, se já estiver disponível
  logoWidthPt?: number; // largura em pt
  logoHeightPt?: number; // altura em pt
  logoWidthPx?: number; // largura em px (convertida para pt)
  logoHeightPx?: number; // altura em px (convertida para pt)
};

/**
 * exportTablePdf
 * pt-BR: Exporta uma tabela para PDF, adiciona título, filtros e opcionalmente
 *        uma logo no cabeçalho. Em seguida, abre o PDF em uma nova aba.
 * en-US: Exports a table to PDF, adds title, filters and optionally a logo
 *        in the header. Then opens the PDF in a new tab.
 */
export async function exportTablePdf(opts: PdfTableOptions) {
  const {
    title,
    headers,
    rows,
    filtersLegend,
    orientation = 'landscape',
    logoUrl,
    logoDataUrl,
    logoWidthPt,
    logoHeightPt,
    logoWidthPx = 72,
    logoHeightPx = 72,
  } = opts;

  // Cria documento com margens confortáveis em pontos (pt)
  const doc = new jsPDF({ unit: 'pt', format: 'a4', orientation });
  const marginLeft = 40;
  const marginTop = 48;

  // Tenta adicionar logo no cabeçalho (se disponível)
  // pt-BR: Se não for fornecido, usa uma logo padrão do diretório public.
  // en-US: If not provided, uses a default logo from the public directory.
  const resolvedLogoUrl = logoDataUrl ? undefined : (logoUrl ?? BRAND_LOGO_URL);
  let headerOffsetY = 0;
  let hasLogo = false;
  let logoWidthRenderedPt = 0;
  let logoHeightRenderedPt = 0;
  try {
    /**
     * blobToPngDataUrl
     * pt-BR: Converte Blob de imagem em data URL PNG e retorna dimensões reais.
     * en-US: Converts image Blob to PNG data URL and returns actual dimensions.
     */
    const blobToPngDataUrl = async (blob: Blob): Promise<{ dataUrl: string; width: number; height: number; } > => {
      return await new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(blob);
        img.onload = () => {
          try {
            const w = img.naturalWidth || 128;
            const h = img.naturalHeight || 128;
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas unsupported');
            ctx.drawImage(img, 0, 0);
            const pngDataUrl = canvas.toDataURL('image/png');
            URL.revokeObjectURL(url);
            resolve({ dataUrl: pngDataUrl, width: w, height: h });
          } catch (e) {
            URL.revokeObjectURL(url);
            reject(e);
          }
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Image load failed'));
        };
        img.src = url;
      });
    };

    let dataUrlFinal: string | undefined = logoDataUrl;
    let imgWidthPx = 128;
    let imgHeightPx = 128;

    if (!dataUrlFinal && resolvedLogoUrl) {
      const res = await fetch(resolvedLogoUrl);
      if (!res.ok) throw new Error('Logo fetch failed');
      const blob = await res.blob();
      // Converte para PNG garantindo dimensões para preservar proporção
      const converted = await blobToPngDataUrl(blob);
      dataUrlFinal = converted.dataUrl;
      imgWidthPx = converted.width;
      imgHeightPx = converted.height;
    }

    if (dataUrlFinal) {
      // Calcula dimensões finais mantendo proporção da imagem
      const aspect = imgHeightPx > 0 && imgWidthPx > 0 ? (imgHeightPx / imgWidthPx) : 1;
      const pxToPt = (px: number) => px * 0.75; // 1pt = 0.75px @96dpi
      let finalWidthPt = typeof logoWidthPt === 'number' ? logoWidthPt : pxToPt(logoWidthPx);
      let finalHeightPt = typeof logoHeightPt === 'number' ? logoHeightPt : pxToPt(logoHeightPx);

      // Se apenas um dos lados for informado, derive o outro pela proporção
      if (finalWidthPt && !logoHeightPt && !logoHeightPx) {
        finalHeightPt = finalWidthPt * aspect;
      }
      if (finalHeightPt && !logoWidthPt && !logoWidthPx) {
        finalWidthPt = finalHeightPt / aspect;
      }

      // Adiciona imagem no topo à esquerda sem deformar
      doc.addImage(dataUrlFinal, 'PNG', marginLeft, marginTop - 8, finalWidthPt, finalHeightPt);
      hasLogo = true;
      logoWidthRenderedPt = finalWidthPt;
      logoHeightRenderedPt = finalHeightPt;
      headerOffsetY = finalHeightPt + 10; // provisório, será recalculado após textos
    }
  } catch {
    // Se a logo não puder ser carregada, segue sem imagem
    headerOffsetY = 0;
  }

  // Cabeçalho: título e data/hora
  const nowStr = new Date().toLocaleString('pt-BR');
  if (hasLogo) {
    const rightX = marginLeft + logoWidthRenderedPt + 12;
    const availableWidth = doc.internal.pageSize.getWidth() - rightX - marginLeft;
    let curY = marginTop + 4;

    // Marca textual (label do painel)
    doc.setFontSize(12);
    doc.setTextColor('#333333');
    doc.text(BRAND_TITLE, rightX, curY);
    curY += 22;

    // Título do relatório
    doc.setFontSize(16);
    doc.setTextColor('#000000');
    const reportTitle = String(title || 'Relatório');
    const titleLines = doc.splitTextToSize(reportTitle, availableWidth);
    doc.text(titleLines, rightX, curY);
    curY += 24 + (titleLines.length - 1) * 14;

    // Data/hora
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.text(`Gerado em: ${nowStr}`, rightX, curY);
    curY += 16;

    // Legenda de filtros (opcional) posicionada à direita
    if (filtersLegend) {
      doc.setTextColor('#333333');
      const legendText = `Filtros: ${filtersLegend}`;
      const split = doc.splitTextToSize(legendText, availableWidth);
      doc.text(split, rightX, curY);
      curY += 18 + (split.length - 1) * 12;
    }

    // Espaço ocupado pelo bloco à direita comparado ao logo
    const blockHeight = curY - marginTop;
    headerOffsetY = Math.max(logoHeightRenderedPt, blockHeight) + 5;
  } else {
    // Fallback sem logo: posiciona título e data abaixo normalmente
    doc.setFontSize(16);
    doc.text(String(title || 'Relatório'), marginLeft, marginTop + headerOffsetY);
    doc.setFontSize(10);
    doc.setTextColor('#666666');
    doc.text(`Gerado em: ${nowStr}`, marginLeft, marginTop + headerOffsetY + 16);
  }

  // Legenda de filtros (opcional)
  if (filtersLegend && !hasLogo) {
    doc.setTextColor('#333333');
    const legendY = marginTop + headerOffsetY + 36;
    const legendText = `Filtros: ${filtersLegend}`;
    const split = doc.splitTextToSize(legendText, doc.internal.pageSize.getWidth() - marginLeft * 2);
    doc.text(split, marginLeft, legendY);
  }

  // Espaço antes da tabela (reduzido)
  const startY = hasLogo
    ? marginTop + headerOffsetY + 8
    : (filtersLegend ? marginTop + 40 : marginTop + 24) + headerOffsetY;

  // Tabela
  autoTable(doc, {
    head: [headers.map((h) => String(h))],
    body: rows.map((r) => r.map((c) => c == null ? '' : String(c))),
    startY,
    styles: { fontSize: 10, cellPadding: 6 },
    headStyles: { fillColor: [245, 245, 245], textColor: 20 },
    didDrawPage: (data) => {
      // Rodapé com número da página
      const pageSize = doc.internal.pageSize;
      const pageWidth = pageSize.getWidth();
      const pageHeight = pageSize.getHeight();
      const pageStr = `Página ${doc.getCurrentPageInfo().pageNumber}`;
      doc.setFontSize(9);
      doc.setTextColor('#666666');
      doc.text(pageStr, pageWidth - marginLeft, pageHeight - 20, { align: 'right' });
    },
  });

  // Abre em nova aba como Blob URL (não baixa por padrão)
  const blobUrl = doc.output('bloburl');
  try {
    window.open(blobUrl, '_blank');
  } catch {
    // Fallback: exibe em mesma aba se bloqueado
    window.location.href = blobUrl;
  }
}