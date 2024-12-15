import { useState } from "react";
import { toast } from "react-toastify";

const useFetch = () => {
  const baseUrl = process.env.REACT_APP_API_URL || "http://127.0.0.1:3000";
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = async (
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET",
    body: Record<string, any> | null = null,
    needsAuth: boolean = true
  ) => {
    const jwtToken = localStorage.getItem("jwt_token");

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (needsAuth && jwtToken) {
      headers["Authorization"] = `Bearer ${jwtToken}`;
    }

    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
        cache: "default",
      });
      const responseData: { data: any; message: string; status: number } =
        await response.json();
      if (responseData.status !== 200 && responseData.status !== 201) {
        if (Array.isArray(responseData.message)) {
          toast.error(responseData.message[0]);
        } else {
          toast.error(responseData.message);
        }
      }
      setData(responseData.data);
      return responseData.data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { fetchData, loading, error, data };
};

export default useFetch;
