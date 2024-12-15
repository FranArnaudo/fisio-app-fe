import { useState } from "react";
import IconButton from "./IconButton";
import NavbarLinkButton from "./NavbarLinkButton";
import ThemeSwitch from "./ThemeSwitch";
import { MdMenu } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <nav className="h-14 hidden sm:flex w-full bg-background justify-between px-2 py-2 relative top-0 shadow-xl ">
        <div className="grid place-items-center">
          <span className="font-bold text-xl">FisioApp</span>
        </div>
        <div className="flex gap-2">
          <NavbarLinkButton to="/" text="Home" />
          <NavbarLinkButton to="/pacientes" text="Pacientes" />
          <NavbarLinkButton to="/turnos" text="Turnos" />
        </div>
        <div className="flex gap-2">
          <ThemeSwitch />
          <span>User</span>
        </div>
      </nav>
      <nav className="flex sm:hidden w-full bg-background justify-between px-2 py-2 relative top-0 shadow-xl ">
        <div className="flex gap-2 items-center">
          <IconButton noBackground onClick={() => setIsOpen(!isOpen)}>
            <MdMenu className="text-contrast" />
          </IconButton>
          <span className="font-bold text-xl">FisioApp</span>
        </div>
        {isOpen && (
          <div className="fixed top-0 right-0 left-0 bottom-full h-screen overflow-clip w-screen flex">
            <div
              id="drawer"
              className="w-3/4 bg-background p-4 pb-32 flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-xl">FisioApp</span>
                <IconButton onClick={() => setIsOpen(false)}>
                  <IoMdClose className="text-secondary " />
                </IconButton>
              </div>
              <div className="w-full h-[1px]  bg-primary"></div>
              <div className="flex flex-col h-full gap-16">
                <div>
                  <NavbarLinkButton to="/" text="Home" />
                  <NavbarLinkButton to="/pacientes" text="Pacientes" />
                  <NavbarLinkButton to="/turnos" text="Turnos" />
                </div>
                <ThemeSwitch />
              </div>
            </div>
            <div
              onClick={() => setIsOpen(false)}
              id="backdrop"
              className="backdrop-blur-sm w-1/4"
            ></div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
