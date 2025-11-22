"use client";

import { useEffect, useState } from "react";

export default function Home() {
  const [links, setLinks] = useState([]);
  const [targetUrl, setTargetUrl] = useState("");
  const [customCode, setCustomCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ---------------------------
  // FIXED: Safe Fetch for links
  // ---------------------------
  useEffect(() => {
    fetch("/api/links")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLinks(data);
        } else if (Array.isArray(data?.links)) {
          setLinks(data.links);
        } else {
          console.warn("Unexpected API format:", data);
          setLinks([]);
        }
      });
  }, []);

  // ---------------------------
  // Create new link
  // ---------------------------
  async function CreateLink() {
    setLoading(true);
    setErrorMsg("");

    const res = await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        target_url: targetUrl,
        code: customCode || undefined,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMsg(data.error);
      setLoading(false);
      return;
    }

    // Reload list
    const newList = await fetch("/api/links").then((r) => r.json());
    setLinks(Array.isArray(newList) ? newList : []);
    setTargetUrl("");
    setCustomCode("");
    setLoading(false);
  }

  // ---------------------------
  // Delete link
  // ---------------------------
  async function deleteLink(code) {
    await fetch(`/api/links/${code}`, { method: "DELETE" });

    const newList = await fetch("/api/links").then((r) => r.json());
    setLinks(Array.isArray(newList) ? newList : []);
  }

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>
        TinyLink Dashboard
      </h1>

      <div style={{ marginTop: "20px" }}>
        <input
          value={targetUrl}
          onChange={(e) => setTargetUrl(e.target.value)}
          placeholder="Enter URL"
          style={{ padding: "10px", width: "50%", marginRight: "10px" }}
        />

        <input
          value={customCode}
          onChange={(e) => setCustomCode(e.target.value)}
          placeholder="Custom Code (optional)"
          style={{ padding: "10px", width: "25%", marginRight: "10px" }}
        />

        <button
          onClick={CreateLink}
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: "#0070f3",
            color: "white",
            borderRadius: "5px",
          }}
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>

      {errorMsg && (
        <p style={{ color: "red", marginTop: "10px" }}>{errorMsg}</p>
      )}

      <h2 style={{ marginTop: "40px", fontSize: "22px" }}>Your Links</h2>

      <table style={{ width: "100%", marginTop: "20px" }} border="1">
        <thead>
          <tr>
            <th>Code</th>
            <th>Target URL</th>
            <th>Clicks</th>
            <th>Last Clicked</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {(Array.isArray(links) ? links : []).map((link) => (
            <tr key={link.code}>
              <td>{link.code}</td>

              <td>
                <a href={link.target_url} target="_blank">
                  {link.target_url}
                </a>
              </td>

              <td>{link.total_clicks}</td>
              <td>{link.last_clicked || "_"}</td>

              <td>
                <button
                  onClick={() =>
                    navigator.clipboard.writeText(
                      `${window.location.origin}/${link.code}`
                    )
                  }
                  style={{ marginRight: "10px" }}
                >
                  Copy
                </button>

                <button onClick={() => deleteLink(link.code)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
