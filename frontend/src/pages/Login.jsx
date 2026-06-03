import AuthPrompt from "../components/AuthPrompt.jsx";

export default function Login({ admin = false, signupMode = false }) {
  return (
    <main className="min-h-screen bg-zinc-100">
      <AuthPrompt open admin={admin} initialSignup={signupMode} title={admin ? "Admin login" : signupMode ? "Create account" : "Customer login"} />
    </main>
  );
}
