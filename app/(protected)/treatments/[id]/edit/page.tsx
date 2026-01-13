import { createClient } from "@/lib/supabase/server";
import { TreatmentForm } from "@/components/treatments/TreatmentForm";
import { notFound } from "next/navigation";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditTreatmentPage({ params }: PageProps) {
    const { id } = await params; // Next.js 15 ต้อง await params
    const supabase = await createClient();

    // ดึงข้อมูลเดิมมาโชว์
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
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                    แก้ไขข้อมูลการรักษา
                </h1>
                <p className="text-slate-500">
                    ปรับปรุงข้อมูลวันที่ {treatment.visit_date}
                </p>
            </div>

            <div className="bg-white p-6 rounded-xl border shadow-sm">
                {/* ส่งข้อมูลเดิม + ID ไปให้ฟอร์ม */}
                <TreatmentForm initialData={treatment} treatmentId={id} />
            </div>
        </div>
    );
}