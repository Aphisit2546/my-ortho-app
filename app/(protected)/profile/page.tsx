import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInDays, differenceInMonths, differenceInYears } from "date-fns";

export default async function ProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    // ดึงข้อมูล Profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

    // ดึงข้อมูลการรักษา
    const { data: treatments } = await supabase
        .from("treatments")
        .select("visit_date, next_appointment_date")
        .eq("user_id", user?.id)
        .order("visit_date", { ascending: false });

    // Calculate Stats
    const totalVisits = treatments?.length || 0;
    const lastVisitDate = treatments?.[0]?.visit_date || null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextAppointment = treatments
        ?.filter(t => t.next_appointment_date && new Date(t.next_appointment_date) >= today)
        .sort((a, b) => new Date(a.next_appointment_date).getTime() - new Date(b.next_appointment_date).getTime())?.[0]?.next_appointment_date || null;

    // Duration Logic
    // If we sort descending, treatments[treatments.length - 1] is the first visit
    const firstVisitDate = treatments?.[treatments.length - 1]?.visit_date;
    const startDateRaw = profile?.ortho_start_date || firstVisitDate;

    let durationText = "เพิ่งเริ่มต้น";
    if (startDateRaw) {
        const start = new Date(startDateRaw);
        const years = differenceInYears(today, start);
        const months = differenceInMonths(today, start) % 12;
        const days = differenceInDays(today, start);

        if (years > 0) durationText = `${years} ปี ${months} เดือน`;
        else if (months > 0) durationText = `${months} เดือน`;
        else durationText = `${days} วัน`;
    }

    const treatmentStats = {
        totalVisits,
        lastVisitDate,
        nextAppointmentDate: nextAppointment,
        duration: durationText
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-10">
            {/* Header Title Section Removed as per new design request which focuses on the centered profile card itself directly */}
            {/* Note: The user requested "Profile Header (Centered)" inside the design. 
                 The current text "โปรไฟล์ของฉัน" might be redundant if the ProfileForm has a big header.
                 But I will keep the container clean. */}

            <ProfileForm user={user} profile={profile} treatmentStats={treatmentStats} />
        </div>
    );
}