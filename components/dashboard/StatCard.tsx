import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    className?: string;
    iconColor?: string;
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    className,
    iconColor = "text-[#123458]"
}: StatCardProps) {
    return (
        <Card className={cn("bg-[#D4C9BE] border-none shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-shadow duration-200", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#123458]/80 uppercase tracking-wide">
                    {title}
                </CardTitle>
                <div className="p-2 bg-[#F1EFEC]/50 rounded-full">
                    <Icon className={cn("h-4 w-4", iconColor)} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-[#030303]">{value}</div>
                {description && (
                    <p className="text-sm text-[#030303]/60 mt-1 font-medium">{description}</p>
                )}
            </CardContent>
        </Card>
    );
}