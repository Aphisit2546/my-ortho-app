"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import PasswordStrength from "@/components/ui/PasswordStrength";

const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
        .regex(/[A-Z]/, "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว")
        .regex(/[a-z]/, "ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว")
        .regex(/^\S*$/, "รหัสผ่านห้ามมีการเว้นวรรค"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
});

type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordSchema>({
        resolver: zodResolver(resetPasswordSchema),
        mode: "onChange",
    });

    const passwordValue = watch("password");

    // Check if user came from email link
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // No session means invalid or expired link
                toast.error("ลิงก์หมดอายุหรือไม่ถูกต้อง");
                router.push("/forgot-password");
            }
        };
        checkSession();
    }, [supabase, router]);

    const onSubmit = async (data: ResetPasswordSchema) => {
        setIsLoading(true);
        setErrorMsg("");

        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            });

            if (error) {
                setErrorMsg(error.message);
                return;
            }

            setIsSuccess(true);
            toast.success("เปลี่ยนรหัสผ่านสำเร็จ!");

            // Redirect to dashboard after 2 seconds
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);

        } catch (error) {
            setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F1EFEC] p-4">
                <Card className="w-full max-w-md shadow-lg bg-[#D4C9BE] border-none rounded-2xl">
                    <CardContent className="pt-8 pb-8 text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-bold text-[#123458]">เปลี่ยนรหัสผ่านสำเร็จ!</h2>
                            <p className="text-[#030303]/70">
                                กำลังพาคุณไปหน้า Dashboard...
                            </p>
                        </div>
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-[#123458]" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1EFEC] p-4">
            <Card className="w-full max-w-md shadow-lg bg-[#D4C9BE] border-none rounded-2xl">
                <CardHeader className="space-y-1 pb-4">
                    <CardTitle className="text-2xl font-bold text-center text-[#123458]">
                        ตั้งรหัสผ่านใหม่
                    </CardTitle>
                    <CardDescription className="text-center text-[#030303]/60">
                        กรุณากรอกรหัสผ่านใหม่ของคุณ
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {/* New Password */}
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-semibold text-[#030303]">
                                รหัสผ่านใหม่
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#123458]/50" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    {...register("password")}
                                    className={`pl-10 pr-10 h-12 bg-[#F1EFEC] border-[#123458]/20 rounded-xl ${errors.password ? "border-red-500" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#123458]/50 hover:text-[#123458]"
                                >
                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            <PasswordStrength password={passwordValue} />
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label htmlFor="confirmPassword" className="text-sm font-semibold text-[#030303]">
                                ยืนยันรหัสผ่านใหม่
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#123458]/50" />
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    {...register("confirmPassword")}
                                    className={`pl-10 pr-10 h-12 bg-[#F1EFEC] border-[#123458]/20 rounded-xl ${errors.confirmPassword ? "border-red-500" : ""}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#123458]/50 hover:text-[#123458]"
                                >
                                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-200">
                                {errorMsg}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-[#123458] hover:bg-[#123458]/90 rounded-xl font-semibold"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    กำลังบันทึก...
                                </>
                            ) : (
                                "ยืนยันรหัสผ่านใหม่"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
