import { MdSunny } from "react-icons/md";
import { FaMoon } from "react-icons/fa6";
import { useEffect, useState } from "react";
const ThemeSwitch = () => {
  const dark = localStorage.getItem("theme") === "dark";
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  });
  const [isDark, setIsDark] = useState(dark);
  const handleToggle = () => {
    if (isDark) {
      setIsDark(false);
      localStorage.setItem("theme", "light");
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      setIsDark(true);
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
  };
  return (
    <button
      className="grid place-items-center p-3 bg-primary hover:bg-secondary dark:hover:bg-slate-300"
      onClick={handleToggle}
    >
      {!isDark ? (
        <MdSunny className="text-contrast " />
      ) : (
        <FaMoon className="text-constrast " />
      )}
    </button>
  );
};

export default ThemeSwitch;
