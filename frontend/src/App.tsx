import { useState } from "react";
import "./App.css";

// This describes what the backend sends back to the frontend
type ScanResult = {
  url: string;
  usesHttps: boolean;
  statusCode: number;
  hasHsts: boolean;
  hasCsp: boolean;
  hasXFrameOptions: boolean;
  hasXContentTypeOptions: boolean;
  score: number;
  grade: string;
};

function App() {
  // Stores what the user types in the input field
  const [url, setUrl] = useState("");

  // Stores the scan result from the backend
  const [result, setResult] = useState<ScanResult | null>(null);

  // Stores error messages
  const [error, setError] = useState("");

  // Shows if the app is currently scanning
  const [loading, setLoading] = useState(false);

  async function scanWebsite() {
    // Clear old result and old error before a new scan
    setResult(null);
    setError("");
    setLoading(true);

    try {
      // Change this port if your backend uses another port
      const backendUrl = "http://localhost:5296";

      // Send the URL to the backend
      const response = await fetch(
        `${backendUrl}/api/scan?url=${encodeURIComponent(url)}`
      );

      // If backend returns an error, show the error text
      if (!response.ok) {
        const errorText = await response.text();
        setError(errorText);
        return;
      }

      // Convert JSON response into a JavaScript object
      const data: ScanResult = await response.json();

      // Save result so it can be shown on the page
      setResult(data);
    } catch {
      setError("Could not connect to the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <h1>WebSafety</h1>
      <p className="subtitle">Simple website security header checker</p>

      <div className="scan-box">
        <input
          type="text"
          placeholder="Enter website URL, for example https://vg.no"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />

        <button onClick={scanWebsite} disabled={loading}>
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {result && (
        <div className="result-card">
          <h2>Scan Result</h2>

          <p>
            <strong>URL:</strong> {result.url}
          </p>

          <p>
            <strong>Status Code:</strong> {result.statusCode}
          </p>

          <p>
            <strong>Score:</strong> {result.score}/100
          </p>

          <p>
            <strong>Grade:</strong> {result.grade}
          </p>

          <table>
            <tbody>
              <tr>
                <td>HTTPS</td>
                <td>{result.usesHttps ? "OK" : "Missing"}</td>
              </tr>

              <tr>
                <td>HSTS</td>
                <td>{result.hasHsts ? "OK" : "Missing"}</td>
              </tr>

              <tr>
                <td>Content-Security-Policy</td>
                <td>{result.hasCsp ? "OK" : "Missing"}</td>
              </tr>

              <tr>
                <td>X-Frame-Options</td>
                <td>{result.hasXFrameOptions ? "OK" : "Missing"}</td>
              </tr>

              <tr>
                <td>X-Content-Type-Options</td>
                <td>{result.hasXContentTypeOptions ? "OK" : "Missing"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="info-section">
        <h2>What do these checks mean?</h2>

        <div className="info-card">
          <h3>HTTPS</h3>
          <p>
            HTTPS means the website uses encrypted communication between the
            browser and the server. This helps protect data from being read or
            changed while it is being sent.
          </p>
        </div>

        <div className="info-card">
          <h3>HSTS</h3>
          <p>
            HSTS stands for Strict-Transport-Security. It tells browsers to
            always use HTTPS for the website, even if the user types HTTP.
          </p>
        </div>

        <div className="info-card">
          <h3>Content-Security-Policy</h3>
          <p>
            Content-Security-Policy helps protect against attacks like XSS by
            controlling which scripts, images and resources the browser is
            allowed to load.
          </p>
        </div>

        <div className="info-card">
          <h3>X-Frame-Options</h3>
          <p>
            X-Frame-Options helps protect against clickjacking by stopping the
            website from being loaded inside a frame on another website.
          </p>
        </div>

        <div className="info-card">
          <h3>X-Content-Type-Options</h3>
          <p>
            X-Content-Type-Options helps stop browsers from guessing file types
            incorrectly. This reduces the risk of some browser-based attacks.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;