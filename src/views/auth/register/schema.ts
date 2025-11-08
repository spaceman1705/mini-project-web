import * as Yup from "yup";

const registerSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Invalid email format")
    .required("Email cannot be empty"),
});

export default registerSchema;