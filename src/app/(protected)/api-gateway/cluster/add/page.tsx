// "use client";

// import React from "react";
// import {
//   Box,
//   Button,
//   Container,
//   TextField,
//   Paper,
//   Typography,
//   IconButton,
// } from "@mui/material";
// import { useForm, Controller, useFieldArray } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { apiService } from "@/api/api-gateway/apiService";
// import { Minus, Plus } from "lucide-react";
// import { AddClusterRequest } from "@/api/api-gateway/interfaces/cluster";
// // import { Delete, Add } from "@mui/icons-material";

// // Yup schema
// const schema = yup.object({
//   name: yup.string().required("Name is required"),
//   destinationAddress: yup
//     .array()
//     .of(
//       yup.object({
//         key: yup.string().required("Key is required"),
//         value: yup.string().required("Value is required"),
//       })
//     )
//     .min(1, "At least one destination is required"),
// });

// export default function AddClusterDestinationPage() {
//   const { control, handleSubmit, formState, reset } =
//     useForm<AddClusterRequest>({
//       resolver: yupResolver(schema),
//       defaultValues: {
//         name: "",
//         destinationAddress: [{ key: "", value: "" }],
//       },
//     });

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "destinationAddress",
//   });

//   const onSubmit = async (data: AddClusterRequest) => {
//     try {
//       // Convert array to dictionary
//       const payload = {
//         name: data.name,
//         destinationAddress: data.destinationAddress.reduce(
//           (acc, cur) => ({ ...acc, [cur.key]: cur.value }),
//           {}
//         ),
//       };
//       const response = await apiService.addCluster(
//         payload as AddClusterRequest
//       );
//       alert("Cluster destination added successfully!");
//       reset();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to add cluster destination.");
//     }
//   };

//   return (
//     <Container maxWidth="sm" sx={{ mt: 4 }}>
//       <Paper sx={{ p: 4 }}>
//         <Typography variant="h5" gutterBottom>
//           Add Cluster Destination
//         </Typography>

//         <Box
//           component="form"
//           noValidate
//           onSubmit={handleSubmit(onSubmit)}
//           sx={{ display: "flex", flexDirection: "column", gap: 2 }}
//         >
//           {/* Name Field */}
//           <Controller
//             name="name"
//             control={control}
//             render={({ field }) => (
//               <TextField
//                 {...field}
//                 label="Cluster Destination Name"
//                 error={!!formState.errors.name}
//                 helperText={formState.errors.name?.message}
//                 fullWidth
//               />
//             )}
//           />

//           {/* Dynamic Destination Entries */}
//           {fields.map((field, index) => (
//             <Box
//               key={field.id}
//               sx={{ display: "flex", gap: 1, alignItems: "center" }}
//             >
//               <Controller
//                 name={`destinationAddress.${index}.key`}
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     label="Key"
//                     error={!!formState.errors.destinationAddress?.[index]?.key}
//                     helperText={
//                       formState.errors.destinationAddress?.[index]?.key?.message
//                     }
//                     fullWidth
//                   />
//                 )}
//               />
//               <Controller
//                 name={`destinationAddress.${index}.value`}
//                 control={control}
//                 render={({ field }) => (
//                   <TextField
//                     {...field}
//                     label="Value"
//                     error={
//                       !!formState.errors.destinationAddress?.[index]?.value
//                     }
//                     helperText={
//                       formState.errors.destinationAddress?.[index]?.value
//                         ?.message
//                     }
//                     fullWidth
//                   />
//                 )}
//               />
//               <IconButton color="error" onClick={() => remove(index)}>
//                 <Minus />
//               </IconButton>
//             </Box>
//           ))}

//           <Button
//             type="button"
//             startIcon={<Plus />}
//             onClick={() => append({ key: "", value: "" })}
//           >
//             Add Entry
//           </Button>

//           <Button
//             type="submit"
//             variant="contained"
//             color="primary"
//             disabled={formState.isSubmitting}
//           >
//             {formState.isSubmitting ? "Adding..." : "Add Destination"}
//           </Button>
//         </Box>
//       </Paper>
//     </Container>
//   );
// }
