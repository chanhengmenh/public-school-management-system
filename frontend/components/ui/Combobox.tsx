'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface ComboboxProps {
    label?: string;
    value: string;
    onChange: (val: string) => void;
    options: string[];
    placeholder: string;
    onAddCustom?: (val: string) => void;
}

export function Combobox({
    label, value, onChange, options, placeholder, onAddCustom
}: ComboboxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const trimmed = value.trim();
            if (trimmed !== '') {
                if (onAddCustom && !options.includes(trimmed)) {
                    onAddCustom(trimmed);
                }
                onChange(trimmed);
                setIsOpen(false);
                inputRef.current?.blur();
            }
        }
    };

    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(value.toLowerCase()));

    return (
        <div className="relative w-full" ref={wrapperRef}>
            {label && <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">{label}</label>}
            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    type="text" value={value}
                    onChange={(e) => { onChange(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-medium text-slate-900 shadow-sm"
                />
                <ChevronDown className={`absolute right-3 text-slate-400 w-4 h-4 pointer-events-none transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (
                <ul className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto py-1">
                    {filteredOptions.length > 0 ? filteredOptions.map((opt, i) => (
                        <li key={i} onClick={() => { onChange(opt); setIsOpen(false); }} className="px-3.5 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer font-medium">{opt}</li>
                    )) : (
                        <li className="px-3.5 py-2 text-sm text-slate-400 italic flex items-center justify-between">
                            <span>{value}</span>
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500">Press Enter to add</span>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}

export default Combobox;
