"use client";

import { useState } from "react";
import { useForm, SubmitHandler, Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon, Loader2, User, Camera, Mail, Pencil, X, Heart, Sparkles } from "lucide-react";
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
import { Card } from "@/components/ui/card";

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

    // Info Display Component
    const InfoItem = ({ label, value }: { label: string; value: string | null | undefined }) => (
        <div className="space-y-1">
            <p className="text-xs font-semibold text-[#123458]/60 uppercase tracking-wider">{label}</p>
            <p className="text-base font-semibold text-[#030303]">{value || "—"}</p>
        </div>
    );

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 py-6 px-4">

            {/* ═══════════════════════════════════════════════════════════════
                PROFILE HEADER CARD
            ═══════════════════════════════════════════════════════════════ */}
            <Card className="bg-gradient-to-br from-[#D4C9BE] to-[#D4C9BE]/80 border-none shadow-lg rounded-3xl p-8 text-center relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#123458]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#123458]/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10 space-y-5">
                    {/* Avatar */}
                    <div className="relative inline-block">
                        <Avatar className="h-32 w-32 border-4 border-[#F1EFEC] shadow-xl mx-auto ring-4 ring-[#123458]/10">
                            <AvatarImage src={previewUrl || ""} className="object-cover" />
                            <AvatarFallback className="bg-[#123458] text-[#F1EFEC] text-4xl font-bold">
                                {profile?.first_name?.[0]?.toUpperCase() || <User className="h-12 w-12" />}
                            </AvatarFallback>
                        </Avatar>

                        {isEditing && (
                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-1 right-1 bg-[#123458] text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-[#123458]/90 transition-all duration-200 hover:scale-110"
                            >
                                <Camera className="h-5 w-5" />
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
                        <h1 className="text-3xl sm:text-4xl font-bold text-[#123458] tracking-tight">
                            {profile?.first_name || "ยังไม่ระบุชื่อ"} {profile?.last_name || ""}
                        </h1>
                        <div className="inline-flex items-center gap-2 bg-[#F1EFEC]/60 px-4 py-2 rounded-full">
                            <Mail className="h-4 w-4 text-[#123458]/60" />
                            <span className="text-sm text-[#030303]/70">{user?.email}</span>
                        </div>
                    </div>

                    {/* Edit Button */}
                    {!isEditing && (
                        <Button
                            variant="outline"
                            onClick={() => setIsEditing(true)}
                            className="bg-[#F1EFEC] border-[#123458]/20 text-[#123458] hover:bg-[#123458] hover:text-white hover:border-[#123458] rounded-full px-8 h-12 font-semibold transition-all duration-300 shadow-sm hover:shadow-md"
                        >
                            <Pencil className="mr-2 h-4 w-4" />
                            แก้ไขโปรไฟล์
                        </Button>
                    )}
                </div>
            </Card>


            {/* ═══════════════════════════════════════════════════════════════
                PERSONAL INFORMATION CARD
            ═══════════════════════════════════════════════════════════════ */}
            <Card className="bg-[#D4C9BE] border-none shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#F1EFEC] rounded-xl shadow-sm">
                        <User className="h-5 w-5 text-[#123458]" />
                    </div>
                    <h2 className="text-lg font-bold text-[#123458]">
                        ข้อมูลส่วนตัว
                    </h2>
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {isEditing ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in fade-in duration-300">
                            {/* ชื่อจริง */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#030303]">ชื่อจริง <span className="text-red-500">*</span></label>
                                <Input
                                    {...form.register("firstName")}
                                    placeholder="กรอกชื่อจริง"
                                    className="h-12 bg-[#F1EFEC] border-[#123458]/20 rounded-xl"
                                />
                                {form.formState.errors.firstName && (
                                    <p className="text-xs text-red-600">{form.formState.errors.firstName.message}</p>
                                )}
                            </div>

                            {/* นามสกุล */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#030303]">นามสกุล <span className="text-red-500">*</span></label>
                                <Input
                                    {...form.register("lastName")}
                                    placeholder="กรอกนามสกุล"
                                    className="h-12 bg-[#F1EFEC] border-[#123458]/20 rounded-xl"
                                />
                                {form.formState.errors.lastName && (
                                    <p className="text-xs text-red-600">{form.formState.errors.lastName.message}</p>
                                )}
                            </div>

                            {/* ชื่อเล่น */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#030303]">ชื่อเล่น</label>
                                <Input
                                    {...form.register("nickname")}
                                    placeholder="กรอกชื่อเล่น (ไม่บังคับ)"
                                    className="h-12 bg-[#F1EFEC] border-[#123458]/20 rounded-xl"
                                />
                            </div>

                            {/* วันเกิด */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-[#030303]">วันเกิด</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-medium h-12 bg-[#F1EFEC] border-[#123458]/20 rounded-xl",
                                                !form.watch("birthDate") && "text-[#030303]/40"
                                            )}
                                        >
                                            <CalendarIcon className="mr-3 h-5 w-5 text-[#123458]/50" />
                                            {form.watch("birthDate")
                                                ? format(form.watch("birthDate")!, "d MMMM yyyy", { locale: th })
                                                : "เลือกวันเกิด"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={form.watch("birthDate")}
                                            onSelect={(date) => form.setValue("birthDate", date)}
                                            initialFocus
                                            captionLayout="dropdown"
                                            fromYear={1950}
                                            toYear={new Date().getFullYear()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                            <InfoItem label="ชื่อ-นามสกุล" value={profile?.first_name ? `${profile.first_name} ${profile.last_name}` : null} />
                            <InfoItem label="ชื่อเล่น" value={profile?.nickname} />
                            <InfoItem
                                label="วันเกิด"
                                value={profile?.birth_date ? format(new Date(profile.birth_date), "d MMMM yyyy", { locale: th }) : null}
                            />
                        </div>
                    )}


                    {/* ═══════════════════════════════════════════════════════════════
                        TREATMENT INFORMATION SECTION
                    ═══════════════════════════════════════════════════════════════ */}
                    <div className="pt-6 border-t border-[#123458]/10 space-y-6">
                        {/* Section Header */}
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-[#F1EFEC] rounded-xl shadow-sm">
                                <Heart className="h-5 w-5 text-[#123458]" />
                            </div>
                            <h2 className="text-lg font-bold text-[#123458]">
                                ข้อมูลการรักษา
                            </h2>
                        </div>

                        {isEditing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 animate-in fade-in duration-300">
                                {/* วันที่เริ่มติดเครื่องมือ */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-[#030303]">วันที่เริ่มติดเครื่องมือจัดฟัน</label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-medium h-12 bg-[#F1EFEC] border-[#123458]/20 rounded-xl",
                                                    !form.watch("orthoStartDate") && "text-[#030303]/40"
                                                )}
                                            >
                                                <CalendarIcon className="mr-3 h-5 w-5 text-[#123458]/50" />
                                                {form.watch("orthoStartDate")
                                                    ? format(form.watch("orthoStartDate")!, "d MMMM yyyy", { locale: th })
                                                    : "เลือกวันที่"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={form.watch("orthoStartDate")}
                                                onSelect={(date) => form.setValue("orthoStartDate", date)}
                                                initialFocus
                                                captionLayout="dropdown"
                                                fromYear={2010}
                                                toYear={new Date().getFullYear()}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                {/* Duration */}
                                {treatmentStats?.duration && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-[#030303]">ระยะเวลาการรักษา</label>
                                        <div className="h-12 bg-[#F1EFEC] border border-[#123458]/20 rounded-xl px-4 flex items-center text-[#030303]/60">
                                            {treatmentStats.duration}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                <InfoItem
                                    label="วันที่เริ่มติดเครื่องมือ"
                                    value={profile?.ortho_start_date ? format(new Date(profile.ortho_start_date), "d MMMM yyyy", { locale: th }) : null}
                                />
                                <InfoItem label="ระยะเวลาการรักษา" value={treatmentStats?.duration} />
                            </div>
                        )}
                    </div>


                    {/* ═══════════════════════════════════════════════════════════════
                        ACTION BUTTONS (EDIT MODE)
                    ═══════════════════════════════════════════════════════════════ */}
                    {isEditing && (
                        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6 animate-in slide-in-from-bottom duration-300">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleCancel}
                                disabled={isLoading}
                                className="text-[#030303]/70 hover:bg-[#F1EFEC] rounded-xl px-8 h-12 font-medium order-2 sm:order-1"
                            >
                                <X className="mr-2 h-4 w-4" />
                                ยกเลิก
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-[#123458] text-white hover:bg-[#123458]/90 rounded-xl px-8 h-12 font-semibold shadow-lg shadow-[#123458]/20 hover:shadow-xl transition-all duration-200 order-1 sm:order-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        กำลังบันทึก...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4" />
                                        บันทึกการเปลี่ยนแปลง
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </form>
            </Card>
        </div>
    );
}