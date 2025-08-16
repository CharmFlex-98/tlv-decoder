
import { Toaster } from "sonner";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarTrigger, SidebarMenuButton, useSidebar } from "./sidebar";
import Link from "next/link";
import { AppRoute } from "next/dist/build/swc/types";
import { AppRouteNames, Value } from "@/routes/routes";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";


export interface MenuGroup {
    title: string,
    items: MenuItem[]
}

interface MenuItem {
    title: string,
    path: string,
}

interface AppSideBarProps {
    menuGroups: MenuGroup[]
}


function AppSideBar({ menuGroups: initialGroups }: AppSideBarProps) {
    const [menuGroups, setMenuGroups] = useState(initialGroups)


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
        </Sidebar>
    )
}

function MenuGroupView({ menuGroup }: { menuGroup: MenuGroup }) {
    return (
        < SidebarGroup >
            <SidebarGroupLabel>{menuGroup.title}</SidebarGroupLabel>
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
    const pathName = usePathname()
    const isActive = pathName == menuItem.path

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive} onClick={() => {
                    setOpenMobile(false)
                }} className={isActive ? "bg-black" : ""}>
                    <Link href={menuItem.path}>{menuItem.title}</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

export { AppSideBar }

