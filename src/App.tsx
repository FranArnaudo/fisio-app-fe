import "./App.css";
import NavbarLayout from "./components/layout/navbar-layout";
import { BrowserRouter, Route, Routes } from "react-router";
import Patients from "./screens/Patients";
import Login from "./screens/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { Professional } from "./types";
import useJwt from "./lib/hooks/useJwt";
import { AuthContext } from "./contexts";
import Appointments from "./screens/Appointments";
import { jwtDecode } from "jwt-decode";
import Healthcares from "./screens/Healthcares";
import Areas from "./screens/Areas";

function App() {
  const { getPayload } = useJwt();

  const [currentUser, setCurrentUser] = useState<Professional | null>(
    JSON.parse(
      JSON.stringify(localStorage.getItem("jwt_token") ? jwtDecode(localStorage.getItem("jwt_token") || "") : "")
    ) ?? null
  );
  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      setCurrentUser(getPayload(token));
    }
  }, []);
  return (
    <>
      <AuthContext.Provider
        value={{
          jwt: localStorage.getItem("jwt_token") || "",
          user: currentUser,
          loaded: true,
        }}
      >
        <ToastContainer />
        <BrowserRouter>
          <Routes>
            <Route
              path="/login"
              element={<Login setUser={setCurrentUser} />}
            ></Route>
            <Route path="/" element={<NavbarLayout />}>
              <Route path="/pacientes" element={<Patients />} />
              <Route path="/turnos" element={<Appointments />} />
              <Route path="/obras-sociales" element={<Healthcares />} />
              <Route path="/areas" element={<Areas />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthContext.Provider>
    </>
  );
}

export default App;
