import { useMemo } from "react";
import { ChevronUp, User, Wrench } from "lucide-react";
import { NavLink, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buildMenuFromDTO, filterMenuByViewAccess, defaultMenu, findMenuItemByUrl } from "@/lib/menu";
import { AppBrand } from "@/components/layout/AppBrand";

/**
 * AppSidebar
 * pt-BR: Sidebar do painel administrativo. A logo no cabeçalho agora
 * redireciona para a LandingPage (rota '/').
 * en-US: Admin panel sidebar. Header logo now navigates to the LandingPage ('/').
 */

export function AppSidebar() {
  const { state } = useSidebar();
  const { menu: apiMenu, logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  /**
   * Garante que o menu tenha um atalho para o relatório de pontos.
   */
  const menuSource = useMemo(() => {
    const sourceMenu = apiMenu && apiMenu.length > 0 ? apiMenu : defaultMenu;

    if (findMenuItemByUrl(sourceMenu, "/points-reports")) {
      return sourceMenu;
    }

    const clonedMenu = sourceMenu.map((item) => ({
      ...item,
      items: item.items ? [...item.items] : undefined,
    }));

    const pointsParent = clonedMenu.find((item) =>
      item.items?.some((subItem) => subItem.url === "/points-extracts")
    );

    if (pointsParent?.items) {
      const extractsItem = pointsParent.items.find((subItem) => subItem.url === "/points-extracts");

      pointsParent.items.push({
        id: "points-reports",
        parent_id: pointsParent.id,
        title: "Relatório de Pontos",
        url: "/points-reports",
        icon: "BarChart3",
        can_view: extractsItem?.can_view ?? 1,
      });

      return clonedMenu;
    }

    return [
      ...clonedMenu,
      {
        id: "points-reports",
        title: "Relatório de Pontos",
        url: "/points-reports",
        icon: "BarChart3",
        can_view: 1,
      },
    ];
  }, [apiMenu]);

  // Build menu from API data or use default menu
  const baseMenu = buildMenuFromDTO(menuSource);

  // Filter by can_view access
  const menuItems = filterMenuByViewAccess(baseMenu);

  const isActive = (path: string) => currentPath === path;
  const hasActiveChild = (items: any[]) => 
    items?.some((item) => isActive(item.url));
  const rota_admin = 'admin';
  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-border print:hidden">
        <Link to="/">
          <AppBrand collapsed={collapsed} />
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    // Menu with submenu
                    <SidebarMenuButton
                      className={hasActiveChild(item.items) ? "bg-accent" : ""}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </SidebarMenuButton>
                  ) : (
                    // Simple menu item
                     <SidebarMenuButton asChild>
                      <NavLink 
                        to={`/${rota_admin}${item.url || "#"}`} 
                        className={({ isActive }) => 
                          isActive 
                            ? "bg-primary font-medium" 
                            : "hover:bg-accent hover:text-accent-foreground"
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                  {item.items && !collapsed && (
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                           <SidebarMenuSubButton asChild>
                             <NavLink 
                               to={`/${rota_admin}${subItem.url || "#"}`} 
                               className={({ isActive }) => 
                                 isActive 
                                   ? "bg-primary font-medium" 
                                   : "hover:bg-accent hover:text-accent-foreground"
                               }
                             >
                               <span>{subItem.title}</span>
                             </NavLink>
                           </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <User className="h-4 w-4" />
                  {!collapsed && <span>Usuário</span>}
                  <ChevronUp className="ml-auto h-4 w-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                side="top" 
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings/user-profiles" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings/system" className="flex items-center">
                    <Wrench className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                  <ChevronUp className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
