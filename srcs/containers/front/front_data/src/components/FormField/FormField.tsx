import InputField from "../InputField/InputField";

type FormFieldProps = {
  label: string;
  iconSrc: string;
  type?: string;
  placeholder?: string;
};

function FormField({ label, iconSrc, type = "text", placeholder }: FormFieldProps) {
  return (
    <div>
      <p className="text-left py-3 px-4 text-gray-high text-xs font-bold">
        {label}
      </p>
      <InputField iconSrc={iconSrc} type={type} placeholder={placeholder} />
    </div>
  );
}

export default FormField;
