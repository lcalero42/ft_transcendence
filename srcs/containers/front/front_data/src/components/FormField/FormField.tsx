import type { ChangeEvent } from "react";
import InputField from "../InputField/InputField";

type FormFieldProps = {
  id: string;
  name?: string;
  label: string;
  iconSrc: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
};

function FormField({ id, name, label, iconSrc, type = "text", placeholder, value, onChange, error }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-left py-3 px-2 text-gray-high font-bold">
        {label}
      </label>
      <InputField
        id={id}
        name={name ?? id}
        iconSrc={iconSrc}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {error && (
        <p className="mt-1 px-2 text-xs" style={{ color: "var(--color-defeat)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

export default FormField;
