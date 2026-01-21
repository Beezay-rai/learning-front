// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import {
//   Box,
//   Button,
//   Card,
//   CardContent,
//   TextField,
//   Typography,
// } from "@mui/material";
// import TwoFAactions from "../Login/store/actions";
// import AuthUtility from "App/utils/AuthUtility";
// import actions from "Common/store/actions";
// import ISendLogo from "App/components/Logo/ISendLogo";
// import Center from "App/components/Center/Center";
// import LoadingBackdrop from "App/components/Loading/LoadingBackdrop";

// const TwoFactorVerify = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [code, setCode] = useState("");
//   const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
//   const inputRefs = useRef([]);
//   const hasCalledVerify = useRef(false);
//   const isVerifyingRef = useRef(false);
//   const {
//     response: verifyResponse,
//     success: verifySuccess,
//     loading,
//     error: verifyError,
//   } = useSelector((state) => state.postTwoFAVerify);

//   const {
//     response: userResponse,
//     success: userSuccess,
//     loading: userLoading,
//   } = useSelector((state) => state.get_user);
//   const isLoading = loading || (verifySuccess && (userLoading || !userSuccess));

//   useEffect(() => {
//     const totpToken = localStorage.getItem("temp_totp_token");
//     const email = localStorage.getItem("2fa_email");

//     if (!totpToken || !email) {
//       navigate("/login");
//     }
//   }, [navigate]);

//   const hasProcessedVerify = useRef(false);

//   useEffect(() => {
//     if (verifySuccess && verifyResponse && !hasProcessedVerify.current) {
//       hasProcessedVerify.current = true;
//       AuthUtility.setAccessToken(verifyResponse?.data?.token);
//       AuthUtility.setRefreshToken(verifyResponse?.data?.refresh_token);

//       dispatch(actions.get_user());
//       dispatch(actions.get_all_country());
//       dispatch(actions.get_send_country());
//       dispatch(actions.get_user_menus_and_permissions());
//       dispatch(
//         actions.get_all_reference({
//           page_number: 1,
//           page_size: 100,
//         }),
//       );
//     }
//   }, [verifySuccess, verifyResponse, dispatch]);

//   useEffect(() => {
//     if (verifySuccess && verifyResponse && userSuccess && userResponse?.data) {
//       dispatch(TwoFAactions.postTwoFAVerifyReset());
//       localStorage.removeItem("temp_totp_token");
//       localStorage.removeItem("2fa_email");

//       navigate("/");
//     }
//   }, [
//     verifySuccess,
//     verifyResponse,
//     userSuccess,
//     userResponse,
//     dispatch,
//     navigate,
//   ]);

//   useEffect(() => {
//     if (!loading && (verifySuccess || verifyResponse)) {
//       setTimeout(() => {
//         hasCalledVerify.current = false;
//         isVerifyingRef.current = false;
//       }, 100);
//     }
//   }, [loading, verifySuccess, verifyResponse]);

//   const handleVerify = (e) => {
//     e?.preventDefault();
//     e?.stopPropagation();

//     const trimmedCode = code.trim();
//     if (
//       !trimmedCode ||
//       loading ||
//       hasCalledVerify.current ||
//       isVerifyingRef.current
//     ) {
//       return;
//     }

//     const totpToken = localStorage.getItem("temp_totp_token");

//     if (!totpToken) {
//       dispatch({
//         type: "SET_TOAST_DATA",
//         data: {
//           message: "Session expired. Please login again.",
//           severity: "error",
//         },
//       });
//       return;
//     }

//     hasCalledVerify.current = true;
//     isVerifyingRef.current = true;
//     dispatch(TwoFAactions.postTwoFAVerify({ code: trimmedCode, totpToken }));
//   };

//   const focusInput = (index) => {
//     const ref = inputRefs.current[index];
//     if (ref && ref.focus) ref.focus();
//   };

//   const handleChange = (index, value) => {
//     if (verifyError) {
//       dispatch(TwoFAactions.postTwoFAVerifyReset());
//     }

//     const cleaned = value.replace(/\D/g, "");
//     if (!cleaned) {
//       const next = [...otpValues];
//       next[index] = "";
//       setOtpValues(next);
//       setCode(next.join(""));
//       return;
//     }

//     const next = [...otpValues];
//     next[index] = cleaned.charAt(cleaned.length - 1);
//     setOtpValues(next);
//     const joined = next.join("");
//     setCode(joined);
//     if (joined.length < 6 && index < 5) {
//       focusInput(index + 1);
//     }
//   };

//   const handleKeyDown = (index, e) => {
//     if (e.key === "Backspace") {
//       if (verifyError) {
//         dispatch(TwoFAactions.postTwoFAVerifyReset());
//       }

//       if (otpValues[index]) {
//         const next = [...otpValues];
//         next[index] = "";
//         setOtpValues(next);
//         setCode(next.join(""));
//         return;
//       }
//       if (index > 0) {
//         focusInput(index - 1);
//       }
//     }
//     if (e.key === "ArrowLeft" && index > 0) {
//       e.preventDefault();
//       focusInput(index - 1);
//     }
//     if (e.key === "ArrowRight" && index < 5) {
//       e.preventDefault();
//       focusInput(index + 1);
//     }
//     if (e.key === "Enter") {
//       e.preventDefault();
//       const currentCode = otpValues.join("");
//       if (currentCode.length === 6 && !isLoading && !hasCalledVerify.current) {
//         handleVerify(e);
//       }
//     }
//   };

//   const handlePaste = (e) => {
//     if (verifyError) {
//       dispatch(TwoFAactions.postTwoFAVerifyReset());
//     }

//     const pasted = (e.clipboardData.getData("text") || "")
//       .replace(/\D/g, "")
//       .slice(0, 6);
//     if (!pasted) return;
//     e.preventDefault();
//     const next = new Array(6).fill("");
//     for (let i = 0; i < pasted.length; i += 1) {
//       next[i] = pasted[i];
//     }
//     setOtpValues(next);
//     setCode(next.join(""));
//     focusInput(Math.min(pasted.length, 5));
//   };

//   return (
//     <Box
//       sx={{
//         height: "100vh",
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         background: "linear-gradient(180deg, #0078FF 0%, #0033CC 100%)",
//       }}
//     >
//       <LoadingBackdrop open={isLoading} />
//       <Card sx={{ width: 360, borderRadius: 3, p: 0.5, textAlign: "center" }}>
//         <CardContent>
//           <Center sx={{ mb: 5 }}>
//             <ISendLogo />
//           </Center>

//           <Typography
//             variant="subtitle2"
//             fontWeight={600}
//             fontSize={15}
//             mb={2}
//             textAlign="left"
//           >
//             Enter verification code
//           </Typography>

//           <Typography
//             variant="caption"
//             color="text.secondary"
//             sx={{ display: "block", mb: 1, textAlign: "left" }}
//           >
//             Enter the code from your authenticator app.
//           </Typography>

//           <Box sx={{ display: "flex", gap: 1, mb: 1 }} onPaste={handlePaste}>
//             {otpValues.map((val, idx) => (
//               <TextField
//                 disabled={isLoading}
//                 key={idx}
//                 inputRef={(el) => (inputRefs.current[idx] = el)}
//                 value={val}
//                 onChange={(e) => handleChange(idx, e.target.value)}
//                 onKeyDown={(e) => handleKeyDown(idx, e)}
//                 error={!!verifyError}
//                 inputProps={{
//                   inputMode: "numeric",
//                   pattern: "[0-9]*",
//                   maxLength: 1,
//                   style: {
//                     textAlign: "center",
//                     fontSize: 20,
//                     padding: "10px 0",
//                   },
//                 }}
//                 sx={{
//                   flex: 1,
//                   "& .MuiOutlinedInput-root": {
//                     borderRadius: 1.5,
//                   },
//                   "& .MuiOutlinedInput-notchedOutline": {
//                     borderColor: verifyError ? "#d32f2f" : "#b6ccf1ff",
//                   },
//                   "&:hover .MuiOutlinedInput-notchedOutline": {
//                     borderColor: verifyError ? "#d32f2f" : "#B3D4FF",
//                   },
//                   "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
//                     borderColor: verifyError ? "#d32f2f" : "#5B9BFF",
//                   },
//                 }}
//               />
//             ))}
//           </Box>

//           {verifyError && (
//             <Typography
//               variant="caption"
//               color="error"
//               sx={{
//                 display: "block",
//                 mb: 2,
//                 textAlign: "left",
//                 fontSize: "0.75rem",
//               }}
//             >
//               {verifyError?.message ||
//                 verifyError?.error?.message ||
//                 "Invalid code. Please try again."}
//             </Typography>
//           )}

//           <Button
//             variant="contained"
//             fullWidth
//             disabled={isLoading || code.length !== 6}
//             onClick={handleVerify}
//             sx={{
//               backgroundColor: "#0078FF",
//               textTransform: "none",
//               py: 1,
//               "&:hover": { backgroundColor: "#005FCC" },
//               marginTop: 1.5,
//             }}
//           >
//             {isLoading ? "Verifying..." : "Verify Code"}
//           </Button>
//         </CardContent>
//       </Card>
//     </Box>
//   );
// };

// export default TwoFactorVerify;
