"use client"
import { AppSideBar, MenuGroup } from "@/components/ui/AppSideBar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

const menuGroups: MenuGroup[] = [
    {
        title: "Tools",
        items: [
            {
                title: "TLV Decoder",
                path: "/tlv-decoder", 
            }, 
            {
                title: "Json Formatter",
                path: "/json-formatter", 
            }, 
            {
                title: "String Encoder",
                path: "/byte-converter", 
            }
        ]
    }, 
]

function Main({ children }: { children: React.ReactNode }) {
    const [open, setOpen ] = useState(false)
 
    return ( 
    <SidebarProvider open={open} onOpenChange={setOpen}>
        <AppSideBar menuGroups={menuGroups}/>
        <main className="w-full h-[100vh]">
            <SidebarTrigger />
            {children}
        </main>
    </SidebarProvider>
    )
}

export { Main }