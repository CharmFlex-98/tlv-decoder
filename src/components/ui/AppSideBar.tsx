
import { Toaster } from "sonner";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarTrigger, SidebarMenuButton, useSidebar } from "./sidebar";
import Link from "next/link";
import { AppRoute } from "next/dist/build/swc/types";
import { AppRouteNames, Value } from "@/routes/routes";
import { useState } from "react";


export interface MenuGroup {
    title: string,
    items: MenuItem[]
}

interface MenuItem {
    title: string,
    path: string,
    isActive: boolean
}

interface AppSideBarProps {
    menuGroups: MenuGroup[]
}


function AppSideBar({ menuGroups: initialGroups }: AppSideBarProps) {
    const [menuGroups, setMenuGroups] = useState(initialGroups)
    const handleClick = ((clickedItem: MenuItem) => {
        setMenuGroups(menuGroups.map(group => ({
            ...group,
            items: group.items.map(item => ({
                ...item,
                isActive: item.path === clickedItem.path
            }))
        })));
    })


    return (
        <Sidebar>
            <SidebarContent>
                {menuGroups.map((group) => (
                    <MenuGroupView
                        key={group.title}
                        menuGroup={group}
                        onClick={(menuItem) => handleClick(menuItem)}
                    />
                ))}
            </SidebarContent>
        </Sidebar>
    )
}

function MenuGroupView({ menuGroup, onClick }: { menuGroup: MenuGroup, onClick: (menuItem: MenuItem) => void }) {
    return (
        < SidebarGroup >
            <SidebarGroupLabel>{menuGroup.title}</SidebarGroupLabel>
            <SidebarGroupContent>
                {menuGroup.items.map((menuItem) => (
                    <MenuItemView
                        key={menuItem.path}
                        menuItem={menuItem}
                        onClick={() => onClick(menuItem)}
                    />
                ))}
            </SidebarGroupContent>
        </SidebarGroup >
    )
}

function MenuItemView({ menuItem, onClick }: { menuItem: MenuItem, onClick: () => void }) {
    const { setOpenMobile } = useSidebar()

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={menuItem.isActive} onClick={() => {
                    onClick()
                    setOpenMobile(false)
                }} className={menuItem.isActive ? "bg-black" : ""}>
                    <Link href={menuItem.path}>{menuItem.title}</Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}

export { AppSideBar }

