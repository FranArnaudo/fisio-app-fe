import React, { useState, useRef, useEffect } from "react";
import { Option } from "@/types";
import { BsChevronDown } from "react-icons/bs";

type SelectProps = {
  options: Option<string | number>[];
  onChange: (option: Option<string>) => void;
  placeholder?: string;
  value?: Option<string | number> | string; // current selected option
};

const Select: React.FC<SelectProps> = ({
  options,
  onChange,
  placeholder = "Select an option...",
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelect = (option: Option<string>) => {
    onChange(option);
    setIsOpen(false);
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  // Close dropdown if user clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const renderText = () => {
    if (typeof value === "string" && value) {
      return options.find((option) => option.value === value)?.text ?? "";
    } else if (typeof value === "object" && value) {
      return value.text;
    } else {
      return (
        <span className="text-gray-400 no-break text-ellipsis overflow-hidden whitespace-nowrap">
          {placeholder}
        </span>
      );
    }
  };

  return (
    <div className="relative w-full " ref={containerRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className="
          w-full
          flex
          justify-between
          items-center
          rounded-md
          border border-gray-300
          bg-white
          h-[40px]
          py-2 px-3
          text-sm text-gray-700
          focus:outline-none
          focus:border-primary
          focus:ring-1 focus:ring-primary
          placeholder-gray-400
          transition-colors
          cursor-pointer
          
        "
      >
        <span>{renderText()}</span>
        <BsChevronDown className="text-gray-500 ml-2" />
      </button>

      {isOpen && (
        <ul
          className="
            absolute
            top-full
            left-0
            z-10
            w-full
            mt-1
            bg-white
            border border-gray-300
            rounded-md
            shadow-lg
            overflow-hidden
          "
        >
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option as Option<string>)}
              className="
                px-3 py-2
                text-gray-700
                hover:bg-gray-100
                cursor-pointer
                transition-colors
              "
            >
              {option.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Select;
