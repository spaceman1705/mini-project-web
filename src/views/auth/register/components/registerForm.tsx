"use client";

import { Formik, Form, FormikProps } from "formik";
import { useSnackbar } from "notistack";

import { verificationLinkService } from "@/services/auth";
import registerSchema from "../schema";

interface IRegister {
  email: string;
}

export default function RegisterForm() {
  const { enqueueSnackbar } = useSnackbar();
  const initialValue = { email: "" };

  async function handleSubmit(values: IRegister) {
    try {
      const data = await verificationLinkService(values.email);

      enqueueSnackbar(data.message, { variant: "success" });
    } catch (err) {
      if (err instanceof Error) {
        enqueueSnackbar(err.message, { variant: "error" });
      } else {
        enqueueSnackbar("Something went wrong", { variant: "error" });
      }
    }
  }

  return (
    <Formik<IRegister>
      initialValues={initialValue}
      validationSchema={registerSchema}
      onSubmit={handleSubmit}
    >
      {(props: FormikProps<IRegister>) => (
        <Form className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <label>Email:</label>
            <input
              className="p-2 border rounded-md"
              type="email"
              name="email"
              value={props.values.email}
              onChange={props.handleChange}
            />
            {props.touched.email && props.errors.email && (
              <span>*{props.errors.email}</span>
            )}
          </div>
          <button type="submit">Register</button>
        </Form>
      )}
    </Formik>
  );
}