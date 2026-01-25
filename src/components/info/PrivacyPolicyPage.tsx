"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, LogOut } from "lucide-react";

interface Props {
  onBackToMain: () => void;
  onNavigateToShop?: () => void;
  onNavigateToAbout?: () => void;
  onNavigateToContact?: () => void;
  onNavigateToLogin?: () => void;
  onNavigateToSignup?: () => void;
  onNavigateToOrders?: () => void;
  skipAnimations?: boolean;
}

const formatDisplayName = (fullName: string): string => {
  if (!fullName) return "";
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0];
  if (firstName.length <= 10) {
    return firstName.toUpperCase();
  }
  const initials = nameParts
    .slice(0, 3)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return initials;
};

const handleUnavailablePage = (page: string) => {
  console.log(`${page} page is not available yet`);
};

export default function PrivacyPolicyPage({ 
  onBackToMain, 
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToLogin,
  onNavigateToSignup,
  onNavigateToOrders,
  skipAnimations = false 
}: Props) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get current route to determine active nav item
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isHomeActive = currentPath === '/';
  const isShopActive = currentPath === '/shop' || currentPath.startsWith('/product/');

  return (
    <div className={`min-h-screen bg-gradient-to-b from-[#f8f8f8] via-[#f0f0f0] to-[#e8e8e8] ${skipAnimations ? '[&_*]:!animate-none' : ''}`}>
      {/* Announcement Bar */}
      <div className="bg-[#333333] text-white text-center py-1.5 px-4 text-[10px] sm:text-xs font-bold tracking-widest uppercase z-[60] relative">
        Free Shipping on all pan-India orders · Code <span className="text-[#4CAF50]">KALLKEYY10</span> for 10% Off
      </div>
      <nav className="sticky top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-md text-white">
        <div className="w-full px-5 sm:px-8 lg:px-24 py-3 lg:py-4">
          <div className="flex items-center justify-between max-w-[1600px] mx-auto relative">
            {/* LEFT: Text Logo (Responsive sizing) */}
            <div className="flex-shrink-0 z-10">
              <h1
                className="text-xl sm:text-2xl lg:text-3xl font-black tracking-wider hover:text-[#b90e0a] transition-colors duration-300 cursor-pointer font-akira"
                onClick={onBackToMain}
              >
                KALLKEYY
              </h1>
            </div>

            {/* CENTER: Brand Logo Image (Hidden on mobile/tablet, visible on large desktop only to prevent overlap) */}
            <div className="hidden xl:block absolute left-1/2 transform -translate-x-1/2 z-10">
              <img
                src="/navbar-logo.png"
                alt="KALLKEYY Logo"
                onClick={onBackToMain}
                className="h-10 w-auto sm:h-12 lg:h-14 object-contain opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
              />
            </div>

            {/* RIGHT: Navigation + Auth */}
            <div className="flex items-center z-10">
              {/* Desktop Navigation Links */}
              <div className="hidden lg:flex gap-0.5 text-sm font-bold">
                <button
                  onClick={() => onBackToMain()}
                  className={isHomeActive 
                    ? "text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 bg-white/5 rounded-lg whitespace-nowrap"
                    : "hover:text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                  }
                >
                  HOME
                </button>
                <button
                  onClick={() =>
                    onNavigateToShop
                      ? onNavigateToShop()
                      : handleUnavailablePage("Shop")
                  }
                  className={isShopActive
                    ? "text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 bg-white/5 rounded-lg whitespace-nowrap"
                    : "hover:text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                  }
                >
                  SHOP
                </button>
                {user && (
                  <button
                    onClick={() =>
                      onNavigateToOrders
                        ? onNavigateToOrders()
                        : handleUnavailablePage("Orders")
                    }
                    className="hover:text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                  >
                    ORDERS
                  </button>
                )}
                <button
                  onClick={() =>
                    onNavigateToAbout
                      ? onNavigateToAbout()
                      : handleUnavailablePage("About")
                  }
                  className="hover:text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  ABOUT
                </button>
                <button
                  onClick={() =>
                    onNavigateToContact
                      ? onNavigateToContact()
                      : handleUnavailablePage("Contact")
                  }
                  className="hover:text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  CONTACT
                </button>

                {/* AUTH BUTTONS - Desktop */}
                {user ? (
                  <>
                    <span className="text-white px-1 lg:px-2 py-2 flex items-center text-xs whitespace-nowrap">
                      HEY,{" "}
                      <span className="text-[#b90e0a] ml-1">
                        {formatDisplayName(user.name)}
                      </span>
                    </span>
                    <button
                      onClick={logout}
                      className="hover:text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 hover:bg-white/5 rounded-lg flex items-center gap-1 whitespace-nowrap"
                    >
                      <LogOut size={14} className="lg:w-4 lg:h-4" />
                      <span className="text-xs">LOGOUT</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigateToLogin ? onNavigateToLogin() : handleUnavailablePage("Login")}
                      className="hover:text-[#b90e0a] transition-colors duration-300 px-1 lg:px-2 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap text-xs"
                    >
                      LOGIN
                    </button>
                    <button
                      onClick={() => onNavigateToSignup ? onNavigateToSignup() : handleUnavailablePage("Signup")}
                      className="bg-[#b90e0a] hover:bg-[#b90e0a]/80 transition-colors duration-300 px-2 lg:px-3 py-2 rounded-lg ml-1 whitespace-nowrap text-xs"
                    >
                      SIGN UP
                    </button>
                  </>
                )}
              </div>

              {/* Hamburger Menu Button (Mobile/Tablet) */}
              <button
                className="lg:hidden text-white hover:text-[#b90e0a] transition-colors p-2 -mr-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X size={24} className="sm:w-7 sm:h-7" />
                ) : (
                  <Menu size={24} className="sm:w-7 sm:h-7" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu (Animated) */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 space-y-2 border-t border-white/10 pt-4 animate-fadeIn">
              <button
                onClick={() => {
                  onBackToMain();
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left hover:text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
              >
                HOME
              </button>
              <button
                onClick={() => {
                  if (onNavigateToShop) {
                    onNavigateToShop();
                  } else {
                    handleUnavailablePage("Shop");
                  }
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left hover:text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
              >
                SHOP
              </button>
              {user && (
                <button
                  onClick={() => {
                    if (onNavigateToOrders) {
                      onNavigateToOrders();
                    } else {
                      handleUnavailablePage("Orders");
                    }
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left hover:text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
                >
                  ORDERS
                </button>
              )}
              <button
                onClick={() => {
                  if (onNavigateToAbout) {
                    onNavigateToAbout();
                  } else {
                    handleUnavailablePage("About");
                  }
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left hover:text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
              >
                ABOUT
              </button>
              <button
                onClick={() => {
                  if (onNavigateToContact) {
                    onNavigateToContact();
                  } else {
                    handleUnavailablePage("Contact");
                  }
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left hover:text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
              >
                CONTACT
              </button>

              {/* AUTH SECTION - Mobile */}
              <div className="border-t border-white/10 pt-3 mt-3">
                {user ? (
                  <>
                    <div className="text-white px-4 py-2 mb-2 text-sm">
                      HEY,{" "}
                      <span className="text-[#b90e0a]">
                        {formatDisplayName(user.name)}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left hover:text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg flex items-center gap-2 text-base font-semibold"
                    >
                      <LogOut size={18} />
                      LOGOUT
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        if (onNavigateToLogin) {
                          onNavigateToLogin();
                        } else {
                          handleUnavailablePage("Login");
                        }
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left hover:text-[#b90e0a] transition-colors duration-300 px-4 py-2.5 hover:bg-white/5 rounded-lg text-base font-semibold"
                    >
                      LOGIN
                    </button>
                    <button
                      onClick={() => {
                        if (onNavigateToSignup) {
                          onNavigateToSignup();
                        } else {
                          handleUnavailablePage("Signup");
                        }
                        setMobileMenuOpen(false);
                      }}
                      className="w-full bg-[#b90e0a] hover:bg-[#b90e0a]/80 transition-colors duration-300 px-4 py-2.5 rounded-lg text-center mt-2 text-base font-semibold"
                    >
                      SIGN UP
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <button onClick={onBackToMain} className="hover:text-[#b90e0a] transition-colors">Home</button>
          <span>/</span>
          <span className="text-[#b90e0a] font-medium">Privacy Policy</span>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-10 shadow-sm border border-black/5 text-[#333]">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-5xl font-black mb-4 text-[#0a0a0a] font-akira">KALLKEYY <span className="text-[#b90e0a]">PRIVACY POLICY</span></h1>
            <div className="space-y-2 mb-8">
              <p><strong>Effective Date:</strong> November 1, 2025</p>
              <p><strong>Last Updated:</strong> October 31, 2025</p>
              <p><strong>Jurisdiction:</strong> Dwarka, New Delhi, India</p>
            </div>
          </div>

          {/* Section */}
          <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">1. INTRODUCTION</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            1.1 Purpose and Scope
          </h3>
          <p className="mb-4">This Privacy Policy ("<strong>Policy</strong>") governs the collection, processing, storage, use, disclosure, transfer, and protection of personal information and data collected by KALLKEYY ("<strong>KALLKEYY</strong>," "<strong>we</strong>," "<strong>our</strong>," "<strong>us</strong>," or the "<strong>Company</strong>") from individuals ("<strong>User</strong>," "<strong>you</strong>," "<strong>your</strong>," "<strong>data subject</strong>," or "<strong>data principal</strong>") who access, visit, or use:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>The website located at <strong>www.kallkeyy.com</strong> and all associated subdomains</li>
            <li>Any digital applications, mobile applications, or platforms operated or maintained by KALLKEYY</li>
            <li>Related online services, offline services, and business processes</li>
            <li>Any technology, tools, or systems integrated with the aforementioned services</li>
          </ul>
          <p className="mb-4">Collectively, these are referred to as the "<strong>Platform</strong>," "<strong>Website</strong>," "<strong>Services</strong>," or "<strong>System</strong>."</p>
          <p className="mb-4">This Policy is binding upon all individuals who interact with KALLKEYY in any capacity, including customers, prospective customers, newsletter subscribers, and website visitors.</p>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            1.2 Commitment to Data Protection and Privacy
          </h3>
          <p className="mb-4">KALLKEYY is deeply committed to protecting the <strong>fundamental right to privacy</strong> of all individuals and recognizes the critical importance of safeguarding personal data. We are committed to maintaining the highest standards of data security, transparency, and compliance in accordance with applicable international and domestic data protection frameworks, including:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>The Information Technology Act, 2000</strong> (IT Act) and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong> (SPDI Rules)</li>
            <li><strong>The Digital Personal Data Protection Act, 2023</strong> (DPDP Act) — as and when brought into force by the Government of India</li>
            <li><strong>The General Data Protection Regulation (EU) 2016/679</strong> (GDPR) and its implementing directives, including the ePrivacy Directive</li>
            <li><strong>The California Consumer Privacy Act (CCPA)</strong> and the <strong>California Privacy Rights Act (CPRA)</strong></li>
            <li><strong>Any other applicable data protection, privacy, or consumer protection laws</strong> in jurisdictions where KALLKEYY operates or where users reside</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            1.3 Principles of Data Processing
          </h3>
          <p className="mb-4">KALLKEYY adheres to the following <strong>core principles</strong> in all data processing activities:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Lawfulness and Fairness:</strong> All processing is conducted lawfully, fairly, and transparently</li>
            <li><strong>Purpose Limitation:</strong> Data is collected and processed only for specified, explicit, and legitimate purposes</li>
            <li><strong>Data Minimization:</strong> Only adequate, relevant, and necessary data is collected and processed</li>
            <li><strong>Accuracy:</strong> Personal data is accurate, kept up to date, and measures are in place to erase or rectify inaccurate data</li>
            <li><strong>Storage Limitation:</strong> Data is retained only for as long as necessary for its intended purpose or as required by law</li>
            <li><strong>Integrity and Confidentiality:</strong> Appropriate security measures protect data against unauthorized access, processing, alteration, or destruction</li>
            <li><strong>Accountability:</strong> KALLKEYY maintains comprehensive records and documentation demonstrating compliance with all applicable regulations</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            1.4 Consent and Acknowledgment
          </h3>
          <p className="mb-4"><strong>By accessing, browsing, or using the Platform in any manner, you explicitly consent to:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>The collection, processing, and use of your personal information as described in this Policy</li>
            <li>The sharing of your data with third-party service providers as outlined herein</li>
            <li>The placement of cookies and similar tracking technologies</li>
            <li>The transfer of your data across jurisdictions where necessary for service provision</li>
            <li>All data processing activities conducted by KALLKEYY and its authorized partners</li>
          </ul>
          <p className="mb-4"><strong>If you do not agree with any provision of this Policy, you must immediately discontinue use of the Platform and refrain from submitting any personal information.</strong></p>
          <p className="mb-4">Your continued use of the Platform following the publication of amendments to this Policy constitutes acceptance of the modified terms.</p>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">2. DEFINITIONS AND KEY TERMS</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            2.1 Personal Information
          </h3>
          <p className="mb-4">"<strong>Personal Information</strong>" means any data or information that directly or indirectly identifies an individual or makes an individual identifiable, including but not limited to:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Full name, first name, middle name, surname, alias, or nickname</li>
            <li>Contact information (email address, telephone number, mobile number, messaging handles)</li>
            <li>Residential, mailing, or billing address</li>
            <li>Date of birth, age, gender, or other demographic information</li>
            <li>Government-issued identification numbers (if applicable)</li>
            <li>Financial information (bank account details, credit/debit card information, UPI identifiers, payment history)</li>
            <li>Transaction history and purchase records</li>
            <li>Account credentials and passwords</li>
            <li>Digital identifiers (IP address, device ID, cookie identifiers, mobile advertising IDs, IDFA)</li>
            <li>Biometric data (if collected)</li>
            <li>Location data and geolocation information</li>
            <li>Communication records and correspondence</li>
            <li>Any other information that can be reasonably associated with an identifiable person</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            2.2 Sensitive Personal Data or Information (SPDI)
          </h3>
          <p className="mb-4">"<strong>Sensitive Personal Data or Information (SPDI)</strong>" refers to a subset of personal data that requires heightened protection and includes:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Financial account information (bank accounts, credit cards, debit cards, digital wallets, cryptocurrency addresses)</li>
            <li>Passwords and security credentials</li>
            <li>Biometric information and biometric templates</li>
            <li>Health and medical records</li>
            <li>Genetic or DNA information</li>
            <li>Caste, religion, political affiliation, or other sensitive categorical information</li>
            <li>Sexual orientation or gender identity information</li>
            <li>Criminal history or legal proceedings</li>
            <li>Information explicitly designated as sensitive under applicable laws</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            2.3 Non-Personal Information (Anonymized and Aggregated Data)
          </h3>
          <p className="mb-4">"<strong>Non-Personal Information</strong>" or "<strong>Anonymized Data</strong>" means information that does not directly or indirectly identify an individual and cannot be used to trace, identify, or contact a specific person, including:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Device type, model, manufacturer, and operating system</li>
            <li>Browser type, version, and configuration</li>
            <li>Anonymized usage statistics and aggregated analytics data</li>
            <li>Statistical information about visitor behavior patterns</li>
            <li>Aggregated purchase trends and preferences</li>
            <li>Technology platform information</li>
            <li>Aggregated demographic information (not linked to individuals)</li>
            <li>Any information that has been irreversibly anonymized or de-identified according to applicable legal standards</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            2.4 Data Processing and Processing Activities
          </h3>
          <p className="mb-4">"<strong>Processing</strong>" or "<strong>Data Processing</strong>" means any operation, manual or automated, performed upon data, including:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Collection, reception, or recording of data</li>
            <li>Organization, structuring, or storage of data</li>
            <li>Retrieval and consultation of data</li>
            <li>Use, disclosure, transmission, or dissemination of data</li>
            <li>Alignment, combination, or aggregation of data</li>
            <li>Restriction, erasure, or destruction of data</li>
            <li>Any other manipulation or handling of data</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            2.5 Data Controller, Data Processor, and Data Fiduciary
          </h3>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Data Controller/Data Fiduciary:</strong> KALLKEYY acts as the primary entity responsible for determining the purposes and means of data processing</li>
            <li><strong>Data Processor:</strong> Third-party vendors, service providers, or intermediaries who process data on behalf of KALLKEYY under contractual obligations</li>
            <li><strong>Data Subject/Data Principal:</strong> The individual to whom personal data relates</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            2.6 Third Parties and Service Partners
          </h3>
          <p className="mb-4">"<strong>Third Parties</strong>" or "<strong>Service Partners</strong>" refers to external individuals, organizations, or entities with whom KALLKEYY shares data or engages to provide services, including:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Payment processing providers (currently: <strong>Razorpay</strong>)</li>
            <li>Shipping, logistics, and fulfillment providers (currently: <strong>Shiprocket</strong> and similar partners)</li>
            <li>Analytics and marketing platforms (including <strong>Google Analytics</strong>, <strong>Meta (Facebook) Ads</strong>, <strong>Google Ads</strong>, and similar services)</li>
            <li>Cloud hosting and data storage providers (currently: <strong>Amazon Web Services (AWS)</strong>)</li>
            <li>Customer relationship management (CRM) systems and platforms</li>
            <li>Email service providers and communication platforms</li>
            <li>Marketing automation and customer engagement platforms</li>
            <li>Law enforcement, regulatory authorities, and government agencies</li>
            <li>Legal advisors, auditors, and compliance consultants</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            2.7 Applicable Law and Jurisdictions
          </h3>
          <p className="mb-4">"<strong>Applicable Law</strong>" refers to all laws, regulations, directives, guidelines, and legal instruments governing data protection, privacy, consumer protection, and information technology, including:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Indian domestic laws (IT Act 2000, SPDI Rules 2011, DPDP Act 2023, Consumer Protection Act 2019, E-commerce Rules 2020)</li>
            <li>European Union regulations (GDPR, ePrivacy Directive, EDPB Guidelines)</li>
            <li>United States regulations (CCPA, CPRA, state-specific privacy laws, FTC regulations)</li>
            <li>International standards and best practices (ISO 27001, ISO 27701)</li>
            <li>Any other applicable privacy or data protection regulations in jurisdictions where KALLKEYY operates</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">3. TECHNOLOGY STACK AND INFRASTRUCTURE</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            3.1 Technical Architecture Overview
          </h3>
          <p className="mb-4">KALLKEYY's Platform is built using the following technology stack:</p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li><strong>Frontend:</strong> React.js - Used for user interface and client-side rendering. Handles device fingerprint, local storage, and session data.</li>
            <li><strong>Backend:</strong> Node.js + Express.js - Provides server-side logic and API management. Processes all request/response data.</li>
            <li><strong>Database:</strong> MongoDB Atlas - Manages data persistence and storage. Stores all personal and transaction data.</li>
            <li><strong>Hosting:</strong> Vercel - Handles frontend and backend deployment. Manages application and data transit.</li>
            <li><strong>Domain:</strong> Hostinger - Provides domain registration and management services. Handles domain WHOIS data.</li>
            <li><strong>Payment Gateway:</strong> Razorpay - Processes payments and transactions. Handles payment card data and transaction records.</li>
            <li><strong>Shipping/Logistics:</strong> Shiprocket - Manages order fulfillment and delivery. Processes shipping address, order details, and tracking information.</li>
            <li><strong>SMS/OTP:</strong> MSG91 - Provides authentication and notifications via SMS. Handles phone number, OTP, and SMS content.</li>
            <li><strong>Email:</strong> Nodemailer - Delivers transactional emails. Processes email addresses and email content.</li>
            <li><strong>Authentication:</strong> Google OAuth - Enables user login and identity verification. Handles Google account identifier and email.</li>
            <li><strong>Analytics:</strong> Google Analytics - Analyzes website traffic and user behavior. Tracks user behavior, page views, and events.</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            3.2 Data Storage and Location
          </h3>
          <p className="mb-4"><strong>Primary Database:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Service Provider:</strong> MongoDB Atlas (managed MongoDB database service)</li>
            <li><strong>Data Storage Location:</strong> Configurable across AWS, Google Cloud, and Azure regions</li>
            <li><strong>Current Configuration:</strong> Data stored in appropriate region for optimal performance and compliance</li>
            <li><strong>Encryption:</strong> All data encrypted in transit (TLS) and at rest (AES-256)</li>
            <li><strong>Backup:</strong> Automated daily backups with 7-day retention; point-in-time recovery available</li>
          </ul>
          <p className="mb-4"><strong>Application Hosting:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Service Provider:</strong> Vercel</li>
            <li><strong>Hosting Locations:</strong> Global CDN with edge servers worldwide</li>
            <li><strong>Data Centers:</strong> Vercel maintains data centers across North America, Europe, and Asia Pacific</li>
            <li><strong>Backend Deployment:</strong> Backend API hosted on Vercel serverless functions</li>
            <li><strong>SSL/TLS:</strong> All connections encrypted with TLS 1.2 or higher</li>
          </ul>
          <p className="mb-4"><strong>Domain Registration:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Registrar:</strong> Hostinger</li>
            <li><strong>WHOIS Privacy:</strong> Free WHOIS privacy protection enabled for kallkeyy.com</li>
            <li><strong>Your data:</strong> Not publicly listed in WHOIS database (privacy-protected)</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            3.3 Third-Party Service Integrations
          </h3>
          <p className="mb-4">All third-party services comply with data protection regulations and are contractually bound to process data according to this Policy.</p>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">4. COLLECTION OF INFORMATION</h2>
          <p className="mb-4">KALLKEYY collects personal information through multiple channels, with full transparency about what is collected, why it is collected, and how it will be used.</p>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            3.1 Information Collected Directly from You
          </h3>
          <p className="mb-4">KALLKEYY collects the following data directly from you when you voluntarily provide it:</p>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Account Registration and Creation
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Full name, email address, mobile/telephone number</li>
            <li>Residential or business address</li>
            <li>Date of birth (if required)</li>
            <li>Password and security questions</li>
            <li>Account preferences and communication preferences</li>
            <li>Profile information and biographical data</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Purchase and Transaction Information
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Billing name and billing address</li>
            <li>Shipping/delivery address (which may differ from billing address)</li>
            <li>Payment method details (credit/debit card information processed through Razorpay, bank account details, digital wallet information)</li>
            <li>Order history and purchase details</li>
            <li>Product preferences and wishlist items</li>
            <li>Transaction amounts and payment status</li>
            <li>Refund and return requests</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Communication and Customer Support
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Inquiry subject matter and content</li>
            <li>Messages, emails, and correspondence</li>
            <li>Support tickets and complaint details</li>
            <li>Feedback, reviews, ratings, and testimonials</li>
            <li>Survey responses and questionnaire answers</li>
            <li>Video, audio, or text communications with our support team</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Marketing and Subscription Information
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Email address for newsletter subscriptions</li>
            <li>Marketing preferences and communication opt-ins</li>
            <li>SMS consent and preferences</li>
            <li>Push notification preferences</li>
            <li>Frequency and type of promotional communications desired</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Optional Information
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Gender and date of birth (for personalization)</li>
            <li>Style preferences and fashion interests (for product recommendations)</li>
            <li>Size and fit information</li>
            <li>Lifestyle interests and hobbies</li>
            <li>Social media handles and usernames (if voluntarily provided for social login)</li>
          </ul>
          <p className="mb-4"><strong>Data Collection Basis:</strong> This information is collected on the legal basis of:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Your explicit, informed, and freely-given consent</li>
            <li>Performance of a contractual agreement (e.g., to process your order)</li>
            <li>Compliance with legal obligations</li>
            <li>Our legitimate business interests in providing better services and customer experience</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            3.2 Information Collected Automatically
          </h3>
          <p className="mb-4">When you access and interact with the Platform, certain information is automatically collected without your explicit action:</p>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Technical and Device Information
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>IP address (Internet Protocol address)</li>
            <li>Device identifier and device fingerprint</li>
            <li>Mobile device identifiers (IDFA for iOS, Android Advertising ID)</li>
            <li>Device type, model, and manufacturer</li>
            <li>Operating system type and version</li>
            <li>Browser type, version, and configuration</li>
            <li>Internet service provider (ISP) information</li>
            <li>Unique device identifiers</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Website and Application Usage Information
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Pages visited and content accessed</li>
            <li>Links clicked and navigation paths followed</li>
            <li>Session duration and frequency of visits</li>
            <li>Features and functionalities used</li>
            <li>Search queries and search history</li>
            <li>Items viewed, added to cart, or removed</li>
            <li>Scroll behavior and time spent on specific pages</li>
            <li>Form fields filled (even if not submitted)</li>
            <li>Error messages and technical issues encountered</li>
            <li>Referring URL and entry/exit pages</li>
            <li>Download history and file access patterns</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Geolocation and Location Data
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Approximate geographic location based on IP address</li>
            <li>GPS coordinates (if you grant permission)</li>
            <li>Location-based service usage</li>
            <li>Region and country of access</li>
            <li>City and state information</li>
            <li>Time zone</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Timestamp and Event Data
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Date and time of each action or interaction</li>
            <li>Event sequence and chronology</li>
            <li>Frequency of interactions</li>
            <li>Historical patterns of behavior</li>
            <li>Temporal trends in usage</li>
          </ul>
          <p className="mb-4"><strong>Basis for Automatic Collection:</strong> This information is collected for:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Service provision and optimization</li>
            <li>Security and fraud prevention</li>
            <li>Analytics and usage pattern analysis</li>
            <li>Marketing and personalization</li>
            <li>Legitimate business interests in understanding user behavior</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            3.3 Information Collected Through Cookies, Web Beacons, and Tracking Technologies
          </h3>
          <p className="mb-4">KALLKEYY employs various tracking technologies to enhance user experience, improve services, and measure effectiveness of marketing campaigns:</p>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Cookies (First-Party and Third-Party)
          </h4>
          <p className="mb-4"><strong>Cookie Categories:</strong></p>
          <p className="mb-4">1. <strong>Essential/Strictly Necessary Cookies</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Required for basic website functionality</li>
            <li>Enable login and session management</li>
            <li>Maintain security and fraud prevention</li>
            <li>Process transactions and orders</li>
            <li>No user opt-out available (required for service provision)</li>
          </ul>
          <p className="mb-4">2. <strong>Performance/Analytics Cookies</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Collect information about how you use the website</li>
            <li>Track page load times and performance metrics</li>
            <li>Identify pages with high traffic or errors</li>
            <li>Measure visitor engagement and behavior patterns</li>
            <li>Powered by: Google Analytics, similar analytics platforms</li>
            <li>User opt-out available through cookie preferences</li>
          </ul>
          <p className="mb-4">3. <strong>Functional/Preference Cookies</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Remember user preferences and settings</li>
            <li>Maintain language and currency selections</li>
            <li>Store previous search queries and browsing history</li>
            <li>Enable customized user experiences</li>
            <li>User opt-out available (may reduce functionality)</li>
          </ul>
          <p className="mb-4">4. <strong>Marketing/Advertising/Targeting Cookies</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Track user behavior across multiple websites</li>
            <li>Enable targeted and personalized advertising</li>
            <li>Create audience segments for retargeting campaigns</li>
            <li>Measure advertising effectiveness and ROI</li>
            <li>Powered by: Meta (Facebook), Google Ads, and similar platforms</li>
            <li>User opt-out available through cookie preferences</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Web Beacons, Pixels, and Tracking Tags
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Transparent 1x1 pixel images embedded in emails and web pages</li>
            <li>Google Analytics tags and event tracking</li>
            <li>Meta Pixel for conversion tracking and audience building</li>
            <li>Advertising pixels from third-party platforms</li>
            <li>Used to measure engagement, conversions, and campaign effectiveness</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Local Storage and Similar Technologies
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Browser local storage and session storage</li>
            <li>HTML5 storage mechanisms</li>
            <li>Flash cookies and stored data</li>
            <li>Service Worker caches</li>
            <li>IndexedDB and similar storage APIs</li>
          </ul>
          <p className="mb-4"><strong>Cookie Retention:</strong> Cookies are retained for varying periods:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Essential cookies: Duration of session or user-defined login period</li>
            <li>Analytics cookies: 12-24 months (GDPR compliance standard)</li>
            <li>Marketing cookies: 12-24 months or as per user preferences</li>
            <li>Preference cookies: 12 months or longer</li>
          </ul>
          <p className="mb-4"><strong>User Control Over Cookies:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Users can disable cookies through browser settings</li>
            <li>Cookie preference center available on the Platform</li>
            <li>Granular category-based controls (accept/reject by type)</li>
            <li>User can withdraw cookie consent at any time</li>
            <li>Some Platform features may not function without certain cookies</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            3.4 Information Collected from Third-Party Sources
          </h3>
          <p className="mb-4">KALLKEYY may receive personal information about you from third-party sources, including:</p>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Payment Processors
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Razorpay:</strong> Payment information, transaction history, billing details, authentication status</li>
            <li>Information shared for payment processing, fraud prevention, and transaction verification</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Logistics and Shipping Partners
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Shiprocket:</strong> Delivery address, contact information, order tracking data, delivery status</li>
            <li>Information shared for order fulfillment, logistics optimization, and delivery management</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Analytics and Marketing Platforms
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Google Analytics:</strong> User behavior, traffic sources, conversion data, audience insights</li>
            <li><strong>Meta (Facebook) Ads:</strong> User interests, demographics, engagement history, pixel-tracked events</li>
            <li><strong>Google Ads:</strong> Search history, ad engagement, conversion data, remarketing audience information</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Cloud Infrastructure Providers
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Amazon Web Services (AWS):</strong> Technical data, system performance, backups, security logs</li>
            <li>Information shared for data storage, security, backup, and disaster recovery</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Social Media and Authentication Platforms
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Information if you use social login (Google, Facebook, Instagram authentication)</li>
            <li>User ID, email, profile information, and social connections</li>
            <li>Subject to social platform privacy policies</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Third-Party Integrations
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>E-commerce platforms or marketplaces if you access KALLKEYY through integrations</li>
            <li>Customer review and rating platforms</li>
            <li>Email list providers or data enrichment services (if applicable)</li>
          </ul>
          <p className="mb-4"><strong>Basis for Collection from Third Parties:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Contractual obligations with service providers</li>
            <li>Your authorization through social login or platform integrations</li>
            <li>Legitimate business interests in service provision and optimization</li>
            <li>Legal and regulatory compliance</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            3.5 Data You Provide About Others
          </h3>
          <p className="mb-4">If you provide personal information about other individuals (such as a family member's address for shipping), you represent that:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>You have obtained necessary consent from such individuals</li>
            <li>You have the legal authority to provide their information</li>
            <li>You will inform them of this Privacy Policy</li>
            <li>You are responsible for their privacy and the lawful use of their data</li>
          </ul>
          <p className="mb-4">KALLKEYY processes such data solely for the purpose for which you provided it and will not use it for other purposes without explicit consent from the relevant individual.</p>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">5. PURPOSES OF DATA COLLECTION AND PROCESSING</h2>
          <p className="mb-4">KALLKEYY collects and processes personal information for the following lawful, specified, and explicit purposes:</p>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            4.1 Service Delivery and Transaction Processing
          </h3>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Creating and maintaining user accounts and profiles</li>
            <li>Processing, verifying, and fulfilling product orders and purchases</li>
            <li>Generating invoices, receipts, and transaction confirmations</li>
            <li>Processing refunds, exchanges, returns, and disputes</li>
            <li>Managing order tracking and delivery status updates</li>
            <li>Providing after-sales support and warranty information</li>
            <li>Facilitating customer service interactions</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            4.2 Payment Processing and Financial Transactions
          </h3>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Processing payments securely through authorized payment gateways (Razorpay)</li>
            <li>Verifying payment information and authorization</li>
            <li>Preventing and detecting fraudulent transactions</li>
            <li>Managing billing and account reconciliation</li>
            <li>Maintaining financial records for accounting and audit purposes</li>
            <li>Complying with tax and financial reporting obligations</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            4.3 Shipping, Logistics, and Delivery
          </h3>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Sharing address information with logistics partners (Shiprocket) for order fulfillment</li>
            <li>Enabling delivery tracking and management</li>
            <li>Managing returns and reverse logistics</li>
            <li>Communicating delivery updates and status</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            4.4 Customer Communication
          </h3>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Sending order confirmations, shipping notifications, and delivery updates</li>
            <li>Responding to customer inquiries, feedback, and complaints</li>
            <li>Providing customer support via email, phone, chat, or other channels</li>
            <li>Sending transactional notifications and account alerts</li>
            <li>Notifying users of changes to terms, policies, or services</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            4.5 Marketing and Promotional Communications
          </h3>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Sending newsletters, promotional offers, and product announcements (with explicit opt-in)</li>
            <li>Informing users about new products, features, or services</li>
            <li>Conducting marketing campaigns and promotional activities</li>
            <li>Personalizing marketing communications based on preferences and behavior</li>
            <li>Offering discounts, loyalty programs, and exclusive deals</li>
            <li>Users can opt out of marketing communications at any time by clicking "unsubscribe"</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            4.6 Personalization and User Experience Enhancement
          </h3>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Personalizing website content and product recommendations</li>
            <li>Remembering user preferences and settings</li>
            <li>Providing customized shopping experiences</li>
            <li>Suggesting products based on browsing history and purchase patterns</li>
            <li>Improving website navigation and interface usability</li>
            <li>Developing features and services tailored to user interests</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            4.7 Analytics, Research, and Business Intelligence
          </h3>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Analyzing website traffic patterns and user behavior</li>
            <li>Understanding customer preferences and purchasing trends</li>
            <li>Conducting market research and competitive analysis</li>
            <li>Measuring marketing campaign effectiveness and ROI</li>
            <li>Identifying popular products and content</li>
            <li>Improving Platform performance, features, and functionality</li>
            <li>Generating anonymous aggregated reports and insights</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            4.8 Fraud Prevention and Security
          </h3>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Detecting and preventing fraudulent transactions and unauthorized access</li>
            <li>Protecting against cyberattacks, data breaches, and security threats</li>
            <li>Verifying user identity and preventing identity theft</li>
            <li>Implementing security measures and monitoring suspicious activities</li>
            <li>Maintaining system integrity and preventing misuse of the Platform</li>
            <li>Conducting security assessments and penetration testing</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            4.9 Legal Compliance and Regulatory Obligations
          </h3>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Complying with applicable laws, regulations, and legal process</li>
            <li>Responding to lawful requests from government agencies and law enforcement</li>
            <li>Maintaining records required for tax, accounting, and audit purposes</li>
            <li>Fulfilling consumer protection and e-commerce compliance requirements</li>
            <li>Responding to court orders, subpoenas, and legal proceedings</li>
            <li>Maintaining compliance documentation and audit trails</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            4.10 Consent and Rights Management
          </h3>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Recording and managing user consent preferences</li>
            <li>Managing opt-ins and opt-outs for various processing activities</li>
            <li>Implementing user rights requests (access, rectification, erasure, portability)</li>
            <li>Maintaining records of consent and processing activities</li>
            <li>Facilitating withdrawal of consent</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            4.11 Business Operations and Improvement
          </h3>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Improving Platform functionality, user interface, and features</li>
            <li>Conducting quality assurance and user testing</li>
            <li>Developing new products, services, and business initiatives</li>
            <li>Managing customer feedback and product reviews</li>
            <li>Training employees and optimizing customer service</li>
            <li>Internal business operations and administrative functions</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            4.12 Legitimate Business Interests
          </h3>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Protecting KALLKEYY's legal rights, property, and interests</li>
            <li>Resolving disputes and enforcing agreements</li>
            <li>Maintaining business continuity and data security</li>
            <li>Improving operational efficiency and resource allocation</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">6. LEGAL BASIS FOR PROCESSING (GDPR ARTICLE 6 & DPDP ACT SECTION 6)</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            5.1 GDPR Legal Basis
          </h3>
          <p className="mb-4">Under the General Data Protection Regulation (GDPR), KALLKEYY processes personal data only when at least one of the following legal bases applies:</p>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            A. Consent (GDPR Article 6(1)(a))
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Users explicitly consent to specific data processing before it occurs</li>
            <li>Consent is freely given, specific, informed, and unambiguous</li>
            <li>Consent is obtained through clear affirmative action (no pre-checked boxes)</li>
            <li>Users can withdraw consent at any time without penalty</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            B. Contract Performance (GDPR Article 6(1)(b))
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data processing is necessary to enter into or perform a contract with the user</li>
            <li>Examples: Processing order information to fulfill purchases, managing deliveries</li>
            <li>Without such processing, contract performance would be impossible</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            C. Legal Obligation (GDPR Article 6(1)(c))
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Processing is necessary to comply with legal obligations applicable to KALLKEYY</li>
            <li>Examples: Tax compliance, consumer protection laws, financial reporting, legal hold obligations</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            D. Vital Interests (GDPR Article 6(1)(d))
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Processing is necessary to protect vital interests of data subjects or others</li>
            <li>Rarely applied in e-commerce context</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            E. Public Task (GDPR Article 6(1)(e))
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Processing is necessary for performance of a task in the public interest</li>
            <li>Not applicable to KALLKEYY as a private commercial entity</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            F. Legitimate Interests (GDPR Article 6(1)(f))
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Processing is necessary for legitimate interests pursued by KALLKEYY</li>
            <li>Legitimate interests include: fraud prevention, direct marketing, analytics, service optimization</li>
            <li>Balancing test: Legitimate interests must not override rights and freedoms of data subjects</li>
            <li>Examples: Preventing fraud, analyzing user behavior, marketing communications</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            5.2 DPDP Act Legal Framework
          </h3>
          <p className="mb-4">The Digital Personal Data Protection Act, 2023 (DPDP Act) establishes principles-based processing:</p>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Processing Basis
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Processing must be lawful, fair, transparent, and necessary</li>
            <li>Processing must be for a specified, explicit, and legitimate purpose</li>
            <li>Consent must be free, specific, informed, and unambiguous (Section 6 of DPDP Act)</li>
            <li>Consent must be obtained through clear affirmative action</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Mandatory Notice Requirements (Draft DPDP Rules, 2025)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Notice must be provided before collecting personal data</li>
            <li>Notice must be in clear and plain language, easy to understand</li>
            <li>Notice must specify:</li>
            <li>Data being collected and why (purpose)</li>
            <li>Categories of recipients</li>
            <li>Retention period</li>
            <li>User rights available</li>
            <li>Contact details of grievance officer</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Exceptions to Consent Requirement
          </h4>
          <p className="mb-4">Consent may not be required when processing is:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Necessary for contract performance</li>
            <li>Required by law</li>
            <li>Related to data already made public by the individual</li>
            <li>Necessary for legal claims or defense</li>
            <li>Related to employment obligations</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            5.3 Consent Management and Renewal
          </h3>
          <p className="mb-4"><strong>Consent Characteristics:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Free:</strong> Not coerced, pressured, or manipulated</li>
            <li><strong>Specific:</strong> Given for particular purposes, not blanket consent</li>
            <li><strong>Informed:</strong> Users understand what they consent to</li>
            <li><strong>Unambiguous:</strong> Given through clear affirmative action</li>
          </ul>
          <p className="mb-4"><strong>Consent Records:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>KALLKEYY maintains detailed records of all consent (who, when, what, how)</li>
            <li>Records are retained for audit and enforcement purposes</li>
            <li>Users can request confirmation of recorded consent at any time</li>
          </ul>
          <p className="mb-4"><strong>Consent Renewal and Degradation:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Consent validity is subject to periodic renewal (annually recommended)</li>
            <li>Users receive reminders at least 30 days before consent expiration</li>
            <li>Expired or degraded consent will not be renewed without fresh user action</li>
            <li>Lapsed consent results in cessation of related processing activities</li>
          </ul>
          <p className="mb-4"><strong>Consent Withdrawal:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Users can withdraw consent at any time through account settings or by contacting support</li>
            <li>Withdrawal is as simple as providing consent</li>
            <li>Withdrawal does not affect lawfulness of prior processing</li>
            <li>Processing ceases immediately upon withdrawal</li>
            <li>However, retention of data for legal compliance may continue</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">7. COOKIES, TRACKING TECHNOLOGIES, AND WEB PRIVACY</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            6.1 Comprehensive Cookie Policy
          </h3>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Cookie Definition and Purpose
          </h4>
          <p className="mb-4">Cookies are small data files stored on your device when you visit the Platform. They serve multiple functions:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Maintaining login sessions and authentication</li>
            <li>Remembering user preferences and settings</li>
            <li>Tracking website usage and performance</li>
            <li>Enabling targeted advertising and remarketing</li>
            <li>Improving user experience and personalization</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Mandatory Cookie Consent (GDPR & ePrivacy Directive)
          </h4>
          <p className="mb-4"><strong>Prior Consent Requirement:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Non-essential cookies cannot be activated without explicit prior user consent</li>
            <li>User must affirmatively opt-in before cookies are set</li>
            <li>Pre-checked boxes are not permitted</li>
            <li>Implied consent through continued browsing is not valid</li>
            <li>Users must be able to reject cookies as easily as accepting</li>
          </ul>
          <p className="mb-4"><strong>Cookie Banner Implementation:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Clear, prominent cookie consent banner appears before non-essential cookies are set</li>
            <li>Banner provides option to "Accept All," "Reject All," or customize preferences</li>
            <li>Links to full cookie policy provided in banner</li>
            <li>Banner is accessible and dismissible</li>
            <li>Banner reappears if not interacted with after reasonable time</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Cookie Categories and User Control
          </h4>
          <p className="mb-4"><strong>1. Essential/Strictly Necessary Cookies (No Consent Required)</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Functional purpose: Enabling core website functionality</li>
            <li>Examples: Session cookies, authentication tokens, security verification, fraud prevention</li>
            <li>Without these, key services cannot be provided</li>
            <li>No opt-out option (required for service provision)</li>
            <li>Retention: Duration of session or user-defined login period</li>
          </ul>
          <p className="mb-4"><strong>2. Analytics/Performance Cookies (Consent Required)</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Functional purpose: Understanding how users interact with the Platform</li>
            <li>Examples: Google Analytics tracking, page load times, visitor flow analysis</li>
            <li>Providers: Google Analytics, similar analytics platforms</li>
            <li>Information collected: Pages visited, time spent, browser type, referring source</li>
            <li>Retention: 12-24 months</li>
            <li>User control: Can be disabled through cookie preferences</li>
            <li>Legitimate interest: Improving Platform performance and user experience</li>
          </ul>
          <p className="mb-4"><strong>3. Functional/Preference Cookies (Consent Recommended)</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Functional purpose: Remembering user preferences and customizing experience</li>
            <li>Examples: Language selection, currency choice, search history, previously viewed items</li>
            <li>Retention: 12 months or until user-initiated deletion</li>
            <li>User control: Can be disabled (may reduce functionality)</li>
            <li>Impact of refusal: Platform remains functional but without personalization</li>
          </ul>
          <p className="mb-4"><strong>4. Marketing/Advertising/Targeting Cookies (Consent Required)</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Functional purpose: Enabling targeted advertising and campaign measurement</li>
            <li>Examples: Facebook Pixel, Google Ads conversion tracking, retargeting pixels</li>
            <li>Providers: Meta (Facebook), Google, other advertising networks</li>
            <li>Information collected: Browsing behavior, purchase history, interests, demographics</li>
            <li>Retention: 12-24 months</li>
            <li>User control: Must be disabled if user rejects</li>
            <li>Purpose: Creating targeted audiences, measuring ad effectiveness, remarketing</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Third-Party Cookies
          </h4>
          <p className="mb-4">KALLKEYY uses cookies from third-party services:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Google Analytics:</strong> User behavior analysis</li>
            <li><strong>Meta (Facebook) Pixel:</strong> Conversion tracking and audience building</li>
            <li><strong>Google Ads:</strong> Advertising and conversion tracking</li>
            <li><strong>Razorpay:</strong> Payment processing and fraud prevention</li>
            <li><strong>Other advertising networks:</strong> Targeted advertising and retargeting</li>
          </ul>
          <p className="mb-4">Third-party cookie policies apply to these services. Users should review respective privacy policies:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Google: google.com/policies/privacy</li>
            <li>Meta: facebook.com/privacy</li>
            <li>Razorpay: razorpay.com/privacy</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            6.2 Cookie Preference Management
          </h3>
          <p className="mb-4"><strong>Cookie Preference Center:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Accessible from every page of the Platform</li>
            <li>Users can update preferences at any time</li>
            <li>Granular controls for each cookie category</li>
            <li>Clear descriptions of what each category does</li>
            <li>Easy-to-understand language without technical jargon</li>
          </ul>
          <p className="mb-4"><strong>Managing Cookies:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Users can disable cookies through browser settings (Chrome, Firefox, Safari, Edge)</li>
            <li>Most browsers provide built-in cookie management tools</li>
            <li>Users can clear cookies manually</li>
            <li>Disabling cookies may impact Platform functionality</li>
          </ul>
          <p className="mb-4"><strong>Global Privacy Control (GPC):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>KALLKEYY respects Global Privacy Control signals (CCPA/CPRA compliance)</li>
            <li>GPC header signals will be honored to opt-out of non-essential cookies</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            6.3 Web Beacon and Pixel-Based Tracking
          </h3>
          <p className="mb-4">Beyond cookies, KALLKEYY uses web beacons and pixels for tracking:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Google Analytics Pixel:</strong> Tracks user behavior across all pages</li>
            <li><strong>Meta Pixel:</strong> Tracks conversions and builds audience segments</li>
            <li><strong>Third-Party Advertising Pixels:</strong> Enable cross-site retargeting</li>
          </ul>
          <p className="mb-4">These technologies create tracking records even without cookies (though less effective).</p>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            6.4 Local Storage and Modern Storage Technologies
          </h3>
          <p className="mb-4">KALLKEYY may use:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Browser Local Storage:</strong> Persistent storage of user preferences</li>
            <li><strong>Session Storage:</strong> Temporary data during active sessions</li>
            <li><strong>IndexedDB:</strong> Enhanced client-side data storage for offline functionality</li>
            <li><strong>Service Workers:</strong> For offline functionality and caching</li>
          </ul>
          <p className="mb-4">These technologies work similarly to cookies but with larger storage capacity. Users can clear these through browser settings.</p>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            6.5 Do Not Track (DNT) Signals
          </h3>
          <p className="mb-4">Some browsers include "Do Not Track" functionality:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>KALLKEYY respects DNT signals where technically feasible</li>
            <li>However, not all tracking technologies support DNT</li>
            <li>Users who want full tracking opt-out should disable cookies and review browser settings</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">8. DATA SHARING AND THIRD-PARTY DISCLOSURE</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            7.1 Overview of Data Sharing Practices
          </h3>
          <p className="mb-4">KALLKEYY shares personal information with third-party service providers only when:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Necessary for service provision and order fulfillment</li>
            <li>Required by law or court order</li>
            <li>Authorized by user consent</li>
            <li>Protected by contractual data processing agreements</li>
          </ul>
          <p className="mb-4">All third-party recipients are legally bound to:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Process data only as instructed by KALLKEYY</li>
            <li>Maintain confidentiality and security of data</li>
            <li>Not use data for their own independent purposes</li>
            <li>Comply with applicable data protection laws</li>
            <li>Implement appropriate technical and organizational security measures</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            7.2 Third-Party Service Providers and Recipients
          </h3>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Payment Processing
          </h4>
          <p className="mb-4"><strong>Service Provider: Razorpay</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data shared: Name, email, phone number, billing address, payment card information</li>
            <li>Purpose: Processing payments, verifying transactions, preventing fraud</li>
            <li>Processing basis: Contract performance and legitimate business interests</li>
            <li>Data retention: As per Razorpay privacy policy (typically 6-7 years for compliance)</li>
            <li>Website: razorpay.com</li>
            <li>Privacy Policy: razorpay.com/privacy</li>
            <li>Legal agreement: Data Processing Agreement (DPA) in place</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Logistics and Shipping
          </h4>
          <p className="mb-4"><strong>Service Providers: Shiprocket and similar partners</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data shared: Full name, phone number, shipping address, order details, tracking information</li>
            <li>Purpose: Order fulfillment, delivery management, returns and reverse logistics</li>
            <li>Processing basis: Contract performance (necessary to deliver orders)</li>
            <li>Data retention: Until delivery completed and return window expired (typically 30-45 days post-delivery)</li>
            <li>Website: shiprocket.in</li>
            <li>Privacy Policy: shiprocket.in/privacy-policy</li>
            <li>Legal agreement: Data Processing Agreement in place</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Analytics and Behavior Tracking
          </h4>
          <p className="mb-4"><strong>Service Provider: Google Analytics</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data shared: IP address, device information, browsing behavior, pages visited, conversion events</li>
            <li>Purpose: Understanding user behavior, measuring traffic, identifying trends</li>
            <li>Processing basis: Legitimate business interests and user consent</li>
            <li>Data retention: 12-24 months</li>
            <li>Website: google.com/analytics</li>
            <li>Privacy Policy: google.com/policies/privacy</li>
            <li>International transfer: Data transferred to Google servers globally (with Standard Contractual Clauses in place)</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Digital Advertising and Retargeting
          </h4>
          <p className="mb-4"><strong>Service Providers: Meta (Facebook) Ads, Google Ads</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data shared: Hashed email, phone number, pixel-tracked browsing behavior, conversion events</li>
            <li>Purpose: Creating targeted audiences, measuring ad effectiveness, remarketing</li>
            <li>Processing basis: Legitimate business interests and user consent</li>
            <li>Data retention: As per platform policies (typically 12-24 months)</li>
            <li>Websites: facebook.com, google.com/ads</li>
            <li>Privacy Policies: facebook.com/privacy, google.com/policies/privacy</li>
            <li>Data is typically anonymized or hashed before sharing</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Cloud Infrastructure and Data Storage
          </h4>
          <p className="mb-4"><strong>Service Provider: Amazon Web Services (AWS)</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data shared: All customer data, transaction records, communication logs</li>
            <li>Purpose: Secure data storage, backup, disaster recovery, system security</li>
            <li>Processing basis: Contract performance and legitimate business interests</li>
            <li>Data location: Servers in India (as per commitment to data localization)</li>
            <li>Encryption: End-to-end encryption in transit and at rest</li>
            <li>Data retention: As long as user maintains account or as required by law</li>
            <li>Website: aws.amazon.com</li>
            <li>Privacy Policy: aws.amazon.com/privacy</li>
            <li>Legal agreement: Data Processing Agreement in place</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Email and Communication Services
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Service providers for transactional emails and SMS</li>
            <li>Data shared: Email address, phone number, communication preferences</li>
            <li>Purpose: Sending order confirmations, updates, and customer service communications</li>
            <li>Processing basis: Contract performance and legitimate business interests</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Customer Support Platforms
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>CRM systems and customer service platforms</li>
            <li>Data shared: Contact information, order history, communication records, support tickets</li>
            <li>Purpose: Providing customer support and service</li>
            <li>Processing basis: Contract performance and legitimate business interests</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            7.3 Restrictions on Data Sharing
          </h3>
          <p className="mb-4"><strong>KALLKEYY Does NOT:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Sell personal data to third parties for commercial gain</li>
            <li>Share data with data brokers or aggregators</li>
            <li>Disclose data to competitors without explicit user authorization</li>
            <li>Use data for purposes other than those specified in this policy</li>
            <li>Share data with unrelated third parties for their independent use</li>
            <li>Transfer data internationally without appropriate safeguards</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            7.4 Legal Disclosures and Law Enforcement
          </h3>
          <p className="mb-4">KALLKEYY may disclose personal information when required or authorized by law:</p>
          <p className="mb-4"><strong>Circumstances for Disclosure:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Court orders, subpoenas, search warrants, or judicial process</li>
            <li>Government agency requests or regulatory investigations</li>
            <li>Law enforcement inquiries related to criminal investigations</li>
            <li>Protection of national security or public interest</li>
            <li>Prevention, investigation, or prosecution of crime</li>
            <li>Enforcement of legal rights or contracts</li>
            <li>Protection of KALLKEYY's property, rights, or safety</li>
            <li>Protection of other users' safety or rights</li>
          </ul>
          <p className="mb-4"><strong>Process for Legal Requests:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>KALLKEYY verifies the legitimacy of legal requests</li>
            <li>KALLKEYY notifies affected users of legal requests where possible and legally permitted</li>
            <li>KALLKEYY discloses only the minimum data necessary</li>
            <li>KALLKEYY maintains records of all legal data requests for audit purposes</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">9. DATA STORAGE, LOCATION, AND RETENTION</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            8.1 Data Storage Location and Infrastructure
          </h3>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Primary Data Storage
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Location:</strong> Servers located in India (Delhi region)</li>
            <li><strong>Provider:</strong> Amazon Web Services (AWS) - India region</li>
            <li><strong>Rationale:</strong> Compliance with data localization requirements, reduced latency, regulatory preference</li>
            <li><strong>Infrastructure:</strong> Secure, redundant, geographically distributed within India</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Data Backup and Disaster Recovery
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Regular automated backups maintained for business continuity</li>
            <li>Backup data stored in AWS secure facilities</li>
            <li>Backup retained for 30 days (minimum) to 90 days (maximum)</li>
            <li>Disaster recovery procedures documented and tested</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Encryption and Security
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data encrypted in transit (TLS/SSL 1.2+)</li>
            <li>Data encrypted at rest using AES-256 encryption</li>
            <li>Encryption keys managed through AWS Key Management Service (KMS)</li>
            <li>Access to encrypted data restricted to authorized personnel only</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            8.2 Data Retention Policy
          </h3>
          <p className="mb-4">KALLKEYY retains personal data only for as long as:</p>
          <p className="mb-4">1. Necessary to fulfill the purposes for which it was collected</p>
          <p className="mb-4">2. Required by applicable law or regulation</p>
          <p className="mb-4">3. Relevant for resolving disputes or defending legal claims</p>
          <p className="mb-4">4. Necessary for business or operational purposes</p>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Specific Retention Periods
          </h4>
          <p className="mb-4"><strong>Active Customer Account Data:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Retained as long as account is active</li>
            <li>Upon account closure: Core data retained for 3 years (DPDP Act compliance)</li>
            <li>Financial records retained for 7 years (tax and accounting compliance)</li>
            <li>Communication records retained for 3 years (DPDPA Draft Rules)</li>
          </ul>
          <p className="mb-4"><strong>Transactional Data:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Payment records: 7 years (PCI DSS compliance, tax requirements)</li>
            <li>Order history: 3 years (consumer protection, dispute resolution)</li>
            <li>Shipping and delivery records: 2 years (logistics, dispute resolution)</li>
            <li>Invoices and receipts: 7 years (tax compliance)</li>
          </ul>
          <p className="mb-4"><strong>Marketing and Communication Data:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Newsletter subscriber data: Retained while subscribed, deleted upon unsubscribe</li>
            <li>Email marketing data: 12 months of inactivity (GDPR compliance)</li>
            <li>SMS preferences: Retained while opted-in, deleted upon opt-out</li>
            <li>Marketing consent records: 3 years (audit and compliance)</li>
          </ul>
          <p className="mb-4"><strong>Analytics and Usage Data:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Google Analytics data: 24 months (default retention)</li>
            <li>Server logs: 90 days (operational purposes)</li>
            <li>User activity logs: 3 years (security and compliance)</li>
          </ul>
          <p className="mb-4"><strong>Support and Communication:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Support tickets and communications: 3 years</li>
            <li>Complaint records: 3-5 years (consumer protection)</li>
            <li>Feedback and reviews: Until withdrawn or deleted</li>
          </ul>
          <p className="mb-4"><strong>Sensitive Personal Data (SPDI):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Passwords and credentials: Permanently encrypted, not retained in readable form</li>
            <li>Credit card information: Not retained after transaction (Razorpay-processed, PCI DSS compliant)</li>
            <li>KYC/identification documents: Per legal requirements, but secured and deleted when no longer necessary</li>
          </ul>
          <p className="mb-4"><strong>Legal Hold Data:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data subject to legal proceedings: Retained until case resolution and appellate period expires</li>
            <li>Data subject to investigation: Retained per investigative requirements</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Post-Retention Deletion Process
          </h4>
          <p className="mb-4"><strong>Automatic Deletion:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data scheduled for deletion on specified date</li>
            <li>Automated processes confirm deletion</li>
            <li>Audit logs record deletion activity</li>
            <li>Backup data deleted within 90 days</li>
          </ul>
          <p className="mb-4"><strong>User-Initiated Deletion (Right to Erasure):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Deletion request processed within 30 days (GDPR), up to 45 days (DPDPA)</li>
            <li>Data deleted from primary systems within 7-10 working days</li>
            <li>Backup copies deleted within 90 days</li>
            <li>User receives confirmation of deletion</li>
          </ul>
          <p className="mb-4"><strong>Exceptions to Deletion:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data required by law (tax, accounting, regulatory)</li>
            <li>Data subject to litigation hold</li>
            <li>Data necessary to defend legal claims</li>
            <li>Data required for KALLKEYY's legitimate interests</li>
            <li>Data necessary for fraud prevention or security</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            8.3 Data Anonymization and De-identification
          </h3>
          <p className="mb-4">Where practical, KALLKEYY anonymizes personal data when:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>No longer needed for specified purposes</li>
            <li>Analytical or research purposes are served</li>
            <li>Legal retention requirements no longer apply</li>
          </ul>
          <p className="mb-4">Anonymization involves:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Removing direct identifiers (name, email, phone)</li>
            <li>Removing quasi-identifiers that could enable re-identification</li>
            <li>Hashing or tokenizing sensitive data</li>
            <li>Aggregating data at group level</li>
            <li>Irreversible anonymization for statistical analysis</li>
          </ul>
          <p className="mb-4">Properly anonymized data is no longer subject to data protection regulations and may be retained indefinitely.</p>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">10. DATA SECURITY PRACTICES</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            9.1 Security Framework and Principles
          </h3>
          <p className="mb-4">KALLKEYY implements comprehensive security measures following industry best practices and compliance frameworks:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>ISO 27001/27701:</strong> Information Security Management System principles</li>
            <li><strong>PCI DSS Level 1:</strong> For payment data security</li>
            <li><strong>NIST Cybersecurity Framework:</strong> Security best practices</li>
            <li><strong>OWASP Top 10:</strong> Web application security standards</li>
          </ul>
          <p className="mb-4"><strong>Security Philosophy:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Layered security approach (defense in depth)</li>
            <li>Continuous monitoring and threat detection</li>
            <li>Regular security audits and penetration testing</li>
            <li>Incident response planning and testing</li>
            <li>Employee security awareness training</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            9.2 Technical Security Measures
          </h3>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Encryption
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>In Transit:</strong> TLS/SSL 1.2 or higher for all data transmission</li>
            <li><strong>At Rest:</strong> AES-256 encryption for sensitive data in storage</li>
            <li><strong>Key Management:</strong> AWS KMS for encryption key management and rotation</li>
            <li><strong>Database Encryption:</strong> Database-level encryption for all personal data stores</li>
            <li><strong>Backup Encryption:</strong> All backups encrypted with separate encryption keys</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Access Control
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Role-Based Access Control (RBAC):</strong> Employees have access only to data necessary for their role</li>
            <li><strong>Principle of Least Privilege:</strong> Minimal permissions granted</li>
            <li><strong>Multi-Factor Authentication (MFA):</strong> Required for admin access</li>
            <li><strong>Identity Management:</strong> Centralized authentication and authorization</li>
            <li><strong>Access Logging:</strong> All access attempts logged and monitored</li>
            <li><strong>Regular Access Reviews:</strong> Quarterly review of user access permissions</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Network Security
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Firewalls:</strong> Hardware and software firewalls protecting network perimeter</li>
            <li><strong>Intrusion Detection:</strong> Real-time monitoring for suspicious network activity</li>
            <li><strong>DDoS Protection:</strong> Mitigation against distributed denial-of-service attacks</li>
            <li><strong>Virtual Private Network (VPN):</strong> Secure remote access for employees</li>
            <li><strong>Network Segmentation:</strong> Isolation of sensitive systems and databases</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Application Security
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Secure Coding Standards:</strong> OWASP Top 10 compliance</li>
            <li><strong>Input Validation:</strong> Protection against injection attacks and malicious input</li>
            <li><strong>Output Encoding:</strong> Prevention of cross-site scripting (XSS)</li>
            <li><strong>SQL Injection Prevention:</strong> Parameterized queries and prepared statements</li>
            <li><strong>Authentication:</strong> Secure password hashing (bcrypt, scrypt, PBKDF2)</li>
            <li><strong>Session Management:</strong> Secure session tokens with limited lifespan</li>
            <li><strong>API Security:</strong> Authentication, rate limiting, and input validation</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Data Anonymization and Tokenization
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Sensitive data fields tokenized in non-production environments</li>
            <li>Personally identifiable information masked in logs and reports</li>
            <li>Hashing of sensitive data for analytics purposes</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            9.3 Organizational and Administrative Security Measures
          </h3>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Employee Training and Awareness
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Annual cybersecurity training for all employees</li>
            <li>Data protection and privacy training during onboarding</li>
            <li>Regular security awareness updates and newsletters</li>
            <li>Phishing simulation training and awareness</li>
            <li>Clear data handling procedures and guidelines</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Access Management
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Background checks for employees with data access</li>
            <li>Confidentiality and data protection agreements signed by all staff</li>
            <li>Role-specific access granted based on business need</li>
            <li>Immediate access revocation upon termination</li>
            <li>Third-party access through separate, monitored credentials</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Vendor Management
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Security assessments of third-party service providers</li>
            <li>Contractual data protection and security obligations</li>
            <li>Regular audits of third-party security practices</li>
            <li>Incident reporting requirements in vendor agreements</li>
            <li>Data processor agreements (DPA) in place with all vendors</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Change Management
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Formal change control procedures for system modifications</li>
            <li>Security review of all changes before implementation</li>
            <li>Testing in non-production environment before deployment</li>
            <li>Rollback procedures for failed changes</li>
            <li>Audit trail of all changes</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Physical Security
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Restricted access to server rooms and data centers (AWS-managed)</li>
            <li>Video surveillance and alarm systems</li>
            <li>Visitor logs and badge access control</li>
            <li>Secure disposal of physical devices containing data</li>
            <li>Environmental controls (fire suppression, cooling, humidity)</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            9.4 Incident Response and Data Breach Management
          </h3>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Data Breach Response Plan
          </h4>
          <p className="mb-4"><strong>Immediate Response (0-24 hours):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Detect and isolate the breach</li>
            <li>Contain and prevent further unauthorized access</li>
            <li>Preserve evidence for forensic analysis</li>
            <li>Activate incident response team</li>
          </ul>
          <p className="mb-4"><strong>Assessment Phase (24-72 hours):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Assess scope of breach and data affected</li>
            <li>Determine impact on data subjects</li>
            <li>Identify cause and timeline of breach</li>
            <li>Evaluate regulatory notification requirements</li>
          </ul>
          <p className="mb-4"><strong>Notification Phase (as required by law):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Notify affected individuals within legal timeframe</li>
            <li>Notify regulatory authorities as required (typically 72 hours under GDPR)</li>
            <li>Provide clear, honest information about breach</li>
            <li>Offer guidance on protective measures</li>
            <li>Provide incident details and contact information</li>
          </ul>
          <p className="mb-4"><strong>Resolution Phase (ongoing):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Implement remedial measures to prevent recurrence</li>
            <li>Cooperate with regulatory investigations</li>
            <li>Conduct post-incident review and analysis</li>
            <li>Document lessons learned</li>
            <li>Update security policies and procedures</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Breach Notification Requirements
          </h4>
          <p className="mb-4"><strong>For GDPR Compliance (EU-based users):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Notify supervisory authority within 72 hours of discovery</li>
            <li>Notify affected individuals without undue delay</li>
            <li>Provide sufficient information to enable protective measures</li>
            <li>Describe likely consequences and mitigating measures</li>
          </ul>
          <p className="mb-4"><strong>For CCPA/CPRA Compliance (California users):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Notify California Attorney General if data of 500+ CA residents affected</li>
            <li>Notify affected individuals without unreasonable delay</li>
            <li>Maintain breach notification log</li>
          </ul>
          <p className="mb-4"><strong>For Indian Data Subjects (DPDP Act):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Notify Data Protection Board as required (once enacted)</li>
            <li>Notify affected individuals of material breach</li>
            <li>Provide information about protective measures</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            9.5 Security Limitations and Disclaimer
          </h3>
          <p className="mb-4"><strong>Important Acknowledgment:</strong></p>
          <p className="mb-4">Despite comprehensive security measures, KALLKEYY cannot guarantee absolute security. Users acknowledge and accept that:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Internet transmission is inherently vulnerable to interception</li>
            <li>No security system is completely immune to sophisticated attacks</li>
            <li>Data breaches may occur despite reasonable precautions</li>
            <li>Users assume some risk when transmitting information online</li>
            <li>KALLKEYY cannot be held liable for unauthorized access beyond its control</li>
          </ul>
          <p className="mb-4"><strong>User Responsibilities:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Users should use strong, unique passwords</li>
            <li>Users should not share account credentials with others</li>
            <li>Users should log out after using shared devices</li>
            <li>Users should keep devices secure and software updated</li>
            <li>Users should report suspected security incidents immediately</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">11. USER RIGHTS AND DATA SUBJECT RIGHTS</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            10.1 Rights Under GDPR (For EU-based Users)
          </h3>
          <p className="mb-4">Users located in the EU have the following rights under the General Data Protection Regulation:</p>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Access (GDPR Article 15)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Right:</strong> Obtain confirmation of whether personal data is being processed and access to such data</li>
            <li><strong>Scope:</strong> All personal data held by KALLKEYY, including metadata about processing</li>
            <li><strong>Format:</strong> Data provided in commonly used electronic format (CSV, PDF)</li>
            <li><strong>Timeframe:</strong> Response within 1 month of valid request (extendable to 3 months for complex requests)</li>
            <li><strong>Cost:</strong> Free (unless request is manifestly unfounded or excessive)</li>
            <li><strong>Exceptions:</strong> Information about other individuals may be redacted if disclosure would harm them</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Rectification/Correction (GDPR Article 16)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Right:</strong> Correct inaccurate, incomplete, or outdated personal data</li>
            <li><strong>Procedure:</strong> Submit correction request with evidence of inaccuracy</li>
            <li><strong>Timeframe:</strong> Processed without undue delay</li>
            <li><strong>Notification:</strong> All third-party recipients notified of correction unless impractical</li>
            <li><strong>Scope:</strong> Can correct data already provided; cannot compel collection of additional data</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Erasure ("Right to Be Forgotten") (GDPR Article 17)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Circumstances:</strong> Erasure required when data is:</li>
            <li>No longer necessary for original purpose</li>
            <li>Consent is withdrawn and no other legal basis exists</li>
            <li>User objects to processing and no legitimate interest overrides</li>
            <li>Data processed unlawfully</li>
            <li>Required to comply with law</li>
            <li><strong>Exceptions:</strong> Erasure not required for:</li>
            <li>Exercise of freedom of expression or information</li>
            <li>Performance of legal obligation</li>
            <li>Establishment, exercise, or defense of legal claims</li>
            <li>Public interest reasons</li>
            <li>Archiving, research, or statistical purposes</li>
            <li><strong>Timeframe:</strong> Processed within 30 days (extendable to 90 days)</li>
            <li><strong>Notification:</strong> Third parties notified of erasure unless impractical</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Restriction of Processing (GDPR Article 18)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Right:</strong> Request that processing be restricted/suspended while accuracy is verified or legal basis is challenged</li>
            <li><strong>Effect:</strong> Data retained but not actively processed</li>
            <li><strong>Timeframe:</strong> Implemented within 1 month</li>
            <li><strong>Duration:</strong> Until dispute is resolved or legal basis established</li>
            <li><strong>Notification:</strong> Third parties notified of restriction where practical</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Data Portability (GDPR Article 20)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Right:</strong> Obtain personal data in structured, commonly used, machine-readable format</li>
            <li><strong>Scope:</strong> Data provided by user or data processing of which is based on consent/contract</li>
            <li><strong>Format:</strong> CSV, JSON, or other standard format enabling transfer to another controller</li>
            <li><strong>Timeframe:</strong> Provided within 1 month (extendable to 3 months)</li>
            <li><strong>Cost:</strong> Free</li>
            <li><strong>Direct Transfer:</strong> Where technically feasible, data can be transmitted directly to another controller</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Object to Processing (GDPR Article 21)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Basis:</strong> Object to processing based on legitimate interests or for direct marketing</li>
            <li><strong>Marketing Communications:</strong> Can object to any processing for marketing purposes</li>
            <li><strong>Effect:</strong> KALLKEYY must cease processing unless compelling legitimate interests override</li>
            <li><strong>Timeframe:</strong> Objection processed within 1 month</li>
            <li><strong>Automated Decision-Making:</strong> Can object to profiling or solely automated decisions</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Rights Related to Automated Decision-Making (GDPR Article 22)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Right:</strong> Not to be subject to decisions based solely on automated processing with legal/significant effects</li>
            <li><strong>Examples:</strong> Automated denial of credit, personalized pricing, automated recruitment</li>
            <li><strong>Exceptions:</strong> Authorized by law, necessary for contract, based on explicit consent</li>
            <li><strong>Safeguards:</strong> Right to human review, challenge, and explanation when exception applies</li>
            <li><strong>Explanation Right:</strong> KALLKEYY must provide meaningful information about decision logic</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Lodge Complaints (GDPR Article 77)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Authority:</strong> Lodge complaint with supervisory authority (data protection authority)</li>
            <li><strong>Contact:</strong> EU residents can contact their country's data protection authority</li>
            <li><strong>Representation:</strong> Can be represented by data protection organization or attorney</li>
            <li><strong>No Retaliation:</strong> KALLKEYY cannot discriminate against users exercising rights</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            10.2 Rights Under CCPA/CPRA (For California Residents)
          </h3>
          <p className="mb-4">California residents have enhanced privacy rights:</p>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Know (CCPA §1798.100)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Right to know what personal information is collected, used, shared</li>
            <li>Right to detailed information about information practices</li>
            <li>Response timeframe: 45 days (extendable to 90 days)</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Delete (CCPA §1798.105)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Right to request deletion of personal information</li>
            <li>Exceptions: Legally required retention, fraud prevention, security</li>
            <li>Response timeframe: 45 days (extendable to 90 days)</li>
            <li>Verification: KALLKEYY may verify identity before processing</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Opt-Out of Sale or Sharing (CCPA §1798.120)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Right to opt-out of sale or sharing of personal information</li>
            <li>"Do Not Sell or Share My Personal Information" link available</li>
            <li>Opt-out applies to future sales/sharing (does not require deletion)</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Limit Use (CCPA §1798.110)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Right to limit use of sensitive personal information</li>
            <li>KALLKEYY uses sensitive data only for specified purposes</li>
            <li>Can limit to purposes reasonably necessary for service provision</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Correct (CPRA §1798.120)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Right to request correction of inaccurate personal information</li>
            <li>Response timeframe: 45 days (extendable to 90 days)</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Opt-Out of Profiling (CPRA §1798.120)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Right to opt-out of automated decision-making or profiling</li>
            <li>KALLKEYY does not engage in automated profiling with legal effects</li>
            <li>Can request limitation on use of data for profiling</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Accessibility Rights (CCPA/CPRA)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Information provided in accessible, readable format</li>
            <li>Support for voice calls for individuals unable to use written requests</li>
            <li>No discrimination against exercising privacy rights</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            10.3 Rights Under DPDP Act 2023 (India)
          </h3>
          <p className="mb-4">Once the DPDP Act comes into force, Indian users will have:</p>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Notice and Transparency (Section 5)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Clear, comprehensive notice before data collection</li>
            <li>Notice in plain language explaining purposes, recipients, retention</li>
            <li>Notice of rights available under DPDP Act</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Access (Section 8(2))
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Access to personal data held by data fiduciary</li>
            <li>Information about processing purposes and recipients</li>
            <li>Accessible format within reasonable timeframe (typically 5-7 days)</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Correction (Section 8(5))
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Request correction of inaccurate or incomplete data</li>
            <li>Data fiduciary must update records within reasonable time</li>
            <li>Notification to recipients of corrections (where practical)</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Erasure (Section 8(3))
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Request deletion of data once purpose is fulfilled</li>
            <li>General rule: Data deleted when purpose completed</li>
            <li>Exceptions: Legal obligations or contractual retention needs</li>
            <li>Notice to recipients of deletion (where practical)</li>
            <li>Timeline: Within 30 days of valid request</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Data Portability (Section 8(6))
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Obtain data in structured, commonly used format</li>
            <li>Scope: Personal data provided by user or collected through user interaction</li>
            <li>Timeline: Within 30 days</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Right to Grievance Redressal (Section 13 and draft rules)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Lodge grievance with data fiduciary's grievance officer</li>
            <li>KALLKEYY's grievance officer contact information provided below</li>
            <li>Grievance response expected within 30 days</li>
            <li>Appeal to Data Protection Board if not satisfied</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            10.4 How to Exercise Your Rights
          </h3>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Online Portal/Dashboard
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Users can manage privacy settings and exercise rights through account dashboard</li>
            <li>Self-service tools for data access, correction, withdrawal of consent</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Email Request
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Send detailed request to: <strong>support@kallkeyy.com</strong></li>
            <li>Request must include: User name, email, specific right being exercised, required information</li>
            <li>Include proof of identity (copy of ID, recent utility bill)</li>
          </ul>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Postal Request
          </h4>
          <p className="mb-4"><strong>Send to:</strong></p>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-4">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              KALLKEYY

              Attention: Data Protection Officer / Grievance Officer

              Dwarka, New Delhi 110078

              India

            </pre>
          </div>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Communication Channels
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Support and Privacy Email:</strong> support@kallkeyy.com</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            10.5 Response to Rights Requests
          </h3>
          <p className="mb-4"><strong>Verification:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>KALLKEYY will verify identity to prevent unauthorized access to data</li>
            <li>May request additional information to confirm identity</li>
            <li>Verification does not add to response timeframe</li>
          </ul>
          <p className="mb-4"><strong>Processing Timeline:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>GDPR: Within 1 month (extendable to 3 months for complex requests)</li>
            <li>CCPA/CPRA: Within 45 days (extendable to 90 days)</li>
            <li>DPDP Act: Within 30 days</li>
            <li>Timeline starts upon receipt of valid request</li>
          </ul>
          <p className="mb-4"><strong>Refusal:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>If request is refused, KALLKEYY provides clear reason for refusal</li>
            <li>Information about right to appeal or lodge complaint provided</li>
            <li>Refusal logged for audit purposes</li>
          </ul>
          <p className="mb-4"><strong>No Discrimination:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>KALLKEYY does not discriminate or retaliate against users exercising rights</li>
            <li>Users may not be denied services or charged more for exercising rights</li>
            <li>Exception: Where provision of service depends on data processing</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">12. MARKETING COMMUNICATIONS AND PREFERENCES</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            11.1 Types of Communications
          </h3>
          <p className="mb-4">KALLKEYY may communicate with users through multiple channels:</p>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Transactional Communications (No Opt-Out)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Order confirmations and receipts</li>
            <li>Shipping and delivery updates</li>
            <li>Customer support responses</li>
            <li>Account and security notifications</li>
            <li>Billing and payment information</li>
            <li>Policy updates and legal notices</li>
          </ul>
          <p className="mb-4">These communications are <strong>not</strong> marketing communications and cannot be opted out of while maintaining an account. However, users can adjust preferences for delivery method (email, SMS, etc.).</p>

          <h4 className="text-[#b90e0a] text-lg font-bold mb-2">
            Marketing Communications (Opt-In Required)
          </h4>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Promotional offers and discounts</li>
            <li>New product launches and collections</li>
            <li>Newsletter and editorial content</li>
            <li>Seasonal sales and special events</li>
            <li>Personalized product recommendations</li>
            <li>Fashion tips and style guides</li>
            <li>Blog posts and content updates</li>
            <li>Abandoned cart reminders</li>
            <li>Customer loyalty program updates</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            11.2 Consent and Opt-In
          </h3>
          <p className="mb-4"><strong>Explicit Opt-In Requirements:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Marketing consent is obtained separately from transactional consent</li>
            <li>Pre-checked consent boxes are NOT permitted</li>
            <li>Users must actively and affirmatively opt-in</li>
            <li>Consent is specific to each type of communication</li>
          </ul>
          <p className="mb-4"><strong>Timing of Consent:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Consent obtained at account signup (optional)</li>
            <li>Consent obtained at checkout (optional)</li>
            <li>Consent obtained via newsletter signup</li>
            <li>Consent can be provided through marketing preference center</li>
          </ul>
          <p className="mb-4"><strong>Record Keeping:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Timestamp of consent recorded (date, time)</li>
            <li>Method of consent recorded (email, web form, account preference)</li>
            <li>Content of consent offer recorded</li>
            <li>User identity confirmed and recorded</li>
            <li>Records maintained for audit purposes (minimum 3 years)</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            11.3 Opt-Out and Preference Management
          </h3>
          <p className="mb-4"><strong>Easy Opt-Out Options:</strong></p>
          <p className="mb-4">1. <strong>Email Communications:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Click "Unsubscribe" link in footer of email</li>
            <li>Update preferences in account settings</li>
            <li>Email support@kallkeyy.com with "Unsubscribe" request</li>
            <li>Response within 5 business days</li>
          </ul>
          <p className="mb-4">2. <strong>SMS Communications:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Reply "STOP" to SMS message</li>
            <li>Update SMS preferences in account settings</li>
            <li>Email support@kallkeyy.com with SMS opt-out request</li>
            <li>Opt-out processed within 24 hours</li>
          </ul>
          <p className="mb-4">3. <strong>Push Notifications:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Disable in app or browser notification settings</li>
            <li>Update notification preferences in account settings</li>
            <li>Contact support@kallkeyy.com for assistance</li>
          </ul>
          <p className="mb-4">4. <strong>Preference Center:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Granular controls for each communication type</li>
            <li>Accessible via account settings or link in emails</li>
            <li>Real-time updates to preferences</li>
          </ul>
          <p className="mb-4"><strong>Granular Preferences:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Users can select specific communication types (newsletters, promotions, product updates)</li>
            <li>Users can select frequency (daily, weekly, monthly)</li>
            <li>Users can select communication channel (email, SMS, push)</li>
            <li>Users can create custom preference combinations</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            11.4 Unsubscribe Processing
          </h3>
          <p className="mb-4"><strong>Timeline:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Email unsubscribes: Processed within 5 business days</li>
            <li>SMS opt-outs: Processed within 24 hours</li>
            <li>Push notification opt-outs: Immediate</li>
          </ul>
          <p className="mb-4"><strong>Confirmation:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Confirmation sent when unsubscribe processed</li>
            <li>Final marketing email confirming unsubscribe may be sent</li>
            <li>User should not receive further marketing communications after opt-out</li>
          </ul>
          <p className="mb-4"><strong>Transactional Emails:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Unsubscribe from marketing does NOT affect transactional emails</li>
            <li>Transactional emails continue (order updates, support responses, etc.)</li>
            <li>Users cannot opt out of transactional communications</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            11.5 Marketing Compliance
          </h3>
          <p className="mb-4"><strong>CAN-SPAM Compliance (USA):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Clear sender identification in marketing emails</li>
            <li>Accurate subject lines that describe content</li>
            <li>Physical mailing address included in emails</li>
            <li>Unsubscribe link in footer of each email</li>
            <li>Processing of opt-out requests within 10 business days</li>
          </ul>
          <p className="mb-4"><strong>GDPR Compliance (EU):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Prior explicit opt-in before marketing communications</li>
            <li>Double opt-in (confirmation email) where required by national law</li>
            <li>Clear identification of KALLKEYY as sender</li>
            <li>Easy opt-out mechanism in every communication</li>
          </ul>
          <p className="mb-4"><strong>CCPA Compliance (California):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Opt-out options provided for behavioral advertising</li>
            <li>Compliance with Global Privacy Control (GPC) signals</li>
            <li>Disclosure of data categories collected for marketing</li>
            <li>Respect for opt-out signals across marketing channels</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">13. INTERNATIONAL DATA TRANSFERS</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            12.1 Cross-Border Data Transfer Challenges
          </h3>
          <p className="mb-4">KALLKEYY operates an international business with customers and operations in multiple jurisdictions. Personal data may be transferred across borders for:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Service provision and order fulfillment</li>
            <li>Third-party service providers operating globally</li>
            <li>Cloud infrastructure located outside India</li>
          </ul>
          <p className="mb-4">International data transfers present regulatory challenges because different countries have different data protection standards.</p>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            12.2 Data Transfer for EU-based Users (GDPR Transfers)
          </h3>
          <p className="mb-4"><strong>Transfer Mechanism: Standard Contractual Clauses (SCCs)</strong></p>
          <p className="mb-4">KALLKEYY uses <strong>Standard Contractual Clauses (SCCs)</strong> approved by the European Commission as the primary mechanism for transferring personal data from the EU to third countries (including India).</p>
          <p className="mb-4"><strong>SCCs include:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Contractual obligations to maintain GDPR-equivalent data protection</li>
            <li>Processor commitments to protect data against unauthorized access</li>
            <li>Data subject rights preserved (access, rectification, erasure, portability)</li>
            <li>Restrictions on sub-processing without permission</li>
            <li>Assistance with data subject rights requests</li>
            <li>Assistance with data protection impact assessments</li>
            <li>Breach notification obligations</li>
          </ul>
          <p className="mb-4"><strong>Supplementary Safeguards:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data minimization principles applied to transferred data</li>
            <li>Encryption of sensitive data in transit and at rest</li>
            <li>Limited duration of international transfers</li>
            <li>Local storage in AWS India region where feasible</li>
            <li>Regular security audits of transfer mechanisms</li>
          </ul>
          <p className="mb-4"><strong>Adequacy Assessment:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>KALLKEYY conducts transfer risk assessments as required under Schrems II ruling</li>
            <li>Assessment considers:</li>
            <li>Legal environment in receiving country</li>
            <li>Surveillance laws and government access potential</li>
            <li>Data subject rights in receiving country</li>
            <li>Existence of mutual legal assistance treaties</li>
            <li>Company's contractual obligations and security measures</li>
            <li>Supplementary safeguards implemented where gaps identified</li>
            <li>Assessment documented and updated annually</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            12.3 Data Transfer to Third-Country Service Providers
          </h3>
          <p className="mb-4"><strong>Service Providers Requiring International Data Transfer:</strong></p>
          <p className="mb-4">1. <strong>Razorpay (Payment Processing):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data transferred to Razorpay's global servers</li>
            <li>Protected by Razorpay's Data Processing Agreement (DPA)</li>
            <li>Razorpay certified under multiple compliance frameworks</li>
            <li>Data minimization applied (only payment information transferred)</li>
          </ul>
          <p className="mb-4">2. <strong>Meta/Facebook Ads:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Pixel-tracked data transferred to Meta servers (USA)</li>
            <li>Protected by Meta's Standard Contractual Clauses</li>
            <li>Data transferred for advertising purposes only</li>
            <li>Users can opt-out through privacy settings</li>
          </ul>
          <p className="mb-4">3. <strong>Google Analytics:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Browsing behavior data transferred to Google servers (global)</li>
            <li>Protected by Google's Data Processing Agreement</li>
            <li>Data anonymization applied where possible</li>
            <li>Users can opt-out through browser settings</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            12.4 Restrictions and User Rights Regarding Transfers
          </h3>
          <p className="mb-4"><strong>User Control:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Users can request no international transfer of data where legally possible</li>
            <li>Certain services cannot function without international transfer</li>
            <li>Users can opt-out of analytics/advertising that requires international transfer</li>
          </ul>
          <p className="mb-4"><strong>Impact on Services:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Refusing international transfer may limit service availability</li>
            <li>Some order fulfillment may not be possible without transfer to logistics partners</li>
            <li>Marketing and analytics functions will be unavailable</li>
          </ul>
          <p className="mb-4"><strong>Transparency:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>All international transfers disclosed in this Policy</li>
            <li>Purpose and recipients clearly identified</li>
            <li>User can request additional information about specific transfers</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">14. CHILDREN'S PRIVACY AND PROTECTIONS</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            13.1 Age Restrictions
          </h3>
          <p className="mb-4"><strong>KALLKEYY's Policy:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>The Platform is <strong>not intended for users under 18 years of age</strong></li>
            <li>Users under 18 should not create accounts or provide personal information</li>
            <li>Parental consent required for users under 18 in certain jurisdictions</li>
          </ul>
          <p className="mb-4"><strong>Age Verification:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>While KALLKEYY does not implement technical age verification</li>
            <li>False representation of age in account creation violates Terms of Service</li>
            <li>KALLKEYY reserves right to request proof of age</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            13.2 Children's Data Protection (If Inadvertently Collected)
          </h3>
          <p className="mb-4">Should KALLKEYY become aware that personal data of a child under 18 (or under age of digital consent in applicable jurisdiction) has been collected:</p>
          <p className="mb-4"><strong>Immediate Actions:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Verify child's age and parental consent status</li>
            <li>Obtain verifiable parental consent if data was collected without it</li>
            <li>Restrict processing to what is necessary</li>
            <li>Delete non-essential data</li>
          </ul>
          <p className="mb-4"><strong>Parental Rights:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Parents/guardians can request information about child's data</li>
            <li>Parents can request deletion of child's account and data</li>
            <li>Parents can restrict processing of child's data</li>
            <li>KALLKEYY will comply with parental requests regarding children's data</li>
          </ul>
          <p className="mb-4"><strong>EU GDPR (Digital Age of Consent):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>In EU, age of digital consent varies by country (13-16 years)</li>
            <li>Users under age of digital consent in their country cannot consent independently</li>
            <li>Parental consent required for users below age threshold</li>
            <li>KALLKEYY may request verification of parental consent</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            13.3 Prohibited Data and Minimization for Children
          </h3>
          <p className="mb-4">If data from individuals under 18 is lawfully collected:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>No collection of sensitive personal data (biometric, health, etc.)</li>
            <li>No collection of explicit content or illegal activity data</li>
            <li>Minimal data collection (only what is necessary)</li>
            <li>No profiling or automated decision-making</li>
            <li>No use of children's data for marketing/advertising</li>
            <li>Extra security protections applied</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            13.4 Parental Notice and Involvement
          </h3>
          <p className="mb-4"><strong>If Child's Account Detected:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Parental notification sent to email/address on file</li>
            <li>Opportunity for parent to contact KALLKEYY</li>
            <li>Parental consent sought within specified timeframe</li>
            <li>Account restricted or deleted if consent not obtained</li>
          </ul>
          <p className="mb-4"><strong>Contacting KALLKEYY About Children's Data:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Parents concerned about child's account should contact: <strong>support@kallkeyy.com</strong></li>
            <li>Include child's name, email, account details</li>
            <li>Request will be processed within 5 business days</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">15. THIRD-PARTY WEBSITES AND LINKS</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            14.1 External Links and Third-Party Websites
          </h3>
          <p className="mb-4">The Platform may contain links to third-party websites, including:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Social media platforms (Instagram, Facebook, TikTok, YouTube)</li>
            <li>E-commerce marketplaces (if KALLKEYY operates on third-party platforms)</li>
            <li>Payment processors and financial institutions</li>
            <li>Shipping and logistics platforms</li>
            <li>Content providers and publishers</li>
            <li>Affiliate and partner websites</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            14.2 KALLKEYY's Non-Responsibility
          </h3>
          <p className="mb-4"><strong>Important Notice:</strong></p>
          <p className="mb-4">KALLKEYY is <strong>not responsible for</strong> the privacy practices, content, or policies of third-party websites. Each third-party website:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Operates under its own privacy policy</li>
            <li>Collects and processes data independently</li>
            <li>May not comply with KALLKEYY's privacy standards</li>
            <li>May share or sell data to other parties</li>
            <li>May use cookies and tracking technologies differently</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            14.3 Third-Party Privacy Policies
          </h3>
          <p className="mb-4"><strong>Users Should Review:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Facebook/Meta Privacy Policy: facebook.com/privacy</li>
            <li>Google Privacy Policy: google.com/policies/privacy</li>
            <li>Instagram Privacy Policy: instagram.com/privacy</li>
            <li>YouTube Privacy Policy: youtube.com/privacy</li>
            <li>Razorpay Privacy Policy: razorpay.com/privacy</li>
            <li>Shiprocket Privacy Policy: shiprocket.in/privacy-policy</li>
            <li>AWS Privacy Policy: aws.amazon.com/privacy</li>
          </ul>
          <p className="mb-4"><strong>Users are encouraged to:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Read third-party privacy policies before sharing information</li>
            <li>Understand their data collection and use practices</li>
            <li>Review their opt-out and privacy control options</li>
            <li>Contact third parties directly with privacy questions</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            14.4 Social Media Integration
          </h3>
          <p className="mb-4">If KALLKEYY integrates with social media platforms (social login, social sharing, social pixels):</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data shared with social platforms governed by their privacy policies</li>
            <li>KALLKEYY cannot control social platform data practices</li>
            <li>Users should review social platform privacy settings</li>
            <li>Pixel data sharing can be disabled through browser/privacy settings</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">16. AUTOMATED DECISION-MAKING AND PROFILING</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            15.1 Current Practices
          </h3>
          <p className="mb-4"><strong>KALLKEYY's Position:</strong></p>
          <p className="mb-4">Currently, KALLKEYY <strong>does not</strong> engage in:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Automated decision-making with legal or similarly significant effects</li>
            <li>Sole reliance on automated profiling for consequential decisions</li>
            <li>Automated decisions that result in service denial or significant impacts</li>
            <li>Automated credit decisions or financial determinations</li>
            <li>Automated hiring or employment decisions</li>
          </ul>
          <p className="mb-4"><strong>Where Automation is Used:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Personalized product recommendations (marketing, not consequential)</li>
            <li>Marketing segmentation and audience building (legitimate business interest)</li>
            <li>Fraud detection and prevention (legitimate security interest)</li>
            <li>Order routing and fulfillment optimization (operational, not consequential)</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            15.2 Profiling and Personalization
          </h3>
          <p className="mb-4"><strong>Profiling Activities:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Analyzing browsing history to predict product interests</li>
            <li>Categorizing customers into marketing segments</li>
            <li>Building lookalike audiences for advertising</li>
            <li>Predicting likelihood of engagement with content</li>
            <li>Identifying preferred products based on purchase history</li>
          </ul>
          <p className="mb-4"><strong>Use of Profiles:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Marketing:</strong> Showing relevant products in emails and ads</li>
            <li><strong>Personalization:</strong> Customizing homepage and product recommendations</li>
            <li><strong>Analytics:</strong> Understanding customer preferences and trends</li>
            <li><strong>Fraud Detection:</strong> Identifying suspicious patterns (not automated decision)</li>
          </ul>
          <p className="mb-4"><strong>User Control:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Users can opt-out of marketing cookies</li>
            <li>Users can manage marketing preferences</li>
            <li>Users can disable personalized recommendations</li>
            <li>Opting out does not affect core services</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            15.3 Machine Learning and Algorithmic Decision-Making
          </h3>
          <p className="mb-4"><strong>Future Considerations:</strong></p>
          <p className="mb-4">If KALLKEYY implements automated decision-making systems in future, the following protections will apply:</p>
          <p className="mb-4"><strong>GDPR Article 22 Compliance:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Automated decisions with legal/significant effects prohibited</li>
            <li>Exception: Necessary for contract performance, authorized by law, or explicit consent</li>
            <li>If exception applies: Safeguards include:</li>
            <li>Right to human review of decision</li>
            <li>Right to provide perspective on automated decision</li>
            <li>Right to challenge and contest decision</li>
            <li>Provision of meaningful explanation about decision logic</li>
          </ul>
          <p className="mb-4"><strong>Explainability:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Meaningful information provided about algorithmic logic</li>
            <li>Explanation accessible and understandable (not technical jargon)</li>
            <li>Information about input data and decision factors</li>
            <li>Information about how to challenge the decision</li>
          </ul>
          <p className="mb-4"><strong>Bias and Fairness:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Systems tested for discriminatory bias</li>
            <li>Algorithms audited for fairness and non-discrimination</li>
            <li>Human oversight of automated systems</li>
            <li>Regular review and updates to prevent bias</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            15.4 Opt-Out and Appeal Rights
          </h3>
          <p className="mb-4"><strong>Opt-Out of Profiling:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Users can request to opt-out of profiling for marketing (if technically feasible)</li>
            <li>Opt-out request submitted via support@kallkeyy.com</li>
            <li>Processing without profiling may result in less personalized experience</li>
          </ul>
          <p className="mb-4"><strong>Appeal of Automated Decisions:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Users can request human review of any automated decision</li>
            <li>Appeal submitted with explanation of why user disagrees</li>
            <li>Human decision-maker reviews appeal within 30 days</li>
            <li>KALLKEYY will not solely rely on automated decision if appealed</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">17. LEGAL COMPLIANCE AND DISCLOSURE</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            16.1 Legal Requests and Law Enforcement
          </h3>
          <p className="mb-4"><strong>Circumstances for Disclosure:</strong></p>
          <p className="mb-4">KALLKEYY may disclose personal information to government agencies, law enforcement, or courts when:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li><strong>Court Orders:</strong> Subpoena, search warrant, court injunction, or other judicial process</li>
            <li><strong>Legal Investigation:</strong> Law enforcement investigation into criminal activity</li>
            <li><strong>Regulatory Compliance:</strong> Request from regulatory agency or government body</li>
            <li><strong>National Security:</strong> Request related to national security or public safety</li>
            <li><strong>Protection of Rights:</strong> Necessary to protect KALLKEYY's legal rights or property</li>
            <li><strong>Protection of Safety:</strong> Necessary to protect safety of users or public</li>
            <li><strong>Prevention of Harm:</strong> Prevention or investigation of suspected fraud or illegal activity</li>
            <li><strong>Legal Obligation:</strong> Required by applicable law or regulation</li>
          </ul>
          <p className="mb-4"><strong>Verification and Notification:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>KALLKEYY verifies legitimacy of legal request before disclosing data</li>
            <li>KALLKEYY provides only minimum data necessary to satisfy request</li>
            <li>Where legally permitted, KALLKEYY notifies affected users of request</li>
            <li>KALLKEYY preserves right to challenge improper requests</li>
            <li>Record maintained of all legal requests and disclosures</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            16.2 Disclosure in Business Transactions
          </h3>
          <p className="mb-4"><strong>Mergers, Acquisitions, and Bankruptcy:</strong></p>
          <p className="mb-4">If KALLKEYY is involved in merger, acquisition, bankruptcy, or similar business transaction:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Personal data may be transferred as business asset</li>
            <li>Users will be notified of change in control or data transfer</li>
            <li>Acquiring entity must assume privacy obligations</li>
            <li>Users may have opportunity to opt-out</li>
            <li>Transaction conducted in accordance with data protection laws</li>
          </ul>
          <p className="mb-4"><strong>Specifically:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data disclosed to potential acquirers for due diligence (subject to NDAs)</li>
            <li>Data transferred to acquiring entity upon transaction completion</li>
            <li>Users notified of new entity's contact information and privacy practices</li>
            <li>Acquiring entity must honor existing user privacy preferences</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            16.3 De-Identified and Aggregated Information
          </h3>
          <p className="mb-4"><strong>De-Identified Data Disclosure:</strong></p>
          <p className="mb-4">KALLKEYY may disclose anonymized or aggregated data (not subject to privacy regulations) for:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Academic research and studies</li>
            <li>Business intelligence and market research</li>
            <li>Benchmarking and industry analysis</li>
            <li>Statistical analysis and reporting</li>
            <li>Public health research (if applicable)</li>
          </ul>
          <p className="mb-4">De-identified data contains no personally identifying information and cannot be linked back to individuals.</p>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">18. LEGAL COMPLIANCE OBLIGATIONS</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            17.1 Compliance Framework
          </h3>
          <p className="mb-4">KALLKEYY is committed to compliance with all applicable laws and maintains internal processes to ensure adherence to:</p>
          <p className="mb-4"><strong>Compliance Areas:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data protection and privacy laws (GDPR, DPDP Act, CCPA, SPDI Rules)</li>
            <li>Consumer protection and e-commerce laws</li>
            <li>Anti-discrimination and fair practices regulations</li>
            <li>Payment card industry standards (PCI DSS)</li>
            <li>Cybersecurity and data security regulations</li>
            <li>Tax and financial reporting requirements</li>
            <li>Anti-money laundering (AML) and Know Your Customer (KYC) requirements</li>
            <li>Children's privacy protections</li>
            <li>Marketing and advertising regulations</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            17.2 Data Protection by Design and by Default
          </h3>
          <p className="mb-4">KALLKEYY implements privacy by design principles:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Privacy considered at all stages of system development</li>
            <li>Privacy impact assessments conducted before new processing</li>
            <li>Data minimization built into systems</li>
            <li>Default privacy-protective settings</li>
            <li>Privacy training for all employees</li>
            <li>Regular privacy and security audits</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            17.3 Data Protection Impact Assessments (DPIA)
          </h3>
          <p className="mb-4">KALLKEYY conducts Data Protection Impact Assessments for:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>New data processing activities</li>
            <li>Significant changes to existing processing</li>
            <li>High-risk processing activities</li>
            <li>Automated decision-making systems</li>
            <li>Large-scale data collection</li>
            <li>International data transfers</li>
          </ul>
          <p className="mb-4">DPIAs document:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Processing purposes and necessity</li>
            <li>Data categories and retention</li>
            <li>Recipients and transfers</li>
            <li>Risks to data subjects</li>
            <li>Mitigation measures</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">19. DATA BREACH NOTIFICATION AND INCIDENT MANAGEMENT</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            18.1 Data Breach Definition
          </h3>
          <p className="mb-4">A "<strong>Data Breach</strong>" is an unauthorized, accidental, or unlawful event resulting in:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Unauthorized access to personal data</li>
            <li>Unauthorized processing of personal data</li>
            <li>Accidental or unlawful destruction of personal data</li>
            <li>Accidental or unlawful loss of personal data</li>
            <li>Accidental or unlawful alteration of personal data</li>
            <li>Disclosure of personal data to unauthorized parties</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            18.2 Breach Response Procedure
          </h3>
          <p className="mb-4"><strong>Discovery Phase:</strong></p>
          <p className="mb-4">1. Breach detected through monitoring systems, user reports, or third-party notification</p>
          <p className="mb-4">2. Incident severity assessed</p>
          <p className="mb-4">3. Affected systems isolated to prevent further unauthorized access</p>
          <p className="mb-4">4. Evidence preserved for forensic analysis</p>
          <p className="mb-4">5. Incident response team activated</p>
          <p className="mb-4"><strong>Containment Phase:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Unauthorized access stopped and systems secured</li>
            <li>Affected systems taken offline if necessary</li>
            <li>Access credentials and credentials changed</li>
            <li>Malware/vulnerabilities remediated</li>
            <li>Security patches applied</li>
          </ul>
          <p className="mb-4"><strong>Assessment Phase:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Full investigation of breach scope and timeline</li>
            <li>Data categories affected identified</li>
            <li>Number of data subjects affected determined</li>
            <li>Likelihood and severity of risk to data subjects assessed</li>
            <li>Notification obligations evaluated</li>
          </ul>
          <p className="mb-4"><strong>Notification Phase:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Affected individuals notified as required by law</li>
            <li>Regulatory authorities notified (within 72 hours for GDPR)</li>
            <li>Potentially affected third parties notified (e.g., payment processors)</li>
            <li>Notification includes:</li>
            <li>Nature of breach and affected data</li>
            <li>Measures taken to mitigate breach</li>
            <li>KALLKEYY contact information</li>
            <li>Guidance on protective measures individuals can take</li>
            <li>Notification to supervisory authority (if applicable)</li>
          </ul>
          <p className="mb-4"><strong>Remediation Phase:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Corrective measures implemented to prevent recurrence</li>
            <li>System security reviewed and enhanced</li>
            <li>Staff training conducted</li>
            <li>Policies and procedures updated</li>
            <li>Post-incident review conducted</li>
            <li>Lessons learned documented</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            18.3 Notification Timelines and Recipients
          </h3>
          <p className="mb-4"><strong>GDPR Notification Requirements (for EU-based users):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Supervisory Authority: Within 72 hours of discovery</li>
            <li>Affected Individuals: Without undue delay (typically within 30 days)</li>
            <li>Notification required only if breach poses risk to rights/freedoms</li>
          </ul>
          <p className="mb-4"><strong>CCPA/CPRA Notification (for California residents):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>California Attorney General: If breach affects 500+ California residents</li>
            <li>Affected Individuals: Without unreasonable delay, typically within 30 days</li>
          </ul>
          <p className="mb-4"><strong>India Notification (DPDP Act, once enforced):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Data Protection Board: Notification as required by rules</li>
            <li>Affected Individuals: Notification of material breach with guidance on protective measures</li>
          </ul>
          <p className="mb-4"><strong>Other Considerations:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Media notification if breach is widespread or high-profile</li>
            <li>Business partner notification (if their data affected)</li>
            <li>Notification in language native to data subjects</li>
            <li>Contact information provided for questions and support</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            18.4 User Support After Breach
          </h3>
          <p className="mb-4"><strong>Offered Support:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Free identity theft monitoring (if applicable)</li>
            <li>Credit monitoring (if financial information breached)</li>
            <li>Guidance on password changes and account security</li>
            <li>Information about legal rights and remedies</li>
            <li>KALLKEYY contact dedicated to breach inquiries</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">20. JURISDICTION, GOVERNING LAW, AND DISPUTE RESOLUTION</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            19.1 Governing Law
          </h3>
          <p className="mb-4"><strong>This Privacy Policy is governed by and construed in accordance with the laws of India</strong>, specifically:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>The Information Technology Act, 2000</li>
            <li>The Digital Personal Data Protection Act, 2023 (upon enforcement)</li>
            <li>The Consumer Protection Act, 2019</li>
            <li>The E-commerce Rules, 2020</li>
            <li>All other applicable laws of India</li>
          </ul>
          <p className="mb-4"><strong>International Compliance:</strong></p>
          <p className="mb-4">For users subject to international privacy laws (GDPR, CCPA, etc.), those laws apply in addition to Indian law, and in case of conflict, the more protective provision applies.</p>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            19.2 Jurisdiction and Venue
          </h3>
          <p className="mb-4"><strong>Forum Selection:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Any disputes arising from this Privacy Policy shall be subject to <strong>exclusive jurisdiction of courts located in New Delhi, India</strong></li>
            <li>Users consent to personal jurisdiction in Delhi courts</li>
            <li>Users waive right to challenge venue in Delhi courts</li>
          </ul>
          <p className="mb-4"><strong>Arbitration Clause (Optional - if included in Terms of Service):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Disputes may be resolved through binding arbitration as specified in Terms of Service</li>
            <li>Arbitration conducted in Delhi, India</li>
            <li>Conducted under Rules of Arbitration (specify rules)</li>
            <li>Arbitrator's decision is final and binding</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            19.3 Severability
          </h3>
          <p className="mb-4">If any provision of this Privacy Policy is found to be invalid or unenforceable:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Remaining provisions continue in full force and effect</li>
            <li>Invalid provision severed or reformed to minimum extent necessary</li>
            <li>Intent of Privacy Policy preserved to maximum extent possible</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            19.4 Conflict of Laws
          </h3>
          <p className="mb-4">In case of conflict between:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>This Privacy Policy and applicable law: More protective provision applies</li>
            <li>GDPR requirements and Indian law: Both apply (more protective prevails)</li>
            <li>CCPA requirements and Indian law: Both apply (more protective prevails)</li>
            <li>DPDP Act requirements and previous standards: DPDP Act applies upon enforcement</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">21. POLICY UPDATES AND MODIFICATIONS</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            20.1 Right to Update Policy
          </h3>
          <p className="mb-4">KALLKEYY reserves the right to modify or update this Privacy Policy at any time, in its sole discretion, to:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Reflect changes in legal or regulatory requirements</li>
            <li>Respond to new privacy or security threats</li>
            <li>Improve service functionality or user experience</li>
            <li>Clarify existing provisions</li>
            <li>Implement new business practices or processing activities</li>
            <li>Comply with guidance from regulatory authorities</li>
            <li>Address user feedback or concerns</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            20.2 Notification of Changes
          </h3>
          <p className="mb-4"><strong>Mechanism for Notification:</strong></p>
          <p className="mb-4">1. Updated policy posted on the Platform with "Last Updated" date</p>
          <p className="mb-4">2. Material changes to privacy practices announced via:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Email notification to registered users (for significant changes)</li>
            <li>Prominent banner on website (for 30 days)</li>
            <li>In-app notification (if applicable)</li>
            <li>Social media announcement</li>
          </ul>
          <p className="mb-4"><strong>Material Changes vs. Non-Material Changes:</strong></p>
          <p className="mb-4"><strong>Material Changes requiring explicit notice:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Changes to data collection practices</li>
            <li>Changes to processing purposes</li>
            <li>Addition of new third-party recipients</li>
            <li>Changes to data retention periods</li>
            <li>Changes to user rights or how to exercise them</li>
            <li>Changes to security practices</li>
            <li>Changes to international data transfers</li>
            <li>Any change materially impacting user privacy</li>
          </ul>
          <p className="mb-4"><strong>Non-Material Changes (updated without explicit notice):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Clarification of existing language</li>
            <li>Correction of grammatical errors</li>
            <li>Addition of examples clarifying existing practices</li>
            <li>Removal of outdated or superseded provisions</li>
            <li>Administrative or organizational updates</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            20.3 User Acceptance of Changes
          </h3>
          <p className="mb-4"><strong>Continued Use Implies Acceptance:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Users who continue using the Platform after 30-day notice period are deemed to accept updated Policy</li>
            <li>Users who disagree with changes should discontinue use of Platform</li>
            <li>No additional acceptance or click-through required for non-material changes</li>
          </ul>
          <p className="mb-4"><strong>Material Changes - Additional Steps:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>For material changes, users may be asked to affirmatively consent or acknowledge</li>
            <li>If users do not agree to material changes, they can close their account</li>
            <li>Grace period provided (typically 30-60 days) to allow account closure</li>
          </ul>
          <p className="mb-4"><strong>Archival of Previous Policies:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Previous versions of Privacy Policy maintained in archives</li>
            <li>Users can access historical versions upon request</li>
            <li>Email support@kallkeyy.com to request previous version</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            20.4 Effective Date of Changes
          </h3>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Changes become effective on date specified (typically 30 days after posting)</li>
            <li>If users use Platform after effective date, they consent to updated Policy</li>
            <li>"Last Updated" date prominently displayed on Policy</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">22. CONTACT INFORMATION AND GRIEVANCE REDRESSAL</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            21.1 Primary Contact for Privacy Matters
          </h3>
          <p className="mb-4"><strong>For general privacy questions, data subject rights requests, or privacy concerns:</strong></p>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-4">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              Privacy Officer

              KALLKEYY

              Email: support@kallkeyy.com

            </pre>
          </div>
          <p className="mb-4"><strong>Response Time:</strong> Within 5-7 business days for acknowledgment; detailed response within 15-30 days depending on complexity.</p>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            21.2 Customer Support for General Inquiries
          </h3>
          <p className="mb-4"><strong>For general customer service, orders, or account issues:</strong></p>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-4">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              Customer Support

              KALLKEYY

              Email: support@kallkeyy.com

              Phone/WhatsApp: [To be added]

              Response Time: Within 24-48 hours

            </pre>
          </div>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            21.3 Grievance Officer and Complaint Resolution
          </h3>
          <p className="mb-4"><strong>For formal grievances, complaints, or unresolved privacy issues:</strong></p>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-4">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              Grievance Officer

              KALLKEYY

              Dwarka, New Delhi 110078

              India

              

              Postal Address:

              KALLKEYY

              [Specific address to be provided]

              Dwarka, Delhi 110078

            </pre>
          </div>
          <p className="mb-4"><strong>Grievance Resolution Process:</strong></p>
          <p className="mb-4">1. <strong>Acknowledgment:</strong> Grievance acknowledged within 2 business days</p>
          <p className="mb-4">2. <strong>Investigation:</strong> Grievance investigated within 7-14 days</p>
          <p className="mb-4">3. <strong>Resolution:</strong> Response provided within 30 days from receipt</p>
          <p className="mb-4">4. <strong>Appeal:</strong> If unsatisfied, appeal to supervisory authority or data protection authority</p>
          <p className="mb-4"><strong>Information to Include in Grievance:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Your name and contact information</li>
            <li>Account details or order information</li>
            <li>Description of grievance or complaint</li>
            <li>What resolution you seek</li>
            <li>Relevant documentation or evidence</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            21.4 Escalation and Appeals
          </h3>
          <p className="mb-4"><strong>If Unsatisfied with KALLKEYY's Response:</strong></p>
          <p className="mb-4"><strong>For EU Users (GDPR):</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Lodge complaint with supervisory authority</li>
            <li>Contact your country's Data Protection Authority</li>
            <li>Example: In UK, contact Information Commissioner's Office (ico.org.uk)</li>
            <li>Example: In Germany, contact BfDI (bfdi.bund.de)</li>
          </ul>
          <p className="mb-4"><strong>For India Users:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Once Data Protection Board established under DPDP Act, file complaint with Board</li>
            <li>Details and procedure will be updated in this Policy upon Board's establishment</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            21.5 Third-Party Service Provider Contacts
          </h3>
          <p className="mb-4"><strong>If complaint relates to third-party data processing:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-2">
            <li><strong>Razorpay (Payments):</strong> Contact: support@razorpay.com | Website: <a href="https://razorpay.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#b90e0a] hover:underline">razorpay.com/privacy</a></li>
            <li><strong>Shiprocket (Logistics):</strong> Contact: support@shiprocket.in | Website: <a href="https://shiprocket.in/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#b90e0a] hover:underline">shiprocket.in/privacy-policy</a></li>
            <li><strong>Google Analytics:</strong> Contact: <a href="https://support.google.com/analytics" target="_blank" rel="noopener noreferrer" className="text-[#b90e0a] hover:underline">support.google.com/analytics</a> | Website: <a href="https://google.com/policies/privacy" target="_blank" rel="noopener noreferrer" className="text-[#b90e0a] hover:underline">google.com/policies/privacy</a></li>
            <li><strong>Meta/Facebook:</strong> Contact: <a href="https://facebook.com/help" target="_blank" rel="noopener noreferrer" className="text-[#b90e0a] hover:underline">facebook.com/help</a> | Website: <a href="https://facebook.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#b90e0a] hover:underline">facebook.com/privacy</a></li>
            <li><strong>AWS (Hosting):</strong> Contact: <a href="https://support.aws.amazon.com" target="_blank" rel="noopener noreferrer" className="text-[#b90e0a] hover:underline">support.aws.amazon.com</a> | Website: <a href="https://aws.amazon.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#b90e0a] hover:underline">aws.amazon.com/privacy</a></li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">23. ACKNOWLEDGMENT AND CONSENT</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            22.1 Express Acknowledgment
          </h3>
          <p className="mb-4"><strong>By accessing, browsing, or using the KALLKEYY Platform in any manner, you explicitly acknowledge and confirm that:</strong></p>
          <p className="mb-4">1. <strong>You have read this entire Privacy Policy</strong> in its entirety and understand all provisions</p>
          <p className="mb-4">2. <strong>You understand how KALLKEYY collects, processes, and uses personal data</strong>, including:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>The types of data collected</li>
            <li>The purposes for collection</li>
            <li>How data is shared with third parties</li>
            <li>How long data is retained</li>
            <li>What cookies and tracking technologies are used</li>
          </ul>
          <p className="mb-4">3. <strong>You consent to all data processing described in this Policy</strong>, including:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Collection of personal information</li>
            <li>Processing and use of data</li>
            <li>Sharing with third-party service providers</li>
            <li>Placement of cookies and tracking technologies</li>
            <li>International transfer of data (where applicable)</li>
            <li>Automated analytics and profiling (for marketing purposes)</li>
            <li>Marketing communications (unless opted out)</li>
          </ul>
          <p className="mb-4">4. <strong>You understand your privacy rights</strong> and how to exercise them, including:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Right to access your data</li>
            <li>Right to correct inaccurate data</li>
            <li>Right to request deletion</li>
            <li>Right to opt-out of marketing</li>
            <li>Right to withdraw consent</li>
            <li>Right to lodge complaints</li>
          </ul>
          <p className="mb-4">5. <strong>You assume responsibility for your own data security</strong>, including:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Maintaining strong, unique passwords</li>
            <li>Not sharing account credentials</li>
            <li>Keeping devices secure</li>
            <li>Reporting suspicious activity immediately</li>
            <li>Understanding inherent risks of internet transmission</li>
          </ul>
          <p className="mb-4">6. <strong>You are not a child under the age of digital consent</strong> in your jurisdiction</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>If under 18, you have obtained parental/guardian consent</li>
            <li>You represent that you have authority to provide consent</li>
          </ul>
          <p className="mb-4">7. <strong>You agree to provide accurate and truthful information</strong> when using the Platform</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>You will not impersonate others</li>
            <li>You will not provide false or misleading information</li>
            <li>You understand consequences of providing inaccurate data</li>
          </ul>
          <p className="mb-4">8. <strong>You understand this Policy may be updated</strong>, and:</p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Continued use of Platform indicates acceptance of updated Policy</li>
            <li>You have right to review updated Policy before using Platform</li>
            <li>Material changes will be communicated (30-day notice typically provided)</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            22.2 Acceptance for Continued Use
          </h3>
          <p className="mb-4"><strong>To continue using the Platform after viewing this Privacy Policy, you must:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Affirmatively accept this Privacy Policy through any provided acceptance mechanism</li>
            <li>OR continue using the Platform (continued use implies acceptance)</li>
            <li>OR create an account or make a purchase (taking action implies consent)</li>
          </ul>
          <p className="mb-4"><strong>If you do not accept these terms:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Immediately stop using the Platform</li>
            <li>Do not create an account</li>
            <li>Do not submit personal information</li>
            <li>Contact support@kallkeyy.com if you have questions</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            22.3 Changes in Circumstances
          </h3>
          <p className="mb-4"><strong>If your circumstances change:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Update your account information promptly</li>
            <li>Modify your privacy preferences as needed</li>
            <li>Notify KALLKEYY of changes in consent status</li>
            <li>Contact support@kallkeyy.com if you wish to modify consents</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">24. ADDITIONAL RESOURCES AND SUPPORT</h2>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            23.1 Privacy Resources
          </h3>
          <p className="mb-4"><strong>For more information about your privacy rights:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>GDPR Official Text: gdpr-text.com</li>
            <li>European Data Protection Board: edpb.europa.eu</li>
            <li>Information Commissioner's Office (UK): ico.org.uk</li>
            <li>German Federal DPA (International): bfdi.bund.de</li>
          </ul>
          <p className="mb-4"><strong>Indian Privacy Resources:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Ministry of Electronics and IT (MeitY): meity.gov.in</li>
            <li>IT Act 2000 and Rules: meity.gov.in</li>
            <li>Consumer Protection Authority: consumeraffairs.gov.in</li>
          </ul>
          <p className="mb-4"><strong>US Privacy Resources:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Federal Trade Commission (FTC): ftc.gov</li>
            <li>California Attorney General: oag.ca.gov</li>
            <li>California Privacy Protection Agency (CPPA): cppa.ca.gov</li>
          </ul>

          <h3 className="text-[#b90e0a] text-xl font-bold mb-2">
            23.2 Browser Privacy Settings
          </h3>
          <p className="mb-4"><strong>Manage your privacy through browser settings:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>Chrome: chrome.google.com/webstore (privacy extensions)</li>
            <li>Firefox: addons.mozilla.org (privacy extensions)</li>
            <li>Safari: apple.com/privacy</li>
            <li>Edge: microsoft.com/edge</li>
          </ul>
          <p className="mb-4"><strong>Popular Privacy Tools:</strong></p>
          <ul className="list-disc pl-8 mb-4 space-y-1">
            <li>uBlock Origin: Block ads and trackers</li>
            <li>Privacy Badger: Automatically block trackers</li>
            <li>Ghostery: Manage trackers</li>
            <li>DuckDuckGo: Private search engine</li>
          </ul>

        </section>

        {/* Section */}
        <section className="mb-8">
          <h2 className="text-[#b90e0a] text-2xl font-bold mb-4">25. ENTIRE AGREEMENT</h2>
          <p className="mb-4">This Privacy Policy, together with the Terms of Service and any other policies published on the Platform, constitutes the entire agreement between KALLKEYY and users regarding the collection, processing, and use of personal data. This Policy supersedes all previous privacy policies, statements, and understandings.</p>
          <p className="mb-4"><strong>If there is any conflict between this Privacy Policy and other KALLKEYY policies, the provision providing greater privacy protection applies.</strong></p>

          <p className="mb-4"><strong>EFFECTIVE DATE: November 1, 2025</strong></p>
          <p className="mb-4"><strong>Last Updated: October 31, 2025</strong></p>
          <p className="mb-4"><strong>© 2025 KALLKEYY. All Rights Reserved.</strong></p>

        </section>

        </div>
      </div>

    </div>
  );
}
