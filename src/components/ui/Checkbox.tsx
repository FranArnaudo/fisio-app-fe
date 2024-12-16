import { useState } from "react";
import { IoCheckbox, IoCheckboxOutline } from "react-icons/io5";

type CheckboxProps = {
  label: string;
  onChange?: (value: boolean) => void;
  value?: boolean;
};
const Checkbox = ({ label, onChange, value }: CheckboxProps) => {
  const [checked, setChecked] = useState(value || false);

  const handleToggle = () => {
    setChecked(!checked);
    if (onChange) {
      onChange(!checked);
    }
  };

  return (
    <div
      className="flex items-center space-x-2 cursor-pointer"
      onClick={handleToggle}
    >
      {checked ? (
        <IoCheckbox className="text-primary w-6 h-6" />
      ) : (
        <IoCheckboxOutline className="text-border w-6 h-6" />
      )}
      <label className="text-foreground text-sm font-medium">{label}</label>
    </div>
  );
};

export default Checkbox;
