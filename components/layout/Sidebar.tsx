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
            "flex flex-col h-screen bg-[#D4C9BE] border-r border-[#123458]/10",
            className
        )}>
            {/* ═══════════════════════════════════════════════════════════════
                LOGO SECTION
            ═══════════════════════════════════════════════════════════════ */}
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-3 group">
                    <div className="relative">
                        <div className="h-11 w-11 rounded-2xl bg-[#123458] flex items-center justify-center shadow-lg shadow-[#123458]/20 group-hover:shadow-[#123458]/30 transition-shadow">
                            <Sparkles className="h-6 w-6 text-[#F1EFEC]" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-[#D4C9BE]" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-[#123458] tracking-tight">
                            OrthoTrack
                        </h1>
                        <p className="text-xs text-[#030303]/50 font-medium">
                            ติดตามการจัดฟัน
                        </p>
                    </div>
                </Link>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                NAVIGATION MENU
            ═══════════════════════════════════════════════════════════════ */}
            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-[#F1EFEC] shadow-sm"
                                        : "hover:bg-[#F1EFEC]/50"
                                )}
                            >
                                <div className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-[#123458] text-[#F1EFEC]"
                                        : "bg-[#123458]/10 text-[#123458] group-hover:bg-[#123458]/20"
                                )}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className={cn(
                                        "font-semibold text-sm",
                                        isActive ? "text-[#123458]" : "text-[#030303]"
                                    )}>
                                        {item.title}
                                    </p>
                                    <p className="text-xs text-[#030303]/50">
                                        {item.subtitle}
                                    </p>
                                </div>
                                {isActive && (
                                    <div className="ml-auto h-2 w-2 rounded-full bg-[#123458]" />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* ═══════════════════════════════════════════════════════════════
                USER SECTION & LOGOUT
            ═══════════════════════════════════════════════════════════════ */}
            <div className="p-4 space-y-3">
                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-[#F1EFEC]/50 rounded-xl">
                    <div className="h-10 w-10 rounded-full bg-[#123458] flex items-center justify-center text-[#F1EFEC] font-bold text-sm">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-[#030303] truncate">
                            {userName}
                        </p>
                        <p className="text-xs text-[#030303]/50">
                            ผู้ใช้งาน
                        </p>
                    </div>
                </div>

                {/* Logout Button */}
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 px-4 py-3 h-auto text-[#030303]/70 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5" />
                    <span className="font-medium">ออกจากระบบ</span>
                </Button>
            </div>
        </div>
    );
}