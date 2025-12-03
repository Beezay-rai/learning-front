import * as yup from "yup";

export const idsrvApiSchema = {
  users: {
    Add: yup.object({
      first_name: yup.string().required("Name is required"),
      last_name: yup.string().required("Name is required"),
      email: yup.string().email("Invalid email").required("Email is required"),
      phone_number: yup.string().required(),
    }),
    Update: yup.object({
      first_name: yup.string().required("Name is required"),
      last_name: yup.string().optional(),
      email: yup.string().email("Invalid email").required("Email is required"),
      phone_number: yup.string().required(),
    }),
  },
  role: {
    Add: yup.object({
      name: yup.string().required("Role name is required"),
      description: yup.string().required("Description is required"),
      userTypeId: yup.number().required("User type is required"),
    }),
    Update: yup.object({
      name: yup.string().required("Role name is required"),
      description: yup.string().required("Description is required"),
      userTypeId: yup.number().required("User type is required"),
    }),
  },
};
