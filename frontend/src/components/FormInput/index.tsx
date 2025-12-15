interface FormInputProps {
  type: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  required?: boolean;
  message?: string;
}

const FormInput = ({
  type,
  name,
  value,
  placeholder,
  icon: Icon,
  required = false,
  message = "",
  onChange,
}: FormInputProps) => (
  <div className="w-full flex flex-col gap-2">
    <div className="relative w-full">
      <Icon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-indigo-400" />
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full p-4 pl-12 text-gray-700 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
      />
    </div>

    {message ? <span className="text-xs text-indigo-600">{message}</span> : null}
  </div>
);

export default FormInput;
