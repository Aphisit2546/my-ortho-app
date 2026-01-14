"use client";

import { useState } from "react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import {
    Calendar,
    FileText,
    MoreHorizontal,
    Pencil,
    Plus,
    Search,
    Trash,
    Filter,
    ClipboardList,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TreatmentCard } from "./TreatmentCard";

interface Treatment {
    id: string;
    visit_date: string;
    total_cost: number;
    next_appointment_date: string | null;
    slip_url: string | null;
    treatment_items: {
        item_type: string;
        other_detail: string | null;
    }[];
}

interface TreatmentListProps {
    initialTreatments: Treatment[];
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

const PAGE_SIZE_OPTIONS = [5, 10, 15, 20, 50];

export function TreatmentList({ initialTreatments }: TreatmentListProps) {
    const router = useRouter();
    const supabase = createClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<string>("all");

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Client-side filtering
    const filteredTreatments = initialTreatments.filter((treatment) => {
        const matchesSearch = searchTerm === "" || treatment.treatment_items.some(item =>
            (TYPE_LABELS[item.item_type] || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.other_detail || "").toLowerCase().includes(searchTerm.toLowerCase())
        );

        const matchesType = filterType === "all" || treatment.treatment_items.some(item => item.item_type === filterType);

        return matchesSearch && matchesType;
    });

    // Pagination calculations
    const totalItems = filteredTreatments.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedTreatments = filteredTreatments.slice(startIndex, endIndex);

    // Reset to page 1 when filter changes
    const handleFilterChange = (value: string) => {
        setFilterType(value);
        setCurrentPage(1);
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handlePageSizeChange = (value: string) => {
        setPageSize(Number(value));
        setCurrentPage(1);
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from("treatments")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("ลบข้อมูลเรียบร้อยแล้ว");
            router.refresh();
        } catch (error: any) {
            toast.error("ลบไม่สำเร็จ: " + error.message);
        }
    };

    // Empty State Component
    const EmptyState = () => (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="h-16 w-16 rounded-full bg-[#123458]/10 flex items-center justify-center mb-4">
                <ClipboardList className="h-8 w-8 text-[#123458]/60" />
            </div>
            <h3 className="text-lg font-semibold text-[#123458] mb-2">
                ไม่พบรายการรักษา
            </h3>
            <p className="text-[#030303]/50 text-sm mb-6 max-w-sm">
                เริ่มต้นเพิ่มรายการรักษาเพื่อบันทึกประวัติของคุณ
            </p>
            <Link href="/treatments/create">
                <Button className="bg-[#123458] hover:bg-[#123458]/90 text-white rounded-lg shadow-md hover:shadow-lg transition-all">
                    <Plus className="mr-2 h-4 w-4" />
                    เพิ่มรายการใหม่
                </Button>
            </Link>
        </div>
    );

    // Pagination Component
    const Pagination = () => {
        if (totalItems === 0) return null;

        return (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-[#123458]/10 bg-[#F1EFEC]/50">
                {/* Items per page selector */}
                <div className="flex items-center gap-2 text-sm text-[#030303]/70">
                    <span>แสดง</span>
                    <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
                        <SelectTrigger className="w-[70px] h-8 bg-[#F1EFEC] border-[#123458]/20 rounded-lg text-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#F1EFEC] border-[#D4C9BE]">
                            {PAGE_SIZE_OPTIONS.map((size) => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span>รายการ</span>
                    <span className="text-[#030303]/50 ml-2">
                        ({startIndex + 1}-{Math.min(endIndex, totalItems)} จาก {totalItems})
                    </span>
                </div>

                {/* Page navigation */}
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="h-8 px-2 text-[#123458] hover:bg-[#123458]/10 disabled:opacity-50"
                    >
                        หน้าแรก
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="h-8 w-8 text-[#123458] hover:bg-[#123458]/10 disabled:opacity-50"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            if (pageNum < 1 || pageNum > totalPages) return null;

                            return (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`h-8 w-8 ${currentPage === pageNum
                                            ? "bg-[#123458] text-white"
                                            : "text-[#123458] hover:bg-[#123458]/10"
                                        }`}
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="h-8 w-8 text-[#123458] hover:bg-[#123458]/10 disabled:opacity-50"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="h-8 px-2 text-[#123458] hover:bg-[#123458]/10 disabled:opacity-50"
                    >
                        หน้าสุดท้าย
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* ═══════════════════════════════════════════════════════════════
                Action Bar: Search + Filter + Add Button
            ═══════════════════════════════════════════════════════════════ */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                {/* Search Input */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#030303]/40" />
                    <Input
                        placeholder="ค้นหารายการรักษา..."
                        className="pl-10 h-11 bg-[#F1EFEC] border-[#123458]/20 focus-visible:ring-[#123458] focus-visible:border-[#123458] rounded-lg"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                    />
                </div>

                {/* Filter Dropdown */}
                <div className="w-full sm:w-[180px]">
                    <Select value={filterType} onValueChange={handleFilterChange}>
                        <SelectTrigger className="h-11 bg-[#F1EFEC] border-[#123458]/20 rounded-lg focus:ring-[#123458]">
                            <div className="flex items-center gap-2 text-[#030303]/70">
                                <Filter className="h-4 w-4" />
                                <SelectValue placeholder="ประเภท" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="bg-[#F1EFEC] border-[#D4C9BE]">
                            <SelectItem value="all">ทั้งหมด</SelectItem>
                            {Object.entries(TYPE_LABELS).map(([key, label]) => (
                                <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Add Button */}
                <Link href="/treatments/create" className="sm:w-auto">
                    <Button className="w-full sm:w-auto h-11 bg-[#123458] hover:bg-[#123458]/90 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-medium px-5">
                        <Plus className="mr-2 h-4 w-4" />
                        เพิ่มรายการใหม่
                    </Button>
                </Link>
            </div>


            {/* ═══════════════════════════════════════════════════════════════
                Data Section: Single Card containing Table
            ═══════════════════════════════════════════════════════════════ */}
            <Card className="bg-[#D4C9BE] border-none shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-0">

                    {/* Desktop View: Table */}
                    <div className="hidden md:block">
                        {paginatedTreatments.length > 0 ? (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b border-[#123458]/10">
                                        <TableHead className="w-[140px] text-[#123458] font-semibold text-sm py-4 pl-6">
                                            วันที่
                                        </TableHead>
                                        <TableHead className="text-[#123458] font-semibold text-sm py-4">
                                            รายการรักษา
                                        </TableHead>
                                        <TableHead className="w-[120px] text-right text-[#123458] font-semibold text-sm py-4">
                                            ค่าใช้จ่าย
                                        </TableHead>
                                        <TableHead className="w-[140px] text-[#123458] font-semibold text-sm py-4">
                                            นัดครั้งถัดไป
                                        </TableHead>
                                        <TableHead className="w-[60px] pr-6"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedTreatments.map((treatment, index) => (
                                        <TableRow
                                            key={treatment.id}
                                            className={`
                                                hover:bg-[#F1EFEC]/50 transition-colors border-b border-[#123458]/5
                                                ${index === paginatedTreatments.length - 1 ? 'border-b-0' : ''}
                                            `}
                                        >
                                            <TableCell className="font-medium text-[#030303] py-5 pl-6">
                                                {format(new Date(treatment.visit_date), "d MMM yyyy", { locale: th })}
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {treatment.treatment_items.map((item, idx) => (
                                                        <Badge
                                                            key={idx}
                                                            variant="outline"
                                                            className="font-normal text-xs bg-[#F1EFEC] text-[#030303] border-[#123458]/20 hover:bg-[#F1EFEC]"
                                                        >
                                                            {TYPE_LABELS[item.item_type] || item.item_type}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-semibold text-[#030303] py-5">
                                                {treatment.total_cost.toLocaleString()} ฿
                                            </TableCell>
                                            <TableCell className="py-5">
                                                {treatment.next_appointment_date ? (
                                                    <div className="flex items-center gap-1.5 text-sm text-[#030303]">
                                                        <Calendar className="h-4 w-4 text-[#123458]/60" />
                                                        {format(new Date(treatment.next_appointment_date), "d MMM yy", { locale: th })}
                                                    </div>
                                                ) : (
                                                    <span className="text-[#030303]/40 text-sm">—</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6 py-5">
                                                <AlertDialog>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-[#030303]/50 hover:text-[#123458] hover:bg-[#F1EFEC]"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-[#F1EFEC] border-[#D4C9BE]">
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
                                                                คุณต้องการลบรายการนี้ใช่ไหม การกระทำนี้ไม่สามารถกู้คืนได้
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel className="border-[#123458]/20 text-[#030303] hover:bg-[#D4C9BE]">
                                                                ยกเลิก
                                                            </AlertDialogCancel>
                                                            <AlertDialogAction
                                                                onClick={() => handleDelete(treatment.id)}
                                                                className="bg-red-600 hover:bg-red-700 text-white"
                                                            >
                                                                ลบข้อมูล
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <EmptyState />
                        )}
                    </div>

                    {/* Mobile View: Card List */}
                    <div className="md:hidden">
                        {paginatedTreatments.length > 0 ? (
                            <div className="divide-y divide-[#123458]/10">
                                {paginatedTreatments.map((treatment) => (
                                    <TreatmentCard key={treatment.id} treatment={treatment} />
                                ))}
                            </div>
                        ) : (
                            <EmptyState />
                        )}
                    </div>

                    {/* Pagination */}
                    <Pagination />

                </CardContent>
            </Card>
        </div>
    );
}
