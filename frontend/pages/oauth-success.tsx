import { useEffect } from "react";
import { useRouter } from "next/router";

export default function OAuthSuccess() {
  const router = useRouter();

  useEffect(() => {
    if (router.query.token) {
      localStorage.setItem("token", String(router.query.token));
      localStorage.setItem("userId", String(router.query.id));
      router.push("/dashboard");
    }
  }, [router.query]);

  return <p>Processando login...</p>;
}
