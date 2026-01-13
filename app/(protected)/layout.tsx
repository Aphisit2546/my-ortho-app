import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";

export default async function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    // ตรวจสอบ Session ฝั่ง Server (ปลอดภัยที่สุด)
    const {
        data: { user },
    } = await supabase.auth.getUser();

    // ถ้าไม่มี User ให้เด้งกลับไปหน้า Login
    if (!user) {
        redirect("/login");
    }

    return (
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
            {/* Sidebar Desktop (ซ่อนใน Mobile) */}
            <aside className="hidden md:block w-64 fixed inset-y-0 z-50">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
                {/* Mobile Header (แสดงเฉพาะ Mobile) */}
                <MobileHeader />

                {/* เนื้อหาแต่ละหน้า (Dashboard, Treatments, etc.) */}
                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}