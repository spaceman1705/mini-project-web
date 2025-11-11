"use client";

import { Formik, Form, FormikProps } from "formik";
import { useSnackbar } from "notistack";
import { verificationLinkService } from "@/services/auth";
import registerSchema from "../schema";
import { useState } from "react";
import Link from "next/link";

interface IRegister {
  email: string;
}

export default function RegisterForm() {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const initialValue = { email: "" };

  async function handleSubmit(values: IRegister) {
    setLoading(true);
    try {
      const data = await verificationLinkService(values.email);
      enqueueSnackbar(data.message, { variant: "success" });
    } catch (err: unknown) {
      if (err instanceof Error) {
        enqueueSnackbar(err.message, { variant: "error" });
      } else {
        enqueueSnackbar("Something went wrong", { variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-secondary px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-tertiary rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-linear-to-r/oklch from-accent1-primary to-accent2-primary">
            Create Account
          </h1>
          <p className="text-center text-muted mb-8">
            Join evora and start exploring events
          </p>

          <Formik<IRegister>
            initialValues={initialValue}
            validationSchema={registerSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<IRegister>) => (
              <Form className="space-y-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-muted mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    value={props.values.email}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    className="w-full bg-secondary border border-tertiary rounded-lg px-4 py-3 text-clear outline-none focus:border-accent1-primary transition"
                  />
                  {props.touched.email && props.errors.email && (
                    <p className="mt-2 text-red-500 text-sm">
                      {props.errors.email}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r/oklch from-accent1-primary to-accent2-primary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending verification link..." : "Register"}
                </button>
              </Form>
            )}
          </Formik>

          <p className="text-center text-muted text-sm mt-6">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-accent1-primary font-semibold hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}