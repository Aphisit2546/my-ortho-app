import { TreatmentForm } from "@/components/treatments/TreatmentForm";

export default function CreateTreatmentPage() {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-1 text-center sm:text-left">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                    บันทึกการรักษา
                </h1>
                <p className="text-muted-foreground">
                    เพิ่มข้อมูลรายการรักษาของคุณวันนี้ เพื่อติดตามความคืบหน้าอย่างต่อเนื่อง
                </p>
            </div>

            {/* Container for the form */}
            <div className="rounded-xl">
                <TreatmentForm />
            </div>
        </div>
    );
}