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
import { Loader2 } from "lucide-react";

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
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center text-primary">
                        เข้าสู่ระบบ
                    </CardTitle>
                    <CardDescription className="text-center">
                        ยินดีต้อนรับกลับสู่ OrthoTrack
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

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

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label htmlFor="password" className="text-sm font-medium">รหัสผ่าน</label>
                                {/* อนาคตเพิ่มหน้าลืมรหัสผ่านได้ตรงนี้ */}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                {...register("password")}
                                className={errors.password ? "border-red-500" : ""}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs">{errors.password.message}</p>
                            )}
                        </div>

                        {errorMsg && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                                {errorMsg}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> กำลังเข้าสู่ระบบ...
                                </>
                            ) : (
                                "เข้าสู่ระบบ"
                            )}
                        </Button>

                        <div className="text-center text-sm text-slate-600 mt-4">
                            ยังไม่มีบัญชี?{" "}
                            <Link href="/register" className="text-primary hover:underline font-semibold">
                                สมัครสมาชิก
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}