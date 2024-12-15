const TextArea = (props: React.InputHTMLAttributes<HTMLTextAreaElement>) => {
  return (
    <textarea
      {...props}
      className="
      w-full
      rounded-md
      border border-gray-300
      bg-white
      py-2 px-3
      text-sm text-gray-700
      focus:outline-none
      h-[100px]
      focus:border-primary
      focus:ring-1 focus:ring-primary
      placeholder-gray-400
      "
    />
  );
};

export default TextArea;
