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

  // TEMPORARY: OTP verification commented out - just validate 10 digits and proceed
  const handleSendOTP = async () => {
    if (phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    // Save phone number to backend
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated. Please login again.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/phone`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Save to localStorage for quick access
        localStorage.setItem("userPhone", phone);
        localStorage.setItem("phoneVerified", "true");
        
        // Verify the phone was actually saved by fetching user profile
        try {
          const verifyResponse = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            credentials: 'include',
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            if (verifyData.success && verifyData.user.phone === phone) {
              console.log("Phone number successfully saved to database:", phone);
            }
          }
        } catch (verifyError) {
          console.error("Error verifying phone save:", verifyError);
        }
        
        onVerificationComplete(phone);
      } else {
        setError(data.message || "Failed to save phone number. Please try again.");
      }
    } catch (error) {
      console.error("Error saving phone number:", error);
      setError("Failed to save phone number. Please try again.");
    }

    // COMMENTED OUT OTP VERIFICATION CODE (Temporary)
    /*
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
    */
  };

  // COMMENTED OUT OTP VERIFICATION CODE (Temporary)
  /*
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
  */

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
          We need your phone number for order confirmations and delivery updates.
        </p>

        {/* TEMPORARY: Simplified phone input without OTP */}
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
            <p
              className="text-xs mt-2"
              style={{
                color: "var(--color-text-secondary)",
                fontSize: "11px",
                lineHeight: "1.4",
              }}
            >
              You might get a call to confirm your order on this number after 1-2 days of order placement
            </p>
          </div>

          {error && (
            <p className="text-sm" style={{ color: "var(--color-error)" }}>
              {error}
            </p>
          )}

          <button
            onClick={handleSendOTP}
            disabled={phone.length !== 10}
            className="w-full py-3 rounded-lg font-medium transition-all duration-300"
            style={{
              background: "var(--color-primary)",
              color: "white",
              opacity: phone.length !== 10 ? 0.6 : 1,
              cursor: phone.length !== 10 ? "not-allowed" : "pointer",
              border: "none",
            }}
          >
            Continue to Checkout
          </button>
        </div>

        {/* 
        COMMENTED OUT OTP INPUT SECTION (Temporary)
        OTP verification code is commented out and will be restored later.
        Currently, we just validate 10-digit phone number and proceed to checkout.
        
        {showOtpInput && (
          <div className="space-y-4">
            ... OTP input UI code ...
          </div>
        )}
        */}
      </div>
    </div>
  );
}
