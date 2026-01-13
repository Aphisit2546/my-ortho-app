import { createClient } from "@/lib/supabase/server";
import { TreatmentList } from "@/components/treatments/TreatmentList";

export default async function TreatmentsPage() {
    const supabase = await createClient();

    // 1. ดึงข้อมูล User ปัจจุบัน
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Query ข้อมูล Treatments + Join ตาราง Items
    const { data: treatments, error } = await supabase
        .from("treatments")
        .select(`
            *,
            treatment_items (
                item_type,
                other_detail
            )
        `)
        .eq("user_id", user?.id)
        .order("visit_date", { ascending: false });

    if (error) {
        return (
            <div className="max-w-5xl mx-auto py-8 px-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <p className="text-red-600 font-medium">เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
                    <p className="text-red-500 text-sm mt-1">{error.message}</p>
                </div>
            </div>
        );
    }

    const totalCount = treatments?.length || 0;

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
            {/* Page Header */}
            <header className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-[#123458] tracking-tight">
                    ประวัติการรักษา
                </h1>
                <p className="text-[#030303]/60 text-sm sm:text-base">
                    รายการรักษาและการชำระเงินทั้งหมด{" "}
                    <span className="font-semibold text-[#123458]">{totalCount}</span> รายการ
                </p>
            </header>

            {/* Treatment List Component (contains Action Bar + Data Section) */}
            <TreatmentList initialTreatments={treatments || []} />
        </div>
    );
}