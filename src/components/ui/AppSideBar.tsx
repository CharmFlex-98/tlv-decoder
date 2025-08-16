
import { Toaster } from "sonner";
import {Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarTrigger, SidebarMenuButton, useSidebar } from "./sidebar";
import Link from "next/link";
import { AppRoute } from "next/dist/build/swc/types";
import { AppRouteNames, Value } from "@/routes/routes";


// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
  },
  {
    title: "Inbox",
    url: "#",
  },
  {
    title: "Calendar",
    url: "#",
  },
  {
    title: "Search",
    url: "#",
  },
  {
    title: "Settings",
    url: "#",
  },
]

export interface AppSideBarProps {
    onMenuItemClicked: () => void
}


function AppSideBar() {
    const { setOpenMobile } = useSidebar()
    return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup >
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={() => setOpenMobile(false)}>
                    <Link href="/tlv-decoder">TLV Decoder</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={() => setOpenMobile(false)}>
                    <Link href="/json-formatter">JSON Formatter</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
             {/* <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/byte-converter">Byte Converter</Link>
                </SidebarMenuButton>
              </SidebarMenuItem> */}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <Toaster richColors position="top-center" />
    </Sidebar>
    )
}

export { AppSideBar }

