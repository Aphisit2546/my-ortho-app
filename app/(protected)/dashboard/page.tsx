import { createClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coins, CalendarDays, Clock, Plus, ArrowRight, FileText } from "lucide-react";
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
        .order("visit_date", { ascending: true });

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

    const upcomingAppointments = treatments
        ?.filter(t => t.next_appointment_date && new Date(t.next_appointment_date) >= today)
        .sort((a, b) => new Date(a.next_appointment_date).getTime() - new Date(b.next_appointment_date).getTime());

    const nextAppt = upcomingAppointments?.[0];

    // C. ระยะเวลาจัดฟัน
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

    // D. รายการล่าสุด (เอา 1 อันล่าสุดมาโชว์)
    const latestTreatment = [...(treatments || [])].reverse()[0];

    return (
        <div className="max-w-6xl mx-auto space-y-10 pb-12">
            {/* ═══════════════════════════════════════════════════════════════
                PAGE HEADER
            ═══════════════════════════════════════════════════════════════ */}
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5">
                <div className="space-y-1">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#123458]">
                        Dashboard
                    </h1>
                    <p className="text-[#030303]/70 text-base sm:text-lg">
                        สวัสดี {profile?.first_name || "คุณ"}! นี่คือภาพรวมการจัดฟันของคุณ
                    </p>
                </div>
                <Link href="/treatments/create">
                    <Button className="bg-[#123458] text-[#F1EFEC] hover:bg-[#123458]/90 hover:shadow-lg transition-all h-12 px-6 rounded-xl font-semibold text-base">
                        <Plus className="mr-2 h-5 w-5" />
                        บันทึกรายการใหม่
                    </Button>
                </Link>
            </header>

            {/* ═══════════════════════════════════════════════════════════════
                SUMMARY CARDS (3 Cards)
            ═══════════════════════════════════════════════════════════════ */}
            <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Card 1: ค่าใช้จ่ายสะสม */}
                <StatCard
                    title="ค่าใช้จ่ายสะสม"
                    value={`฿${totalPaid.toLocaleString()}`}
                    description="รวมทุกรายการรักษา"
                    icon={Coins}
                />

                {/* Card 2: ระยะเวลาจัดฟัน */}
                <StatCard
                    title="ระยะเวลาจัดฟัน"
                    value={durationText}
                    description={startDateRaw
                        ? `เริ่มเมื่อ ${format(new Date(startDateRaw), "d MMM yy", { locale: th })}`
                        : "รอข้อมูลวันเริ่ม"}
                    icon={CalendarDays}
                />

                {/* Card 3: นัดครั้งถัดไป */}
                <StatCard
                    title="นัดครั้งถัดไป"
                    value={nextAppt
                        ? format(new Date(nextAppt.next_appointment_date), "d MMM", { locale: th })
                        : "ยังไม่มีนัด"}
                    description={nextAppt
                        ? `อีก ${differenceInDays(new Date(nextAppt.next_appointment_date), today)} วัน`
                        : "อย่าลืมจดวันนัดครั้งหน้านะ"}
                    icon={Clock}
                    className="sm:col-span-2 lg:col-span-1"
                />
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION: ประวัติล่าสุด
            ═══════════════════════════════════════════════════════════════ */}
            <section className="space-y-4">
                {/* Section Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#123458]">
                        ประวัติล่าสุด
                    </h2>
                    <Link
                        href="/treatments"
                        className="text-sm font-semibold text-[#123458] hover:text-[#123458]/80 flex items-center gap-1 transition-colors"
                    >
                        ดูทั้งหมด
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>

                {/* Latest Treatment Card */}
                <Card className="bg-[#D4C9BE] border-none shadow-sm rounded-2xl overflow-hidden">
                    {latestTreatment ? (
                        /* Has Data */
                        <div className="p-6 sm:p-8">
                            <div className="flex items-start gap-5">
                                {/* Icon */}
                                <div className="flex-shrink-0 h-14 w-14 rounded-2xl bg-[#F1EFEC] flex items-center justify-center shadow-sm">
                                    <CalendarDays className="h-7 w-7 text-[#123458]" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-2">
                                    <p className="text-xl sm:text-2xl font-bold text-[#030303]">
                                        {format(new Date(latestTreatment.visit_date), "d MMMM yyyy", { locale: th })}
                                    </p>
                                    <p className="text-base text-[#030303]/70 font-medium">
                                        ชำระเงิน <span className="font-bold text-[#123458]">฿{latestTreatment.total_cost.toLocaleString()}</span>
                                    </p>
                                    {latestTreatment.next_appointment_date && (
                                        <p className="text-sm text-[#030303]/60">
                                            นัดถัดไป: {format(new Date(latestTreatment.next_appointment_date), "d MMM yyyy", { locale: th })}
                                        </p>
                                    )}
                                </div>

                                {/* View Link */}
                                <Link
                                    href={`/treatments/${latestTreatment.id}`}
                                    className="hidden sm:flex items-center gap-2 text-sm font-semibold text-[#123458] hover:text-[#123458]/80 transition-colors px-4 py-2 rounded-lg hover:bg-[#F1EFEC]/50"
                                >
                                    ดูรายละเอียด
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    ) : (
                        /* Empty State */
                        <div className="text-center py-16 px-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#F1EFEC] mb-5 shadow-sm">
                                <FileText className="h-8 w-8 text-[#123458]/50" />
                            </div>
                            <h3 className="text-xl font-bold text-[#123458] mb-2">
                                ยังไม่มีรายการรักษา
                            </h3>
                            <p className="text-[#030303]/60 mb-6 max-w-sm mx-auto">
                                เริ่มบันทึกรายการรักษาของคุณได้เลย เพื่อติดตามความคืบหน้าการจัดฟัน
                            </p>
                            <Link href="/treatments/create">
                                <Button className="bg-[#123458] text-[#F1EFEC] hover:bg-[#123458]/90 h-11 px-6 rounded-xl font-semibold">
                                    <Plus className="mr-2 h-5 w-5" />
                                    เริ่มบันทึกรายการแรก
                                </Button>
                            </Link>
                        </div>
                    )}
                </Card>
            </section>
        </div>
    );
}