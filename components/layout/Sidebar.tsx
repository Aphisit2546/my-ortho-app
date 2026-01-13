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
    Smile,
} from "lucide-react";
import { toast } from "sonner";

const menuItems = [
    {
        title: "ภาพรวม (Dashboard)",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "บันทึกการรักษา",
        href: "/treatments",
        icon: ClipboardList,
    },
    {
        title: "ข้อมูลส่วนตัว",
        href: "/profile",
        icon: User,
    },
];

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }

export function Sidebar({ className }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            toast.error("ออกจากระบบไม่สำเร็จ");
        } else {
            toast.success("ออกจากระบบแล้ว");
            router.push("/login");
            router.refresh(); // เคลียร์ Cache
        }
    };

    return (
        <div className={cn("pb-12 h-screen border-r bg-sidebar text-sidebar-foreground", className)}>
            <div className="space-y-4 py-4">
                <div className="px-4 py-2 flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Smile className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-sidebar-foreground">
                        OrthoTrack
                    </h2>
                </div>
                <div className="px-3 py-2">
                    <div className="space-y-1">
                        {menuItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start gap-2",
                                        pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 left-0 w-full px-3">
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                >
                    <LogOut className="h-4 w-4" />
                    ออกจากระบบ
                </Button>
            </div>
        </div>
    );
}