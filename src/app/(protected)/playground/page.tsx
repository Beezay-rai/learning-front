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
import CodeIcon from "@mui/icons-material/Code";
import PublicIcon from "@mui/icons-material/Public";
import DataObjectIcon from "@mui/icons-material/DataObject";
import SendIcon from "@mui/icons-material/Send";
import TerminalIcon from "@mui/icons-material/Terminal";

import KeyIcon from "@mui/icons-material/VpnKey";

const tools = [
    {
        id: "code-editor",
        title: "Code Editor",
        description:
            "Write and run HTML, CSS, and JavaScript code directly in the browser with live preview.",
        icon: CodeIcon,
        link: "/playground/code-editor",
        color: "#6366f1",
        bg: "#eef2ff",
        tag: "Frontend",
    },
    {
        id: "json-formatter",
        title: "JSON Formatter",
        description:
            "Paste JSON to format, validate, and explore its structure with syntax highlighting.",
        icon: DataObjectIcon,
        link: "/playground/json-formatter",
        color: "#10b981",
        bg: "#d1fae5",
        tag: "Utility",
    },
    {
        id: "api-tester",
        title: "API Tester",
        description:
            "Send HTTP requests and inspect responses — a lightweight Postman-like tool.",
        icon: SendIcon,
        link: "/playground/api-tester",
        color: "#f59e0b",
        bg: "#fef3c7",
        tag: "Testing",
    },
    {
        id: "csharp-fiddler",
        title: "C# Fiddler",
        description:
            "Write and execute C# code snippets in real-time using .NET runtime via Piston API.",
        icon: TerminalIcon,
        link: "/playground/csharp-fiddler",
        color: "#8b5cf6",
        bg: "#f5f3ff",
        tag: "Backend",
    },
    {
        id: "jwt-inspector",
        title: "JWT Inspector",
        description:
            "Decode, verify, and generated JWTs. Inspect headers, payloads, and signatures.",
        icon: KeyIcon,
        link: "/playground/jwt-inspector",
        color: "#ec4899",
        bg: "#fdf2f8",
        tag: "Security",
    },
];

export default function PlaygroundPage() {
    return (
        <Box>
            <Box mb={4}>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                    🧪 Playground
                </Typography>
                <Typography variant="body1" color="text.secondary" mt={0.5}>
                    Developer tools to code, test, and inspect — all in one place.
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
