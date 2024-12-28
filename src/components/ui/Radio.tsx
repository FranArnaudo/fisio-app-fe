import { useState } from "react";
import { IoIosRadioButtonOff, IoIosRadioButtonOn } from "react-icons/io";

type RadioProps = {
  label: string;
  onChange?: (name: string, value: boolean) => void;
  value?: boolean;
  name?: string;
};
const Radio = ({ label, onChange, value, name }: RadioProps) => {
  const [checked, setChecked] = useState(value || false);

  const handleToggle = () => {
    setChecked(!checked);
    if (onChange && name) {
      onChange(name, !checked);
    }
  };

  return (
    <div
      className="flex items-center space-x-2 cursor-pointer"
      onClick={handleToggle}
    >
      {checked ? (
        <IoIosRadioButtonOn className="text-primary w-6 h-6" />
      ) : (
        <IoIosRadioButtonOff className="text-border w-6 h-6" />
      )}
      <label className="text-foreground text-sm font-medium">{label}</label>
    </div>
  );
};

export default Radio;
