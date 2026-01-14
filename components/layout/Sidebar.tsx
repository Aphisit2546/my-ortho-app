"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import {
    LayoutDashboard,
    ClipboardList,
    User,
    LogOut,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const menuItems = [
    {
        title: "ภาพรวม",
        subtitle: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "บันทึกการรักษา",
        subtitle: "Treatments",
        href: "/treatments",
        icon: ClipboardList,
    },
    {
        title: "ข้อมูลส่วนตัว",
        subtitle: "Profile",
        href: "/profile",
        icon: User,
    },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();
    const [userName, setUserName] = useState<string>("");

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("first_name")
                    .eq("id", user.id)
                    .single();
                setUserName(profile?.first_name || user.email?.split("@")[0] || "User");
            }
        };
        fetchUser();
    }, [supabase]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("ออกจากระบบไม่สำเร็จ");
        } else {
            toast.success("ออกจากระบบแล้ว");
            router.push("/login");
            router.refresh();
        }
    };

    return (
        <div className={cn(
            "flex flex-col bg-[#D4C9BE] border-r border-[#123458]/10 overflow-hidden",
            "h-full",
            className
        )}>
            {/* ═══════════════════════════════════════════════════════════════
                LOGO SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <div className="p-4 flex-shrink-0">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-xl bg-[#123458] flex items-center justify-center shadow-md">
                            <Sparkles className="h-5 w-5 text-[#F1EFEC]" />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-base font-bold text-[#123458] tracking-tight leading-tight">
                            OrthoTrack
                        </h1>
                        <p className="text-[10px] text-[#030303]/50 font-medium">
                            ติดตามการจัดฟัน
                        </p>
                    </div>
                </Link>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                NAVIGATION MENU - Scrollable
            ═══════════════════════════════════════════════════════════════ */}
            <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-[#F1EFEC] shadow-sm"
                                        : "hover:bg-[#F1EFEC]/50"
                                )}
                            >
                                <div className={cn(
                                    "flex-shrink-0 p-2 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-[#123458] text-[#F1EFEC]"
                                        : "bg-[#123458]/10 text-[#123458] group-hover:bg-[#123458]/20"
                                )}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={cn(
                                        "font-semibold text-sm leading-tight",
                                        isActive ? "text-[#123458]" : "text-[#030303]"
                                    )}>
                                        {item.title}
                                    </p>
                                    <p className="text-[10px] text-[#030303]/50">
                                        {item.subtitle}
                                    </p>
                                </div>
                                {isActive && (
                                    <div className="flex-shrink-0 h-2 w-2 rounded-full bg-[#123458]" />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* ═══════════════════════════════════════════════════════════════
                USER SECTION & LOGOUT - Compact, always visible
            ═══════════════════════════════════════════════════════════════ */}
            <div className="p-3 flex-shrink-0 border-t border-[#123458]/10 space-y-2">
                {/* User Info + Logout in one row */}
                <div className="flex items-center gap-2 px-2 py-2 bg-[#F1EFEC]/50 rounded-xl">
                    <div className="h-8 w-8 rounded-full bg-[#123458] flex items-center justify-center text-[#F1EFEC] font-bold text-xs flex-shrink-0">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-[#030303] truncate">
                            {userName}
                        </p>
                        <p className="text-[10px] text-[#030303]/50">
                            ผู้ใช้งาน
                        </p>
                    </div>
                </div>

                {/* Logout Button - Prominent */}
                <Button
                    variant="ghost"
                    className="w-full justify-center gap-2 px-3 py-2.5 h-10 text-red-600 hover:text-white hover:bg-red-500 rounded-xl transition-colors bg-red-50 border border-red-200"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    <span className="font-semibold text-sm">ออกจากระบบ</span>
                </Button>
            </div>
        </div>
    );
}