"use client"
import { AppSideBar } from "@/components/ui/AppSideBar";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

function Main({ children }: { children: React.ReactNode }) {
    const [open, setOpen ] = useState(false)
 
    return ( 
    <SidebarProvider open={open} onOpenChange={setOpen}>
        <AppSideBar />
        <main className="w-full h-[100vh]">
            <SidebarTrigger />
            {children}
        </main>
    </SidebarProvider>
    )
}

export { Main }