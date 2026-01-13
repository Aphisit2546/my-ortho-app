import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, ClipboardList, ShieldCheck, Smile } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header / Navbar */}
      <header className="bg-background border-b px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Smile className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-bold text-foreground">OrthoTrack</span>
        </div>
        <div className="space-x-4">
          <Link href="/login">
            <Button variant="ghost">เข้าสู่ระบบ</Button>
          </Link>
          <Link href="/register">
            <Button>สมัครสมาชิก</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight">
            บันทึกการจัดฟัน <br />
            <span className="text-primary">ง่าย ครบ จบในที่เดียว</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            ระบบติดตามการรักษาทันตกรรมจัดฟัน ช่วยให้คุณจัดการประวัติการรักษา
            ค่าใช้จ่าย และวันนัดหมายได้อย่างเป็นระบบ ปลอดภัย และใช้งานง่าย
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto gap-2 text-lg h-12 px-8">
              เริ่มต้นใช้งานฟรี <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mt-16 text-left w-full">
          <FeatureCard
            icon={<ClipboardList className="h-8 w-8 text-primary" />}
            title="บันทึกประวัติ"
            desc="เก็บข้อมูลการรักษา เปลี่ยนยาง ขูดหินปูน พร้อมแนบสลิปโอนเงิน"
          />
          <FeatureCard
            icon={<Smile className="h-8 w-8 text-primary" />}
            title="ติดตามความคืบหน้า"
            desc="ดูจำนวนวันที่จัดฟัน และยอดเงินรวมทั้งหมดผ่าน Dashboard"
          />
          <FeatureCard
            icon={<ShieldCheck className="h-8 w-8 text-primary" />}
            title="ปลอดภัย & เป็นส่วนตัว"
            desc="ข้อมูลของคุณถูกเก็บรักษาอย่างปลอดภัยด้วยมาตรฐานระดับสากล"
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-muted-foreground text-sm border-t bg-background">
        © {new Date().getFullYear()} OrthoTrack System. All rights reserved.
      </footer>
    </div>
  );
}

// Component ย่อยสำหรับ Card
function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-card text-card-foreground p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 bg-primary/10 w-12 h-12 flex items-center justify-center rounded-lg">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}