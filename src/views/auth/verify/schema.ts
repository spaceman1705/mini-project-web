import * as Yup from "yup";

const verifySchema = Yup.object({
  firstname: Yup.string().trim().required("Firstname cannot be empty"),
  lastname: Yup.string().trim().required("lastname cannot be empty"),
  password: Yup.string().trim().required("lastname cannot be empty"),
});

export default verifySchema;