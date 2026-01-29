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
import { trackBeginCheckout, trackPurchase } from "../../lib/analytics";

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
  checkout?: {
    config?: {
      config_id?: string;
    };
  };
  // Alternative: direct checkout_config_id parameter
  checkout_config_id?: string;
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
  const [checkoutTracked, setCheckoutTracked] = useState(false);

  // Address states
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Coupon states
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{
    code: string;
    discountAmount: number;
    finalAmount: number;
  } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);
  const [showMoreCoupons, setShowMoreCoupons] = useState(false);

  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");

  // COD charge constant
  const COD_CHARGE = 100;

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
        
        if (!response.ok) {
          console.error("Failed to fetch user profile:", response.status);
          throw new Error(`Failed to fetch profile: ${response.status}`);
        }
        
        const data = await response.json();

        if (data.success && data.user && data.user.phone && data.user.phoneVerified) {
          // Phone is verified in database
          console.log("Phone verified in database:", data.user.phone);
          setUserPhone(data.user.phone);
          setPhoneVerified(true);
          localStorage.setItem("userPhone", data.user.phone);
          localStorage.setItem("phoneVerified", "true");
          await fetchAddresses();
        } else {
          // Phone not verified - show modal
          console.log("Phone not verified. User data:", data.user);
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

  // Track begin checkout when items are available and phone is verified (only once)
  useEffect(() => {
    if (phoneVerified && items.length > 0 && selectedAddress && !checkoutTracked) {
      const checkoutItems = items.map(item => ({
        item_id: item.productId,
        item_name: item.productName,
        item_category: item.productId.includes('hoodie') ? 'Hoodies' : 'T-Shirts',
        price: item.price,
        quantity: item.quantity,
      }));
      
      const finalPrice = couponApplied ? couponApplied.finalAmount : totalPrice;
      trackBeginCheckout(checkoutItems, finalPrice, 'INR');
      setCheckoutTracked(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneVerified, selectedAddress, checkoutTracked]);

  // Fetch available coupons when user is verified and cart is ready
  useEffect(() => {
    if (phoneVerified && user && totalPrice > 0) {
      fetchAvailableCoupons();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneVerified, user, totalPrice]);

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

    // Phone is already saved to backend by PhoneVerificationModal
    // Just update localStorage and refresh user data
    localStorage.setItem("userPhone", phone);
    localStorage.setItem("phoneVerified", "true");

    // Refresh user data from backend to confirm phone is saved
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!response.ok) {
          console.error("Failed to verify phone save:", response.status);
          throw new Error(`Failed to verify: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.user) {
          // Verify the phone was actually saved
          if (data.user.phone === phone && data.user.phoneVerified) {
            console.log("Phone number confirmed saved in database:", data.user.phone);
            // Update with fresh backend data
            setUserPhone(data.user.phone);
            setPhoneVerified(true);
            localStorage.setItem("userPhone", data.user.phone);
            localStorage.setItem("phoneVerified", "true");
          } else {
            console.warn("Phone verification mismatch:", {
              expected: phone,
              received: data.user.phone,
              verified: data.user.phoneVerified
            });
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing user data after phone verification:", error);
    }

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

  const fetchAvailableCoupons = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/api/coupons/available?cartTotal=${totalPrice}`, {
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAvailableCoupons(data.coupons || []);
      }
    } catch (error) {
      console.error("Error fetching available coupons:", error);
    }
  };

  const applyCouponDirectly = async (code: string) => {
    setCouponError("");
    setValidatingCoupon(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          cartTotal: totalPrice,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCouponApplied({
          code: data.coupon.code,
          discountAmount: data.coupon.discountAmount,
          finalAmount: data.coupon.finalAmount,
        });
        setCouponError("");
      } else {
        setCouponError(data.message || "Invalid coupon code");
        setCouponApplied(null);
      }
    } catch (error) {
      setCouponError("Failed to validate coupon. Please try again.");
      setCouponApplied(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    setCouponError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          cartTotal: totalPrice,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCouponApplied({
          code: data.coupon.code,
          discountAmount: data.coupon.discountAmount,
          finalAmount: data.coupon.finalAmount,
        });
        setCouponError("");
      } else {
        setCouponError(data.message || "Invalid coupon code");
        setCouponApplied(null);
      }
    } catch (error) {
      setCouponError("Failed to validate coupon. Please try again.");
      setCouponApplied(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setCouponApplied(null);
    setCouponError("");
  };

  const handleCODOrder = async () => {
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

      // Load Razorpay script for token payment
      const res = await loadRazorpayScript();
      if (!res) {
        alert(
          "Razorpay SDK failed to load. Please check your internet connection."
        );
        setLoading(false);
        return;
      }

      // Create COD token order (₹100) through Razorpay
      const response = await fetch(`${API_BASE_URL}/api/orders/create-cod-token-order`, {
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
          couponCode: couponApplied?.code || null,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error("COD token order creation failed:", data);
        alert(data.message || "Failed to create COD token payment. Please try again.");
        setLoading(false);
        return;
      }

      // Validate response data
      if (!data.order || !data.order.id || !data.key) {
        console.error("Invalid COD token order creation response:", data);
        alert("Invalid response from server. Please try again.");
        setLoading(false);
        return;
      }

      // Get payment configuration ID from backend response or frontend environment
      const paymentConfigId = data.checkout_config_id || import.meta.env.VITE_RAZORPAY_PAYMENT_CONFIG_ID;

      const options: RazorpayOptions = {
        key: data.key,
        amount: data.order.amount, // ₹100 token amount
        currency: data.order.currency,
        name: "KALLKEYY",
        description: "COD Order Token Payment (₹100)",
        order_id: data.order.id,
        // Add payment configuration ID if specified
        ...(paymentConfigId && {
          checkout_config_id: paymentConfigId
        }),
        handler: async function (response: RazorpayResponse) {
          // Verify COD token payment
          const verifyResponse = await fetch(
            `${API_BASE_URL}/api/orders/verify-cod-token-payment`,
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
                shippingAddress: {
                  ...selectedAddress,
                  email: user?.email,
                },
                couponCode: couponApplied?.code || null,
              }),
            }
          );

          const verifyData = await verifyResponse.json();
          
          if (verifyData.success) {
            // Track purchase with Google Analytics for COD token payment
            if (verifyData.order) {
              const purchaseItems = items.map(item => ({
                item_id: item.productId,
                item_name: item.productName,
                item_category: item.productId.includes('hoodie') ? 'Hoodies' : 'T-Shirts',
                price: item.price,
                quantity: item.quantity,
              }));
              
              const finalAmount = couponApplied ? couponApplied.finalAmount : totalPrice;
              trackPurchase({
                transaction_id: verifyData.order.orderId || verifyData.order._id?.toString() || '',
                value: finalAmount,
                currency: 'INR',
                tax: 0,
                shipping: 0,
                items: purchaseItems,
              });
            }
            
            // Payment successful - navigate to order confirmation page
            await clearCart();
            
            // Get order ID from response
            const orderId = verifyData.order?._id?.toString() || verifyData.order?.orderId || verifyData.order?._id || verifyData.orderId || '';
            
            // Use navigation callback if provided, otherwise fallback to window.location
            if (onOrderSuccess) {
              onOrderSuccess(orderId || undefined);
            } else {
              sessionStorage.setItem('allowed_/order-confirmation', 'true');
              if (orderId) {
                window.location.href = `/order-confirmation?orderId=${orderId}`;
              } else {
                window.location.href = "/order-confirmation";
              }
            }
          } else {
            // Payment verification failed
            console.error("COD token payment verification failed:", verifyData);
            const errorMessage = verifyData.message || "Unknown error";
            alert(
              `❌ COD token payment verification failed: ${errorMessage}\n\n` +
              `🔑 Razorpay Payment ID: ${response.razorpay_payment_id}\n` +
              `🔑 Razorpay Order ID: ${response.razorpay_order_id}\n\n` +
              `Please save these IDs and contact support. Your ₹100 token payment may have been processed.`
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
      console.error("COD token payment error:", error);
      alert("Failed to process COD token payment. Please try again.");
      setLoading(false);
    }
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
          couponCode: couponApplied?.code || null,
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

            // Get payment configuration ID from backend response or frontend environment
            // Backend response takes priority (if RAZORPAY_PAYMENT_CONFIG_ID is set in backend .env)
            // Otherwise, fallback to frontend env variable (VITE_RAZORPAY_PAYMENT_CONFIG_ID)
            const paymentConfigId = data.checkout_config_id || import.meta.env.VITE_RAZORPAY_PAYMENT_CONFIG_ID;

            const options: RazorpayOptions = {
              key: data.key,
              amount: data.order.amount,
              currency: data.order.currency,
              name: "KALLKEYY",
              description: "Streetwear Fashion",
              order_id: data.order.id,
              // Add payment configuration ID if specified
              // This applies the custom payment methods (UPI, Cards, Netbanking only)
              // checkout_config_id restricts payment methods to those configured in Razorpay Dashboard
              ...(paymentConfigId && {
                checkout_config_id: paymentConfigId
              }),
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
            // Track purchase with Google Analytics
            if (verifyData.order) {
              const purchaseItems = items.map(item => ({
                item_id: item.productId,
                item_name: item.productName,
                item_category: item.productId.includes('hoodie') ? 'Hoodies' : 'T-Shirts',
                price: item.price,
                quantity: item.quantity,
              }));
              
              const finalAmount = couponApplied ? couponApplied.finalAmount : totalPrice;
              trackPurchase({
                transaction_id: verifyData.order.orderId || verifyData.order._id?.toString() || '',
                value: finalAmount,
                currency: 'INR',
                tax: 0,
                shipping: 0,
                items: purchaseItems,
              });
            }
            
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <Package
          size={64}
          className="text-gray-400 mb-6"
        />
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
        <p className="text-lg text-gray-600 mb-8">
          Add some streetwear to your collection
        </p>
        <button
          onClick={() => (window.location.href = "/shop")}
          className="px-8 py-3 bg-[#b90e0a] hover:bg-[#8a0a08] text-white font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#b90e0a] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900 ${skipAnimations ? '[&_*]:!animate-none' : ''}`}>
      {/* Coupon Code Block */}
      <div className="bg-[#333333] text-white text-center py-1.5 px-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase z-[60] relative">
        Free Shipping on all pan-India orders · Code <span className="text-[#4CAF50]">KALLKEYY100</span> for ₹100 Off on your first order only
      </div>

      {/* Main Content */}
      <div className="pt-8 pb-32 px-4 md:px-8 container mx-auto max-w-6xl">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 mb-8 text-gray-500 hover:text-[#b90e0a] transition-all duration-300 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
          Checkout
        </h1>
        <p className="text-lg text-gray-600 mb-2">
          Complete your order securely
        </p>
        <p className="text-sm text-gray-600 mb-12">
          Ordering as:{" "}
          <strong className="text-[#b90e0a]">
            {user?.email}
          </strong>
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Address Section */}
          <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-300 hover:shadow-2xl space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#b90e0a] to-[#8a0a08] rounded-lg">
                  <Package size={24} className="text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
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
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 bg-[#b90e0a] hover:bg-[#8a0a08] text-white font-medium transform hover:scale-105 hover:shadow-lg"
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
                    <p className="text-gray-600">
                      No saved addresses. Add one to continue.
                    </p>
                  </div>
                ) : (
                  savedAddresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => setSelectedAddress(address)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                        selectedAddress?._id === address._id
                          ? "bg-[#b90e0a]/5 border-[#b90e0a] shadow-lg"
                          : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-md"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <strong className="text-gray-900 font-semibold">
                            {address.fullName}
                          </strong>
                          {address.isDefault && (
                            <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        {selectedAddress?._id === address._id && (
                          <CheckCircle
                            size={20}
                            className="text-[#b90e0a]"
                          />
                        )}
                      </div>
                      <p className="text-gray-700 text-sm mb-1">
                        {address.address}
                      </p>
                      <p className="text-gray-600 text-sm mb-1">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      <p className="text-gray-600 text-sm">
                        Phone: {address.phone}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAddress(address);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 bg-white border border-gray-300 text-gray-700 hover:border-gray-400 hover:shadow-md"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAddress(address._id!);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-all duration-300 bg-red-50 border border-red-300 text-red-600 hover:bg-red-100 hover:border-red-400"
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
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
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
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-[#b90e0a] focus:ring-2 focus:ring-[#b90e0a]/20 transition-all duration-300 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
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
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-[#b90e0a] focus:ring-2 focus:ring-[#b90e0a]/20 transition-all duration-300 outline-none"
                    maxLength={10}
                  />
                  <p className="text-xs mt-2 text-gray-500 leading-snug">
                    You might get a call to confirm your order on this number after 1-2 days of order placement
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <MapPin size={16} className="text-[#b90e0a]" />
                    Pincode *
                    {fetchingPincode && (
                      <span className="text-xs text-[#b90e0a] font-normal">
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
                    className={`w-full px-4 py-3 rounded-lg border-2 ${
                      fetchingPincode ? "border-[#b90e0a]" : "border-gray-300"
                    } bg-white text-gray-900 focus:border-[#b90e0a] focus:ring-2 focus:ring-[#b90e0a]/20 transition-all duration-300 outline-none`}
                    maxLength={6}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, city: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-[#b90e0a] focus:ring-2 focus:ring-[#b90e0a]/20 transition-all duration-300 outline-none"
                      disabled={fetchingPincode}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      State *
                    </label>
                    <select
                      value={newAddress.state}
                      onChange={(e) =>
                        setNewAddress({ ...newAddress, state: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-[#b90e0a] focus:ring-2 focus:ring-[#b90e0a]/20 transition-all duration-300 outline-none cursor-pointer"
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
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Complete Address *
                  </label>
                  <textarea
                    placeholder="House/Flat No., Street, Landmark, etc."
                    value={newAddress.address}
                    onChange={(e) => {
                      const value = e.target.value;
                      const sanitized = value.replace(/[^A-Za-z0-9\s.,-\/]/g, "");
                      setNewAddress({ ...newAddress, address: sanitized });
                    }}
                    onKeyPress={(e) => {
                      if (!/[A-Za-z0-9\s.,-\/]/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 bg-white text-gray-900 focus:border-[#b90e0a] focus:ring-2 focus:ring-[#b90e0a]/20 transition-all duration-300 outline-none min-h-[100px] resize-vertical"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveAddress}
                    className="flex-1 py-3 rounded-lg font-semibold transition-all duration-300 bg-[#b90e0a] hover:bg-[#8a0a08] text-white transform hover:scale-105 hover:shadow-lg"
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
                    className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 bg-gray-200 hover:bg-gray-300 text-gray-700 border-2 border-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xl transition-all duration-300 hover:shadow-2xl h-fit sticky top-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-[#b90e0a] to-[#8a0a08] rounded-lg">
                <CreditCard size={24} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Order Summary
              </h2>
            </div>

            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto border-b border-gray-200 pb-6">
              {items.map((item, index) => (
                <div
                  key={`${item.productId}-${item.size}-${index}`}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    item.inStock === false
                      ? "bg-red-50 border-2 border-red-300"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  {/* Stock Warning Badge */}
                  {item.inStock === false && (
                    <div className="flex items-center gap-2 mb-2 p-2 rounded-lg bg-red-100 border border-red-300">
                      <span className="text-red-600 text-sm font-semibold">
                        ⚠️ {item.reason || 'Out of Stock'}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {item.productName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Size: {item.size} • Qty: {item.quantity}
                      </p>
                      <p className="font-bold text-[#b90e0a] mt-2">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>

                      {/* Save for Later Button */}
                      <button
                        onClick={async () => {
                          await saveForLater(item.productId, item.size);
                          await fetchCart(); // Refresh cart to update stock status
                        }}
                        className="mt-2 text-xs hover:underline flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        <span>📌</span> Save for Later
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Section */}
            <div className="mb-4 py-4 border-b border-gray-200">
              <label className="block mb-2 text-sm font-semibold text-gray-900">
                Coupon Code
              </label>
              {!couponApplied ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        validateCoupon();
                      }
                    }}
                    className={`flex-1 px-4 py-2.5 rounded-lg border-2 ${
                      couponError ? "border-red-300" : "border-gray-300"
                    } bg-white text-gray-900 focus:border-[#b90e0a] focus:ring-2 focus:ring-[#b90e0a]/20 transition-all duration-300 outline-none`}
                  />
                  <button
                    onClick={validateCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 ${
                      validatingCoupon || !couponCode.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-[#b90e0a] hover:bg-[#8a0a08] text-white transform hover:scale-105"
                    }`}
                  >
                    {validatingCoupon ? "Applying..." : "Apply"}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border-2 border-green-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-green-600" />
                    <span className="text-gray-900 font-semibold">
                      {couponApplied.code} applied! Saved ₹{couponApplied.discountAmount.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={removeCoupon}
                    className="text-sm hover:underline text-red-600 font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
              {couponError && (
                <p className="mt-2 text-sm text-red-600 font-medium">
                  {couponError}
                </p>
              )}

              {/* Available Coupons Section */}
              {!couponApplied && availableCoupons.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs mb-2 text-gray-600 font-medium">
                    Available Coupons:
                  </p>
                  <div 
                    className="flex gap-2 overflow-x-auto pb-2"
                    style={{ scrollbarWidth: 'thin' }}
                  >
                    {(showMoreCoupons ? availableCoupons : availableCoupons.slice(0, 3)).map((coupon, index) => (
                      <button
                        key={coupon.code}
                        onClick={() => applyCouponDirectly(coupon.code)}
                        className="flex-shrink-0 px-3 py-2 rounded-lg border-2 transition-all hover:shadow-lg bg-white border-[#b90e0a] hover:bg-[#b90e0a]/5 min-w-fit cursor-pointer transform hover:scale-105"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <span className="font-bold text-sm text-[#b90e0a]">
                            {coupon.code}
                          </span>
                          <span className="text-xs font-semibold text-green-600">
                            {coupon.discountType === 'percentage' 
                              ? `-${coupon.discountValue}%` 
                              : `-₹${coupon.discountValue}`}
                          </span>
                        </div>
                        {coupon.name && (
                          <p className="text-xs truncate max-w-[150px] text-gray-600">
                            {coupon.name}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                  {availableCoupons.length > 3 && (
                    <button
                      onClick={() => setShowMoreCoupons(!showMoreCoupons)}
                      className="mt-2 text-xs font-semibold hover:underline text-[#b90e0a]"
                    >
                      {showMoreCoupons ? "Show Less" : `+${availableCoupons.length - 3} More Coupons`}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="mb-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-semibold">₹{totalPrice.toFixed(2)}</span>
              </div>
              {couponApplied && (
                <div className="flex justify-between items-center">
                  <span className="text-green-600 font-medium">Discount ({couponApplied.code})</span>
                  <span className="text-green-600 font-semibold">
                    -₹{couponApplied.discountAmount.toFixed(2)}
                  </span>
                </div>
              )}
              {paymentMethod === "cod" && (
                <div className="flex justify-between items-center">
                  <span className="text-orange-600 font-medium">COD Charge</span>
                  <span className="text-orange-600 font-semibold">
                    +₹{COD_CHARGE.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mb-4 py-4 border-t-2 border-b-2 border-gray-300">
              <span className="text-xl font-bold text-gray-900">
                Total
              </span>
              <span className="text-xl font-bold text-[#b90e0a]">
                ₹{(
                  (couponApplied ? couponApplied.finalAmount : totalPrice) +
                  (paymentMethod === "cod" ? COD_CHARGE : 0)
                ).toFixed(2)}
              </span>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6 py-4 border-b border-gray-200">
              <label className="block mb-3 text-sm font-semibold text-gray-900">
                Payment Method
              </label>
              <div className="space-y-3">
                {/* Razorpay Option */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    paymentMethod === "razorpay"
                      ? "border-[#b90e0a] bg-[#b90e0a]/5 shadow-lg"
                      : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-md"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={(e) => setPaymentMethod(e.target.value as "razorpay" | "cod")}
                    className="mt-1 w-5 h-5 accent-[#b90e0a]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard size={18} className="text-[#b90e0a]" />
                      <span className="font-semibold text-gray-900">
                        Online Payment (Razorpay)
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      Pay securely with UPI, Cards, or Netbanking
                    </p>
                  </div>
                </label>

                {/* COD Option */}
                <label
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    paymentMethod === "cod"
                      ? "border-[#b90e0a] bg-[#b90e0a]/5 shadow-lg"
                      : "border-gray-300 bg-white hover:border-gray-400 hover:shadow-md"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(e) => setPaymentMethod(e.target.value as "razorpay" | "cod")}
                    className="mt-1 w-5 h-5 accent-[#b90e0a]"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Package size={18} className="text-[#b90e0a]" />
                      <span className="font-semibold text-gray-900">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-bold">
                        +₹{COD_CHARGE}
                      </span>
                    </div>
                    <p className="text-xs text-orange-600 font-medium mb-2">
                      ⚠️ Additional ₹{COD_CHARGE} order confirmation charge applies
                    </p>
                    <p className="text-xs text-red-600 font-medium">
                      Note: Returns are not available for COD orders. Only replacements will be provided.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Button */}
            {paymentMethod === "razorpay" ? (
              <button
                onClick={handlePayment}
                disabled={loading || !selectedAddress}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                  loading || !selectedAddress
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#b90e0a] to-[#8a0a08] hover:from-[#8a0a08] hover:to-[#b90e0a] text-white transform hover:scale-105 shadow-lg hover:shadow-2xl"
                }`}
              >
                <CreditCard size={20} />
                {loading
                  ? "Processing..."
                  : !selectedAddress
                  ? "Select Address"
                  : `Pay ₹${(couponApplied ? couponApplied.finalAmount : totalPrice).toFixed(2)}`}
              </button>
            ) : (
              <button
                onClick={handleCODOrder}
                disabled={loading || !selectedAddress}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                  loading || !selectedAddress
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#b90e0a] to-[#8a0a08] hover:from-[#8a0a08] hover:to-[#b90e0a] text-white transform hover:scale-105 shadow-lg hover:shadow-2xl"
                }`}
              >
                <Package size={20} />
                {loading
                  ? "Placing Order..."
                  : !selectedAddress
                  ? "Select Address"
                  : "Place Order"}
              </button>
            )}

            {(paymentMethod === "razorpay" || paymentMethod === "cod") && (
              <div className="flex items-center justify-center gap-2 mt-4 p-3 rounded-lg bg-green-50 border border-green-300">
                <Lock size={16} className="text-green-600" />
                <span className="text-gray-700 text-sm font-medium">
                  Secure payment powered by Razorpay
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
