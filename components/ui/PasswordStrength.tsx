import { Check, X } from "lucide-react";

interface Props {
    password?: string;
}

export default function PasswordStrength({ password = "" }: Props) {
    const checks = [
        { label: "ความยาวอย่างน้อย 8 ตัวอักษร", pass: password.length >= 8 },
        { label: "มีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว", pass: /[A-Z]/.test(password) },
        { label: "มีตัวพิมพ์เล็กอย่างน้อย 1 ตัว", pass: /[a-z]/.test(password) },
        { label: "ไม่มีการเว้นวรรค", pass: /^\S*$/.test(password) && password.length > 0 },
    ];

    return (
        <div className="space-y-2 mt-2 p-3 bg-slate-50 rounded-md text-sm border">
            <p className="font-semibold text-slate-700 mb-1">ความปลอดภัยของรหัสผ่าน:</p>
            {checks.map((check, index) => (
                <div key={index} className="flex items-center gap-2">
                    {check.pass ? (
                        <Check className="w-4 h-4 text-green-500" />
                    ) : (
                        <X className="w-4 h-4 text-red-400" />
                    )}
                    <span className={check.pass ? "text-green-700" : "text-slate-500"}>
                        {check.label}
                    </span>
                </div>
            ))}
        </div>
    );
}