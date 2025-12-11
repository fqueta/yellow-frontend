import { BRAND_LOGO_URL, BRAND_TITLE, BRAND_SUBTITLE } from '@/lib/brand';

type AppBrandProps = {
  collapsed?: boolean;
  showSubtitle?: boolean;
  className?: string;
};

/**
 * AppBrand
 * pt-BR: Componente reutilizável de marca. Exibe o favicon como logo e
 *        o label do painel (título e subtítulo). Usado no cabeçalho da
 *        sidebar e pode ser reutilizado em outras áreas do painel.
 * en-US: Reusable brand component. Shows the favicon as logo and the panel
 *        label (title and subtitle). Used in sidebar header and reusable
 *        across the panel.
 */
export function AppBrand({ collapsed, showSubtitle = true, className }: AppBrandProps) {
  return (
    <div className={`flex items-center gap-2 px-4 py-3 ${className || ''}`}>
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground overflow-hidden">
        <img src={BRAND_LOGO_URL} alt={BRAND_TITLE} className="h-5 w-5" />
      </div>
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-semibold">{BRAND_TITLE}</span>
          {showSubtitle && (
            <span className="text-xs text-muted-foreground">{BRAND_SUBTITLE}</span>
          )}
        </div>
      )}
    </div>
  );
}