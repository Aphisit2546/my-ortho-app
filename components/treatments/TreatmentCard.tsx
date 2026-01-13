"use client";

import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Calendar, Coins, FileText, MoreVertical, Pencil, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TreatmentProps {
    treatment: {
        id: string;
        visit_date: string;
        total_cost: number;
        next_appointment_date: string | null;
        slip_url: string | null;
        treatment_items: {
            item_type: string;
            other_detail: string | null;
        }[];
    };
}

const TYPE_LABELS: Record<string, string> = {
    adjust_tools: "ปรับเครื่องมือ",
    bonding: "ติดเครื่องมือ",
    scaling: "ขูดหินปูน",
    extraction: "ถอนฟัน",
    filling: "อุดฟัน",
    xray: "เอกซเรย์",
    retention: "รีเทนเนอร์",
    other: "อื่นๆ",
};

export function TreatmentCard({ treatment }: TreatmentProps) {
    const router = useRouter();
    const supabase = createClient();

    const handleDelete = async () => {
        try {
            const { error } = await supabase
                .from("treatments")
                .delete()
                .eq("id", treatment.id);

            if (error) throw error;

            toast.success("ลบข้อมูลเรียบร้อยแล้ว");
            router.refresh();
        } catch (error: any) {
            toast.error("ลบไม่สำเร็จ: " + error.message);
        }
    };

    return (
        <div className="p-4 hover:bg-[#F1EFEC]/30 transition-colors">
            {/* Header: Date + Cost + Menu */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    {/* Date Badge */}
                    <div className="h-12 w-12 rounded-xl bg-[#F1EFEC] flex flex-col items-center justify-center">
                        <span className="font-bold text-lg text-[#123458] leading-none">
                            {format(new Date(treatment.visit_date), "dd", { locale: th })}
                        </span>
                        <span className="text-[10px] text-[#030303]/60 uppercase">
                            {format(new Date(treatment.visit_date), "MMM", { locale: th })}
                        </span>
                    </div>
                    {/* Date Details + Cost */}
                    <div className="flex flex-col">
                        <span className="text-sm text-[#030303]/60">
                            {format(new Date(treatment.visit_date), "yyyy", { locale: th })}
                        </span>
                        <div className="flex items-center gap-1.5 font-semibold text-[#030303]">
                            <Coins className="h-3.5 w-3.5 text-[#123458]/70" />
                            <span>{treatment.total_cost.toLocaleString()} ฿</span>
                        </div>
                    </div>
                </div>

                {/* Dropdown Menu */}
                <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 -mr-2 text-[#030303]/50 hover:text-[#123458] hover:bg-[#F1EFEC]"
                            >
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-36 bg-[#F1EFEC] border-[#D4C9BE]">
                            <Link href={`/treatments/${treatment.id}/edit`}>
                                <DropdownMenuItem className="cursor-pointer text-[#030303] focus:bg-[#D4C9BE]">
                                    <Pencil className="mr-2 h-4 w-4" /> แก้ไข
                                </DropdownMenuItem>
                            </Link>
                            {treatment.slip_url && (
                                <Link href={treatment.slip_url} target="_blank">
                                    <DropdownMenuItem className="cursor-pointer text-[#030303] focus:bg-[#D4C9BE]">
                                        <FileText className="mr-2 h-4 w-4" /> ดูสลิป
                                    </DropdownMenuItem>
                                </Link>
                            )}
                            <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-red-600 cursor-pointer focus:text-red-600 focus:bg-red-50">
                                    <Trash className="mr-2 h-4 w-4" /> ลบข้อมูล
                                </DropdownMenuItem>
                            </AlertDialogTrigger>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <AlertDialogContent className="bg-[#F1EFEC] border-[#D4C9BE]">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-[#123458]">ยืนยันการลบ?</AlertDialogTitle>
                            <AlertDialogDescription className="text-[#030303]/60">
                                คุณต้องการลบประวัติการรักษานี้ใช่ไหม การกระทำนี้ไม่สามารถกู้คืนได้
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="border-[#123458]/20 text-[#030303] hover:bg-[#D4C9BE]">
                                ยกเลิก
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                ยืนยันลบ
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            {/* Treatment Items */}
            <div className="flex flex-wrap gap-1.5 mb-3">
                {treatment.treatment_items.map((item, index) => (
                    <Badge
                        key={index}
                        variant="outline"
                        className="font-normal text-xs bg-[#F1EFEC] text-[#030303] border-[#123458]/20"
                    >
                        {TYPE_LABELS[item.item_type] || item.item_type}
                        {item.item_type === "other" && item.other_detail && (
                            <span className="ml-1 opacity-70">({item.other_detail})</span>
                        )}
                    </Badge>
                ))}
            </div>

            {/* Next Appointment + Slip */}
            <div className="flex items-center justify-between text-xs text-[#030303]/60">
                <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[#123458]/60" />
                    {treatment.next_appointment_date ? (
                        <span>
                            นัดหน้า:{" "}
                            <span className="font-medium text-[#030303]">
                                {format(new Date(treatment.next_appointment_date), "d MMM yy", { locale: th })}
                            </span>
                        </span>
                    ) : (
                        <span>ไม่ได้ระบุวันนัด</span>
                    )}
                </div>

                {treatment.slip_url && (
                    <Link href={treatment.slip_url} target="_blank">
                        <div className="flex items-center gap-1 hover:text-[#123458] transition-colors cursor-pointer">
                            <FileText className="h-3.5 w-3.5" />
                            <span>สลิป</span>
                        </div>
                    </Link>
                )}
            </div>
        </div>
    );
}