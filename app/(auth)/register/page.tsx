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
import { Loader2 } from "lucide-react";
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

            // ✅ แก้ตรงนี้: ไม่ต้อง Alert แล้ว สั่งให้เด้งไป Dashboard เลย
            // เพราะปิด Confirm Email แล้ว สมัครปุ๊บ = Login ปั๊บ
            toast.success("สมัครสมาชิกสำเร็จ!"); // ใช้ toast แทน alert จะดูดีกว่า (อย่าลืม import toast)

            router.push("/dashboard");
            router.refresh();

        } catch (error) {
            setErrorMsg("เกิดข้อผิดพลาดบางอย่าง");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-primary">
                        ลงทะเบียนจัดฟัน
                    </CardTitle>
                    <CardDescription className="text-center">
                        สร้างบัญชีเพื่อเริ่มติดตามการรักษาของคุณ
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">อีเมล</label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                {...register("email")}
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs">{errors.email.message}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium">รหัสผ่าน</label>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                                className={errors.password ? "border-red-500" : ""}
                            />
                            {/* Password Strength Indicator */}
                            <PasswordStrength password={passwordValue} />
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-medium">ยืนยันรหัสผ่าน</label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...register("confirmPassword")}
                                className={errors.confirmPassword ? "border-red-500" : ""}
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Error Message */}
                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                                {errorMsg}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังสร้างบัญชี...
                                </>
                            ) : (
                                "สมัครสมาชิก"
                            )}
                        </Button>

                        <div className="text-center text-sm text-slate-600 mt-4">
                            มีบัญชีอยู่แล้ว?{" "}
                            <Link href="/login" className="text-primary hover:underline font-semibold">
                                เข้าสู่ระบบ
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}