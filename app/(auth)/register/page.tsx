"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterSchema } from "@/lib/validators";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PasswordStrength from "@/components/ui/PasswordStrength";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, Lock, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();
    const supabase = createClient();

    // 1. Setup Form with React Hook Form + Zod
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        mode: "onChange", // ตรวจสอบทันทีที่พิมพ์
    });

    const passwordValue = watch("password");

    // 2. Handle Submit
    const onSubmit = async (data: RegisterSchema) => {
        setIsLoading(true);
        setErrorMsg("");

        try {
            // ส่งข้อมูลไป Supabase Auth
            const { error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
            });

            if (error) {
                setErrorMsg(error.message);
                return;
            }

            toast.success("สมัครสมาชิกสำเร็จ!");

            router.push("/dashboard");
            router.refresh();

        } catch (error) {
            setErrorMsg("เกิดข้อผิดพลาดบางอย่าง");
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
                        ลงทะเบียนบันทึกการจัดฟัน
                    </CardTitle>
                    <CardDescription className="text-center text-[#030303]/60">
                        สร้างบัญชีเพื่อเริ่มติดตามการรักษาของคุณ
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-6 sm:px-8 pb-8">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

                        {/* Email Field */}
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

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-semibold text-[#030303]">รหัสผ่าน</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#123458]/50" />
                                <Input
                                    id="password"
                                    type="password"
                                    {...register("password")}
                                    className={`pl-10 h-12 bg-[#F1EFEC] border-[#123458]/20 rounded-xl text-base ${errors.password ? "border-red-500" : ""}`}
                                />
                            </div>
                            {/* Password Strength Indicator */}
                            <PasswordStrength password={passwordValue} />
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-semibold text-[#030303]">ยืนยันรหัสผ่าน</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#123458]/50" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    {...register("confirmPassword")}
                                    className={`pl-10 h-12 bg-[#F1EFEC] border-[#123458]/20 rounded-xl text-base ${errors.confirmPassword ? "border-red-500" : ""}`}
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Error Message */}
                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
                                {errorMsg}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full h-12 bg-[#123458] hover:bg-[#123458]/90 rounded-xl font-semibold text-base"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังสร้างบัญชี...
                                </>
                            ) : (
                                "สมัครสมาชิก"
                            )}
                        </Button>

                        <div className="text-center text-sm text-[#030303]/60 pt-2">
                            มีบัญชีอยู่แล้ว?{" "}
                            <Link href="/login" className="text-[#123458] hover:underline font-semibold">
                                เข้าสู่ระบบ
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}