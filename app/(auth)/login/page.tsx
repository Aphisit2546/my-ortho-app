"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Lock, Sparkles } from "lucide-react";

// Schema สำหรับ Login (เช็คแค่ว่าต้องกรอก)
const loginSchema = z.object({
    email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
    password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();
    const supabase = createClient();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginSchema) => {
        setIsLoading(true);
        setErrorMsg("");

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (error) {
                setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง"); // ไม่ควรบอกละเอียดว่าผิดอันไหนเพื่อความปลอดภัย
                return;
            }

            // Login สำเร็จ -> ไป Dashboard
            router.push("/dashboard");
            router.refresh(); // Refresh เพื่อให้ Server Component รู้ว่า User login แล้ว

        } catch (error) {
            setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1EFEC] p-4">
            <Card className="w-full max-w-md shadow-lg bg-[#D4C9BE] border-none rounded-2xl">
                <CardHeader className="space-y-4 pb-2 pt-8 px-6 sm:px-8">
                    {/* Logo */}
                    <div className="flex justify-center mb-2">
                        <div className="h-14 w-14 rounded-2xl bg-[#123458] flex items-center justify-center shadow-lg">
                            <Sparkles className="h-7 w-7 text-[#F1EFEC]" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl sm:text-3xl font-bold text-center text-[#123458]">
                        เข้าสู่ระบบ
                    </CardTitle>
                    <CardDescription className="text-center text-[#030303]/60">
                        ยินดีต้อนรับกลับสู่ Orthodontic Records
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-6 sm:px-8 pb-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-semibold text-[#030303]">อีเมล</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#123458]/50" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    {...register("email")}
                                    className={`pl-10 h-12 bg-[#F1EFEC] border-[#123458]/20 rounded-xl text-base ${errors.email ? "border-red-500" : ""}`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="password" className="text-sm font-semibold text-[#030303]">รหัสผ่าน</label>
                                <Link href="/forgot-password" className="text-xs font-medium text-[#123458] hover:underline">
                                    ลืมรหัสผ่าน?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#123458]/50" />
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    className={`pl-10 h-12 bg-[#F1EFEC] border-[#123458]/20 rounded-xl text-base ${errors.password ? "border-red-500" : ""}`}
                                />
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs">{errors.password.message}</p>
                            )}
                        </div>

                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
                                {errorMsg}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-[#123458] hover:bg-[#123458]/90 rounded-xl font-semibold text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังเข้าสู่ระบบ...
                                </>
                            ) : (
                                "เข้าสู่ระบบ"
                            )}
                        </Button>

                        <div className="text-center text-sm text-[#030303]/60 pt-2">
                            ยังไม่มีบัญชี?{" "}
                            <Link href="/register" className="text-[#123458] hover:underline font-semibold">
                                สมัครสมาชิก
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}