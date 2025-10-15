import { useCallback } from "react";
import { LoginForm } from "@/components/LoginForm";

export function LoginFormWrapper() {
  const handleLogin = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (email: string, _password: string) => {
      // TODO: Implement Supabase authentication
      // Example implementation:
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email,
      //   password: _password,
      // })
      //
      // if (error) {
      //   throw new Error(error.message)
      // }
      //
      // if (data.session) {
      //   // Redirect to dashboard or home page
      //   window.location.href = "/dashboard"
      // }

      // Simulated API call for demo purposes
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // For now, just show success
      alert(`Logowanie dla: ${email}`);
    },
    []
  );

  return <LoginForm onSubmit={handleLogin} />;
}
