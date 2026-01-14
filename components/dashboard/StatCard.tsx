import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: React.ComponentType<{ className?: string }>;
    className?: string;
}

export function StatCard({
    title,
    value,
    description,
    icon: Icon,
    className,
}: StatCardProps) {
    return (
        <Card className={cn(
            "relative bg-[#D4C9BE] border-none shadow-sm rounded-2xl overflow-hidden",
            "hover:shadow-md transition-all duration-300 ease-out",
            "p-6",
            className
        )}>
            {/* Icon - Top Right */}
            <div className="absolute top-5 right-5">
                <div className="p-3 bg-[#F1EFEC] rounded-xl shadow-sm">
                    <Icon className="h-5 w-5 text-[#123458]" />
                </div>
            </div>

            {/* Content */}
            <div className="space-y-3 pr-16">
                {/* Title */}
                <p className="text-sm font-semibold text-[#123458]/70 uppercase tracking-wider">
                    {title}
                </p>

                {/* Main Value - Prominent */}
                <p className="text-3xl sm:text-4xl font-bold text-[#030303] leading-tight">
                    {value}
                </p>

                {/* Description */}
                {description && (
                    <p className="text-sm text-[#030303]/60 font-medium">
                        {description}
                    </p>
                )}
            </div>
        </Card>
    );
}