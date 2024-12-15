import { NavLink } from "react-router";

interface NavbarLinkButtonProps {
  text: string;
  to: string;
}
const NavbarLinkButton = ({ text, to }: NavbarLinkButtonProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        ` px-3 py-2 grid place-items-center text-contrast rounded-lg ${
          isActive
            ? "bg-primary text-contrast hover:text-contrast hover:bg-gray-800 dark:hover:bg-slate-300 "
            : "hover:text-gray-700"
        }
        `
      }
    >
      {text}
    </NavLink>
  );
};

export default NavbarLinkButton;
