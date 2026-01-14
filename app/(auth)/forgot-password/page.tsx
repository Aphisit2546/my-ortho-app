"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Mail, CheckCircle } from "lucide-react";

const forgotPasswordSchema = z.object({
    email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
});

type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const supabase = createClient();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordSchema>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordSchema) => {
        setIsLoading(true);
        setErrorMsg("");

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                setErrorMsg(error.message);
                return;
            }

            setIsSuccess(true);
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
                            <h2 className="text-2xl font-bold text-[#123458]">ส่งลิงก์แล้ว!</h2>
                            <p className="text-[#030303]/70">
                                กรุณาตรวจสอบอีเมลของคุณ เพื่อรีเซ็ตรหัสผ่าน
                            </p>
                        </div>
                        <Link href="/login">
                            <Button className="bg-[#123458] hover:bg-[#123458]/90 rounded-xl">
                                กลับไปหน้าเข้าสู่ระบบ
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F1EFEC] p-4">
            <Card className="w-full max-w-md shadow-lg bg-[#D4C9BE] border-none rounded-2xl">
                <CardHeader className="space-y-1 pb-4">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm font-medium text-[#123458] hover:text-[#123458]/80 transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        กลับ
                    </Link>
                    <CardTitle className="text-2xl font-bold text-center text-[#123458]">
                        ลืมรหัสผ่าน
                    </CardTitle>
                    <CardDescription className="text-center text-[#030303]/60">
                        กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-semibold text-[#030303]">
                                อีเมล
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#123458]/50" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    {...register("email")}
                                    className={`pl-10 h-12 bg-[#F1EFEC] border-[#123458]/20 rounded-xl ${errors.email ? "border-red-500" : ""}`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-xs">{errors.email.message}</p>
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
                                    กำลังส่ง...
                                </>
                            ) : (
                                "ส่งลิงก์รีเซ็ตรหัสผ่าน"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
