import { Professional } from "@/types";
import { jwtDecode } from "jwt-decode";

const useJwt = () => {
  const getPayload = (token: string): Professional | null => {
    try {
      const payload = jwtDecode<Professional & { iat?: number; exp?: number }>(
        token
      );
      delete payload.iat;
      delete payload.exp;
      return payload;
    } catch (error) {
      console.error("Invalid JWT:", error);
      return null;
    }
  };

  const isExpired = (token: string) => {
    try {
      const { exp } = jwtDecode(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return exp! < currentTime;
    } catch (error) {
      console.error("Invalid JWT:", error);
      return true;
    }
  };

  return { getPayload, isExpired };
};

export default useJwt;
