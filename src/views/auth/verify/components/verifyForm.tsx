"use client";

import { Formik, Form, FormikProps } from "formik";
import { useSearchParams, useRouter } from "next/navigation";
import { useSnackbar } from "notistack";
import { useState } from "react";
import { AxiosError } from "axios";
import Link from "next/link";

import { verifyService } from "@/services/auth";
import verifySchema from "../schema";

interface IVerify {
  firstname: string;
  lastname: string;
  password: string;
}

export default function VerifyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paramValue = searchParams.get("token");
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const initialValue = { firstname: "", lastname: "", password: "" };

  async function handleSubmit(values: IVerify) {
    setLoading(true);
    try {
      const data = await verifyService(
        values.firstname,
        values.lastname,
        values.password,
        paramValue as string
      );

      enqueueSnackbar(data.message, { variant: "success" });

      // Redirect ke login setelah sukses
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (err) {
      if (err instanceof AxiosError) {
        enqueueSnackbar(err.response?.data.error, { variant: "error" });
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
            Verify Account
          </h1>
          <p className="text-center text-muted mb-8">
            Complete your registration to get started
          </p>

          <Formik<IVerify>
            initialValues={initialValue}
            validationSchema={verifySchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<IVerify>) => (
              <Form className="space-y-6">
                {/* Firstname */}
                <div>
                  <label
                    htmlFor="firstname"
                    className="block text-sm font-medium text-muted mb-2"
                  >
                    First Name
                  </label>
                  <input
                    id="firstname"
                    type="text"
                    name="firstname"
                    placeholder="John"
                    value={props.values.firstname}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    className="w-full bg-secondary border border-tertiary rounded-lg px-4 py-3 text-clear outline-none focus:border-accent1-primary transition"
                  />
                  {props.touched.firstname && props.errors.firstname && (
                    <p className="mt-2 text-red-500 text-sm">
                      {props.errors.firstname}
                    </p>
                  )}
                </div>

                {/* Lastname */}
                <div>
                  <label
                    htmlFor="lastname"
                    className="block text-sm font-medium text-muted mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    id="lastname"
                    type="text"
                    name="lastname"
                    placeholder="Doe"
                    value={props.values.lastname}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    className="w-full bg-secondary border border-tertiary rounded-lg px-4 py-3 text-clear outline-none focus:border-accent1-primary transition"
                  />
                  {props.touched.lastname && props.errors.lastname && (
                    <p className="mt-2 text-red-500 text-sm">
                      {props.errors.lastname}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-muted mb-2"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={props.values.password}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    className="w-full bg-secondary border border-tertiary rounded-lg px-4 py-3 text-clear outline-none focus:border-accent1-primary transition"
                  />
                  {props.touched.password && props.errors.password && (
                    <p className="mt-2 text-red-500 text-sm">
                      {props.errors.password}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r/oklch from-accent1-primary to-accent2-primary text-white font-semibold py-3 rounded-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Verify Account"}
                </button>
              </Form>
            )}
          </Formik>

          <p className="text-center text-muted text-sm mt-6">
            Already verified?{" "}
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