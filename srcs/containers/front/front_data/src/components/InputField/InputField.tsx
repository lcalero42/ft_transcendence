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
  return (
    <div className="flex items-center gap-3 rounded-full border border-purple-900 px-4 py-3">
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
        type={type}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none"
      />
    </div>
  );
}

export default InputField;
