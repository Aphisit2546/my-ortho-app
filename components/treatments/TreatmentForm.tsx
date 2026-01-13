"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon, Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// Schema Validation
const treatmentSchema = z.object({
    visitDate: z.date({ error: "กรุณาเลือกวันที่" }),
    totalCost: z.coerce.number().min(0, "ราคาต้องไม่ต่ำกว่า 0"),
    nextAppointment: z.date().optional(),
    items: z.array(
        z.object({
            type: z.string().min(1, "กรุณาเลือกรายการ"),
            otherDetail: z.string().optional(),
        })
    ).min(1, "ต้องมีรายการรักษาอย่างน้อย 1 รายการ"),
});

type TreatmentFormValues = z.infer<typeof treatmentSchema>;

const TREATMENT_TYPES = [
    { value: "adjust_tools", label: "ปรับเครื่องมือ/เปลี่ยนยาง" },
    { value: "bonding", label: "ติดเครื่องมือ (Bracket)" },
    { value: "scaling", label: "ขูดหินปูน" },
    { value: "extraction", label: "ถอนฟัน" },
    { value: "filling", label: "อุดฟัน" },
    { value: "xray", label: "เอกซเรย์/พิมพ์ปาก" },
    { value: "retention", label: "รับรีเทนเนอร์" },
    { value: "other", label: "อื่นๆ (ระบุ)" },
];

// เพิ่ม Props เพื่อรับข้อมูลสำหรับการแก้ไข
interface TreatmentFormProps {
    initialData?: any;     // ข้อมูลเดิม (กรณีแก้ไข)
    treatmentId?: string;  // ID ของรายการ (กรณีแก้ไข)
}

export function TreatmentForm({ initialData, treatmentId }: TreatmentFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const router = useRouter();
    const supabase = createClient();

    // Setup Form โดยเช็คว่ามีข้อมูลเดิมไหม
    const form = useForm<TreatmentFormValues>({
        resolver: zodResolver(treatmentSchema) as any,
        defaultValues: initialData ? {
            // กรณีแก้ไข: map ข้อมูลจาก DB เข้า Form
            visitDate: new Date(initialData.visit_date),
            totalCost: initialData.total_cost,
            nextAppointment: initialData.next_appointment_date ? new Date(initialData.next_appointment_date) : undefined,
            items: initialData.treatment_items.map((item: any) => ({
                type: item.item_type,
                otherDetail: item.other_detail || "",
            })),
        } : {
            // กรณีสร้างใหม่: ใช้ค่า Default
            visitDate: new Date(),
            items: [{ type: "adjust_tools", otherDetail: "" }],
            totalCost: 1000,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const onSubmit = async (data: TreatmentFormValues) => {
        setIsLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("ไม่พบข้อมูลผู้ใช้");

            // จัดการเรื่องรูปสลิป
            let slipUrl = initialData?.slip_url || null; // ใช้รูปเดิมไปก่อน

            // ถ้ามีการเลือกไฟล์ใหม่ ให้ Upload
            if (file) {
                const fileExt = file.name.split(".").pop();
                const fileName = `${user.id}/${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from("slips")
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage
                    .from("slips")
                    .getPublicUrl(fileName);

                slipUrl = publicUrlData.publicUrl;
            }

            let targetId = treatmentId;

            // ===========================
            // CASE 1: EDIT (มี ID ส่งมา)
            // ===========================
            if (treatmentId) {
                // 1. Update ข้อมูลหลักในตาราง treatments
                const { error: updateError } = await supabase
                    .from("treatments")
                    .update({
                        visit_date: format(data.visitDate, "yyyy-MM-dd"),
                        total_cost: data.totalCost,
                        next_appointment_date: data.nextAppointment
                            ? format(data.nextAppointment, "yyyy-MM-dd")
                            : null,
                        slip_url: slipUrl,
                    })
                    .eq("id", treatmentId);

                if (updateError) throw updateError;

                // 2. จัดการ Items: ลบของเก่าทิ้งทั้งหมด แล้วเดี๋ยว insert ใหม่ (ง่ายกว่ามานั่งเช็คทีละอัน)
                const { error: deleteItemsError } = await supabase
                    .from("treatment_items")
                    .delete()
                    .eq("treatment_id", treatmentId);

                if (deleteItemsError) throw deleteItemsError;
            }
            // ===========================
            // CASE 2: CREATE (ไม่มี ID)
            // ===========================
            else {
                const { data: treatment, error: txError } = await supabase
                    .from("treatments")
                    .insert({
                        user_id: user.id,
                        visit_date: format(data.visitDate, "yyyy-MM-dd"),
                        total_cost: data.totalCost,
                        next_appointment_date: data.nextAppointment
                            ? format(data.nextAppointment, "yyyy-MM-dd")
                            : null,
                        slip_url: slipUrl,
                    })
                    .select()
                    .single();

                if (txError) throw txError;
                targetId = treatment.id;
            }

            // 3. Insert Items (ใช้ Logic เดียวกันทั้ง Create และ Edit)
            const itemsToInsert = data.items.map((item) => ({
                treatment_id: targetId,
                item_type: item.type,
                other_detail: item.type === "other" ? item.otherDetail : null,
            }));

            const { error: itemsError } = await supabase
                .from("treatment_items")
                .insert(itemsToInsert);

            if (itemsError) throw itemsError;

            toast.success(treatmentId ? "แก้ไขข้อมูลสำเร็จ!" : "บันทึกข้อมูลสำเร็จ!");
            router.push("/treatments");
            router.refresh();

        } catch (error: any) {
            console.error(error);
            const errorMsg = error?.message || "Unknown error";
            toast.error("เกิดข้อผิดพลาด: " + errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* GROUP 1: ข้อมูลทั่วไปของการรักษา */}
            <div className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm p-6 space-y-6">
                <div className="border-b border-border/20 pb-2">
                    <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        ข้อมูลการรักษา
                    </h3>
                </div>

                <div className="grid gap-6">
                    {/* วันที่ */}
                    <div className="flex flex-col space-y-2">
                        <label className="text-sm font-medium text-foreground">วันที่ไปทำฟัน <span className="text-destructive">*</span></label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal bg-input border-input hover:bg-input/80",
                                        !form.watch("visitDate") && "text-muted-foreground"
                                    )}
                                >
                                    {form.watch("visitDate") ? (
                                        format(form.watch("visitDate"), "PPP", { locale: th })
                                    ) : (
                                        <span>เลือกวันที่</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={form.watch("visitDate")}
                                    onSelect={(date) => date && form.setValue("visitDate", date)}
                                    initialFocus
                                    captionLayout="dropdown"
                                    fromYear={2000}
                                    toYear={new Date().getFullYear() + 1}
                                />
                            </PopoverContent>
                        </Popover>
                        {form.formState.errors.visitDate && (
                            <p className="text-destructive text-xs">{form.formState.errors.visitDate.message}</p>
                        )}
                    </div>

                    {/* รายการรักษา */}
                    <div className="space-y-4">
                        <label className="text-sm font-medium text-foreground">รายการที่ทำ <span className="text-destructive">*</span></label>
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-[1fr,auto] gap-3 items-start animate-fade-in">
                                <div className="space-y-3 p-4 bg-background/50 rounded-lg border border-border/20">
                                    <Select
                                        onValueChange={(value) => form.setValue(`items.${index}.type`, value)}
                                        defaultValue={field.type}
                                    >
                                        <SelectTrigger className="bg-input border-input">
                                            <SelectValue placeholder="เลือกรายการ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {TREATMENT_TYPES.map((t) => (
                                                <SelectItem key={t.value} value={t.value}>
                                                    {t.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {form.watch(`items.${index}.type`) === "other" && (
                                        <Input
                                            placeholder="ระบุรายละเอียดเพิ่มเติม..."
                                            {...form.register(`items.${index}.otherDetail`)}
                                            className="bg-input"
                                        />
                                    )}
                                </div>

                                {fields.length > 1 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="mt-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </Button>
                                )}
                            </div>
                        ))}

                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="w-full sm:w-auto"
                            onClick={() => append({ type: "adjust_tools", otherDetail: "" })}
                        >
                            <Plus className="mr-2 h-4 w-4" /> เพิ่มรายการรักษา
                        </Button>
                        {form.formState.errors.items && (
                            <p className="text-destructive text-xs">{form.formState.errors.items.message}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* GROUP 2: ค่าใช้จ่าย & สลิป */}
            <div className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm p-6 space-y-6">
                <div className="border-b border-border/20 pb-2">
                    <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        ค่าใช้จ่าย
                    </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">ยอดชำระจริง (บาท)</label>
                        <div className="relative">
                            <Input
                                type="number"
                                {...form.register("totalCost")}
                                className="pl-8 text-lg font-semibold bg-input"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">฿</span>
                        </div>
                        <p className="text-xs text-muted-foreground">รวมค่าอุปกรณ์และค่าบริการทั้งหมด</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">แนบสลิปโอนเงิน</label>
                        <div className="flex items-center gap-4">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="cursor-pointer bg-input file:text-primary file:font-medium"
                            />
                        </div>
                        {initialData?.slip_url && !file && (
                            <div className="text-xs text-green-600 flex items-center gap-1">
                                ✓ มีสลิปเดิมแล้ว
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* GROUP 3: วันนัดครั้งถัดไป */}
            <div className="bg-card text-card-foreground rounded-xl border border-border/50 shadow-sm p-6 space-y-6">
                <div className="border-b border-border/20 pb-2">
                    <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                        <CalendarIcon className="h-5 w-5" />
                        นัดหมายครั้งถัดไป
                    </h3>
                </div>

                <div className="flex flex-col space-y-2">
                    <label className="text-sm font-medium text-foreground">วันนัดครั้งถัดไป (ถ้ามี)</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full sm:w-1/2 pl-3 text-left font-normal bg-input border-input",
                                    !form.watch("nextAppointment") && "text-muted-foreground"
                                )}
                            >
                                {form.watch("nextAppointment") ? (
                                    format(form.watch("nextAppointment")!, "PPP", { locale: th })
                                ) : (
                                    <span>ระบุวันนัด</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={form.watch("nextAppointment")}
                                onSelect={(date) => form.setValue("nextAppointment", date)}
                                initialFocus
                                captionLayout="dropdown"
                                fromYear={new Date().getFullYear()}
                                toYear={new Date().getFullYear() + 2}
                            />
                        </PopoverContent>
                    </Popover>
                    <p className="text-xs text-muted-foreground">หากยังไม่ทราบสามารถเว้นว่างได้ แล้วค่อยมาอัปเดตทีหลัง</p>
                </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-4">
                <Button
                    type="submit"
                    className="w-full h-12 text-lg shadow-md shadow-primary/10 transition-transform active:scale-[0.98]"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> กำลังบันทึก...
                        </>
                    ) : (
                        treatmentId ? "บันทึกการแก้ไข" : "ยืนยันการบันทึก"
                    )}
                </Button>
            </div>
        </form>
    );
}