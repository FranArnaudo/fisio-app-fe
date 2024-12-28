import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const Datepicker = (props: any) => {
  return (
    <DatePicker
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
        hover:border-primary
        focus:border-primary
        focus:ring-1 focus:ring-primary
        placeholder-gray-400
        ${props.error ? "border-red-500 focus:border-red-700" : ""}
        ${props.className}
      `}
    />
  );
};

export default Datepicker;
