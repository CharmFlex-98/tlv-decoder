
import { Toaster } from "sonner";
import {Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarTrigger, SidebarMenuButton } from "./sidebar";
import Link from "next/link";


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


function AppSideBar() {
    return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup >
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/tlv-decoder">TLV Decoder</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
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

