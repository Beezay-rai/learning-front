import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Stack,
} from "@mui/material";
import { useState } from "react";

interface ConfigureModalProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (data: ConfigureFormData) => void;
}

interface ConfigureFormData {
  auth: string;
  certificate: string;
  rateLimit: number;
  logApi: boolean;
}

export default function ConfigureModal({
  open,
  onClose,
  onUpdate,
}: ConfigureModalProps) {
  const [form, setForm] = useState<ConfigureFormData>({
    auth: "",
    certificate: "",
    rateLimit: 0,
    logApi: false,
  });

  const handleChange = (key: keyof ConfigureFormData, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpdate = () => {
    onUpdate(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Configure API</DialogTitle>

      <DialogContent>
        <Stack spacing={3} mt={1}>
          {/* Auth Select */}
          <FormControl fullWidth>
            <InputLabel>Auth</InputLabel>
            <Select
              label="Auth"
              value={form.auth}
              onChange={(e) => handleChange("auth", e.target.value)}
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="basic">Basic Auth</MenuItem>
              <MenuItem value="oauth">OAuth</MenuItem>
              <MenuItem value="apikey">API Key</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Certificate</InputLabel>
            <Select
              label="Certificate"
              value={form.certificate}
              onChange={(e) => handleChange("certificate", e.target.value)}
            >
              <MenuItem value="cert1">Certificate 1</MenuItem>
              <MenuItem value="cert2">Certificate 2</MenuItem>
            </Select>
          </FormControl>

          {/* Rate Limit */}
          <TextField
            label="Rate Limit (req/min)"
            type="number"
            fullWidth
            value={form.rateLimit}
            onChange={(e) => handleChange("rateLimit", Number(e.target.value))}
          />

          {/* Log API Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={form.logApi}
                onChange={(e) => handleChange("logApi", e.target.checked)}
              />
            }
            label="Enable API Logging"
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="error" variant="outlined">
          Close
        </Button>
        <Button variant="contained" onClick={handleUpdate}>
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
}
