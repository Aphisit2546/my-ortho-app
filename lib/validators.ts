import { z } from "zod"

export const registerSchema = z.object({
    email: z.string().email("รูปแบบอีเมลไม่ถูกต้อง"),
    password: z
        .string()
        .min(8, "รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร")
        .regex(/[A-Z]/, "ต้องมีตัวพิมพ์ใหญ่อย่างน้อย 1 ตัว")
        .regex(/[a-z]/, "ต้องมีตัวพิมพ์เล็กอย่างน้อย 1 ตัว")
        .regex(/^\S*$/, "รหัสผ่านห้ามมีการเว้นวรรค"),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "รหัสผ่านไม่ตรงกัน",
    path: ["confirmPassword"],
})

export type RegisterSchema = z.infer<typeof registerSchema>