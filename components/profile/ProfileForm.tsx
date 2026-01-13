"use client";

import { useState } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon, Loader2, User, Camera, Mail, Pencil, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Schema Validation
const profileSchema = z.object({
    firstName: z.string().min(1, "กรุณากรอกชื่อจริง"),
    lastName: z.string().min(1, "กรุณากรอกนามสกุล"),
    nickname: z.string().optional(),
    birthDate: z.date().optional(),
    orthoStartDate: z.date().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
    user: any;
    profile: any;
    treatmentStats?: {
        totalVisits: number;
        lastVisitDate: string | null;
        nextAppointmentDate: string | null;
        duration?: string;
    };
}

export function ProfileForm({ user, profile, treatmentStats }: ProfileFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.avatar_url);
    const router = useRouter();
    const supabase = createClient();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema) as Resolver<ProfileFormValues>,
        defaultValues: {
            firstName: profile?.first_name || "",
            lastName: profile?.last_name || "",
            nickname: profile?.nickname || "",
            birthDate: profile?.birth_date ? new Date(profile.birth_date) : undefined,
            orthoStartDate: profile?.ortho_start_date ? new Date(profile.ortho_start_date) : undefined,
        },
    });

    // Handle Image Selection
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const localPreview = URL.createObjectURL(file);
            setPreviewUrl(localPreview);
        }
    };

    const uploadAvatar = async (file: File) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `avatars/${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(fileName);
        return publicUrlData.publicUrl;
    };

    const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
        setIsLoading(true);
        try {
            let newAvatarUrl = profile?.avatar_url;

            if (avatarFile) {
                newAvatarUrl = await uploadAvatar(avatarFile);
            }

            const { error } = await supabase
                .from("profiles")
                .update({
                    first_name: data.firstName,
                    last_name: data.lastName,
                    nickname: data.nickname,
                    birth_date: data.birthDate ? format(data.birthDate, "yyyy-MM-dd") : null,
                    ortho_start_date: data.orthoStartDate ? format(data.orthoStartDate, "yyyy-MM-dd") : null,
                    avatar_url: newAvatarUrl,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", user.id);

            if (error) throw error;

            toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
            router.refresh();
            setIsEditing(false);
            setAvatarFile(null);

        } catch (error: any) {
            console.error(error);
            toast.error("เกิดข้อผิดพลาด: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        form.reset();
        setIsEditing(false);
        setAvatarFile(null);
        setPreviewUrl(profile?.avatar_url);
    };

    // Info Display Component - Clean & Minimal
    const InfoField = ({ label, value }: { label: string; value: string | null | undefined }) => (
        <div className="space-y-1.5">
            <p className="text-xs font-medium text-[#123458]/60 uppercase tracking-wider">{label}</p>
            <p className="text-base font-medium text-[#030303]">{value || "—"}</p>
        </div>
    );

    return (
        <div className="w-full max-w-2xl mx-auto space-y-8 py-8 px-4">

            {/* ═══════════════════════════════════════════════════════════════
                1. Profile Header - Centered
            ═══════════════════════════════════════════════════════════════ */}
            <header className="text-center space-y-5">
                {/* Avatar */}
                <div className="relative inline-block">
                    <Avatar className="h-28 w-28 border-4 border-[#D4C9BE] shadow-lg mx-auto ring-4 ring-[#F1EFEC]">
                        <AvatarImage src={previewUrl || ""} className="object-cover" />
                        <AvatarFallback className="bg-[#D4C9BE] text-[#123458] text-3xl font-semibold">
                            {profile?.first_name?.[0]?.toUpperCase() || <User className="h-10 w-10" />}
                        </AvatarFallback>
                    </Avatar>

                    {/* Camera overlay - only in Edit Mode */}
                    {isEditing && (
                        <label
                            htmlFor="avatar-upload"
                            className="absolute bottom-0 right-0 bg-[#123458] text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-[#123458]/90 transition-all duration-200 hover:scale-105"
                            aria-label="เปลี่ยนรูปโปรไฟล์"
                        >
                            <Camera className="h-4 w-4" />
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                                disabled={isLoading}
                            />
                        </label>
                    )}
                </div>

                {/* Name & Email */}
                <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[#123458] tracking-tight">
                        {profile?.first_name || "ยังไม่ระบุชื่อ"} {profile?.last_name || ""}
                    </h1>
                    <div className="flex items-center justify-center gap-2 text-[#030303]/50">
                        <Mail className="h-4 w-4" />
                        <span className="text-sm">{user?.email}</span>
                    </div>
                </div>

                {/* Edit Button (Ghost/Outline) - Only when NOT editing */}
                {!isEditing && (
                    <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        className="border-[#123458]/30 text-[#123458] hover:bg-[#123458] hover:text-white hover:border-[#123458] rounded-full px-6 h-10 font-medium transition-all duration-200"
                    >
                        <Pencil className="mr-2 h-4 w-4" />
                        แก้ไขโปรไฟล์
                    </Button>
                )}
            </header>


            {/* ═══════════════════════════════════════════════════════════════
                2. Single Information Card
            ═══════════════════════════════════════════════════════════════ */}
            <Card className="bg-[#D4C9BE] border-none shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="pb-0 pt-6 px-6">
                    <CardTitle className="flex items-center gap-2.5 text-[#123458] text-lg font-bold">
                        <User className="h-5 w-5" />
                        ข้อมูล
                    </CardTitle>
                </CardHeader>

                <CardContent className="pt-6 pb-8 px-6">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                        {/* ─────────────────────────────────────────────────────
                            Section 1: ข้อมูลส่วนตัว
                        ───────────────────────────────────────────────────── */}
                        <section className="space-y-5">
                            <h3 className="text-sm font-semibold text-[#123458] uppercase tracking-wide border-l-[3px] border-[#123458] pl-3">
                                ข้อมูลส่วนตัว
                            </h3>

                            {isEditing ? (
                                // EDIT MODE
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
                                    {/* ชื่อจริง */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#123458]">ชื่อจริง</label>
                                        <Input
                                            {...form.register("firstName")}
                                            placeholder="กรอกชื่อจริง"
                                            className="bg-[#F1EFEC] border-[#123458]/20 focus-visible:ring-[#123458] focus-visible:border-[#123458] rounded-lg h-11"
                                        />
                                        {form.formState.errors.firstName && (
                                            <p className="text-xs text-red-600">{form.formState.errors.firstName.message}</p>
                                        )}
                                    </div>

                                    {/* นามสกุล */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#123458]">นามสกุล</label>
                                        <Input
                                            {...form.register("lastName")}
                                            placeholder="กรอกนามสกุล"
                                            className="bg-[#F1EFEC] border-[#123458]/20 focus-visible:ring-[#123458] focus-visible:border-[#123458] rounded-lg h-11"
                                        />
                                        {form.formState.errors.lastName && (
                                            <p className="text-xs text-red-600">{form.formState.errors.lastName.message}</p>
                                        )}
                                    </div>

                                    {/* ชื่อเล่น */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#123458]">ชื่อเล่น</label>
                                        <Input
                                            {...form.register("nickname")}
                                            placeholder="กรอกชื่อเล่น (ไม่บังคับ)"
                                            className="bg-[#F1EFEC] border-[#123458]/20 focus-visible:ring-[#123458] focus-visible:border-[#123458] rounded-lg h-11"
                                        />
                                    </div>

                                    {/* วันเกิด */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#123458]">วันเกิด</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal bg-[#F1EFEC] border-[#123458]/20 hover:bg-[#F1EFEC] hover:border-[#123458]/40 rounded-lg h-11",
                                                        !form.watch("birthDate") && "text-[#030303]/40"
                                                    )}
                                                >
                                                    {form.watch("birthDate")
                                                        ? format(form.watch("birthDate")!, "d MMMM yyyy", { locale: th })
                                                        : "เลือกวันเกิด"}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-[#F1EFEC] border-[#D4C9BE] shadow-lg rounded-xl" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={form.watch("birthDate")}
                                                    onSelect={(date) => form.setValue("birthDate", date)}
                                                    initialFocus
                                                    captionLayout="dropdown"
                                                    fromYear={1950}
                                                    toYear={new Date().getFullYear()}
                                                    className="rounded-xl"
                                                    classNames={{
                                                        day_selected: "bg-[#123458] text-white hover:bg-[#123458]/90",
                                                        day_today: "bg-[#D4C9BE] text-[#030303]",
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                            ) : (
                                // READ-ONLY MODE - 3 Columns Grid
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <InfoField
                                        label="ชื่อ-นามสกุล"
                                        value={profile?.first_name ? `${profile.first_name} ${profile.last_name}` : null}
                                    />
                                    <InfoField
                                        label="ชื่อเล่น"
                                        value={profile?.nickname}
                                    />
                                    <InfoField
                                        label="วันเกิด"
                                        value={profile?.birth_date
                                            ? format(new Date(profile.birth_date), "d MMMM yyyy", { locale: th })
                                            : null
                                        }
                                    />
                                </div>
                            )}
                        </section>


                        {/* ─────────────────────────────────────────────────────
                            Section 2: ข้อมูลการรักษา
                        ───────────────────────────────────────────────────── */}
                        <section className="space-y-5">
                            <h3 className="text-sm font-semibold text-[#123458] uppercase tracking-wide border-l-[3px] border-[#123458] pl-3">
                                ข้อมูลการรักษา
                            </h3>

                            {isEditing ? (
                                // EDIT MODE
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in fade-in duration-300">
                                    {/* วันที่เริ่มติดเครื่องมือ */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[#123458]">วันที่เริ่มติดเครื่องมือจัดฟัน</label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal bg-[#F1EFEC] border-[#123458]/20 hover:bg-[#F1EFEC] hover:border-[#123458]/40 rounded-lg h-11",
                                                        !form.watch("orthoStartDate") && "text-[#030303]/40"
                                                    )}
                                                >
                                                    {form.watch("orthoStartDate")
                                                        ? format(form.watch("orthoStartDate")!, "d MMMM yyyy", { locale: th })
                                                        : "เลือกวันที่"}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0 bg-[#F1EFEC] border-[#D4C9BE] shadow-lg rounded-xl" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={form.watch("orthoStartDate")}
                                                    onSelect={(date) => form.setValue("orthoStartDate", date)}
                                                    initialFocus
                                                    captionLayout="dropdown"
                                                    fromYear={2010}
                                                    toYear={new Date().getFullYear()}
                                                    className="rounded-xl"
                                                    classNames={{
                                                        day_selected: "bg-[#123458] text-white hover:bg-[#123458]/90",
                                                        day_today: "bg-[#D4C9BE] text-[#030303]",
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    {/* Duration (Read-only info) */}
                                    {treatmentStats?.duration && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[#123458]">ระยะเวลาการรักษา</label>
                                            <div className="bg-[#F1EFEC] border border-[#123458]/20 rounded-lg h-11 px-3 flex items-center text-[#030303]/60">
                                                {treatmentStats.duration}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // READ-ONLY MODE
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <InfoField
                                        label="วันที่เริ่มติดเครื่องมือ"
                                        value={profile?.ortho_start_date
                                            ? format(new Date(profile.ortho_start_date), "d MMMM yyyy", { locale: th })
                                            : null
                                        }
                                    />
                                    <InfoField
                                        label="ระยะเวลาการรักษา"
                                        value={treatmentStats?.duration}
                                    />
                                </div>
                            )}
                        </section>


                        {/* ─────────────────────────────────────────────────────
                            Action Buttons (Edit Mode Only)
                        ───────────────────────────────────────────────────── */}
                        {isEditing && (
                            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6 animate-in slide-in-from-bottom duration-300">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={handleCancel}
                                    disabled={isLoading}
                                    className="text-[#123458] hover:bg-[#123458]/10 rounded-full px-8 h-11 font-medium order-2 sm:order-1"
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    ยกเลิก
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-[#123458] text-white hover:bg-[#123458]/90 rounded-full px-8 h-11 font-medium shadow-md hover:shadow-lg transition-all duration-200 order-1 sm:order-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            กำลังบันทึก...
                                        </>
                                    ) : (
                                        "บันทึกการเปลี่ยนแปลง"
                                    )}
                                </Button>
                            </div>
                        )}

                    </form>
                </CardContent>
            </Card>

        </div>
    );
}