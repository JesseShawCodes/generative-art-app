import type { ChangeEvent } from 'react';

interface RangeFieldProps {
  id: string;
  label: string;
  min: number;
  max: number;
  value: number;
  onValueChange: (value: number) => void;
  /** Range step; defaults to 1. Use fractional steps for continuous params. */
  step?: number;
}

function RangeField({
  id,
  label,
  min,
  max,
  value,
  onValueChange,
  step = 1,
}: RangeFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onValueChange(Number(event.target.value));
  };

  return (
    <div className="mb-3">
      <label
        className="mb-1 block font-semibold text-bloom-dark dark:text-night-strong"
        htmlFor={id}
      >
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        className="w-full accent-bloom dark:accent-bloom-pink"
        value={value}
        onChange={handleChange}
      />
    </div>
  );
}

export default RangeField;
