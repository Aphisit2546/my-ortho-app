"use client";

import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export default function MobileHeader() {
    const [open, setOpen] = useState(false);

    return (
        <header className="flex md:hidden items-center justify-between border-b border-[#123458]/10 bg-[#F1EFEC] px-4 h-14 sticky top-0 z-50">
            <div className="flex items-center gap-2">
                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-[#123458]">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="left"
                        className="p-0 w-[280px] max-w-[85vw] bg-[#D4C9BE] border-r-0"
                    >
                        {/* Hidden Title for Accessibility */}
                        <VisuallyHidden>
                            <SheetTitle>เมนูหลัก</SheetTitle>
                        </VisuallyHidden>

                        {/* Sidebar with h-full to fill Sheet */}
                        <div className="h-full">
                            <Sidebar className="h-full" />
                        </div>
                    </SheetContent>
                </Sheet>
                <span className="font-bold text-[#123458]">OrthoTrack</span>
            </div>
        </header>
    );
}