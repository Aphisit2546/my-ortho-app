"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarIcon, Loader2, Plus, Trash2, Banknote, Clock } from "lucide-react";
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

interface TreatmentFormProps {
    initialData?: any;
    treatmentId?: string;
}

export function TreatmentForm({ initialData, treatmentId }: TreatmentFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const form = useForm<TreatmentFormValues>({
        resolver: zodResolver(treatmentSchema) as any,
        defaultValues: initialData ? {
            visitDate: new Date(initialData.visit_date),
            totalCost: initialData.total_cost,
            nextAppointment: initialData.next_appointment_date ? new Date(initialData.next_appointment_date) : undefined,
            items: initialData.treatment_items.map((item: any) => ({
                type: item.item_type,
                otherDetail: item.other_detail || "",
            })),
        } : {
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

            let slipUrl = initialData?.slip_url || null;

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

            if (treatmentId) {
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

                const { error: deleteItemsError } = await supabase
                    .from("treatment_items")
                    .delete()
                    .eq("treatment_id", treatmentId);

                if (deleteItemsError) throw deleteItemsError;
            } else {
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

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 1: ข้อมูลการรักษา
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-[#D4C9BE] rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#F1EFEC] rounded-xl">
                        <CalendarIcon className="h-5 w-5 text-[#123458]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#123458]">
                        ข้อมูลการรักษา
                    </h3>
                </div>

                <div className="space-y-5">
                    {/* วันที่ไปทำฟัน */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#030303]">
                            วันที่ไปทำฟัน <span className="text-red-500">*</span>
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-medium h-12 bg-[#F1EFEC] border-[#123458]/20 hover:bg-[#F1EFEC]/80 hover:border-[#123458]/40 rounded-xl",
                                        !form.watch("visitDate") && "text-[#030303]/50"
                                    )}
                                >
                                    <CalendarIcon className="mr-3 h-5 w-5 text-[#123458]/60" />
                                    {form.watch("visitDate") ? (
                                        format(form.watch("visitDate"), "PPP", { locale: th })
                                    ) : (
                                        <span>เลือกวันที่</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={form.watch("visitDate")}
                                    onSelect={(date) => date && form.setValue("visitDate", date, { shouldDirty: true, shouldValidate: true })}
                                    initialFocus
                                    captionLayout="dropdown"
                                    fromYear={2000}
                                    toYear={new Date().getFullYear() + 1}
                                />
                            </PopoverContent>
                        </Popover>
                        {form.formState.errors.visitDate && (
                            <p className="text-red-500 text-sm">{form.formState.errors.visitDate.message}</p>
                        )}
                    </div>

                    {/* รายการที่ทำ */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-[#030303]">
                            รายการที่ทำ <span className="text-red-500">*</span>
                        </label>

                        <div className="space-y-3">
                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="flex gap-3 items-center animate-in fade-in-0 slide-in-from-top-2 duration-200"
                                >
                                    <div className="flex-1 space-y-3">
                                        <Select
                                            onValueChange={(value) => form.setValue(`items.${index}.type`, value)}
                                            defaultValue={field.type}
                                        >
                                            <SelectTrigger className="w-full h-12 bg-[#F1EFEC] border-[#123458]/25 rounded-xl font-medium text-[#030303]">
                                                <SelectValue placeholder="เลือกรายการรักษา" />
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
                                                className="h-12 bg-[#F1EFEC] border-[#123458]/25 rounded-xl"
                                            />
                                        )}
                                    </div>

                                    {fields.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl h-10 w-10 flex-shrink-0"
                                            onClick={() => remove(index)}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            className="w-full h-11 bg-[#F1EFEC] hover:bg-[#F1EFEC]/80 text-[#123458] border border-[#123458]/25 rounded-xl font-semibold"
                            onClick={() => append({ type: "adjust_tools", otherDetail: "" })}
                        >
                            <Plus className="mr-2 h-4 w-4" /> เพิ่มรายการรักษา
                        </Button>

                        {form.formState.errors.items && (
                            <p className="text-red-500 text-sm">{form.formState.errors.items.message}</p>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 2: ค่าใช้จ่าย
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-[#D4C9BE] rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#F1EFEC] rounded-xl">
                        <Banknote className="h-5 w-5 text-[#123458]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#123458]">
                        ค่าใช้จ่าย
                    </h3>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                    {/* ยอดชำระจริง */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#030303]">
                            ยอดชำระจริง (บาท)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#123458] font-bold text-lg">
                                ฿
                            </span>
                            <Input
                                type="number"
                                {...form.register("totalCost")}
                                className="pl-10 h-12 text-lg font-bold bg-[#F1EFEC] border-[#123458]/20 rounded-xl"
                            />
                        </div>
                        <p className="text-xs text-[#030303]/60">
                            รวมค่าประเมินและค่าบริการทั้งหมด
                        </p>
                    </div>

                    {/* แนบสลิป */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#030303]">
                            แนบสลิปโอนเงิน <span className="text-[#030303]/50 font-normal">(ไม่บังคับ)</span>
                        </label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="h-12 bg-[#F1EFEC] border-[#123458]/20 rounded-xl cursor-pointer file:bg-[#123458] file:text-[#F1EFEC] file:border-0 file:rounded-lg file:px-3 file:py-1 file:mr-3 file:font-medium file:cursor-pointer"
                        />
                        {initialData?.slip_url && !file && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                                ✓ มีสลิปเดิมแล้ว
                            </p>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 3: นัดหมายครั้งถัดไป
            ═══════════════════════════════════════════════════════════════ */}
            <section className="bg-[#D4C9BE] rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
                {/* Section Header */}
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-[#F1EFEC] rounded-xl">
                        <Clock className="h-5 w-5 text-[#123458]" />
                    </div>
                    <h3 className="text-lg font-bold text-[#123458]">
                        นัดหมายครั้งถัดไป
                    </h3>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-[#030303]">
                        วันนัดครั้งถัดไป <span className="text-[#030303]/50 font-normal">(ถ้ามี)</span>
                    </label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-full sm:w-1/2 justify-start text-left font-medium h-12 bg-[#F1EFEC] border-[#123458]/20 hover:bg-[#F1EFEC]/80 hover:border-[#123458]/40 rounded-xl",
                                    !form.watch("nextAppointment") && "text-[#030303]/50"
                                )}
                            >
                                <CalendarIcon className="mr-3 h-5 w-5 text-[#123458]/60" />
                                {form.watch("nextAppointment") ? (
                                    format(form.watch("nextAppointment")!, "PPP", { locale: th })
                                ) : (
                                    <span>ระบุวันนัด</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={form.watch("nextAppointment")}
                                onSelect={(date) => form.setValue("nextAppointment", date, { shouldDirty: true })}
                                initialFocus
                                captionLayout="dropdown"
                                fromYear={new Date().getFullYear()}
                                toYear={new Date().getFullYear() + 2}
                            />
                        </PopoverContent>
                    </Popover>
                    <p className="text-xs text-[#030303]/60">
                        หากยังไม่ทราบสามารถเว้นว่างได้ แล้วค่อยมาอัปเดตภายหลัง
                    </p>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════════
                PRIMARY ACTION BUTTON
            ═══════════════════════════════════════════════════════════════ */}
            <div className="pt-2">
                <Button
                    type="submit"
                    className="w-full h-14 text-lg font-bold bg-[#123458] hover:bg-[#123458]/90 text-[#F1EFEC] rounded-xl shadow-lg shadow-[#123458]/20 transition-all duration-200 active:scale-[0.98]"
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