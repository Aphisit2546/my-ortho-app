"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function MobileHeader() {
    const [open, setOpen] = useState(false);

    return (
        <header className="flex md:hidden items-center justify-between border-b bg-background px-4 h-14 sticky top-0 z-50">
            <div className="flex items-center">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="-ml-2">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-72">
                        {/* จำเป็นต้องใส่ Title เพื่อ Accessibility แต่เราซ่อนไว้ได้ */}
                        <VisuallyHidden>
                            <SheetTitle>Menu</SheetTitle>
                        </VisuallyHidden>
                        {/* Reuse Sidebar Component */}
                        <Sidebar />
                    </SheetContent>
                </Sheet>
                <span className="font-bold ml-2">OrthoTrack</span>
            </div>
        </header>
    );
}