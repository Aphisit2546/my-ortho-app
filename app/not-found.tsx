import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileX, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1EFEC] p-4">
            <Card className="w-full max-w-md bg-[#D4C9BE] border-none rounded-2xl shadow-lg p-8 text-center space-y-6">
                <div className="mx-auto w-20 h-20 bg-[#F1EFEC] rounded-full flex items-center justify-center">
                    <FileX className="h-10 w-10 text-[#123458]" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-6xl font-bold text-[#123458]">404</h1>
                    <h2 className="text-xl font-semibold text-[#030303]">
                        ไม่พบหน้าที่ต้องการ
                    </h2>
                    <p className="text-[#030303]/70 text-sm">
                        หน้าที่คุณกำลังมองหาอาจถูกย้าย ลบ หรือไม่เคยมีอยู่
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link href="/dashboard">
                        <Button className="bg-[#123458] hover:bg-[#123458]/90 rounded-xl w-full">
                            <Home className="mr-2 h-4 w-4" />
                            ไปหน้าหลัก
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    )
}
