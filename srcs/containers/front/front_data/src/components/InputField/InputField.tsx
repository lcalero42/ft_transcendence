import { useState } from "react";
import EyeIcon from "../../assets/icons/eye.svg";
import EyeOffIcon from "../../assets/icons/eye-off.svg";

type InputFieldProps = {
  iconSrc?: string;
  type?: string;
  placeholder?: string;
};

function InputField({
  iconSrc,
  type = "text",
  placeholder,
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
        type={inputType}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none"
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
