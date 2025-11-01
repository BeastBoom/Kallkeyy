import { useState, useEffect } from "react";
import { useCart } from "../../contexts/CartContext";
import { useAuth } from "../../contexts/AuthContext";
import {
  ArrowLeft,
  Package,
  CreditCard,
  Lock,
  MapPin,
  Plus,
  CheckCircle,
  Edit,
  Trash2,
} from "lucide-react";
import PhoneVerificationModal from "../auth/PhoneVerificationModal";
import { API_BASE_URL } from "../../lib/apiConfig";

interface Address {
  _id?: string;
  fullName: string;
  phone: string;
  pincode: string;
  city: string;
  state: string;
  address: string;
  isDefault?: boolean;
}

interface CheckoutPageProps {
  onBackToShop?: () => void;
  skipAnimations?: boolean;
  onOrderSuccess?: (orderId?: string) => void;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  modal: { ondismiss: () => void };
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
}

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const INDIAN_STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export default function CheckoutPage({ onBackToShop, skipAnimations = false, onOrderSuccess }: CheckoutPageProps) {
  const { items, totalPrice, clearCart, saveForLater, fetchCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetchingPincode, setFetchingPincode] = useState(false);
  const [pincodeDebounce, setPincodeDebounce] = useState<NodeJS.Timeout | null>(
    null
  );

  // Phone verification states
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [userPhone, setUserPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Address states
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [newAddress, setNewAddress] = useState<Address>({
    fullName: "",
    phone: "",
    pincode: "",
    city: "",
    state: "",
    address: "",
  });

  // Check phone verification on mount
  useEffect(() => {
    const checkPhoneVerification = async () => {
      // Wait for user to be loaded from AuthContext
      if (!user) {
        return;
      }

      // Check if cart is empty - redirect to shop
      if (items.length === 0) {
        return;
      }

      const savedPhone = localStorage.getItem("userPhone");
      const verified = localStorage.getItem("phoneVerified");

      // Always verify with backend, don't just trust localStorage
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found, redirecting to shop");
          window.location.href = "/shop";
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();

        if (data.success && data.user.phone && data.user.phoneVerified) {
          // Phone is verified in database
          setUserPhone(data.user.phone);
          setPhoneVerified(true);
          localStorage.setItem("userPhone", data.user.phone);
          localStorage.setItem("phoneVerified", "true");
          await fetchAddresses();
        } else {
          // Phone not verified - show modal
          localStorage.removeItem("userPhone");
          localStorage.removeItem("phoneVerified");
          setShowPhoneVerification(true);
        }
      } catch (error) {
        console.error("Error checking phone verification:", error);
        setShowPhoneVerification(true);
      }
    };

    checkPhoneVerification();
  }, [user, items]);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/addresses`, {
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (data.success) {
        setSavedAddresses(data.addresses);
        const defaultAddr = data.addresses.find(
          (addr: Address) => addr.isDefault
        );
        if (defaultAddr) {
          setSelectedAddress(defaultAddr);
        } else if (data.addresses.length > 0) {
          setSelectedAddress(data.addresses[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handlePhoneVerificationComplete = async (phone: string) => {
    setUserPhone(phone);
    setPhoneVerified(true);
    setShowPhoneVerification(false);

    // Clear any cached phone data to force refresh from server
    localStorage.setItem("userPhone", phone);
    localStorage.setItem("phoneVerified", "true");

    await fetchAddresses();
  };

  // Pincode auto-fetch with 2-second delay
  useEffect(() => {
    // Clear any existing timeout
    if (pincodeDebounce) {
      clearTimeout(pincodeDebounce);
      setPincodeDebounce(null);
    }

    // Only fetch if pincode is exactly 6 digits
    if (newAddress.pincode.length === 6) {
      const timeout = setTimeout(() => {
        fetchLocationFromPincode(newAddress.pincode);
      }, 2000);

      setPincodeDebounce(timeout);
    }

    // Cleanup function
    return () => {
      if (pincodeDebounce) {
        clearTimeout(pincodeDebounce);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newAddress.pincode]);

  const fetchLocationFromPincode = async (pincode: string) => {
    setFetchingPincode(true);
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await response.json();

      if (
        data[0].Status === "Success" &&
        data[0].PostOffice &&
        data[0].PostOffice.length > 0
      ) {
        const postOffice = data[0].PostOffice[0];
        setNewAddress((prev) => ({
          ...prev,
          city: postOffice.District || "",
          state: postOffice.State || "",
        }));
      } else {
        alert("Invalid pincode. Please check and try again.");
      }
    } catch (error) {
      console.error("Error fetching pincode details:", error);
      alert("Failed to fetch location details. Please enter manually.");
    } finally {
      setFetchingPincode(false);
    }
  };

  const handleSaveAddress = async () => {
    // Validation
    if (
      !newAddress.fullName ||
      !newAddress.phone ||
      !newAddress.pincode ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.address
    ) {
      alert("Please fill in all address fields");
      return;
    }

    if (newAddress.phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const url = isEditingAddress
        ? `${API_BASE_URL}/api/addresses/${selectedAddress?._id}`
        : `${API_BASE_URL}/api/addresses`;

      const method = isEditingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      });

      const data = await response.json();

      if (data.success) {
        setSavedAddresses(data.addresses);
        const savedAddr = data.addresses[data.addresses.length - 1];
        setSelectedAddress(savedAddr);
        setShowAddressForm(false);
        setIsEditingAddress(false);
        setNewAddress({
          fullName: "",
          phone: userPhone,
          pincode: "",
          city: "",
          state: "",
          address: "",
        });
      } else {
        alert(data.message || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      alert("Failed to save address. Please try again.");
    }
  };

  const handleEditAddress = (address: Address) => {
    setNewAddress(address);
    setSelectedAddress(address);
    setIsEditingAddress(true);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/addresses/${addressId}`, {
        method: "DELETE",
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (data.success) {
        setSavedAddresses(data.addresses);
        if (selectedAddress?._id === addressId) {
          setSelectedAddress(data.addresses[0] || null);
        }
      } else {
        alert(data.message || "Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Failed to delete address. Please try again.");
    }
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please login to continue");
        window.location.href = "/login";
        setLoading(false);
        return;
      }

      // Validate cart stock before proceeding
      const stockValidation = await fetch(`${API_BASE_URL}/api/cart/validate`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const stockData = await stockValidation.json();
      
      if (!stockData.success) {
        alert("Failed to validate cart items. Please try again.");
        setLoading(false);
        return;
      }

      if (!stockData.allItemsAvailable) {
        const outOfStockItems = stockData.itemsWithStock
          .filter((item: any) => !item.inStock)
          .map((item: any) => `• ${item.productName} (Size ${item.size}) - ${item.reason}`)
          .join('\n');
        
        alert(
          `⚠️ Some items in your cart are out of stock:\n\n${outOfStockItems}\n\nPlease remove out-of-stock items or move them to "Save for Later" before proceeding.`
        );
        
        setLoading(false);
        return;
      }

      const res = await loadRazorpayScript();
      if (!res) {
        alert(
          "Razorpay SDK failed to load. Please check your internet connection."
        );
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/payment/create-order`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: {
            ...selectedAddress,
            email: user?.email,
          },
        }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error("Order creation failed:", data);
        alert(data.message || "Failed to create order. Please try again.");
        setLoading(false);
        return;
      }

      // Validate response data
      if (!data.order || !data.order.id || !data.key) {
        console.error("Invalid order creation response:", data);
        alert("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }

      const options: RazorpayOptions = {
        key: data.key,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "KALLKEYY",
        description: "Streetwear Fashion",
        order_id: data.order.id,
        handler: async function (response: RazorpayResponse) {
          // Retry verification with exponential backoff for network resilience
          let verifyData;
          let lastError;
          const maxRetries = 3;
          
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              const verifyResponse = await fetch(
                `${API_BASE_URL}/api/payment/verify-payment`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                }
              );

              verifyData = await verifyResponse.json();
              
              // If successful, break out of retry loop
              if (verifyData.success) {
                break;
              }
              
              // If not successful and it's not a retry-able error, break
              if (verifyResponse.status === 400 || verifyResponse.status === 403) {
                break;
              }
              
              // If it's a 500 error, retry
              lastError = verifyData;
              if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
                console.log(`⚠️ Verification attempt ${attempt} failed, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
              }
            } catch (error) {
              lastError = error;
              if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`⚠️ Network error on attempt ${attempt}, retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
              }
            }
          }

          // Handle final result
          if (verifyData?.success) {
            // Payment successful - navigate to order confirmation page
            await clearCart();
            
            // Get order ID from response (use order._id, orderId, or order.orderId field)
            // Backend returns order object with _id (MongoDB ObjectId) and orderId (receipt string)
            const orderId = verifyData.order?._id?.toString() || verifyData.order?.orderId || verifyData.order?._id || verifyData.orderId || '';
            
            // Use navigation callback if provided, otherwise fallback to window.location
            if (onOrderSuccess) {
              onOrderSuccess(orderId || undefined);
            } else {
              // Fallback: Navigate using window.location (shouldn't happen but keeping as safety)
              sessionStorage.setItem('allowed_/order-confirmation', 'true');
              if (orderId) {
                window.location.href = `/order-confirmation?orderId=${orderId}`;
              } else {
                window.location.href = "/order-confirmation";
              }
            }
          } else {
            // Payment verification failed after all retries
            console.error("Payment verification failed after retries:", verifyData || lastError);
            const errorMessage = verifyData?.message || lastError?.message || "Unknown error";
            alert(
              `❌ Payment verification failed: ${errorMessage}\n\n` +
              `🔑 Razorpay Payment ID: ${response.razorpay_payment_id}\n` +
              `🔑 Razorpay Order ID: ${response.razorpay_order_id}\n\n` +
              `Please save these IDs and contact support. Your payment may have been processed - do not retry payment.`
            );
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            // Don't show alert on modal dismiss - user might close intentionally
          },
        },
        prefill: {
          name: selectedAddress.fullName,
          email: user?.email || "",
          contact: selectedAddress.phone,
        },
        theme: {
          color: "#b90e0a", // KALLKEYY brand color
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{
          background: "var(--color-background)",
          color: "var(--color-text)",
        }}
      >
        <Package
          size={64}
          style={{ color: "var(--color-text-secondary)", marginBottom: "24px" }}
        />
        <h2 className="text-hero mb-4">Your Cart is Empty</h2>
        <p
          className="text-body mb-8"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Add some streetwear to your collection
        </p>
        <button
          onClick={() => (window.location.href = "/shop")}
          className="street-button"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (showPhoneVerification && user) {
    return (
      <PhoneVerificationModal
        onVerificationComplete={handlePhoneVerificationComplete}
      />
    );
  }

  // Show loading state while checking authentication
  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "var(--color-background)",
          color: "var(--color-text)",
        }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b90e0a] mx-auto mb-4"></div>
          <p style={{ color: "var(--color-text-secondary)" }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-8 px-4 md:px-8 ${skipAnimations ? '[&_*]:!animate-none' : ''}`}
      style={{
        background: "var(--color-background)",
        color: "var(--color-text)",
      }}
    >
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 mb-8 transition-all duration-300 hover:gap-3"
          style={{
            color: "var(--color-text-secondary)",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            fontSize: "var(--font-size-base)",
          }}
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <h1
          className="text-display mb-2"
          style={{ color: "var(--color-text)" }}
        >
          Checkout
        </h1>
        <p
          className="text-body mb-2"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Complete your order securely
        </p>
        <p
          className="text-sm mb-12"
          style={{ color: "var(--color-text-secondary)" }}
        >
          Ordering as:{" "}
          <strong style={{ color: "var(--color-primary)" }}>
            {user?.email}
          </strong>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Address Section */}
          <div className="card-street space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Package size={24} style={{ color: "var(--color-primary)" }} />
                <h2
                  className="text-heading"
                  style={{ color: "var(--color-text)" }}
                >
                  Delivery Address
                </h2>
              </div>
              {!showAddressForm && (
                <button
                  onClick={() => {
                    setNewAddress({
                      fullName: "",
                      phone: userPhone,
                      pincode: "",
                      city: "",
                      state: "",
                      address: "",
                    });
                    setIsEditingAddress(false);
                    setShowAddressForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded transition-all"
                  style={{
                    background: "var(--color-primary)",
                    color: "white",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  <Plus size={16} />
                  Add New
                </button>
              )}
            </div>

            {!showAddressForm ? (
              <div className="space-y-4">
                {savedAddresses.length === 0 ? (
                  <div className="text-center py-8">
                    <p style={{ color: "var(--color-text-secondary)" }}>
                      No saved addresses. Add one to continue.
                    </p>
                  </div>
                ) : (
                  savedAddresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => setSelectedAddress(address)}
                      className="p-4 rounded cursor-pointer transition-all"
                      style={{
                        background:
                          selectedAddress?._id === address._id
                            ? "var(--color-primary-light)"
                            : "var(--color-secondary)",
                        border: `2px solid ${
                          selectedAddress?._id === address._id
                            ? "var(--color-primary)"
                            : "var(--color-border)"
                        }`,
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <strong style={{ color: "var(--color-text)" }}>
                            {address.fullName}
                          </strong>
                          {address.isDefault && (
                            <span
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                background: "var(--color-success)",
                                color: "white",
                              }}
                            >
                              Default
                            </span>
                          )}
                        </div>
                        {selectedAddress?._id === address._id && (
                          <CheckCircle
                            size={20}
                            style={{ color: "var(--color-primary)" }}
                          />
                        )}
                      </div>
                      <p
                        style={{
                          color: "var(--color-text)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        {address.address}
                      </p>
                      <p
                        style={{
                          color: "var(--color-text-secondary)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p
                        style={{
                          color: "var(--color-text-secondary)",
                          fontSize: "var(--font-size-sm)",
                        }}
                      >
                        Phone: {address.phone}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(address);
                          }}
                          className="flex items-center gap-1 px-3 py-1 rounded text-sm transition-all"
                          style={{
                            background: "var(--color-secondary)",
                            color: "var(--color-text)",
                            border: "1px solid var(--color-border)",
                            cursor: "pointer",
                          }}
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAddress(address._id!);
                          }}
                          className="flex items-center gap-1 px-3 py-1 rounded text-sm transition-all"
                          style={{
                            background: "rgba(var(--color-error-rgb), 0.1)",
                            color: "var(--color-error)",
                            border: "1px solid var(--color-error)",
                            cursor: "pointer",
                          }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label
                    className="form-label"
                    style={{ color: "var(--color-text)" }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    value={newAddress.fullName}
                    onChange={(e) => {
                      const value = e.target.value;
                      const sanitized = value.replace(/[^A-Za-z\s.]/g, "");
                      setNewAddress({ ...newAddress, fullName: sanitized });
                    }}
                    onKeyPress={(e) => {
                      if (!/[A-Za-z\s.]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    required
                    className="form-control"
                    style={{
                      background: "var(--color-surface)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-border)",
                      width: "100%",
                      padding: "var(--space-12)",
                      borderRadius: "var(--radius-base)",
                    }}
                  />
                </div>

                <div>
                  <label
                    className="form-label"
                    style={{ color: "var(--color-text)" }}
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="10-digit number"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
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

                <div>
                  <label
                    className="form-label flex items-center gap-2"
                    style={{ color: "var(--color-text)" }}
                  >
                    <MapPin size={16} />
                    Pincode *
                    {fetchingPincode && (
                      <span
                        className="text-xs"
                        style={{ color: "var(--color-primary)" }}
                      >
                        Fetching location...
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="6-digit pincode"
                    value={newAddress.pincode}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                      })
                    }
                    className="form-control"
                    style={{
                      background: "var(--color-surface)",
                      color: "var(--color-text)",
                      border: `2px solid ${
                        fetchingPincode
                          ? "var(--color-primary)"
                          : "var(--color-border)"
                      }`,
                      width: "100%",
                      padding: "var(--space-12)",
                      borderRadius: "var(--radius-base)",
                    }}
                    maxLength={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      className="form-label"
                      style={{ color: "var(--color-text)" }}
                    >
                      City *
                    </label>
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="form-control"
                      style={{
                        background: "var(--color-surface)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-border)",
                        width: "100%",
                        padding: "var(--space-12)",
                        borderRadius: "var(--radius-base)",
                      }}
                      disabled={fetchingPincode}
                    />
                  </div>

                  <div>
                    <label
                      className="form-label"
                      style={{ color: "var(--color-text)" }}
                    >
                      State *
                    </label>
                    <select
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      className="form-control"
                      style={{
                        background: "var(--color-surface)",
                        color: "var(--color-text)",
                        border: "1px solid var(--color-border)",
                        width: "100%",
                        padding: "var(--space-12)",
                        borderRadius: "var(--radius-base)",
                        cursor: "pointer",
                      }}
                      disabled={fetchingPincode}
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    className="form-label"
                    style={{ color: "var(--color-text)" }}
                  >
                    Complete Address *
                  </label>
                  <textarea
                    placeholder="House/Flat No., Street, Landmark, etc."
                    value={newAddress.address}
                    onChange={(e) => {
                      const value = e.target.value;
                      const sanitized = value.replace(/[^A-Za-z0-9\s.,-]/g, "");
                      setNewAddress({ ...newAddress, address: sanitized });
                    }}
                    onKeyPress={(e) => {
                      if (!/[A-Za-z0-9\s.,-]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    required
                    className="form-control"
                    style={{
                      background: "var(--color-surface)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-border)",
                      minHeight: "100px",
                      width: "100%",
                      padding: "var(--space-12)",
                      borderRadius: "var(--radius-base)",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAddress}
                    className="flex-1 py-3 rounded-lg font-medium transition-all"
                    style={{
                      background: "var(--color-primary)",
                      color: "white",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {isEditingAddress ? "Update Address" : "Save Address"}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddressForm(false);
                      setIsEditingAddress(false);
                      setNewAddress({
                        fullName: "",
                        phone: userPhone,
                        pincode: "",
                        city: "",
                        state: "",
                        address: "",
                      });
                    }}
                    className="px-6 py-3 rounded-lg font-medium transition-all"
                    style={{
                      background: "var(--color-secondary)",
                      color: "var(--color-text)",
                      border: "1px solid var(--color-border)",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="card-street h-fit sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard size={24} style={{ color: "var(--color-primary)" }} />
              <h2
                className="text-heading"
                style={{ color: "var(--color-text)" }}
              >
                Order Summary
              </h2>
            </div>

            <div
              className="space-y-4 mb-6 max-h-96 overflow-y-auto"
              style={{
                borderBottom: "1px solid var(--color-border)",
                paddingBottom: "var(--space-16)",
              }}
            >
              {items.map((item, index) => (
                <div
                  key={`${item.productId}-${item.size}-${index}`}
                  className="p-3 rounded"
                  style={{
                    background: "var(--color-secondary)",
                    border: item.inStock === false ? "2px solid #ef4444" : "1px solid var(--color-card-border)",
                  }}
                >
                  {/* Stock Warning Badge */}
                  {item.inStock === false && (
                    <div 
                      className="flex items-center gap-2 mb-2 p-2 rounded"
                      style={{
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)"
                      }}
                    >
                      <span style={{ color: "#ef4444", fontSize: "0.875rem", fontWeight: 600 }}>
                        ⚠️ {item.reason || 'Out of Stock'}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded"
                        style={{ border: "1px solid var(--color-border)" }}
                      />
                    )}
                    <div className="flex-1">
                      <h3
                        className="font-medium mb-1"
                        style={{
                          color: "var(--color-text)",
                          fontSize: "var(--font-size-base)",
                        }}
                      >
                        {item.productName}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                      <p
                        className="font-semibold mt-2"
                        style={{
                          color: "var(--color-primary)",
                          fontSize: "var(--font-size-base)",
                        }}
                      >
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>

                      {/* Save for Later Button */}
                      <button
                        onClick={async () => {
                          await saveForLater(item.productId, item.size);
                          await fetchCart(); // Refresh cart to update stock status
                        }}
                        className="mt-2 text-xs hover:underline flex items-center gap-1"
                        style={{ color: "#3b82f6" }}
                      >
                        <span>📌</span> Save for Later
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div
              className="flex justify-between items-center mb-6 py-4"
              style={{ borderBottom: "1px solid var(--color-border)" }}
            >
              <span
                className="text-heading"
                style={{ color: "var(--color-text)" }}
              >
                Total
              </span>
              <span
                className="text-heading"
                style={{
                  color: "var(--color-primary)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                ₹{totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || !selectedAddress}
              className="w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300"
              style={{
                background: "var(--color-error)",
                color: "white",
                opacity: loading || !selectedAddress ? 0.6 : 1,
                cursor: loading || !selectedAddress ? "not-allowed" : "pointer",
                border: "none",
                boxShadow: "var(--shadow-md)",
              }}
              onMouseEnter={(e) => {
                if (!loading && selectedAddress) {
                  e.currentTarget.style.background = "var(--color-red-500)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--color-error)";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
            >
              <CreditCard size={20} />
              {loading
                ? "Processing..."
                : !selectedAddress
                ? "Select Address"
                : `Pay ₹${totalPrice.toFixed(2)}`}
            </button>

            <div
              className="flex items-center justify-center gap-2 mt-4 p-3 rounded"
              style={{
                background: "var(--color-secondary)",
                border: "1px solid var(--color-border)",
              }}
            >
              <Lock size={16} style={{ color: "var(--color-success)" }} />
              <span
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: "var(--font-size-sm)",
                }}
              >
                Secure payment powered by Razorpay
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
