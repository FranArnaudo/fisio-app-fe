import React, { useState, useMemo, useRef, useEffect } from "react";
import { Option } from "@/types"; // { label: string; value: string; text: string }

type AutocompleteProps = {
  options: Option<string>[];
  onChange: (option: Option<string>) => void;
  placeholder?: string;
  defaultOptionId?: string;
  error?: boolean;
  helperText?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">;

const Autocomplete: React.FC<AutocompleteProps> = ({
  options,
  onChange,
  defaultOptionId,
  error,
  helperText,
  ...props
}) => {
  const [inputValue, setInputValue] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize strings to handle diacritics
  const normalizeStr = (str: string) =>
    str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filteredOptions = useMemo(() => {
    if (!inputValue) return options.slice(0, 5);
    const normalizedInput = normalizeStr(inputValue);
    return options.filter((opt) => {
      const normalizedLabel = normalizeStr(opt.text);
      return normalizedLabel.includes(normalizedInput);
    });
  }, [inputValue, options]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleOptionSelect = (option: Option<string>) => {
    setInputValue(option.text);
    onChange(option);
    // Close the dropdown after selection
    setIsOpen(false);
  };

  useEffect(() => {
    if (!inputValue && options.length && defaultOptionId) {
      console.log(
        "🚀Fran ~ file: Autocomplete.tsx:54 ~ useEffect ~ inputValue:",
        inputValue,
        options
      );
      const defaultOption = options.find((opt) => opt.id === defaultOptionId);
      console.log(
        "🚀Fran ~ file: Autocomplete.tsx:55 ~ useEffect ~ defaultOption:",
        defaultOption
      );
      handleOptionSelect(defaultOption ?? options[0]);
    }
  }, [options]);
  // Close the dropdown if user clicks outside
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

  return (
    <div className="relative w-full" ref={containerRef}>
      <input
        type="text"
        className={`
          w-full
          rounded-md
          border border-gray-300
          bg-white
          py-2 px-3
          text-sm text-gray-700
          focus:outline-none
          focus:border-primary
          focus:ring-1 focus:ring-primary
          placeholder-gray-400
          transition-colors
          ${error ? "border-red-500 focus:border-red-700" : ""}
        `}
        onFocus={() => setIsOpen(true)}
        value={inputValue ?? ""}
        onChange={handleInputChange}
        {...props}
      />
      {helperText && (
        <p className={`${error ? "text-red-500" : ""} text-xs mt-1 pl-1`}>
          {helperText}
        </p>
      )}
      {isOpen && filteredOptions.length > 0 && (
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
          {filteredOptions.map((option) => (
            <li
              key={option.value}
              className="
                px-3 py-2
                text-gray-700
                hover:bg-gray-100
                cursor-pointer
                transition-colors
              "
              onClick={() => handleOptionSelect(option)}
            >
              {option.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Autocomplete;
