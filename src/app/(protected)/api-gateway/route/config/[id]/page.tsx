"use client";
import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  IconButton,
  Divider,
  Stack,
  Paper,
  Grid,
  Container,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

export default function ApiConfigPage() {
  const [authType, setAuthType] = useState("none");
  const [rateLimit, setRateLimit] = useState("");
  const [cert, setCert] = useState("");
  const [origins, setOrigins] = useState([""]);

  const handleOriginChange = (index: number, value: string) => {
    const newOrigins = [...origins];
    newOrigins[index] = value;
    setOrigins(newOrigins);
  };

  const addOrigin = () => setOrigins([...origins, ""]);

  const removeOrigin = (index: number) => {
    setOrigins(origins.filter((_, i) => i !== index));
  };

  return (
    <Paper>
      <Card elevation={6} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 3, md: 6 } }}>
          <Typography
            variant="h4"
            component="h1"
            fontWeight="bold"
            color="primary"
            sx={{ mb: 4 }}
          >
            API Route Configuration
          </Typography>

          <Grid container spacing={3}>
            {/* Certificate */}
            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel id="cert-label">Select Certificate</InputLabel>
                <Select
                  labelId="cert-label"
                  value={cert}
                  label="Select Certificate"
                  onChange={(e) => setCert(e.target.value)}
                >
                  <MenuItem value="">Select</MenuItem>
                  <MenuItem value="cert1">Certificate 1</MenuItem>
                  <MenuItem value="cert2">Certificate 2</MenuItem>
                  <MenuItem value="cert3">Certificate 3</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={6}>
              <FormControl fullWidth>
                <InputLabel id="auth-type-label">
                  Authentication Type
                </InputLabel>
                <Select
                  labelId="auth-type-label"
                  value={authType}
                  label="Authentication Type"
                  onChange={(e) => setAuthType(e.target.value as string)}
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="basic">Basic Auth</MenuItem>
                  <MenuItem value="apikey">API Key</MenuItem>
                  <MenuItem value="jwt">JWT</MenuItem>
                  <MenuItem value="hmac">HMAC</MenuItem>
                  <MenuItem value="clientcert">Client Certificate</MenuItem>
                  <MenuItem value="oauth">OAuth2</MenuItem>
                </Select>
              </FormControl>

              {/* Dynamic Auth Fields */}
              {/* <Box mt={3}>
                {authType === "basic" && (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Username" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField fullWidth label="Password" type="password" />
                    </Grid>
                  </Grid>
                )}

                {authType === "apikey" && (
                  <TextField
                    fullWidth
                    label="API Key"
                    placeholder="Enter your API key"
                  />
                )}

                {authType === "jwt" && (
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth label="Issuer (iss)" />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField fullWidth label="Audience (aud)" />
                    </Grid>
                    <Grid size={12}>
                      <TextField
                        fullWidth
                        label="Public Key / JWKS URL"
                        multiline
                        rows={5}
                        placeholder="-----BEGIN PUBLIC KEY-----\n...or https://your-domain/.well-known/jwks.json"
                      />
                    </Grid>
                  </Grid>
                )}

                {authType === "hmac" && (
                  <TextField
                    fullWidth
                    label="HMAC Secret"
                    type="password"
                    placeholder="Your shared secret for signature verification"
                  />
                )}

                {["clientcert", "oauth"].includes(authType) && (
                  <Typography color="text.secondary" variant="body2">
                    Configuration for {authType.toUpperCase()} will be available
                    in the next update.
                  </Typography>
                )}
              </Box> */}
            </Grid>

            {/* Rate Limiting */}
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <TextField
                fullWidth
                label="Requests per minute"
                type="number"
                value={rateLimit}
                onChange={(e) => setRateLimit(e.target.value)}
                placeholder="e.g. 100"
              />
            </Grid>
          </Grid>

          <Grid container spacing={1} sx={{ mt: 5 }}>
            <Grid
              size={12}
              sx={{ display: "flex", justifyContent: "space-between" }}
            >
              <Typography variant="h6" fontWeight="medium">
                Allowed Origins (CORS)
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addOrigin}
              >
                Add Origin
              </Button>
            </Grid>
            <Grid size={12}>
              {origins.map((origin, index) => (
                <Grid size={8} key={index}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ mb: 2 }}
                  >
                    <TextField
                      fullWidth
                      size="small"
                      label={`Origin ${index + 1}`}
                      placeholder="https://example.com"
                      value={origin}
                      onChange={(e) =>
                        handleOriginChange(index, e.target.value)
                      }
                    />
                    {origins.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => removeOrigin(index)}
                        aria-label="remove origin"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Divider sx={{ my: 6 }} />

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button variant="contained" size="large" sx={{ px: 5 }}>
              Save Configuration
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Paper>
  );
}
