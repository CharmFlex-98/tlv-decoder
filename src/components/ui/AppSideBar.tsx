
import { Toaster } from "sonner";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarTrigger, SidebarMenuButton, useSidebar } from "./sidebar";
import Link from "next/link";
import { AppRoute } from "next/dist/build/swc/types";
import { AppRouteNames, Value } from "@/routes/routes";


export interface MenuGroup {
    title: string,
    items: MenuItem[]
}

interface MenuItem {
    title: string,
    path: string
}

interface AppSideBarProps {
    menuGroups: MenuGroup[]
}


function AppSideBar({ menuGroups }: AppSideBarProps) {
    return (
        <Sidebar>
            <SidebarContent>
                {menuGroups.map((group) => (
                    <MenuGroupView
                        key={group.title}
                        menuGroup={group}
                    />
                ))}
            </SidebarContent>

            <Toaster richColors position="top-center" />
        </Sidebar>
    )
}

function MenuGroupView({ menuGroup }: { menuGroup: MenuGroup }) {
    return (
        < SidebarGroup >
            <SidebarGroupLabel>{ menuGroup.title }</SidebarGroupLabel>
            <SidebarGroupContent>
                {menuGroup.items.map((menuItem) => (
                    <MenuItemView
                        key={menuItem.path}
                        menuItem={menuItem}
                    />
                ))}
            </SidebarGroupContent>
        </SidebarGroup >
    )
}

function MenuItemView({ menuItem }: { menuItem: MenuItem }) {
    const { setOpenMobile } = useSidebar()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={() => setOpenMobile(false)}>
                    <Link href={menuItem.path}>{menuItem.title}</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

export { AppSideBar }

