import { useState, type ChangeEvent } from "react";
import EyeIcon from "../../assets/icons/eye.svg";
import EyeOffIcon from "../../assets/icons/eye-off.svg";

type InputFieldProps = {
  id?: string;
  name?: string;
  iconSrc?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

function InputField({
  id,
  name,
  iconSrc,
  type = "text",
  placeholder,
  value,
  onChange,
}: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className="flex items-center gap-3 rounded-full border border-card-border px-4 py-3">
      {iconSrc && (
        <div
          className="mask-icon h-5 w-5 shrink-0 bg-accent-purple"
          style={{
            WebkitMaskImage: `url("${iconSrc}")`,
            maskImage: `url("${iconSrc}")`,
          }}
        />
      )}

      <input
        id={id}
        name={name}
        type={inputType}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full bg-transparent outline-none text-sm"
      />

      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="shrink-0 cursor-pointer"
        >
          <div
            className="mask-icon h-5 w-5 bg-accent-purple"
            style={{
              WebkitMaskImage: `url("${showPassword ? EyeOffIcon : EyeIcon}")`,
              maskImage: `url("${showPassword ? EyeOffIcon : EyeIcon}")`,
            }}
          />
        </button>
      )}
    </div>
  );
}

export default InputField;
