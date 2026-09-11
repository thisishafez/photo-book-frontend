import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { useTheme } from "../../contexts/ThemeContext";
import { pick } from "../../utils/normalizeHangout";
import { api } from "../../services/api";
import "./QRScanner.css";

// BarcodeDetector is native (no new dependency) but not available on
// all browsers (notably Safari/iOS) — manual entry is the reliable
// path here, not just an error fallback.
const supportsBarcodeDetector =
  typeof window !== "undefined" && "BarcodeDetector" in window;

export default function QRScanner() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);

  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { type: "success" | "error", text }

  useEffect(() => () => stopCamera(), []);

  const startCamera = async () => {
    if (!supportsBarcodeDetector) return;
    setResult(null);
    try {
      detectorRef.current = new window.BarcodeDetector({
        formats: ["qr_code"],
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScanning(true);
      tick();
    } catch {
      setResult({
        type: "error",
        text: "Couldn't access the camera — enter the code manually below.",
      });
    }
  };

  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setScanning(false);
  };

  const tick = async () => {
    if (!videoRef.current || !detectorRef.current) return;

    try {
      const codes = await detectorRef.current.detect(videoRef.current);

      if (codes.length > 0) {
        stopCamera();
        submitCode(codes[0].rawValue);
        return;
      }
    } catch {
      // A single frame occasionally fails to decode — just keep going.
    }

    rafRef.current = requestAnimationFrame(tick);
  };

  const submitCode = async (code) => {
    const trimmed = (code || "").trim();

    if (!trimmed) return;

    setSubmitting(true);
    setResult(null);

    try {
      const verification = await api.attendance.verifyScan(trimmed);

      const activityTitle =
        pick(verification, "activity_title", "ActivityTitle") ||
        pick(
          pick(verification, "activity", "Activity") || {},
          "title",
          "Title"
        ) ||
        "the activity";

      setResult({
        type: "success",
        text: `You're checked in for ${activityTitle}!`,
      });

      setManualCode("");
    } catch (err) {
      setResult({
        type: "error",
        text: err.message || "That code isn't valid.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    submitCode(manualCode);
  };

  return (
    <div className={`qr-scanner-page ${darkMode ? "qr-scanner-dark kh-dark" : ""}`}>
      <Navbar />

      <main className="qr-scanner-container">
        <button className="qr-scanner-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1>Scan to check in</h1>

        <p className="qr-scanner-subtitle">
          Scan the host's QR code at the activity to verify your attendance.
        </p>

        {supportsBarcodeDetector ? (
          <div className="qr-scanner-camera">
            <video
              ref={videoRef}
              className="qr-scanner-video"
              muted
              playsInline
            />

            {!scanning ? (
              <button
                className="qr-scanner-camera-btn"
                onClick={startCamera}
                disabled={submitting}
              >
                Start camera
              </button>
            ) : (
              <button
                className="qr-scanner-camera-btn stop"
                onClick={stopCamera}
              >
                Stop camera
              </button>
            )}
          </div>
        ) : (
          <p className="qr-scanner-note">
            Camera scanning isn't supported in this browser — enter the code
            shown by the host instead.
          </p>
        )}

        <form className="qr-scanner-manual" onSubmit={handleManualSubmit}>
          <label htmlFor="qr-manual-code">
            Or enter the code manually
          </label>

          <input
            id="qr-manual-code"
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="e.g. ACT-9F2K7"
            disabled={submitting}
          />

          <button
            type="submit"
            className="qr-scanner-submit-btn"
            disabled={submitting || !manualCode.trim()}
          >
            {submitting ? "Checking in…" : "Check in"}
          </button>
        </form>

        {result && (
          <p
            className={`qr-scanner-notice qr-scanner-notice-${result.type}`}
          >
            {result.text}
          </p>
        )}
      </main>
    </div>
  );
}