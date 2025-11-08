import RegisterForm from "./components/registerForm";

export default function RegisterView() {
  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-3xl">Register</h1>
      <RegisterForm />
    </div>
  );
}