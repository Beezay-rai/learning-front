import * as yup from "yup";

export const coreApiSchema = {
  RestBuilder: {
    Add: yup.object({
      name: yup.string().required("Name is required"),
      url: yup.string().required("URL is required"),
      description: yup.string().optional(),
      method: yup
        .string()
        .oneOf(["GET", "POST", "PUT", "DELETE", "PATCH"], "Invalid HTTP method")
        .required("HTTP method is required"),
      params: yup
        .array()
        .of(
          yup.object({
            key: yup.string(),
            value: yup.string(),
          })
        )
        .optional(),
      headers: yup
        .array()
        .of(
          yup.object({
            key: yup.string(),
            value: yup.string(),
            type: yup.string(),
          })
        )
        .optional(),
    }),
  },
};
