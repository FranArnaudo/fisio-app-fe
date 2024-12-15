import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import useFetch from "@/lib/hooks/useFetch";
import useJwt from "@/lib/hooks/useJwt";
import { Professional } from "@/types";
import { useFormik } from "formik";
import { useNavigate } from "react-router";

type LoginProps = {
  setUser: (user: Professional) => void;
};
function Login({ setUser }: LoginProps) {
  const { fetchData } = useFetch();
  const navigate = useNavigate();
  const { getPayload } = useJwt();
  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
    },
    onSubmit: async (values) => {
      const returnData = await fetchData("/auth/login", "POST", values, false);
      if (returnData) {
        localStorage.setItem("jwt_token", returnData.access_token);
        const translatedPayload = getPayload(returnData.access_token);
        if (translatedPayload) {
          setUser(translatedPayload);
          navigate("/pacientes");
        }
      }
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          formik.handleSubmit(e);
        }}
        className="w-full max-w-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded-md shadow-md p-6"
      >
        <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Ingresa tus credenciales para acceder a tu cuenta.
        </p>
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre de usuario
          </label>
          <TextInput
            type="text"
            placeholder="Usuario"
            name="username"
            onChange={formik.handleChange}
            value={formik.values.username}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            Contraseña
          </label>
          <TextInput
            type="password"
            placeholder="••••••••"
            name="password"
            onChange={formik.handleChange}
            value={formik.values.password}
          />
        </div>

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="form-checkbox h-4 w-4 text-primary border-gray-300 rounded mr-2"
            />
            Recuérdame
          </label>
          <a href="#" className="text-sm text-primary hover:underline">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <Button className="w-full" variant="primary" type="submit">
          Iniciar sesión
        </Button>

        <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          ¿No tienes cuenta?
          <a href="#" className="text-primary hover:underline ml-1">
            Regístrate
          </a>
        </div>
      </form>
    </div>
  );
}

export default Login;
