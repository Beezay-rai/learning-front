// "use client";

// import { Button, Card, CardContent } from "@mui/material";
// import { useEffect, useState } from "react";

// export default function WebhookViewerPage() {
//   const [logs, setLogs] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);

//   const fetchLogs = async () => {
//     setLoading(true);
//     const res = await fetch("http://localhost:3000/api/webhooks/receive");
//     const data = await res.json();
//     setLogs(data);
//     setLoading(false);
//   };

//   const clearLogs = async () => {
//     await fetch("http://localhost:3000/api/webhooks/proxy", {
//       method: "DELETE",
//     });
//     setLogs([]);
//   };

//   useEffect(() => {
//     fetchLogs();
//   }, []);

//   return (
//     <div className="p-6 max-w-6xl mx-auto space-y-4">
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-semibold">Webhook Inspector</h1>
//         <div className="space-x-2">
//           <Button onClick={fetchLogs} disabled={loading}>
//             {loading ? "Refreshing..." : "Refresh"}
//           </Button>
//           <Button onClick={clearLogs} color="error">
//             Clear Logs
//           </Button>
//         </div>
//       </div>

//       {logs.length === 0 && (
//         <p className="text-muted-foreground">No webhooks received yet.</p>
//       )}

//       {logs.map((log) => (
//         <Card key={log.id} className="rounded-2xl">
//           <CardContent className="space-y-2">
//             <div className="text-sm text-muted-foreground">
//               Received at: {new Date(log.receivedAt).toLocaleString()}
//             </div>

//             <div className="text-sm font-semibold">Request Headers:</div>
//             <pre>{JSON.stringify(log.request?.headers ?? {}, null, 2)}</pre>

//             <div className="text-sm font-semibold">Request Body:</div>
//             <pre>{JSON.stringify(log.request?.body ?? {}, null, 2)}</pre>

//             <div className="text-sm font-semibold">Response Status:</div>
//             <pre>{log.response?.status ?? "N/A"}</pre>

//             <div className="text-sm font-semibold">Response Body:</div>
//             <pre>{JSON.stringify(log.response?.body ?? {}, null, 2)}</pre>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// }
