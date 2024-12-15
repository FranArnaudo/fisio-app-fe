import { Outlet, useNavigate } from "react-router";
import Navbar from "../ui/Navbar";
import { Bounce, toast } from "react-toastify";
import { useContext, useEffect } from "react";
import useJwt from "@/lib/hooks/useJwt";
import { AuthContext } from "@/contexts";

const NavbarLayout = () => {
  const navigate = useNavigate();
  const { user, jwt, loaded } = useContext(AuthContext);

  const { isExpired } = useJwt();
  useEffect(() => {
    if (!user && loaded) {
      toast.error("Necesitas estar logueado para acceder", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
      });
      navigate("/login");
    } else {
      if (isExpired(jwt)) {
        navigate("/login");
      }
    }
  }, [user, navigate]);

  return (
    <div className="h-full w-full flex flex-col">
      <Navbar />
      <Outlet />
    </div>
  );
};

export default NavbarLayout;
