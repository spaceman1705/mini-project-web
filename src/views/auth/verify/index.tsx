import VerifyForm from "./components/verifyForm";

export default function VerifyView() {
  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-3xl">Verify</h1>
      <VerifyForm />
    </div>
  );
}