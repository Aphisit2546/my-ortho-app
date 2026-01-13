# Design System: Professional Luxe
**Single Theme (Light Mode Only)**

## 🎨 Color Palette
**Constraint: Strictly enforced.**

| Role | Color | Hex | Token Name | Usage |
|------|-------|-----|------------|-------|
| **Background** | Cream / Off-White | `#F1EFEC` | `--background` | Main application background, input background. |
| **Surface** | Warm Beige | `#D4C9BE` | `--card`, `--popover`, `--sidebar`, `--secondary`, `--muted`, `--accent` | Cards, Sidebar, Sections, Secondary Buttons. |
| **Primary** | Deep Navy | `#123458` | `--primary`, `--ring` | Navbar, Main Buttons, Highlights, Icons, Focus Rings. |
| **Text / Action** | Jet Black | `#030303` | `--foreground`, `--destructive` | Main text, Headings, Call-to-Action. |
| **Borders** | Navy (25% Opacity) | `#12345840` | `--border`, `--input` | Subtle dividers, Input borders, Card borders. |

## 🧩 Component Styling

### Typography
- **Font**: Geist Sans / Inter (Clean, modern sans-serif).
- **Headings**: `#030303` (Foreground).
- **Body**: `#030303` (Foreground) or `#123458` for muted text on beige backgrounds.

### Core Components
#### Button
- **Primary**: Background `#123458`, Text `#F1EFEC`.
- **Secondary**: Background `#D4C9BE`, Text `#123458`.
- **Ghost/Text**: Text `#030303`, Hover `#D4C9BE` (Accent).

#### Card
- **Background**: `#D4C9BE` (Surface).
- **Text**: `#030303`.
- **Border**: `#123458` (Low opacity).
- **Shadow**: Subtle.

#### Form / Input
- **Background**: `#F1EFEC` (Matches main background).
- **Border**: `#123458` (Low opacity).
- **Focus**: Ring `#123458` (Solid).

#### Sidebar
- **Background**: `#D4C9BE`.
- **Text**: `#030303`.
- **Active Item**: `#F1EFEC` (Background color) with `#123458` text.

## 🚫 Constraints
- No Dark Mode.
- No Theme Switching.
- No other colors allowed (only opacity variations of hierarchy).
