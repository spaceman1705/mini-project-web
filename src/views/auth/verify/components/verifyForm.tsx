"use client";

import { Formik, Form, FormikProps } from "formik";
import { useSearchParams } from "next/navigation";
import { useSnackbar } from "notistack";

import { verifyService } from "@/services/auth";
import verifySchema from "../schema";
import { AxiosError } from "axios";

interface IVerify {
  firstname: string;
  lastname: string;
  password: string;
}

export default function VerifyForm() {
  const searchParams = useSearchParams();
  const paramValue = searchParams.get("token");
  const { enqueueSnackbar } = useSnackbar();
  const initialValue = { firstname: "", lastname: "", password: "" };

  async function handleSubmit(values: IVerify) {
    try {
      const data = await verifyService(
        values.firstname,
        values.lastname,
        values.password,
        paramValue as string
      );

      enqueueSnackbar(data.message, { variant: "success" });
    } catch (err) {
      if (err instanceof AxiosError) {
        enqueueSnackbar(err.response?.data.error, { variant: "error" });
      } else {
        enqueueSnackbar("Something went wrong", { variant: "error" });
      }
    }
  }

  return (
    <Formik<IVerify>
      initialValues={initialValue}
      validationSchema={verifySchema}
      onSubmit={handleSubmit}
    >
      {(props: FormikProps<IVerify>) => (
        <Form className="flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <label>Firstname:</label>
            <input
              className="p-2 border rounded-md"
              type="text"
              name="firstname"
              value={props.values.firstname}
              onChange={props.handleChange}
            />
            {props.touched.firstname && props.errors.firstname && (
              <span>*{props.errors.firstname}</span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <label>Lastname:</label>
            <input
              className="p-2 border rounded-md"
              type="text"
              name="lastname"
              value={props.values.lastname}
              onChange={props.handleChange}
            />
            {props.touched.lastname && props.errors.lastname && (
              <span>*{props.errors.lastname}</span>
            )}
          </div>
          <div className="flex flex-col gap-3">
            <label>Password:</label>
            <input
              className="p-2 border rounded-md"
              type="password"
              name="password"
              value={props.values.password}
              onChange={props.handleChange}
            />
            {props.touched.password && props.errors.password && (
              <span>*{props.errors.password}</span>
            )}
          </div>
          <button type="submit">Verify</button>
        </Form>
      )}
    </Formik>
  );
}