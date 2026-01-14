import { TreatmentForm } from "@/components/treatments/TreatmentForm";

export default function CreateTreatmentPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-8 pb-12">
            {/* Page Header - Centered */}
            <header className="text-center space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#123458]">
                    บันทึกการรักษา
                </h1>
                <p className="text-[#030303]/70 text-base sm:text-lg max-w-md mx-auto">
                    เพิ่มข้อมูลรายการรักษาของคุณวันนี้ เพื่อติดตามความคืบหน้าอย่างต่อเนื่อง
                </p>
            </header>

            {/* Form Container */}
            <TreatmentForm />
        </div>
    );
}