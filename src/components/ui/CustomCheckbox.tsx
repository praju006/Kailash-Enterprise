'use client';

import { CheckIcon } from '@/components/ui/Icons';

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  type?: 'checkbox' | 'radio';
}

export default function CustomCheckbox({ checked, onChange, label, type = 'checkbox' }: CheckboxProps) {
  const shape = type === 'radio' ? 'rounded-full' : 'rounded-[5px]';
  return (
    <label className="flex items-center gap-2.5 mb-3 text-sm cursor-pointer select-none group">
      <span className="relative inline-flex shrink-0">
        <input
          type={type}
          checked={checked}
          onChange={onChange}
          className="peer absolute inset-0 opacity-0 cursor-pointer"
        />
        <span
          className={`w-[19px] h-[19px] border-2 border-line ${shape} flex items-center justify-center transition-colors bg-white peer-checked:bg-maroon peer-checked:border-maroon group-hover:border-maroon/60 ${
            checked ? 'bg-maroon border-maroon' : ''
          }`}
        >
          {type === 'radio' ? (
            <span className={`w-2 h-2 rounded-full bg-white transition-transform ${checked ? 'scale-100' : 'scale-0'}`} />
          ) : (
            <CheckIcon className={`w-3 h-3 text-white transition-transform ${checked ? 'scale-100' : 'scale-0'}`} />
          )}
        </span>
      </span>
      <span className={checked ? 'text-ink font-medium' : 'text-ink-soft'}>{label}</span>
    </label>
  );
}
