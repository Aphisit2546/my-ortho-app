import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ClipboardList, ShieldCheck, Smile, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F1EFEC]">
      {/* Header / Navbar */}
      <header className="bg-[#F1EFEC] border-b border-[#123458]/10 px-4 sm:px-6 py-3 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-[#123458] flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-[#F1EFEC]" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-[#123458]">OrthoTrack</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-[#123458] hover:bg-[#123458]/10 text-sm sm:text-base px-3 sm:px-4 h-9 sm:h-10"
              >
                เข้าสู่ระบบ
              </Button>
            </Link>
            <Link href="/register">
              <Button
                className="bg-[#123458] hover:bg-[#123458]/90 text-sm sm:text-base px-3 sm:px-4 h-9 sm:h-10 rounded-xl"
              >
                สมัครสมาชิก
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-12 sm:py-16 space-y-8 max-w-4xl mx-auto">
        <div className="space-y-4 sm:space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-[#123458] tracking-tight leading-tight">
            บันทึกการจัดฟัน <br />
            <span className="text-[#123458]/80">ง่าย ครบ จบในที่เดียว</span>
          </h1>
          <p className="text-base sm:text-lg text-[#030303]/70 max-w-2xl mx-auto leading-relaxed px-2">
            ระบบติดตามการรักษาทันตกรรมจัดฟัน ช่วยให้คุณจัดการประวัติการรักษา
            ค่าใช้จ่าย และวันนัดหมายได้อย่างเป็นระบบ ปลอดภัย และใช้งานง่าย
          </p>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <Link href="/register" className="block">
            <Button
              size="lg"
              className="w-full gap-2 text-base sm:text-lg h-12 sm:h-14 px-8 bg-[#123458] hover:bg-[#123458]/90 rounded-xl shadow-lg shadow-[#123458]/20"
            >
              เริ่มต้นใช้งานฟรี <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mt-12 sm:mt-16 w-full px-2">
          <FeatureCard
            icon={<ClipboardList className="h-6 w-6 sm:h-8 sm:w-8 text-[#123458]" />}
            title="บันทึกประวัติ"
            desc="เก็บข้อมูลการรักษา เปลี่ยนยาง ขูดหินปูน พร้อมแนบสลิปโอนเงิน"
          />
          <FeatureCard
            icon={<Smile className="h-6 w-6 sm:h-8 sm:w-8 text-[#123458]" />}
            title="ติดตามความคืบหน้า"
            desc="ดูจำนวนวันที่จัดฟัน และยอดเงินรวมทั้งหมดผ่าน Dashboard"
          />
          <FeatureCard
            icon={<ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-[#123458]" />}
            title="ปลอดภัย & เป็นส่วนตัว"
            desc="ข้อมูลของคุณถูกเก็บรักษาอย่างปลอดภัยด้วยมาตรฐานระดับสากล"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-[#030303]/50 text-sm border-t border-[#123458]/10 bg-[#F1EFEC] px-4">
        © {new Date().getFullYear()} OrthoTrack System. All rights reserved.
      </footer>
    </div>
  );
}

// Component ย่อยสำหรับ Card
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-[#D4C9BE] p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-left">
      <div className="mb-3 sm:mb-4 bg-[#F1EFEC] w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl">
        {icon}
      </div>
      <h3 className="font-bold text-base sm:text-lg mb-2 text-[#123458]">{title}</h3>
      <p className="text-[#030303]/70 text-sm sm:text-base leading-relaxed">{desc}</p>
    </div>
  );
}