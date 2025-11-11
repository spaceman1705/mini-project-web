"use client";

import { Formik, Form, FormikProps } from "formik";
import { useSnackbar } from "notistack";
import { verificationLinkService } from "@/services/auth";
import registerSchema from "../schema";
import { useState } from "react";

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
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="flex flex-col gap-4 w-80 bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold text-center mb-2">Register</h2>

        <Formik<IRegister>
          initialValues={initialValue}
          validationSchema={registerSchema}
          onSubmit={handleSubmit}
        >
          {(props: FormikProps<IRegister>) => (
            <Form className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  type="email"
                  name="email"
                  placeholder="Masukkan email kamu"
                  value={props.values.email}
                  onChange={props.handleChange}
                />
                {props.touched.email && props.errors.email && (
                  <span className="text-red-500 text-sm">
                    *{props.errors.email}
                  </span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition ${loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
              >
                {loading ? "Mengirim..." : "Daftar"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
