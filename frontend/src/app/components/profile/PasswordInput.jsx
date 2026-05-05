import { Eye, EyeOff } from "lucide-react";

export default function PasswordInput({ name, placeholder, show, showKey, form, onChangeForm, onToggleShow }) {

    const handleChange = (e) => {
        const { name, value } = e.target
        onChangeForm((prev) => ({ ...prev, [name]: value }))
    }

    const toggleShow = (field) => {
        onToggleShow((prev) => ({ ...prev, [field]: !prev[field] }))
    }

    return(
        <div className="relative">
            <input
            name={name}
            type={show[showKey] ? "text" : "password"}
            value={form[name]}
            onChange={handleChange}
            placeholder={placeholder}
            required
            className="w-full h-10 px-3 pr-9 rounded-lg border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
            />
            <button
            type="button"
            onClick={() => toggleShow(showKey)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
            {show[showKey] ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
        </div>
    )
}
