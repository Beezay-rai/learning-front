// "use client";
// import {
//   Box,
//   Button,
//   Container,
//   Typography,
//   Stack,
//   AppBar,
//   Toolbar,
// } from "@mui/material";
// import { useRouter } from "next/navigation";
// import { LogIn } from "lucide-react";
// import { signinRedirect } from "@/services/authService";

// export default function HomePage() {
//   const handleLogin = () => {
//     signinRedirect();
//   };

//   return (
//     <>
//       {/* Navbar */}
//       <AppBar position="static" color="transparent" elevation={0}>
//         <Toolbar sx={{ justifyContent: "space-between" }}>
//           <Typography variant="h6" sx={{ fontWeight: "bold" }}>
//             MyApp
//           </Typography>
//           <Button
//             variant="contained"
//             color="primary"
//             startIcon={<LogIn />}
//             onClick={handleLogin}
//             sx={{ borderRadius: 2, textTransform: "none" }}
//           >
//             Login
//           </Button>
//         </Toolbar>
//       </AppBar>

//       {/* Hero Section */}
//       <Container maxWidth="md" sx={{ mt: 10, textAlign: "center" }}>
//         <Stack spacing={3} alignItems="center">
//           <Typography
//             variant="h2"
//             sx={{
//               fontWeight: "bold",
//               color: "text.primary",
//               fontSize: { xs: "2.5rem", md: "3.5rem" },
//             }}
//           >
//             Welcome to <span style={{ color: "#1976d2" }}>MyApp</span>
//           </Typography>

//           <Typography
//             variant="h6"
//             sx={{
//               color: "text.secondary",
//               maxWidth: 600,
//               lineHeight: 1.6,
//             }}
//           >
//             Build, manage, and grow your projects effortlessly with modern tools
//             and seamless collaboration.
//           </Typography>

//           <Button
//             variant="contained"
//             color="primary"
//             size="large"
//             sx={{
//               px: 5,
//               py: 1.5,
//               borderRadius: 3,
//               textTransform: "none",
//               fontSize: "1rem",
//             }}
//             onClick={handleLogin}
//           >
//             Get Started
//           </Button>
//         </Stack>
//       </Container>

//       {/* Footer */}
//       <Box
//         sx={{
//           mt: 12,
//           py: 3,
//           textAlign: "center",
//           bgcolor: "grey.100",
//           color: "text.secondary",
//         }}
//       >
//         <Typography variant="body2">
//           © {new Date().getFullYear()} MyApp. All rights reserved.
//         </Typography>
//       </Box>
//     </>
//   );
// }
"use client";

import type { ReactNode } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  AppBar,
  Toolbar,
  Chip,
} from "@mui/material";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import { LogIn, ArrowRight, Network, ShieldCheck, Activity, Lock } from "lucide-react";
import {
  ReactFlow,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeTypes,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { signinRedirect } from "@/services/authService";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
});
const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const colors = {
  bg: "#F8F9FB",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F4F8",
  border: "rgba(15, 23, 42, 0.10)",
  copper: "#B5611E",
  copperSoft: "rgba(181, 97, 30, 0.10)",
  teal: "#1E8A85",
  tealSoft: "rgba(30, 138, 133, 0.10)",
  textPrimary: "#0F172A",
  textSecondary: "#5A6478",
} as const;

const features = [
  {
    icon: Network,
    title: "One builder, any protocol",
    description:
      "Define a REST resource, or import a WSDL and expose a SOAP operation — from the same route builder, behind the same host.",
  },
  {
    icon: ShieldCheck,
    title: "Auth assigned per route",
    description:
      "API key, OAuth2, JWT, or mutual TLS. Pick a strategy per route, change it later, and the gateway enforces it immediately — no redeploy.",
  },
  {
    icon: Activity,
    title: "Every call, accounted for",
    description:
      "Request logs, latency, and auth failures stream in real time, scoped down to the individual route.",
  },
];

const steps = [
  {
    number: "01",
    title: "Define the route",
    description: "Set the path, method, and the upstream service it points to.",
  },
  {
    number: "02",
    title: "Choose the protocol",
    description: "A REST resource, or a SOAP operation pulled straight from a WSDL.",
  },
  {
    number: "03",
    title: "Attach an auth strategy",
    description: "API key, OAuth2, JWT, or mTLS — scoped to that route alone.",
  },
  {
    number: "04",
    title: "Publish",
    description: "The gateway enforces it live. No redeploy, no downtime.",
  },
];

const sampleRoutes = [
  {
    method: "POST",
    path: "/v1/payments/charge",
    protocol: "REST",
    auth: "OAuth2 · scope: payments:write",
  },
  {
    method: "POST",
    path: "/v1/legacy/CustomerLookup",
    protocol: "SOAP 1.1",
    auth: "mTLS + API key",
  },
];

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Typography
      component="a"
      href={href}
      sx={{
        fontSize: "0.9rem",
        color: colors.textSecondary,
        textDecoration: "none",
        "&:hover": { color: colors.textPrimary },
      }}
    >
      {children}
    </Typography>
  );
}

function Navbar({ onLogin }: { onLogin: () => void }) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(11, 18, 32, 0.8)",
        backdropFilter: "blur(10px)",
        borderBottom: `1px solid ${colors.border}`,
        boxShadow: "none",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", py: 1.5 }}>
        <Stack direction="row" spacing={1.2} alignItems="center">
          <Box
            sx={{
              width: 28,
              height: 28,
              borderRadius: "8px",
              bgcolor: colors.copperSoft,
              border: `1px solid ${colors.copper}`,
              display: "grid",
              placeItems: "center",
            }}
          >
            <Network size={16} color={colors.copper} />
          </Box>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "1.15rem",
              letterSpacing: "-0.01em",
              color: colors.textPrimary,
            }}
          >
            Switchbay
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={4}
          alignItems="center"
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          <NavLink href="#protocols">Protocols</NavLink>
          <NavLink href="#how-it-works">How it works</NavLink>
        </Stack>

        <Button
          variant="contained"
          startIcon={<LogIn size={16} />}
          onClick={onLogin}
          sx={{
            bgcolor: colors.copper,
            color: "#fff",
            textTransform: "none",
            borderRadius: 2,
            fontWeight: 600,
            px: 2.5,
            "&:hover": { bgcolor: "#9A4D15" },
          }}
        >
          Log in
        </Button>
      </Toolbar>
    </AppBar>
  );
}

type ProtocolNode = Node<{ label: string }, "protocol">;
type GatewayNode = Node<Record<string, never>, "gateway">;
type AuthNode = Node<Record<string, never>, "auth">;
type ServiceNode = Node<{ label: string }, "service">;
type DiagramNode = ProtocolNode | GatewayNode | AuthNode | ServiceNode;

const handleDotStyle = (color: string) => ({
  width: 8,
  height: 8,
  background: color,
  border: `1px solid ${colors.surface}`,
});

function ProtocolNodeView({ data }: NodeProps<ProtocolNode>) {
  return (
    <Box
      sx={{
        width: 120,
        height: 48,
        borderRadius: "10px",
        bgcolor: colors.surfaceAlt,
        border: `1.5px solid ${colors.copper}`,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Typography sx={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: colors.copper }}>
        {data.label}
      </Typography>
      <Handle type="source" position={Position.Right} style={handleDotStyle(colors.copper)} />
    </Box>
  );
}

function GatewayNodeView() {
  return (
    <Box
      sx={{
        width: 100,
        height: 100,
        borderRadius: "50%",
        bgcolor: colors.surfaceAlt,
        border: `2px solid ${colors.copper}`,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Handle type="target" position={Position.Left} style={handleDotStyle(colors.copper)} />
      <Typography
        sx={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          letterSpacing: "0.06em",
          color: colors.textPrimary,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        GATE
        <br />
        WAY
      </Typography>
      <Handle type="source" position={Position.Right} style={handleDotStyle(colors.teal)} />
    </Box>
  );
}

function AuthNodeView() {
  return (
    <Box
      sx={{
        width: 84,
        height: 84,
        borderRadius: "50%",
        bgcolor: colors.tealSoft,
        border: `2px solid ${colors.teal}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.3,
      }}
    >
      <Handle type="target" position={Position.Left} style={handleDotStyle(colors.teal)} />
      <Lock size={15} color={colors.teal} />
      <Typography
        sx={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.08em", color: colors.teal }}
      >
        AUTH
      </Typography>
      <Handle type="source" position={Position.Right} style={handleDotStyle(colors.teal)} />
    </Box>
  );
}

function ServiceNodeView({ data }: NodeProps<ServiceNode>) {
  return (
    <Box
      sx={{
        width: 100,
        height: 44,
        borderRadius: "10px",
        bgcolor: colors.surfaceAlt,
        border: `1.5px solid ${colors.border}`,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Handle type="target" position={Position.Left} style={handleDotStyle(colors.teal)} />
      <Typography sx={{ fontFamily: "var(--font-mono)", fontSize: "0.72rem", color: colors.textSecondary }}>
        {data.label}
      </Typography>
    </Box>
  );
}

const diagramNodeTypes: NodeTypes = {
  protocol: ProtocolNodeView,
  gateway: GatewayNodeView,
  auth: AuthNodeView,
  service: ServiceNodeView,
};

const diagramNodes: DiagramNode[] = [
  { id: "rest", type: "protocol", position: { x: 0, y: 20 }, data: { label: "REST" } },
  { id: "soap", type: "protocol", position: { x: 0, y: 180 }, data: { label: "SOAP" } },
  { id: "gateway", type: "gateway", position: { x: 220, y: 75 }, data: {} },
  { id: "auth", type: "auth", position: { x: 410, y: 83 }, data: {} },
  { id: "service-a", type: "service", position: { x: 560, y: 10 }, data: { label: "Service A" } },
  { id: "service-b", type: "service", position: { x: 560, y: 175 }, data: { label: "Service B" } },

];

const diagramEdges: Edge[] = [
  { id: "rest-gateway", source: "rest", target: "gateway", animated: true, style: { stroke: colors.copper, strokeWidth: 2 } },
  { id: "soap-gateway", source: "soap", target: "gateway", animated: true, style: { stroke: colors.copper, strokeWidth: 2 } },
  { id: "gateway-auth", source: "gateway", target: "auth", animated: true, style: { stroke: colors.teal, strokeWidth: 2 } },
  { id: "auth-service-a", source: "auth", target: "service-a", animated: true, style: { stroke: colors.teal, strokeWidth: 2 } },
  { id: "auth-service-b", source: "auth", target: "service-b", animated: true, style: { stroke: colors.teal, strokeWidth: 2 } },
];

function GatewayDiagram() {
  return (
    <Box
      sx={{
        bgcolor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 3,
        p: { xs: 1, md: 2 },
        height: { xs: 320, md: 380 },
      }}
    >
      <ReactFlow
        nodes={diagramNodes}
        edges={diagramEdges}
        nodeTypes={diagramNodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
      />
    </Box>
  );
}

function Hero({ onLogin }: { onLogin: () => void }) {
  return (
    <Container maxWidth="lg" sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 10 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" },
          gap: { xs: 6, md: 4 },
          alignItems: "center",
        }}
      >
        <Stack spacing={3}>
          <Chip
            label="API GATEWAY"
            sx={{
              alignSelf: "flex-start",
              bgcolor: colors.copperSoft,
              color: colors.copper,
              fontFamily: "var(--font-mono)",
              fontSize: "0.7rem",
              letterSpacing: "0.08em",
              fontWeight: 600,
              borderRadius: 1,
              height: 26,
            }}
          />
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              fontSize: { xs: "2.4rem", md: "3.4rem" },
              color: colors.textPrimary,
            }}
          >
            Plug in any protocol.
            <br />
            Route out one gateway.
          </Typography>
          <Typography
            sx={{
              color: colors.textSecondary,
              fontSize: "1.05rem",
              lineHeight: 1.7,
              maxWidth: 480,
            }}
          >
            Switchbay builds REST and SOAP APIs from a single control plane,
            and lets every route carry its own auth strategy — API key,
            OAuth2, JWT, or mutual TLS — changed at runtime, never a redeploy.
          </Typography>
          <Stack direction="row" spacing={2} sx={{ pt: 1 }}>
            <Button
              variant="contained"
              size="large"
              endIcon={<ArrowRight size={16} />}
              onClick={onLogin}
              sx={{
                bgcolor: colors.copper,
                color: "#fff",
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 600,
                px: 3.5,
                "&:hover": { bgcolor: "#9A4D15" },
              }}
            >
              Get started
            </Button>
            <Button
              component="a"
              href="#how-it-works"
              variant="outlined"
              size="large"
              sx={{
                borderColor: colors.border,
                color: colors.textPrimary,
                textTransform: "none",
                borderRadius: 2,
                fontWeight: 600,
                px: 3.5,
                "&:hover": { borderColor: colors.copper, bgcolor: "transparent" },
              }}
            >
              See how it works
            </Button>
          </Stack>
        </Stack>

        <GatewayDiagram />
      </Box>
    </Container>
  );
}

function RoutePreview() {
  return (
    <Box
      id="protocols"
      sx={{
        bgcolor: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        borderBottom: `1px solid ${colors.border}`,
      }}
    >
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={1} sx={{ mb: 5, maxWidth: 560 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: { xs: "1.6rem", md: "2rem" },
              color: colors.textPrimary,
            }}
          >
            A route is just configuration
          </Typography>
          <Typography sx={{ color: colors.textSecondary, lineHeight: 1.7 }}>
            Protocol and auth are settings on the route, not decisions baked
            into your code. Change either one without touching the other.
          </Typography>
        </Stack>

        <Stack spacing={2}>
          {sampleRoutes.map((route) => (
            <Box
              key={route.path}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "auto 1fr auto auto" },
                gap: { xs: 1.5, sm: 3 },
                alignItems: "center",
                bgcolor: colors.surfaceAlt,
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
                px: 3,
                py: 2,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                  color: colors.copper,
                  fontWeight: 600,
                }}
              >
                {route.method}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.9rem",
                  color: colors.textPrimary,
                }}
              >
                {route.path}
              </Typography>
              <Chip
                label={route.protocol}
                size="small"
                sx={{
                  bgcolor: colors.copperSoft,
                  color: colors.copper,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  height: 24,
                  justifySelf: { xs: "start", sm: "center" },
                }}
              />
              <Chip
                label={route.auth}
                size="small"
                sx={{
                  bgcolor: colors.tealSoft,
                  color: colors.teal,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.7rem",
                  height: 24,
                  justifySelf: { xs: "start", sm: "end" },
                }}
              />
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

function FeatureGrid() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 4,
        }}
      >
        {features.map(({ icon: Icon, title, description }) => (
          <Stack key={title} spacing={2}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "10px",
                bgcolor: colors.copperSoft,
                display: "grid",
                placeItems: "center",
              }}
            >
              <Icon size={20} color={colors.copper} />
            </Box>
            <Typography
              sx={{
                fontFamily: "var(--font-display)",
                fontWeight: 600,
                fontSize: "1.15rem",
                color: colors.textPrimary,
              }}
            >
              {title}
            </Typography>
            <Typography sx={{ color: colors.textSecondary, lineHeight: 1.7, fontSize: "0.95rem" }}>
              {description}
            </Typography>
          </Stack>
        ))}
      </Box>
    </Container>
  );
}

function HowItWorks() {
  return (
    <Box id="how-it-works" sx={{ bgcolor: colors.surface, borderTop: `1px solid ${colors.border}` }}>
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 11 } }}>
        <Typography
          sx={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: { xs: "1.6rem", md: "2rem" },
            color: colors.textPrimary,
            mb: 5,
          }}
        >
          How it works
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
            gap: 4,
          }}
        >
          {steps.map((step) => (
            <Stack key={step.number} spacing={1.5} sx={{ borderLeft: `2px solid ${colors.copper}`, pl: 2.5 }}>
              <Typography sx={{ fontFamily: "var(--font-mono)", color: colors.copper, fontSize: "0.85rem", fontWeight: 600 }}>
                {step.number}
              </Typography>
              <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 600, color: colors.textPrimary }}>
                {step.title}
              </Typography>
              <Typography sx={{ color: colors.textSecondary, fontSize: "0.9rem", lineHeight: 1.6 }}>
                {step.description}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Container>
    </Box>
  );
}

function Footer() {
  return (
    <Box sx={{ borderTop: `1px solid ${colors.border}` }}>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontFamily: "var(--font-display)", fontWeight: 700, color: colors.textPrimary }}>
              Switchbay
            </Typography>
            <Typography sx={{ color: colors.textSecondary, fontSize: "0.85rem" }}>
              — built for teams who ship APIs, not glue code.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: colors.teal }} />
            <Typography sx={{ color: colors.textSecondary, fontSize: "0.8rem", fontFamily: "var(--font-mono)" }}>
              All systems operational
            </Typography>
          </Stack>
        </Stack>
        <Typography sx={{ color: colors.textSecondary, fontSize: "0.78rem", mt: 3 }}>
          © {new Date().getFullYear()} Switchbay. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}

export default function HomePage() {
  const handleLogin = () => {
    signinRedirect();
  };

  return (
    <Box
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      sx={{
        bgcolor: colors.bg,
        color: colors.textPrimary,
        minHeight: "100vh",
        fontFamily: "var(--font-body)",
      }}
    >
      <Navbar onLogin={handleLogin} />
      <Hero onLogin={handleLogin} />
      <RoutePreview />
      <FeatureGrid />
      <HowItWorks />
      <Footer />
    </Box>
  );
}