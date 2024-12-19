const TextInput = (
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    error?: boolean;
    helperText?: string;
  }
) => {
  return (
    <>
      <input
        type="text"
        {...props}
        className={`
      w-full
      rounded-md
      border border-gray-300
      bg-white
      py-2 px-3
      text-sm text-gray-700
      focus:outline-none
      h-[40px]
      focus:border-primary
      focus:ring-1 focus:ring-primary
      placeholder-gray-400
      ${props.error ? "border-red-500 focus:border-red-700" : ""}
      `}
      />
      {props.helperText && (
        <p className={`${props.error ? "text-red-500" : ""} text-xs mt-1 pl-1`}>
          {props.helperText}
        </p>
      )}
    </>
  );
};

export default TextInput;
