"use client"

import { useState, useRef } from "react"

// Map backend status → progress %
const STATUS_PROGRESS: Record<string, number> = {
  queued: 0,
  validating: 10,
  feature_engineering: 30,
  training: 60,
  saving_model: 85,
  registering_model: 95,
  completed: 100,
  failed: 100,
}

export default function Home() {
  const [assetType, setAssetType] = useState("gas_turbine")
  const [file, setFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState<number | null>(null)

  const [status, setStatus] = useState<string>("idle")
  const [progress, setProgress] = useState<number>(0)
  const [logs, setLogs] = useState<string[]>([])

  const wsRef = useRef<WebSocket | null>(null)

  const log = (msg: string) =>
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])

  // -------------------------
  // Upload CSV
  // -------------------------
  const uploadCsv = async () => {
    if (!file) {
      alert("Please select a CSV file")
      return
    }

    log("Uploading CSV...")
    setStatus("queued")
    setProgress(0)

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/upload-csv-for-model-creation-or-update?asset_type=${assetType}`,
      {
        method: "POST",
        body: formData,
      }
    )

    if (!res.ok) {
      log("Upload failed")
      setStatus("failed")
      setProgress(100)
      return
    }

    const data = await res.json()
    setJobId(data.job_id)
    log(`Training started (job_id=${data.job_id})`)

    connectWebSocket(data.job_id)
  }

  // -------------------------
  // WebSocket connection
  // -------------------------
  const connectWebSocket = (jobId: number) => {
    const wsUrl = `ws://localhost:8000/ws/training/${jobId}`


    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {}

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)

      const newStatus = data.status
      const newProgress = STATUS_PROGRESS[newStatus] ?? progress

      setStatus(newStatus)
      setProgress(newProgress)

      log(`${newStatus}: ${data.message}`)
    }

    ws.onerror = () => log("WebSocket error")
    ws.onclose = () =>{}
  }

  return (
    <main
      style={{
        padding: 24,
        maxWidth: 800,
        margin: "0 auto",
        fontFamily: "monospace",
      }}
    >
      <h1>Training API Test</h1>

      {/* ------------------------- */}
      {/* Controls */}
      {/* ------------------------- */}
      <div style={{ marginBottom: 12 }}>
        <label>Asset Type: </label>
        <input
          value={assetType}
          onChange={(e) => setAssetType(e.target.value)}
          style={{ marginLeft: 8 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <button onClick={uploadCsv}>Upload & Train</button>

      {/* ------------------------- */}
      {/* Status Bar */}
      {/* ------------------------- */}
      <div style={{ marginTop: 24 }}>
        <div style={{ marginBottom: 6 }}>
          <strong>Status:</strong> {status}
        </div>

        <div
          style={{
            width: "100%",
            height: 20,
            background: "#333",
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background:
                progress === 100
                  ? status === "failed"
                    ? "#f00"
                    : "#0f0"
                  : "#0af",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div style={{ marginTop: 4 }}>{progress}%</div>
      </div>

      {/* ------------------------- */}
      {/* Logs */}
      {/* ------------------------- */}
      <hr style={{ margin: "24px 0" }} />

      <h3>Logs</h3>
      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: 12,
          maxHeight: 300,
          overflowY: "auto",
        }}
      >
        {logs.join("\n")}
      </pre>
    </main>
  )
}
