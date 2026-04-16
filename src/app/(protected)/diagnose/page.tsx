"use client";

import Link from "next/link";
import {
    Box,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    Grid,
    Typography,
} from "@mui/material";
import NetworkCheckIcon from "@mui/icons-material/NetworkCheck";
import BugReportIcon from "@mui/icons-material/BugReport";
import SpeedIcon from "@mui/icons-material/Speed";

const tools = [
    {
        id: "network-logs",
        title: "Network Logs",
        description:
            "Intercept and inspect HTTP requests and responses in real-time with detailed headers, body, and timing info.",
        icon: NetworkCheckIcon,
        link: "/diagnose/network-logs",
        color: "#06b6d4",
        bg: "#ecfeff",
        tag: "Network",
    },
    {
        id: "performance",
        title: "Performance Monitor",
        description:
            "Track page load times, resource sizes, and rendering performance metrics at a glance.",
        icon: SpeedIcon,
        link: "/diagnose/network-logs",
        color: "#f97316",
        bg: "#fff7ed",
        tag: "Performance",
    },
    {
        id: "error-tracker",
        title: "Error Tracker",
        description:
            "Capture and inspect runtime errors, unhandled rejections, and console warnings.",
        icon: BugReportIcon,
        link: "/diagnose/network-logs",
        color: "#ef4444",
        bg: "#fef2f2",
        tag: "Errors",
    },
];

export default function DiagnosePage() {
    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                    🩺 Diagnose
                </Typography>
                <Typography variant="body1" color="text.secondary" mt={0.5}>
                    Inspect, debug, and monitor network activity and application health.
                </Typography>
            </Box>

            <Grid container spacing={3}>
                {tools.map(({ id, title, description, icon: Icon, link, color, bg, tag }) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={id}>
                        <Card
                            sx={{
                                height: "100%",
                                borderRadius: 3,
                                border: "1px solid",
                                borderColor: "divider",
                                transition: "all 0.2s ease",
                                "&:hover": {
                                    borderColor: color,
                                    boxShadow: `0 8px 24px rgba(0,0,0,0.12)`,
                                    transform: "translateY(-2px)",
                                },
                            }}
                            elevation={0}
                        >
                            <CardActionArea component={Link} href={link} sx={{ height: "100%", alignItems: "flex-start", p: 1 }}>
                                <CardContent>
                                    <Box
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            borderRadius: 3,
                                            background: bg,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            mb: 2,
                                        }}
                                    >
                                        <Icon sx={{ color, fontSize: 26 }} />
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {title}
                                        </Typography>
                                        <Chip label={tag} size="small" sx={{ fontSize: "0.7rem", bgcolor: bg, color }} />
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" lineHeight={1.6}>
                                        {description}
                                    </Typography>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
