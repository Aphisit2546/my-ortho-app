'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1EFEC] p-4">
            <Card className="w-full max-w-md bg-[#D4C9BE] border-none rounded-2xl shadow-lg p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-[#123458]">
                        เกิดข้อผิดพลาด
                    </h2>
                    <p className="text-[#030303]/70 text-sm">
                        ขออภัย เกิดข้อผิดพลาดบางอย่าง กรุณาลองใหม่อีกครั้ง
                    </p>
                    {error.digest && (
                        <p className="text-xs text-[#030303]/50 font-mono">
                            Error ID: {error.digest}
                        </p>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                        onClick={reset}
                        className="bg-[#123458] hover:bg-[#123458]/90 rounded-xl"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        ลองใหม่
                    </Button>
                    <Link href="/dashboard">
                        <Button
                            variant="outline"
                            className="border-[#123458]/20 text-[#123458] hover:bg-[#F1EFEC] rounded-xl w-full"
                        >
                            <Home className="mr-2 h-4 w-4" />
                            กลับหน้าหลัก
                        </Button>
                    </Link>
                </div>
            </Card>
        </div>
    )
}
