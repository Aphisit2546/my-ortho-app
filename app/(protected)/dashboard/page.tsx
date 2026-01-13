import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, CalendarDays, Clock, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format, differenceInDays, differenceInMonths, differenceInYears } from "date-fns";
import { th } from "date-fns/locale";

export default async function DashboardPage() {
    const supabase = await createClient();

    // 1. ดึงข้อมูล User
    const { data: { user } } = await supabase.auth.getUser();

    // 2. ดึงข้อมูลการรักษาทั้งหมด (เรียงตามวันที่ทำ)
    const { data: treatments } = await supabase
        .from("treatments")
        .select("id, visit_date, total_cost, next_appointment_date")
        .eq("user_id", user?.id)
        .order("visit_date", { ascending: true }); // เรียงเก่า -> ใหม่ เพื่อหาวันแรก

    // 2.1 ดึงข้อมูล Profile เพื่อเอาวันเริ่มจัดฟัน
    const { data: profile } = await supabase
        .from("profiles")
        .select("ortho_start_date, first_name")
        .eq("id", user?.id)
        .single();

    // --- คำนวณ Logic ---

    // A. ยอดเงินรวม
    const totalPaid = treatments?.reduce((sum, item) => sum + item.total_cost, 0) || 0;

    // B. วันนัดครั้งถัดไป (หาอันแรกที่ยังไม่ถึงกำหนด)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // กรองเอาเฉพาะวันที่ Next Appointment >= วันนี้
    const upcomingAppointments = treatments
        ?.filter(t => t.next_appointment_date && new Date(t.next_appointment_date) >= today)
        .sort((a, b) => new Date(a.next_appointment_date).getTime() - new Date(b.next_appointment_date).getTime());

    const nextAppt = upcomingAppointments?.[0]; // เอาอันที่ใกล้ที่สุด

    // C. ระยะเวลาจัดฟัน
    // ใช้ ortho_start_date จาก Profile เป็นหลัก ถ้าไม่มีค่อยใช้ First Visit
    const startDateRaw = profile?.ortho_start_date || treatments?.[0]?.visit_date;

    let durationText = "เพิ่งเริ่มต้น";
    if (startDateRaw) {
        const start = new Date(startDateRaw);
        const years = differenceInYears(today, start);
        const months = differenceInMonths(today, start) % 12;
        const days = differenceInDays(today, start);

        if (years > 0) durationText = `${years} ปี ${months} เดือน`;
        else if (months > 0) durationText = `${months} เดือน`;
        else durationText = `${days} วัน`;
    }

    // D. รายการล่าสุด (เอา 3 อันล่าสุดมาโชว์)
    // ต้อง reverse กลับ เพราะตอน fetch เราเรียงเก่า->ใหม่
    const recentTreatments = [...(treatments || [])].reverse().slice(0, 5); // Show top 5

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#123458]/10 pb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#123458]">
                        Dashboard
                    </h1>
                    <p className="text-[#030303]/70 text-lg mt-1">
                        ยินดีต้อนรับ {profile?.first_name || "กลับ"}, ภาพรวมการรักษาของคุณ
                    </p>
                </div>
                <Link href="/treatments/create">
                    <Button className="bg-[#123458] text-[#F1EFEC] hover:bg-[#123458]/90 hover:shadow-lg transition-all h-11 px-6 rounded-xl">
                        <Plus className="mr-2 h-5 w-5" /> บันทึกรายการใหม่
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* Card 1: ค่าใช้จ่าย */}
                <StatCard
                    title="ค่าใช้จ่ายสะสม"
                    value={`฿${totalPaid.toLocaleString()}`}
                    description="รวมทุกรายการรักษา"
                    icon={Coins}
                    iconColor="text-[#123458]"
                />

                {/* Card 2: ระยะเวลา */}
                <StatCard
                    title="ระยะเวลาจัดฟัน"
                    value={durationText}
                    description={startDateRaw ? `เริ่มเมื่อ ${format(new Date(startDateRaw), "d MMM yy", { locale: th })}` : "รอข้อมูลวันเริ่ม"}
                    icon={CalendarDays}
                    iconColor="text-[#123458]"
                />

                {/* Card 3: นัดครั้งหน้า */}
                <StatCard
                    title="นัดครั้งถัดไป"
                    value={nextAppt
                        ? format(new Date(nextAppt.next_appointment_date), "d MMM", { locale: th })
                        : "ยังไม่มีนัด"}
                    description={nextAppt
                        ? `อีก ${differenceInDays(new Date(nextAppt.next_appointment_date), today)} วัน`
                        : "อย่าลืมจดวันนัดครั้งหน้านะ"}
                    icon={Clock}
                    iconColor="text-[#123458]"
                />
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-xl font-bold text-[#123458]">ประวัติล่าสุด</h2>
                    <Link href="/treatments" className="text-sm font-medium text-[#123458] hover:underline flex items-center">
                        ดูทั้งหมด <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                </div>

                <Card className="bg-[#D4C9BE] border-none shadow-sm rounded-2xl overflow-hidden">
                    <CardContent className="p-0">
                        <div className="divide-y divide-[#123458]/10">
                            {recentTreatments.length > 0 ? (
                                recentTreatments.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-5 hover:bg-[#123458]/5 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-[#F1EFEC] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                                                <CalendarDays className="h-6 w-6 text-[#123458]" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-[#030303] text-lg">
                                                    {format(new Date(item.visit_date), "d MMMM yyyy", { locale: th })}
                                                </p>
                                                <p className="text-[#030303]/60 font-medium">
                                                    ชำระเงิน {item.total_cost.toLocaleString()} บาท
                                                </p>
                                            </div>
                                        </div>
                                        {item.next_appointment_date && (
                                            <Badge variant="outline" className="hidden sm:flex border-[#123458]/30 text-[#123458] bg-transparent font-medium px-3 py-1">
                                                นัด: {format(new Date(item.next_appointment_date), "d MMM", { locale: th })}
                                            </Badge>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#123458]/10 mb-3">
                                        <Coins className="h-6 w-6 text-[#123458]/50" />
                                    </div>
                                    <h3 className="text-lg font-medium text-[#123458]">ยังไม่มีรายการรักษา</h3>
                                    <p className="text-[#030303]/60">เริ่มบันทึกรายการรักษาของคุณได้เลย</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}