import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
    CalendarDays,
    Banknote,
    Clock,
    ArrowLeft,
    Pencil,
    FileText,
    Receipt
} from "lucide-react";

interface PageProps {
    params: Promise<{ id: string }>;
}

// Treatment type labels
const TREATMENT_LABELS: Record<string, string> = {
    adjust_tools: "ปรับเครื่องมือ/เปลี่ยนยาง",
    bonding: "ติดเครื่องมือ (Bracket)",
    scaling: "ขูดหินปูน",
    extraction: "ถอนฟัน",
    filling: "อุดฟัน",
    xray: "เอกซเรย์/พิมพ์ปาก",
    retention: "รับรีเทนเนอร์",
    other: "อื่นๆ",
};

export default async function TreatmentDetailPage({ params }: PageProps) {
    const { id } = await params;
    const supabase = await createClient();

    // Fetch treatment with items
    const { data: treatment } = await supabase
        .from("treatments")
        .select(`
            *,
            treatment_items (
                item_type,
                other_detail
            )
        `)
        .eq("id", id)
        .single();

    if (!treatment) {
        return notFound();
    }

    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-12">
            {/* Page Header */}
            <header className="space-y-4">
                <Link
                    href="/treatments"
                    className="inline-flex items-center gap-2 text-sm font-medium text-[#123458] hover:text-[#123458]/80 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    กลับไปรายการทั้งหมด
                </Link>

                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#123458]">
                            รายละเอียดการรักษา
                        </h1>
                        <p className="text-[#030303]/70">
                            วันที่ {format(new Date(treatment.visit_date), "d MMMM yyyy", { locale: th })}
                        </p>
                    </div>
                    <Link href={`/treatments/${id}/edit`}>
                        <Button
                            variant="outline"
                            className="border-[#123458]/25 text-[#123458] hover:bg-[#123458]/5 rounded-xl"
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            แก้ไข
                        </Button>
                    </Link>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 1: รายการที่ทำ
            ═══════════════════════════════════════════════════════════════ */}
            <Card className="bg-[#D4C9BE] border-none shadow-sm rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#F1EFEC] rounded-xl">
                        <FileText className="h-5 w-5 text-[#123458]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#123458]">
                        รายการที่ทำ
                    </h2>
                </div>

                <div className="space-y-2">
                    {treatment.treatment_items?.map((item: any, index: number) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-4 bg-[#F1EFEC] rounded-xl"
                        >
                            <div className="h-8 w-8 rounded-full bg-[#123458]/10 flex items-center justify-center text-sm font-bold text-[#123458]">
                                {index + 1}
                            </div>
                            <div>
                                <p className="font-semibold text-[#030303]">
                                    {TREATMENT_LABELS[item.item_type] || item.item_type}
                                </p>
                                {item.other_detail && (
                                    <p className="text-sm text-[#030303]/60">
                                        {item.other_detail}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 2: ค่าใช้จ่าย
            ═══════════════════════════════════════════════════════════════ */}
            <Card className="bg-[#D4C9BE] border-none shadow-sm rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#F1EFEC] rounded-xl">
                        <Banknote className="h-5 w-5 text-[#123458]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#123458]">
                        ค่าใช้จ่าย
                    </h2>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#F1EFEC] rounded-xl">
                    <span className="text-[#030303]/70 font-medium">ยอดชำระ</span>
                    <span className="text-2xl font-bold text-[#123458]">
                        ฿{treatment.total_cost?.toLocaleString() || 0}
                    </span>
                </div>

                {treatment.slip_url && (
                    <div className="space-y-2">
                        <p className="text-sm font-medium text-[#030303]/70 flex items-center gap-2">
                            <Receipt className="h-4 w-4" />
                            สลิปโอนเงิน
                        </p>
                        <a
                            href={treatment.slip_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                        >
                            <img
                                src={treatment.slip_url}
                                alt="สลิปโอนเงิน"
                                className="max-w-xs rounded-xl border border-[#123458]/10 hover:opacity-90 transition-opacity"
                            />
                        </a>
                    </div>
                )}
            </Card>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 3: นัดหมายครั้งถัดไป
            ═══════════════════════════════════════════════════════════════ */}
            <Card className="bg-[#D4C9BE] border-none shadow-sm rounded-2xl p-6 sm:p-8 space-y-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#F1EFEC] rounded-xl">
                        <Clock className="h-5 w-5 text-[#123458]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#123458]">
                        นัดหมายครั้งถัดไป
                    </h2>
                </div>

                <div className="p-4 bg-[#F1EFEC] rounded-xl">
                    {treatment.next_appointment_date ? (
                        <div className="flex items-center gap-3">
                            <CalendarDays className="h-5 w-5 text-[#123458]" />
                            <span className="text-lg font-semibold text-[#030303]">
                                {format(new Date(treatment.next_appointment_date), "d MMMM yyyy", { locale: th })}
                            </span>
                        </div>
                    ) : (
                        <p className="text-[#030303]/60">
                            ยังไม่ได้ระบุวันนัดครั้งถัดไป
                        </p>
                    )}
                </div>
            </Card>
        </div>
    );
}
