import { useState } from "react";
import { Shield, CheckCircle, X } from "lucide-react";
import { API_BASE_URL } from "../../lib/apiConfig";

interface PhoneVerificationModalProps {
  onVerificationComplete: (phone: string) => void;
}

export default function PhoneVerificationModal({
  onVerificationComplete,
}: PhoneVerificationModalProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setOtpSending(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please login again.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/otp/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.success) {
        setShowOtpInput(true);
      } else {
        setError(data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error("OTP send error:", error);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setOtpVerifying(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please login again.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/otp/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await response.json();

      if (data.success) {
        // Save to localStorage
        localStorage.setItem("userPhone", data.phone);
        localStorage.setItem("phoneVerified", "true");
        onVerificationComplete(data.phone);
      } else {
        setError(data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setOtpVerifying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0, 0, 0, 0.8)" }}
    >
      <div
        className="card-street max-w-md w-full"
        style={{ maxHeight: "90vh", overflow: "auto" }}
      >
        <div className="flex items-center gap-3 mb-6">
          <Shield size={24} style={{ color: "var(--color-primary)" }} />
          <h2 className="text-heading" style={{ color: "var(--color-text)" }}>
            Verify Your Phone Number
          </h2>
        </div>

        <p
          className="mb-6"
          style={{
            color: "var(--color-text-secondary)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          We need to verify your phone number for order confirmations and
          delivery updates. You'll receive the OTP via WhatsApp.
        </p>

        {!showOtpInput ? (
          <div className="space-y-4">
            <div>
              <label
                className="form-label"
                style={{ color: "var(--color-text)" }}
              >
                Phone Number *
              </label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                  setError("");
                }}
                className="form-control"
                style={{
                  background: "var(--color-surface)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                  width: "100%",
                  padding: "var(--space-12)",
                  borderRadius: "var(--radius-base)",
                }}
                maxLength={10}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: "var(--color-error)" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleSendOTP}
              disabled={otpSending || phone.length !== 10}
              className="w-full py-3 rounded-lg font-medium transition-all duration-300"
              style={{
                background: "var(--color-primary)",
                color: "white",
                opacity: otpSending || phone.length !== 10 ? 0.6 : 1,
                cursor:
                  otpSending || phone.length !== 10 ? "not-allowed" : "pointer",
                border: "none",
              }}
            >
              {otpSending ? "Sending OTP..." : "Send OTP via WhatsApp"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className="p-4 rounded"
              style={{
                background: "var(--color-secondary)",
                border: "1px solid var(--color-border)",
              }}
            >
              <p
                className="text-sm mb-2"
                style={{ color: "var(--color-text-secondary)" }}
              >
                OTP sent to your WhatsApp:{" "}
                <strong style={{ color: "var(--color-text)" }}>
                  +91 {phone}
                </strong>
              </p>
              <button
                onClick={() => {
                  setShowOtpInput(false);
                  setOtp("");
                  setError("");
                }}
                className="text-sm underline"
                style={{
                  color: "var(--color-primary)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Change number
              </button>
            </div>

            <div>
              <label
                className="form-label"
                style={{ color: "var(--color-text)" }}
              >
                Enter 6-digit OTP *
              </label>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, "").slice(0, 6));
                  setError("");
                }}
                className="form-control"
                style={{
                  background: "var(--color-surface)",
                  color: "var(--color-text)",
                  border: "1px solid var(--color-border)",
                  width: "100%",
                  padding: "var(--space-12)",
                  borderRadius: "var(--radius-base)",
                  fontSize: "var(--font-size-lg)",
                  letterSpacing: "0.5em",
                  textAlign: "center",
                }}
                maxLength={6}
                autoFocus
              />
            </div>

            {error && (
              <p className="text-sm" style={{ color: "var(--color-error)" }}>
                {error}
              </p>
            )}

            <button
              onClick={handleVerifyOTP}
              disabled={otpVerifying || otp.length !== 6}
              className="w-full py-3 rounded-lg font-medium transition-all duration-300"
              style={{
                background: "var(--color-success)",
                color: "white",
                opacity: otpVerifying || otp.length !== 6 ? 0.6 : 1,
                cursor:
                  otpVerifying || otp.length !== 6 ? "not-allowed" : "pointer",
                border: "none",
              }}
            >
              {otpVerifying ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={handleSendOTP}
              disabled={otpSending}
              className="text-sm w-full underline"
              style={{
                color: "var(--color-primary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "var(--space-8)",
              }}
            >
              Resend OTP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
