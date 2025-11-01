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

export default function TermsOfServicePage({
  onBackToMain,
  onNavigateToShop,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToLogin,
  onNavigateToSignup,
  onNavigateToOrders,
  skipAnimations = false,
}: Props) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen bg-black text-white ${skipAnimations ? '[&_*]:!animate-none' : ''}`}>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
          <div className="flex items-center justify-between relative">
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
              <div className="hidden lg:flex gap-2 text-sm lg:text-base font-bold">
                <button
                  onClick={() => onBackToMain()}
                  className="hover:text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  HOME
                </button>
                <button
                  onClick={() =>
                    onNavigateToShop
                      ? onNavigateToShop()
                      : handleUnavailablePage("Shop")
                  }
                  className="hover:text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
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
                    className="hover:text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
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
                  className="hover:text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  ABOUT
                </button>
                <button
                  onClick={() =>
                    onNavigateToContact
                      ? onNavigateToContact()
                      : handleUnavailablePage("Contact")
                  }
                  className="hover:text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap"
                >
                  CONTACT
                </button>

                {/* AUTH BUTTONS - Desktop */}
                {user ? (
                  <>
                    <span className="text-white px-2 lg:px-3 py-2 flex items-center text-xs lg:text-sm whitespace-nowrap">
                      HEY,{" "}
                      <span className="text-[#b90e0a] ml-1">
                        {formatDisplayName(user.name)}
                      </span>
                    </span>
                    <button
                      onClick={logout}
                      className="hover:text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg flex items-center gap-1 whitespace-nowrap"
                    >
                      <LogOut size={14} className="lg:w-4 lg:h-4" />
                      <span className="text-xs lg:text-sm">LOGOUT</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigateToLogin ? onNavigateToLogin() : handleUnavailablePage("Login")}
                      className="hover:text-[#b90e0a] transition-colors duration-300 px-2 lg:px-3 py-2 hover:bg-white/5 rounded-lg whitespace-nowrap text-xs lg:text-sm"
                    >
                      LOGIN
                    </button>
                    <button
                      onClick={() => onNavigateToSignup ? onNavigateToSignup() : handleUnavailablePage("Signup")}
                      className="bg-[#b90e0a] hover:bg-[#b90e0a]/80 transition-colors duration-300 px-3 lg:px-4 py-2 rounded-lg ml-1 whitespace-nowrap text-xs lg:text-sm"
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
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-[#b90e0a]">KALLKEYY TERMS OF SERVICE</h1>
      <br />
      <div className="mb-8 space-y-2">
        <p className="text-white text-sm"><strong className="font-bold">Effective Date:</strong> November 1, 2025</p>
        <p className="text-white text-sm"><strong className="font-bold">Last Updated:</strong> November 1, 2025</p>
        <p className="text-white text-sm"><strong className="font-bold">Entity:</strong> KALLKEYY (Brand Entity under registration)</p>
        <p className="text-white text-sm"><strong className="font-bold">Registered Base:</strong> Dwarka, New Delhi, India</p>
        <p className="text-white text-sm"><strong className="font-bold">Contact:</strong> <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a></p>
        <p className="text-white text-sm"><strong className="font-bold">Website:</strong> <a href="https://www.kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">www.kallkeyy.com</a></p>
      </div>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">1. INTRODUCTION AND ACCEPTANCE</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">1.1 Agreement to Terms</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">These Terms of Service (&quot;<strong className="font-bold">Terms</strong>,&quot; &quot;<strong className="font-bold">Agreement</strong>,&quot; or &quot;<strong className="font-bold">Terms of Service</strong>&quot;) constitute a <strong className="font-bold">legally binding contract</strong> between you (referred to as &quot;<strong className="font-bold">User</strong>,&quot; &quot;<strong className="font-bold">Customer</strong>,&quot; &quot;<strong className="font-bold">you</strong>,&quot; &quot;<strong className="font-bold">your</strong>,&quot; or &quot;<strong className="font-bold">Buyer</strong>&quot;) and KALLKEYY (&quot;<strong className="font-bold">KALLKEYY</strong>,&quot; &quot;<strong className="font-bold">we</strong>,&quot; &quot;<strong className="font-bold">us</strong>,&quot; &quot;<strong className="font-bold">our</strong>,&quot; or &quot;<strong className="font-bold">Company</strong>&quot;), governing your access to and use of:</p>
      <br />
      <p className="text-white mb-4 leading-relaxed">- The website located at <strong className="font-bold">www.kallkeyy.com</strong> and all associated subdomains</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Any mobile applications, progressive web applications (PWA), or digital platforms operated by KALLKEYY</li>
        <li className="mb-2 leading-relaxed">Social media channels, marketing platforms, and digital storefronts operated by KALLKEYY</li>
        <li className="mb-2 leading-relaxed">All related services, features, content, products, and functionality offered under the KALLKEYY brand</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed">Collectively, these are referred to as the &quot;<strong className="font-bold">Platform</strong>,&quot; &quot;<strong className="font-bold">Website</strong>,&quot; &quot;<strong className="font-bold">Services</strong>,&quot; or &quot;<strong className="font-bold">Site</strong>.&quot;</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">1.2 Binding Effect and Consent</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">By accessing, browsing, registering an account, placing an order, or otherwise using the Platform in any manner, you:</strong></p>
      <br />
      <p className="text-white mb-4 leading-relaxed">1. <strong className="font-bold">Acknowledge</strong> that you have read, understood, and agree to be bound by these Terms in their entirety</p>
      <p className="text-white mb-4 leading-relaxed">2. <strong className="font-bold">Consent</strong> to the collection, use, and processing of your personal data as described in our Privacy Policy</p>
      <p className="text-white mb-4 leading-relaxed">3. <strong className="font-bold">Agree</strong> to comply with all applicable laws, regulations, and these Terms</p>
      <p className="text-white mb-4 leading-relaxed">4. <strong className="font-bold">Represent and warrant</strong> that you have the legal capacity to enter into this binding agreement</p>
      <p className="text-white mb-4 leading-relaxed">5. <strong className="font-bold">Accept</strong> any additional terms, policies, or guidelines referenced herein or made available on the Platform</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">If you do not agree to these Terms or cannot comply with them, you must immediately cease all use of the Platform and refrain from creating an account or placing orders.</strong></p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">1.3 Scope of Application</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">These Terms apply to:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">All visitors, browsers, and users of the Platform (whether registered or unregistered)</li>
        <li className="mb-2 leading-relaxed">All customers who purchase Products or Services</li>
        <li className="mb-2 leading-relaxed">All account holders and registered users</li>
        <li className="mb-2 leading-relaxed">All participants in promotional campaigns, contests, or loyalty programs</li>
        <li className="mb-2 leading-relaxed">Any individual or entity interacting with KALLKEYY through any channel</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">1.4 Integration with Other Policies</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">These Terms incorporate by reference and must be read in conjunction with:</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Privacy Policy</strong> (governing data collection and processing)</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Return, Refund, and Exchange Policy</strong> (governing post-purchase procedures)</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Shipping and Delivery Policy</strong> (governing order fulfillment)</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Cookie Policy</strong> (governing tracking technologies)</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Any other policies, notices, or guidelines published on the Platform</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed">In case of conflict between these Terms and other policies, these Terms shall prevail unless explicitly stated otherwise.</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">1.5 Amendments and Modifications</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">KALLKEYY reserves the <strong className="font-bold">absolute and unconditional right</strong> to modify, amend, update, or replace any provision of these Terms at any time, in its sole discretion, without prior notice or liability.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Notice of Changes:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Material changes will be communicated via website banner, email notification, or in-platform alert</li>
        <li className="mb-2 leading-relaxed">Non-material changes may be posted directly without separate notification</li>
        <li className="mb-2 leading-relaxed">The &quot;Last Updated&quot; date at the top of this document reflects the most recent revision</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Acceptance of Changes:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Your continued use of the Platform after the effective date of any changes constitutes your binding acceptance of the modified Terms</li>
        <li className="mb-2 leading-relaxed">If you do not agree to modified Terms, you must discontinue use of the Platform immediately</li>
        <li className="mb-2 leading-relaxed">It is your responsibility to review these Terms periodically</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">1.6 Language and Translation</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">These Terms are drafted in English. In case of any translation into other languages, the <strong className="font-bold">English version shall prevail</strong> in all interpretations and disputes.</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">2. DEFINITIONS AND INTERPRETATION</h2>
      <br />
      <p className="text-white mb-4 leading-relaxed">For the purposes of these Terms, unless the context otherwise requires:</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">2.1 Key Definitions</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">&quot;Account&quot;</strong> means a personal user profile created by a User to access, browse, purchase, and manage orders on the Platform, including login credentials, saved addresses, purchase history, and preferences.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">&quot;Applicable Law&quot;</strong> means all laws, statutes, regulations, ordinances, rules, codes, guidelines, and directives applicable to the Platform, including but not limited to:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">The Indian Contract Act, 1872</li>
        <li className="mb-2 leading-relaxed">The Consumer Protection Act, 2019</li>
        <li className="mb-2 leading-relaxed">The Consumer Protection (E-Commerce) Rules, 2020</li>
        <li className="mb-2 leading-relaxed">The Information Technology Act, 2000</li>
        <li className="mb-2 leading-relaxed">The Information Technology (Reasonable Security Practices) Rules, 2011</li>
        <li className="mb-2 leading-relaxed">The Digital Personal Data Protection Act, 2023 (once enforced)</li>
        <li className="mb-2 leading-relaxed">The Legal Metrology Act, 2009</li>
        <li className="mb-2 leading-relaxed">Any other applicable Indian or international laws</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">&quot;Business Day&quot;</strong> means any day other than Saturday, Sunday, or a public holiday in New Delhi, India.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">&quot;Content&quot;</strong> means all text, graphics, images, photographs, videos, audio, software, code, designs, logos, trademarks, trade names, service marks, data, information, and other materials displayed, published, or made available on or through the Platform.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">&quot;Intellectual Property&quot;</strong> means all intellectual property rights, including but not limited to copyrights, trademarks, service marks, trade names, patents, trade secrets, design rights, database rights, domain names, and other proprietary rights, whether registered or unregistered.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">&quot;Order&quot;</strong> means a request submitted by a User through the Platform to purchase one or more Products, which is subject to acceptance by KALLKEYY.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">&quot;Order Confirmation&quot;</strong> means the email or notification sent by KALLKEYY acknowledging receipt and acceptance of an Order, constituting a binding contract for the sale and purchase of Products.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">&quot;Platform&quot;</strong> means the website www.kallkeyy.com and all associated digital interfaces, mobile applications, progressive web applications, and online services operated by KALLKEYY.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">&quot;Products&quot;</strong> means all streetwear clothing, apparel, accessories, merchandise, and related goods sold, offered for sale, or displayed through the Platform, including but not limited to t-shirts, hoodies, jackets, caps, bags, and other fashion items.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">&quot;Services&quot;</strong> means all services provided by KALLKEYY through the Platform, including but not limited to e-commerce services, customer support, product recommendations, account management, and any other ancillary services.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">&quot;Third-Party Service Provider&quot;</strong> means external service providers engaged by KALLKEYY to facilitate operations, including:</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Razorpay</strong> (payment processing)</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Shiprocket</strong> (logistics and shipping)</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">MSG91</strong> (SMS and WhatsApp OTP)</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Google Analytics</strong> (website analytics)</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Google OAuth</strong> (authentication)</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Vercel</strong> (hosting)</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">MongoDB Atlas</strong> (database)</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Nodemailer</strong> (email delivery)</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Hostinger</strong> (domain registration)</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Any other service providers engaged from time to time</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">&quot;User&quot;</strong>, <strong className="font-bold">&quot;Customer&quot;</strong>, <strong className="font-bold">&quot;you&quot;</strong>, or <strong className="font-bold">&quot;your&quot;</strong> means any individual or entity accessing or using the Platform, whether as a visitor, browser, account holder, or purchaser.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">&quot;User Content&quot;</strong> means any content, information, data, text, photographs, reviews, ratings, feedback, or other materials submitted, uploaded, posted, or transmitted by Users on or through the Platform.</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">2.2 Interpretation Rules</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">In these Terms:</p>
      <p className="text-white mb-4 leading-relaxed">- References to &quot;<strong className="font-bold">including</strong>&quot; or &quot;<strong className="font-bold">includes</strong>&quot; mean &quot;including but not limited to&quot; unless expressly stated otherwise</p>
      <p className="text-white mb-4 leading-relaxed">- References to the <strong className="font-bold">singular</strong> include the plural and vice versa</p>
      <p className="text-white mb-4 leading-relaxed">- References to <strong className="font-bold">one gender</strong> include all genders</p>
      <p className="text-white mb-4 leading-relaxed">- Headings and section titles are for <strong className="font-bold">convenience only</strong> and do not affect interpretation</p>
      <p className="text-white mb-4 leading-relaxed">- References to &quot;<strong className="font-bold">writing</strong>&quot; or &quot;<strong className="font-bold">written</strong>&quot; include email and electronic communication</p>
      <p className="text-white mb-4 leading-relaxed">- References to &quot;<strong className="font-bold">days</strong>&quot; mean calendar days unless specified as Business Days</p>
      <p className="text-white mb-4 leading-relaxed">- References to <strong className="font-bold">statutory provisions</strong> include those provisions as amended, re-enacted, or replaced from time to time</p>
      <p className="text-white mb-4 leading-relaxed">- The word &quot;<strong className="font-bold">may</strong>&quot; indicates discretion; the word &quot;<strong className="font-bold">shall</strong>&quot; or &quot;<strong className="font-bold">must</strong>&quot; indicates obligation</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">3. ELIGIBILITY AND CAPACITY</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">3.1 Age Requirements</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Minimum Age:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- You must be at least <strong className="font-bold">18 years of age</strong> to use the Platform, create an Account, or make purchases</p>
      <p className="text-white mb-4 leading-relaxed">- Individuals under 18 years of age are <strong className="font-bold">strictly prohibited</strong> from accessing or using the Platform without parental or guardian consent and supervision</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">If you are under 18 years of age, you may only use the Platform with the involvement of a parent or legal guardian who accepts these Terms on your behalf</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Verification:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY reserves the right to verify your age at any time</li>
        <li className="mb-2 leading-relaxed">You may be required to provide proof of age (government-issued ID, birth certificate, etc.)</li>
        <li className="mb-2 leading-relaxed">False representation of age is a violation of these Terms and may result in immediate Account termination</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">3.2 Legal Capacity</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">By using the Platform, you represent and warrant that:</p>
      <p className="text-white mb-4 leading-relaxed">- You have the <strong className="font-bold">legal capacity</strong> to enter into binding contracts under the laws of India and your jurisdiction of residence</p>
      <p className="text-white mb-4 leading-relaxed">- You are <strong className="font-bold">not prohibited</strong> by law from using the Platform or purchasing Products</p>
      <p className="text-white mb-4 leading-relaxed">- You have the <strong className="font-bold">authority</strong> to bind yourself (or your organization, if applicable) to these Terms</p>
      <p className="text-white mb-4 leading-relaxed">- All information you provide is <strong className="font-bold">accurate, current, and complete</strong></p>
      <p className="text-white mb-4 leading-relaxed">- You will <strong className="font-bold">update</strong> information promptly when it changes</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">3.3 Business or Organizational Use</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">If you are accessing the Platform on behalf of a business, organization, or other legal entity:</p>
      <p className="text-white mb-4 leading-relaxed">- You represent that you are <strong className="font-bold">duly authorized</strong> to accept these Terms on behalf of such entity</p>
      <p className="text-white mb-4 leading-relaxed">- The term &quot;<strong className="font-bold">you</strong>&quot; includes both you individually and the entity you represent</p>
      <p className="text-white mb-4 leading-relaxed">- Both you and the entity shall be <strong className="font-bold">jointly and severally liable</strong> for compliance with these Terms</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">You must provide accurate business registration details if requested</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">3.4 Geographic Restrictions</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Territorial Scope:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- The Platform is primarily intended for users located in <strong className="font-bold">India</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">International users may access the Platform subject to compliance with their local laws</li>
        <li className="mb-2 leading-relaxed">KALLKEYY does not represent that Products or Content are appropriate or available for use outside India</li>
        <li className="mb-2 leading-relaxed">Accessing the Platform from jurisdictions where its contents are illegal is prohibited</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Export and Import Compliance:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Users are responsible for compliance with all applicable export and import laws</li>
        <li className="mb-2 leading-relaxed">Products may not be exported or re-exported to countries or individuals subject to trade embargoes or sanctions</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">3.5 Prohibited Users</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">The following individuals or entities are <strong className="font-bold">prohibited</strong> from using the Platform:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Persons under 18 years of age (without parental consent and supervision)</li>
        <li className="mb-2 leading-relaxed">Persons or entities previously suspended or banned from the Platform</li>
        <li className="mb-2 leading-relaxed">Persons or entities engaged in fraudulent, illegal, or unethical activities</li>
        <li className="mb-2 leading-relaxed">Competitors seeking to scrape, copy, or reverse-engineer the Platform</li>
        <li className="mb-2 leading-relaxed">Automated bots, scrapers, or non-human agents (except authorized search engine crawlers)</li>
      </ul>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">4. ACCOUNT REGISTRATION AND SECURITY</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">4.1 Account Creation</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Requirement:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- While browsing is permitted without an Account, you <strong className="font-bold">must create an Account</strong> to:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Place orders and make purchases</li>
        <li className="mb-2 leading-relaxed">Track order history and shipments</li>
        <li className="mb-2 leading-relaxed">Save addresses and payment methods</li>
        <li className="mb-2 leading-relaxed">Access personalized recommendations</li>
        <li className="mb-2 leading-relaxed">Participate in loyalty programs or promotions</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Registration Process:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Provide accurate, current, and complete information during registration</li>
        <li className="mb-2 leading-relaxed">Information required may include:</li>
        <li className="mb-2 leading-relaxed">Full name</li>
        <li className="mb-2 leading-relaxed">Email address</li>
        <li className="mb-2 leading-relaxed">Mobile phone number</li>
        <li className="mb-2 leading-relaxed">Residential or billing address</li>
        <li className="mb-2 leading-relaxed">Password (meeting security requirements)</li>
        <li className="mb-2 leading-relaxed">Optionally authenticate using <strong className="font-bold">Google OAuth</strong> (Google sign-in)</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Verification:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- You may be required to verify your email address or phone number via <strong className="font-bold">OTP (One-Time Password)</strong> sent through MSG91</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Account activation may be delayed pending verification</li>
        <li className="mb-2 leading-relaxed">KALLKEYY reserves the right to request additional identity verification at any time</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">4.2 Account Information Accuracy</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">You agree to:</p>
      <p className="text-white mb-4 leading-relaxed">- Provide <strong className="font-bold">true, accurate, current, and complete</strong> information during registration and at all times</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Update</strong> your Account information promptly when it changes</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Notify KALLKEYY immediately</strong> of any unauthorized use of your Account or security breach</p>
      <br />
      <p className="text-white mb-4 leading-relaxed">Providing false, inaccurate, or misleading information:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Constitutes a breach of these Terms</li>
        <li className="mb-2 leading-relaxed">May result in immediate Account suspension or termination</li>
        <li className="mb-2 leading-relaxed">May result in order cancellation or refusal of service</li>
        <li className="mb-2 leading-relaxed">May expose you to legal liability</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">4.3 Account Security and Credentials</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Your Responsibilities:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- You are <strong className="font-bold">solely responsible</strong> for:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Maintaining the confidentiality of your Account credentials (username, password, OTP)</li>
        <li className="mb-2 leading-relaxed">All activities that occur under your Account, whether authorized or unauthorized</li>
        <li className="mb-2 leading-relaxed">Any losses or damages resulting from unauthorized Account access due to your failure to maintain security</li>
        <li className="mb-2 leading-relaxed">You must <strong className="font-bold">not</strong>:</li>
        <li className="mb-2 leading-relaxed">Share your Account credentials with any third party</li>
        <li className="mb-2 leading-relaxed">Allow any other person to use your Account</li>
        <li className="mb-2 leading-relaxed">Create multiple Accounts for the same individual</li>
        <li className="mb-2 leading-relaxed">Use another person&#39;s Account without authorization</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Security Best Practices:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Use a <strong className="font-bold">strong, unique password</strong> (combination of letters, numbers, special characters)</p>
      <p className="text-white mb-4 leading-relaxed">- Do <strong className="font-bold">not reuse</strong> passwords from other websites or services</p>
      <p className="text-white mb-4 leading-relaxed">- Enable <strong className="font-bold">two-factor authentication</strong> (2FA) if and when available</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Log out of your Account when using shared or public devices</li>
        <li className="mb-2 leading-relaxed">Monitor your Account regularly for unauthorized activity</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Unauthorized Access:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- You must <strong className="font-bold">immediately notify</strong> KALLKEYY at <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a> if you suspect:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Unauthorized access to your Account</li>
        <li className="mb-2 leading-relaxed">Compromise of your Account credentials</li>
        <li className="mb-2 leading-relaxed">Any security breach or vulnerability</li>
        <li className="mb-2 leading-relaxed">KALLKEYY will investigate and may temporarily suspend your Account pending resolution</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">4.4 Account Suspension and Termination</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">KALLKEYY&#39;s Rights:</strong></p>
      <p className="text-white mb-4 leading-relaxed">KALLKEYY reserves the <strong className="font-bold">absolute and unconditional right</strong> to suspend, restrict, or terminate your Account at any time, with or without notice, for any reason, including but not limited to:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Violation of these Terms or any applicable policy</li>
        <li className="mb-2 leading-relaxed">Fraudulent, abusive, or illegal activity</li>
        <li className="mb-2 leading-relaxed">Chargebacks, payment disputes, or payment failures</li>
        <li className="mb-2 leading-relaxed">Providing false or misleading information</li>
        <li className="mb-2 leading-relaxed">Engaging in conduct harmful to KALLKEYY&#39;s reputation or business interests</li>
        <li className="mb-2 leading-relaxed">Suspected security breach or unauthorized access</li>
        <li className="mb-2 leading-relaxed">Abuse of promotional offers, discounts, or loyalty programs</li>
        <li className="mb-2 leading-relaxed">Multiple or repeated violations of policies</li>
        <li className="mb-2 leading-relaxed">Prolonged inactivity (Account dormancy)</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">User-Initiated Termination:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">You may request Account deletion at any time by contacting <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a></li>
        <li className="mb-2 leading-relaxed">Upon Account deletion:</li>
        <li className="mb-2 leading-relaxed">Your personal data will be processed according to our Privacy Policy</li>
        <li className="mb-2 leading-relaxed">You will lose access to order history, saved information, and loyalty rewards</li>
        <li className="mb-2 leading-relaxed">Pending orders may be canceled (subject to cancellation policy)</li>
        <li className="mb-2 leading-relaxed">Outstanding payment obligations remain enforceable</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Effect of Termination:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Upon termination or suspension:</li>
        <li className="mb-2 leading-relaxed">You lose all rights to use the Platform and access your Account</li>
        <li className="mb-2 leading-relaxed">You must cease all use of the Platform immediately</li>
        <li className="mb-2 leading-relaxed">All outstanding payment obligations survive termination</li>
        <li className="mb-2 leading-relaxed">KALLKEYY may retain certain data as required by law or for legitimate business purposes</li>
        <li className="mb-2 leading-relaxed">You remain liable for all activities that occurred prior to termination</li>
      </ul>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">5. PRODUCTS AND SERVICES</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">5.1 Product Descriptions and Accuracy</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Product Information:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">All Products are described as accurately as possible, including:</li>
        <li className="mb-2 leading-relaxed">Product name and category</li>
        <li className="mb-2 leading-relaxed">Size, dimensions, and fit information</li>
        <li className="mb-2 leading-relaxed">Materials, fabric composition, and care instructions</li>
        <li className="mb-2 leading-relaxed">Color, design, and style details</li>
        <li className="mb-2 leading-relaxed">Pricing and availability</li>
        <li className="mb-2 leading-relaxed">Product images and photographs</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Limitations and Disclaimers:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Despite reasonable efforts to ensure accuracy, KALLKEYY <strong className="font-bold">does not guarantee</strong> that:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Product descriptions are entirely error-free, complete, or current</li>
        <li className="mb-2 leading-relaxed">Product colors displayed on your device match actual Product colors (due to screen calibration and lighting variations)</li>
        <li className="mb-2 leading-relaxed">Product images accurately reflect actual Product appearance in all respects</li>
        <li className="mb-2 leading-relaxed">Pricing is free from errors or discrepancies</li>
        <li className="mb-2 leading-relaxed">All information is up-to-date at all times</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Typographical Errors:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY reserves the right to correct any errors, inaccuracies, or omissions at any time</li>
        <li className="mb-2 leading-relaxed">If a Product is listed at an incorrect price due to typographical error, KALLKEYY may:</li>
        <li className="mb-2 leading-relaxed">Cancel the Order and refund any payment made</li>
        <li className="mb-2 leading-relaxed">Contact you to confirm acceptance of the corrected price</li>
        <li className="mb-2 leading-relaxed">Refuse to honor the incorrect price</li>
        <li className="mb-2 leading-relaxed">Pricing errors do not constitute binding offers</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">5.2 Product Availability and Stock</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Subject to Availability:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">All Products are subject to availability at the time of Order placement</li>
        <li className="mb-2 leading-relaxed">Displaying a Product on the Platform does not guarantee its availability</li>
        <li className="mb-2 leading-relaxed">Product availability may change without notice</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Inventory Limitations:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY reserves the right to:</li>
        <li className="mb-2 leading-relaxed">Limit quantities of any Product offered for sale</li>
        <li className="mb-2 leading-relaxed">Limit quantities per person, per household, or per Order</li>
        <li className="mb-2 leading-relaxed">Discontinue any Product at any time without prior notice</li>
        <li className="mb-2 leading-relaxed">Refuse Orders that exceed quantity limitations</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Out-of-Stock Products:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">If a Product becomes unavailable after you place an Order:</li>
        <li className="mb-2 leading-relaxed">KALLKEYY will notify you via email or phone</li>
        <li className="mb-2 leading-relaxed">You may choose an alternative Product or cancel the Order</li>
        <li className="mb-2 leading-relaxed">Full refund will be issued for canceled or unavailable Products</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">5.3 Product Customization and Pre-Orders</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Customization (if offered):</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Certain Products may be available for customization (embroidery, printing, etc.)</li>
        <li className="mb-2 leading-relaxed">Customized Products:</li>
        <li className="mb-2 leading-relaxed">Cannot be returned or exchanged unless defective</li>
        <li className="mb-2 leading-relaxed">May require additional processing time</li>
        <li className="mb-2 leading-relaxed">Are subject to separate terms and conditions</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Pre-Orders and Made-to-Order:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Some Products may be available for pre-order before official launch</li>
        <li className="mb-2 leading-relaxed">Pre-order Products:</li>
        <li className="mb-2 leading-relaxed">Will be shipped on or after the specified launch date</li>
        <li className="mb-2 leading-relaxed">Are subject to availability and may be canceled if production issues arise</li>
        <li className="mb-2 leading-relaxed">May have extended delivery timelines</li>
        <li className="mb-2 leading-relaxed">Payment may be charged at the time of Order or at the time of shipment (as specified)</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">5.4 Right to Refuse Service</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">KALLKEYY reserves the <strong className="font-bold">absolute and unconditional right</strong> to refuse service, limit quantities, or refuse to accept or fulfill any Order for any reason, including but not limited to:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Suspected fraudulent activity or payment issues</li>
        <li className="mb-2 leading-relaxed">Geographic restrictions or unavailability in your location</li>
        <li className="mb-2 leading-relaxed">Violation of these Terms or applicable policies</li>
        <li className="mb-2 leading-relaxed">Abusive, threatening, or inappropriate conduct</li>
        <li className="mb-2 leading-relaxed">Excessive or unreasonable Order quantities</li>
        <li className="mb-2 leading-relaxed">Products no longer available or discontinued</li>
        <li className="mb-2 leading-relaxed">Technical errors or system malfunctions</li>
      </ul>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">6. PRICING, FEES, AND PAYMENT TERMS</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">6.1 Pricing and Currency</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Display Currency:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- All prices displayed on the Platform are in <strong className="font-bold">Indian Rupees (INR)</strong> unless otherwise expressly stated</p>
      <p className="text-white mb-4 leading-relaxed">- Prices are <strong className="font-bold">inclusive of applicable taxes</strong> unless stated otherwise (GST, VAT, or other statutory levies as applicable)</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Pricing Changes:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY reserves the right to change prices at any time without prior notice</li>
        <li className="mb-2 leading-relaxed">Price changes do not affect Orders already confirmed and paid for</li>
        <li className="mb-2 leading-relaxed">Prices applicable at the time of Order placement govern the transaction</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Taxes and Duties:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Prices include applicable <strong className="font-bold">Goods and Services Tax (GST)</strong> as required by Indian law</p>
      <p className="text-white mb-4 leading-relaxed">- For international orders (if applicable), additional customs duties, import taxes, or fees may apply and are the <strong className="font-bold">sole responsibility of the Customer</strong></p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">6.2 Payment Methods and Processing</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Accepted Payment Methods:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Credit Cards (Visa, MasterCard, American Express, RuPay, etc.)</li>
        <li className="mb-2 leading-relaxed">Debit Cards (Visa, MasterCard, RuPay, Maestro, etc.)</li>
        <li className="mb-2 leading-relaxed">Net Banking (all major Indian banks)</li>
        <li className="mb-2 leading-relaxed">UPI (Unified Payments Interface) - Google Pay, PhonePe, Paytm, BHIM, etc.</li>
        <li className="mb-2 leading-relaxed">Digital Wallets (Paytm Wallet, Mobikwik, Freecharge, etc.)</li>
        <li className="mb-2 leading-relaxed">Other payment methods supported by <strong className="font-bold">Razorpay</strong> (our payment gateway partner)</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Payment Gateway:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- All payments are processed through <strong className="font-bold">Razorpay</strong>, a <strong className="font-bold">PCI-DSS Level 1 compliant</strong> payment gateway</p>
      <p className="text-white mb-4 leading-relaxed">- KALLKEYY <strong className="font-bold">does not collect, store, or process</strong> payment card information directly</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Payment card details are encrypted and transmitted directly to Razorpay</li>
        <li className="mb-2 leading-relaxed">Razorpay&#39;s terms and conditions and privacy policy apply to all payment transactions</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Payment Authorization:</strong></p>
      <p className="text-white mb-4 leading-relaxed">By providing payment information, you represent and warrant that:</p>
      <p className="text-white mb-4 leading-relaxed">- You are <strong className="font-bold">authorized</strong> to use the selected payment method</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Sufficient funds or credit</strong> are available to complete the transaction</p>
      <p className="text-white mb-4 leading-relaxed">- Payment information is <strong className="font-bold">accurate and complete</strong></p>
      <p className="text-white mb-4 leading-relaxed">- You will <strong className="font-bold">not dispute legitimate charges</strong> or initiate chargebacks fraudulently</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Payment Processing Timeline:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Payment is <strong className="font-bold">authorized and charged</strong> at the time of Order placement (except for pre-orders, which may be charged at shipment)</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Orders are processed only after successful payment confirmation</li>
        <li className="mb-2 leading-relaxed">Payment confirmation is typically received within minutes, but may be delayed due to bank or payment gateway issues</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">6.3 Payment Failures and Errors</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Payment Failures:</strong></p>
      <p className="text-white mb-4 leading-relaxed">If payment fails due to insufficient funds, incorrect details, bank decline, or technical issues:</p>
      <p className="text-white mb-4 leading-relaxed">- The Order will <strong className="font-bold">not be processed</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">You will be notified via email or SMS</li>
        <li className="mb-2 leading-relaxed">You may retry payment or contact <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a> for assistance</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Duplicate Charges:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">If you are inadvertently charged more than once for the same Order:</li>
        <li className="mb-2 leading-relaxed">Contact <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a> immediately</li>
        <li className="mb-2 leading-relaxed">Duplicate charges will be refunded within 5-7 Business Days after verification</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Third-Party Payment Errors:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- KALLKEYY is <strong className="font-bold">not responsible</strong> for:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Payment delays, processing errors, or transaction failures caused by Razorpay, banks, or payment networks</li>
        <li className="mb-2 leading-relaxed">Charges imposed by your bank or card issuer (foreign transaction fees, currency conversion fees, etc.)</li>
        <li className="mb-2 leading-relaxed">Technical issues or downtime affecting third-party payment systems</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">6.4 Promotional Offers, Discounts, and Coupons</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Promotional Codes:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY may, from time to time, offer promotional discounts, coupon codes, referral credits, or loyalty rewards</li>
        <li className="mb-2 leading-relaxed">Promotional offers are subject to:</li>
        <li className="mb-2 leading-relaxed">Specific terms and conditions communicated at the time of the offer</li>
        <li className="mb-2 leading-relaxed">Validity periods and expiration dates</li>
        <li className="mb-2 leading-relaxed">Minimum purchase requirements</li>
        <li className="mb-2 leading-relaxed">Product or category exclusions</li>
        <li className="mb-2 leading-relaxed">Limitations on combination with other offers</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Restrictions:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Only <strong className="font-bold">one promotional code</strong> may be applied per Order unless otherwise stated</p>
      <p className="text-white mb-4 leading-relaxed">- Promotional codes are <strong className="font-bold">non-transferable</strong> and have no cash value</p>
      <p className="text-white mb-4 leading-relaxed">- Promotional codes <strong className="font-bold">cannot be redeemed retroactively</strong> for past purchases</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY reserves the right to cancel or modify promotional offers at any time</li>
        <li className="mb-2 leading-relaxed">Abuse of promotional codes (creating multiple accounts, using automated tools, etc.) will result in Account termination and Order cancellation</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Price Adjustments:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- KALLKEYY does <strong className="font-bold">not offer price adjustments</strong> if a Product goes on sale after you purchase it</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">No refunds or credits will be issued for price differences resulting from promotional offers applied after your purchase</li>
      </ul>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">7. ORDER PLACEMENT AND ACCEPTANCE</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">7.1 Order Submission</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Order Process:</strong></p>
      <ol className="list-decimal list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Select Products and add to cart</li>
        <li className="mb-2 leading-relaxed">Review cart and proceed to checkout</li>
        <li className="mb-2 leading-relaxed">Provide or confirm shipping address and contact information</li>
        <li className="mb-2 leading-relaxed">Select payment method and complete payment</li>
        <li className="mb-2 leading-relaxed">Review and submit Order</li>
      </ol>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Order Submission ≠ Order Acceptance:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Submitting an Order does <strong className="font-bold">not</strong> constitute a binding contract</p>
      <p className="text-white mb-4 leading-relaxed">- An Order is merely an <strong className="font-bold">offer to purchase</strong> Products at the stated price</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY reserves the right to accept or reject any Order at its sole discretion</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">7.2 Order Confirmation and Contract Formation</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Order Confirmation Email:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Upon successful Order placement and payment authorization, you will receive an <strong className="font-bold">Order Confirmation Email</strong> at the email address provided</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">The Order Confirmation Email includes:</li>
        <li className="mb-2 leading-relaxed">Order number and date</li>
        <li className="mb-2 leading-relaxed">List of Products ordered (description, quantity, price)</li>
        <li className="mb-2 leading-relaxed">Total amount charged (including taxes and shipping fees)</li>
        <li className="mb-2 leading-relaxed">Shipping address and estimated delivery timeline</li>
        <li className="mb-2 leading-relaxed">Payment method used</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Contract Formation:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- A <strong className="font-bold">binding contract</strong> is formed <strong className="font-bold">only when</strong> KALLKEYY sends you an Order Confirmation Email</p>
      <p className="text-white mb-4 leading-relaxed">- Until you receive an Order Confirmation Email, KALLKEYY has <strong className="font-bold">not accepted</strong> your Order and may reject it for any reason</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY reserves the right to cancel any Order prior to shipment, even after Order Confirmation, in exceptional circumstances (fraud, pricing error, Product unavailability, force majeure, etc.)</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">7.3 Order Cancellation by KALLKEYY</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">KALLKEYY reserves the right to cancel any Order, before or after Order Confirmation, for reasons including but not limited to:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Product unavailability or stock discrepancies</li>
        <li className="mb-2 leading-relaxed">Pricing or typographical errors</li>
        <li className="mb-2 leading-relaxed">Suspected fraudulent activity or payment issues</li>
        <li className="mb-2 leading-relaxed">Violation of these Terms or applicable policies</li>
        <li className="mb-2 leading-relaxed">Geographic restrictions or inability to deliver to specified address</li>
        <li className="mb-2 leading-relaxed">Force majeure events or operational disruptions</li>
        <li className="mb-2 leading-relaxed">Technical errors or system malfunctions</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Cancellation Notification:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">If KALLKEYY cancels an Order, you will be notified via email or phone</li>
        <li className="mb-2 leading-relaxed">Full refund will be issued to the original payment method within 5-7 Business Days</li>
        <li className="mb-2 leading-relaxed">KALLKEYY is <strong className="font-bold">not liable</strong> for any consequential damages, losses, or inconvenience resulting from Order cancellation</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">7.4 Order Cancellation by Customer</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Cancellation Window:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- You may cancel an Order <strong className="font-bold">before it is shipped</strong> by contacting <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a></p>
      <p className="text-white mb-4 leading-relaxed">- Once an Order is shipped, it <strong className="font-bold">cannot be canceled</strong> (but may be eligible for return per the Return Policy)</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Cancellation Process:</strong></p>
      <ol className="list-decimal list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Email <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a> with your Order number and cancellation request</li>
        <li className="mb-2 leading-relaxed">KALLKEYY will confirm whether the Order can be canceled</li>
        <li className="mb-2 leading-relaxed">If cancellation is successful, full refund will be issued within 5-7 Business Days</li>
      </ol>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Cancellation Fees:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">No cancellation fees are charged for Orders canceled before shipment</li>
        <li className="mb-2 leading-relaxed">Refunds will be processed to the original payment method</li>
      </ul>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">8. SHIPPING, DELIVERY, AND RISK OF LOSS</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">8.1 Shipping Partners and Processing</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Logistics Partners:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Orders are processed, packed, and shipped through our logistics partners, including <strong className="font-bold">Shiprocket</strong> and other authorized couriers</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY does not directly operate delivery services</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Order Processing Time:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Orders are typically processed within <strong className="font-bold">1-3 Business Days</strong> after Order Confirmation</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Processing time may be longer during:</li>
        <li className="mb-2 leading-relaxed">Sale periods or promotional events</li>
        <li className="mb-2 leading-relaxed">Holidays and festive seasons</li>
        <li className="mb-2 leading-relaxed">Force majeure events or operational disruptions</li>
        <li className="mb-2 leading-relaxed">Customized or made-to-order Products may require additional processing time (as specified at the time of Order)</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">8.2 Shipping Addresses and Accuracy</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Address Requirements:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- You must provide a <strong className="font-bold">complete, accurate, and deliverable</strong> shipping address, including:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Full recipient name</li>
        <li className="mb-2 leading-relaxed">Complete street address with house/flat number</li>
        <li className="mb-2 leading-relaxed">Landmark (optional but recommended)</li>
        <li className="mb-2 leading-relaxed">City, state, and PIN code</li>
        <li className="mb-2 leading-relaxed">Contact phone number (for delivery coordination)</li>
        <li className="mb-2 leading-relaxed">KALLKEYY is <strong className="font-bold">not responsible</strong> for delays, non-delivery, or return-to-origin caused by:</li>
        <li className="mb-2 leading-relaxed">Incomplete, incorrect, or undeliverable addresses</li>
        <li className="mb-2 leading-relaxed">Inaccessible delivery locations</li>
        <li className="mb-2 leading-relaxed">Recipient unavailability or refusal to accept delivery</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Address Changes:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Address changes <strong className="font-bold">must be requested immediately</strong> by contacting <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a></p>
      <p className="text-white mb-4 leading-relaxed">- Once an Order is shipped, address changes are generally <strong className="font-bold">not possible</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY will make reasonable efforts to accommodate address change requests but cannot guarantee success</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">PO Boxes and Military Addresses:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Delivery to PO Boxes may not be available through all logistics partners</li>
        <li className="mb-2 leading-relaxed">Contact <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a> if you require delivery to a PO Box or military address</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">8.3 Delivery Timelines and Estimates</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Estimated Delivery:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Estimated delivery timelines are provided for convenience only at the time of Order placement</li>
        <li className="mb-2 leading-relaxed">Timelines are <strong className="font-bold">estimates only</strong> and <strong className="font-bold">not guaranteed</strong></li>
        <li className="mb-2 leading-relaxed">Actual delivery times may vary based on:</li>
        <li className="mb-2 leading-relaxed">Destination location and distance from warehouse</li>
        <li className="mb-2 leading-relaxed">Courier partner&#39;s delivery schedule</li>
        <li className="mb-2 leading-relaxed">Weather conditions, natural disasters, or other force majeure events</li>
        <li className="mb-2 leading-relaxed">Customs clearance delays (for international orders)</li>
        <li className="mb-2 leading-relaxed">High-volume periods (sales, holidays, festivals)</li>
        <li className="mb-2 leading-relaxed">Recipient unavailability or delivery rescheduling</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Delivery Timeline Ranges:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Metro Cities:</strong> Typically 3-5 Business Days</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Tier 2/3 Cities:</strong> Typically 5-7 Business Days</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Remote Areas:</strong> Typically 7-10 Business Days</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">International (if applicable):</strong> Varies by destination country (10-21 Business Days)</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Delivery Delays:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- KALLKEYY is <strong className="font-bold">not liable</strong> for delivery delays caused by:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Courier or logistics partner delays</li>
        <li className="mb-2 leading-relaxed">Customs clearance delays</li>
        <li className="mb-2 leading-relaxed">Weather-related disruptions or natural disasters</li>
        <li className="mb-2 leading-relaxed">Strikes, lockouts, or labor disputes</li>
        <li className="mb-2 leading-relaxed">Government restrictions, lockdowns, or regulatory actions</li>
        <li className="mb-2 leading-relaxed">Recipient unavailability or incorrect address</li>
        <li className="mb-2 leading-relaxed">Force majeure events beyond KALLKEYY&#39;s reasonable control</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">8.4 Delivery Confirmation and Risk of Loss</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Delivery Confirmation:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Products are considered <strong className="font-bold">delivered</strong> when handed over to the recipient or an authorized person at the delivery address</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Signature or OTP confirmation may be required upon delivery</li>
        <li className="mb-2 leading-relaxed">Delivery confirmation is recorded by the courier partner</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Transfer of Risk:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Title and risk of loss</strong> pass to you upon delivery of the Product to the specified address</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">You bear the risk of loss, damage, or theft after successful delivery</li>
        <li className="mb-2 leading-relaxed">KALLKEYY is <strong className="font-bold">not responsible</strong> for Products lost, stolen, or damaged after delivery confirmation</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Failed Delivery Attempts:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">If delivery fails due to recipient unavailability, incorrect address, or refusal to accept:</li>
        <li className="mb-2 leading-relaxed">Courier will make <strong className="font-bold">2-3 delivery attempts</strong> (as per courier policy)</li>
        <li className="mb-2 leading-relaxed">You will be notified via SMS or email</li>
        <li className="mb-2 leading-relaxed">Products may be returned to KALLKEYY&#39;s warehouse after failed attempts</li>
        <li className="mb-2 leading-relaxed">Re-delivery may be arranged (additional shipping fees may apply)</li>
        <li className="mb-2 leading-relaxed">If Products are returned to warehouse, refund (minus shipping costs) will be issued</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Unclaimed or Refused Deliveries:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">If you refuse delivery or fail to claim Products after multiple delivery attempts:</li>
        <li className="mb-2 leading-relaxed">Products will be returned to KALLKEYY&#39;s warehouse</li>
        <li className="mb-2 leading-relaxed">Refund will be issued minus original shipping costs and any applicable restocking fees</li>
        <li className="mb-2 leading-relaxed">KALLKEYY reserves the right to deduct return shipping costs from refund amount</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">8.5 Shipment Tracking</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Tracking Information:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Once your Order is shipped, you will receive a <strong className="font-bold">Shipment Confirmation Email</strong> with:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Tracking number</li>
        <li className="mb-2 leading-relaxed">Courier partner name</li>
        <li className="mb-2 leading-relaxed">Link to track shipment in real-time</li>
        <li className="mb-2 leading-relaxed">You can track your Order by:</li>
        <li className="mb-2 leading-relaxed">Clicking the tracking link in the Shipment Confirmation Email</li>
        <li className="mb-2 leading-relaxed">Visiting the courier partner&#39;s website and entering your tracking number</li>
        <li className="mb-2 leading-relaxed">Logging into your KALLKEYY Account and viewing Order status</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Tracking Updates:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Tracking information is updated by the courier partner</li>
        <li className="mb-2 leading-relaxed">There may be delays in tracking updates due to courier scanning procedures</li>
        <li className="mb-2 leading-relaxed">Contact <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a> if tracking information is not updated for more than 48 hours after shipment</li>
      </ul>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">9. RETURNS, EXCHANGES, AND REFUNDS</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">9.1 Return and Exchange Policy Overview</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">Returns and exchanges are governed by the <strong className="font-bold">KALLKEYY Return, Refund, and Exchange Policy</strong>, which is incorporated into these Terms by reference and available at www.kallkeyy.com/returns.</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">9.2 Eligibility Criteria</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Products Eligible for Return/Exchange:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Products must be:</li>
        <li className="mb-2 leading-relaxed"><strong className="font-bold">Unused, unworn, and in original condition</strong> with all tags, labels, and packaging intact</li>
        <li className="mb-2 leading-relaxed">Returned within the specified return window (typically <strong className="font-bold">7-14 days</strong> from delivery date, as specified in Return Policy)</li>
        <li className="mb-2 leading-relaxed">Accompanied by original invoice or Order Confirmation</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Products NOT Eligible for Return/Exchange:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Products with missing tags, labels, or packaging</li>
        <li className="mb-2 leading-relaxed">Products that have been used, worn, washed, or altered</li>
        <li className="mb-2 leading-relaxed">Intimate apparel, undergarments, or hygiene-sensitive items</li>
        <li className="mb-2 leading-relaxed">Customized, personalized, or made-to-order Products</li>
        <li className="mb-2 leading-relaxed">Products purchased during final sale or clearance (marked as &quot;non-returnable&quot;)</li>
        <li className="mb-2 leading-relaxed">Products damaged due to misuse, negligence, or improper care</li>
        <li className="mb-2 leading-relaxed">Products returned after the return window has expired</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">9.3 Return and Exchange Process</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Initiating a Return/Exchange:</strong></p>
      <ol className="list-decimal list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Contact <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a> within the return window with:</li>
      </ol>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Order number</li>
        <li className="mb-2 leading-relaxed">Product details (name, size, color)</li>
        <li className="mb-2 leading-relaxed">Reason for return/exchange</li>
        <li className="mb-2 leading-relaxed">Photographs (if claiming defect or damage)</li>
      </ul>
      <ol className="list-decimal list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY will review your request and issue a Return Authorization (if approved)</li>
        <li className="mb-2 leading-relaxed">Pack the Product securely in original packaging (if available)</li>
        <li className="mb-2 leading-relaxed">Courier pickup will be arranged (for eligible returns) or you will receive return shipping instructions</li>
      </ol>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Return Shipping:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Prepaid Return Shipping:</strong> For defective, damaged, or incorrect Products, KALLKEYY will arrange prepaid courier pickup at no cost to you</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Self-Paid Return Shipping:</strong> For change-of-mind returns or size exchanges, you may be responsible for return shipping costs (as specified in Return Policy)</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Inspection and Verification:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Upon receiving returned Products, KALLKEYY will inspect them to verify eligibility</li>
        <li className="mb-2 leading-relaxed">Products not meeting eligibility criteria will be rejected and may be returned to you (shipping costs at your expense)</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">9.4 Refunds</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Refund Processing:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Refunds are issued only after successful inspection and verification of returned Products</li>
        <li className="mb-2 leading-relaxed">Refunds are processed to the <strong className="font-bold">original payment method</strong> within <strong className="font-bold">5-10 Business Days</strong> after verification</li>
        <li className="mb-2 leading-relaxed">Refund timeline may vary based on your bank or payment provider&#39;s processing time</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Refund Amount:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Full refund of Product price (excluding original shipping costs, if applicable)</li>
        <li className="mb-2 leading-relaxed">For defective, damaged, or incorrect Products, full refund including original shipping costs</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Partial Refunds:</strong></p>
      <p className="text-white mb-4 leading-relaxed">KALLKEYY reserves the right to issue partial refunds if:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Products are returned with missing tags, minor damage, or signs of use</li>
        <li className="mb-2 leading-relaxed">Products are not in original condition</li>
        <li className="mb-2 leading-relaxed">Deductions for return shipping costs, restocking fees, or damage are applicable</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">9.5 Exchanges</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Exchange Process:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Exchanges are subject to Product availability</li>
        <li className="mb-2 leading-relaxed">If the desired size, color, or variant is unavailable, refund will be issued instead</li>
        <li className="mb-2 leading-relaxed">Exchanges for different Products may be accommodated on a case-by-case basis</li>
        <li className="mb-2 leading-relaxed">Additional shipping costs may apply for exchanges</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Exchange Timeline:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Exchanges are processed within <strong className="font-bold">7-10 Business Days</strong> after receiving and verifying the returned Product</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">New Product will be shipped once the exchange is approved</li>
      </ul>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">10. INTELLECTUAL PROPERTY RIGHTS</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">10.1 Ownership of Platform and Content</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Proprietary Rights:</strong></p>
      <p className="text-white mb-4 leading-relaxed">All Content, software, code, design, graphics, logos, trademarks, trade names, service marks, copyrights, patents, and other Intellectual Property displayed on or embodied in the Platform are the <strong className="font-bold">exclusive property</strong> of KALLKEYY or its licensors.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Protected Elements Include:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY brand name, logo, and wordmarks</li>
        <li className="mb-2 leading-relaxed">Product names, designs, and images</li>
        <li className="mb-2 leading-relaxed">Website design, layout, and user interface</li>
        <li className="mb-2 leading-relaxed">Software, code, and technical architecture (React, Node.js, Express.js, MongoDB)</li>
        <li className="mb-2 leading-relaxed">Photographs, videos, and multimedia content</li>
        <li className="mb-2 leading-relaxed">Text, copy, product descriptions, and marketing materials</li>
        <li className="mb-2 leading-relaxed">Graphics, illustrations, and visual designs</li>
        <li className="mb-2 leading-relaxed">Domain names (kallkeyy.com and subdomains)</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Legal Protection:</strong></p>
      <p className="text-white mb-4 leading-relaxed">All Intellectual Property is protected under:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">The Copyright Act, 1957 (India)</li>
        <li className="mb-2 leading-relaxed">The Trade Marks Act, 1999 (India)</li>
        <li className="mb-2 leading-relaxed">The Patents Act, 1970 (India)</li>
        <li className="mb-2 leading-relaxed">The Designs Act, 2000 (India)</li>
        <li className="mb-2 leading-relaxed">International intellectual property treaties and conventions</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">10.2 Restrictions on Use</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">You are <strong className="font-bold">strictly prohibited</strong> from:</p>
      <p className="text-white mb-4 leading-relaxed">- Copying, reproducing, distributing, publishing, displaying, performing, modifying, creating derivative works, transmitting, or otherwise exploiting any Content without express <strong className="font-bold">written consent</strong> from KALLKEYY</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Using KALLKEYY trademarks, logos, or brand elements in any manner without prior authorization</li>
        <li className="mb-2 leading-relaxed">Reverse engineering, decompiling, disassembling, or attempting to derive source code from the Platform</li>
        <li className="mb-2 leading-relaxed">Framing, mirroring, or otherwise incorporating any part of the Platform into another website or service</li>
        <li className="mb-2 leading-relaxed">Scraping, harvesting, or extracting data or Content from the Platform using automated tools</li>
        <li className="mb-2 leading-relaxed">Removing, obscuring, or altering any copyright notices, trademarks, or proprietary rights notices</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">10.3 Limited License to Use Platform</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">KALLKEYY grants you a <strong className="font-bold">limited, non-exclusive, non-transferable, revocable license</strong> to:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Access and use the Platform for personal, non-commercial purposes</li>
        <li className="mb-2 leading-relaxed">Browse Products and place Orders</li>
        <li className="mb-2 leading-relaxed">View and download Content for personal reference only</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">This license does NOT permit you to:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Use the Platform or Content for commercial purposes</li>
        <li className="mb-2 leading-relaxed">Reproduce or redistribute Content beyond personal use</li>
        <li className="mb-2 leading-relaxed">Use KALLKEYY Intellectual Property in any manner</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed">KALLKEYY may <strong className="font-bold">revoke this license</strong> at any time without notice.</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">10.4 User Content and License Grant</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">User-Submitted Content:</strong></p>
      <p className="text-white mb-4 leading-relaxed">If you submit, post, upload, or transmit any User Content (reviews, ratings, photographs, comments, feedback, etc.) on or through the Platform:</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">You grant KALLKEYY:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- A <strong className="font-bold">worldwide, perpetual, irrevocable, royalty-free, transferable, sublicensable</strong> license to use, reproduce, distribute, display, modify, adapt, create derivative works from, and otherwise exploit your User Content for any purpose, including but not limited to:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Marketing, advertising, and promotional materials</li>
        <li className="mb-2 leading-relaxed">Social media posts and campaigns</li>
        <li className="mb-2 leading-relaxed">Product reviews and testimonials</li>
        <li className="mb-2 leading-relaxed">Platform improvement and development</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">You represent and warrant that:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">You own or have the necessary rights to submit the User Content</li>
        <li className="mb-2 leading-relaxed">User Content does not infringe any third-party intellectual property, privacy, or other rights</li>
        <li className="mb-2 leading-relaxed">User Content complies with these Terms and applicable laws</li>
        <li className="mb-2 leading-relaxed">You have obtained any necessary consents, permissions, or releases from individuals appearing in User Content</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">10.5 Enforcement and Legal Action</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">Unauthorized use of KALLKEYY Intellectual Property:</p>
      <p className="text-white mb-4 leading-relaxed">- Constitutes a <strong className="font-bold">breach of these Terms</strong></p>
      <p className="text-white mb-4 leading-relaxed">- May result in <strong className="font-bold">immediate Account termination</strong> and suspension of Services</p>
      <p className="text-white mb-4 leading-relaxed">- May result in <strong className="font-bold">civil and criminal liability</strong> under applicable copyright, trademark, and intellectual property laws</p>
      <p className="text-white mb-4 leading-relaxed">- May result in KALLKEYY pursuing <strong className="font-bold">legal remedies</strong>, including but not limited to injunctive relief, damages, and attorneys&#39; fees</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Reporting Intellectual Property Infringement:</strong></p>
      <p className="text-white mb-4 leading-relaxed">If you believe your intellectual property rights have been infringed on the Platform, contact <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a> with:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Description of the allegedly infringing material</li>
        <li className="mb-2 leading-relaxed">Location (URL) of the infringing material</li>
        <li className="mb-2 leading-relaxed">Your contact information</li>
        <li className="mb-2 leading-relaxed">Statement of good faith belief that use is unauthorized</li>
        <li className="mb-2 leading-relaxed">Statement that information provided is accurate</li>
        <li className="mb-2 leading-relaxed">Your physical or electronic signature</li>
      </ul>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">11. USER OBLIGATIONS AND PROHIBITED USES</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">11.1 General User Obligations</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">By using the Platform, you agree to:</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Comply</strong> with all applicable laws, regulations, and these Terms</p>
      <p className="text-white mb-4 leading-relaxed">- Use the Platform only for <strong className="font-bold">lawful purposes</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Provide <strong className="font-bold">accurate and truthful</strong> information</p>
      <p className="text-white mb-4 leading-relaxed">- Maintain the <strong className="font-bold">security</strong> of your Account credentials</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Respect</strong> the rights of KALLKEYY and other Users</p>
      <p className="text-white mb-4 leading-relaxed">- Use the Platform in a manner that does <strong className="font-bold">not disrupt</strong> its operation or harm KALLKEYY&#39;s reputation</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">11.2 Prohibited Conduct</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">You are <strong className="font-bold">strictly prohibited</strong> from:</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Fraudulent or Illegal Activities:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Engaging in fraudulent transactions, payment fraud, or chargeback abuse</li>
        <li className="mb-2 leading-relaxed">Using stolen payment methods or engaging in identity theft</li>
        <li className="mb-2 leading-relaxed">Violating any applicable laws or regulations</li>
        <li className="mb-2 leading-relaxed">Facilitating or participating in money laundering or other illegal activities</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Unauthorized Access and Interference:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Accessing or attempting to access non-public areas of the Platform, servers, or databases</li>
        <li className="mb-2 leading-relaxed">Bypassing, circumventing, or disabling security features or access controls</li>
        <li className="mb-2 leading-relaxed">Interfering with or disrupting the Platform&#39;s operation, servers, or networks</li>
        <li className="mb-2 leading-relaxed">Introducing viruses, malware, trojans, worms, or other harmful code</li>
        <li className="mb-2 leading-relaxed">Launching denial-of-service (DoS) or distributed denial-of-service (DDoS) attacks</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Data Mining and Scraping:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Scraping, harvesting, or extracting data or Content from the Platform using automated tools, bots, or scripts</li>
        <li className="mb-2 leading-relaxed">Using web crawlers, spiders, or scrapers to copy or index Content</li>
        <li className="mb-2 leading-relaxed">Engaging in data mining, screen scraping, or database extraction</li>
        <li className="mb-2 leading-relaxed">Collecting User information without authorization</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Reverse Engineering:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Reverse engineering, decompiling, disassembling, or attempting to derive source code from the Platform</li>
        <li className="mb-2 leading-relaxed">Attempting to discover underlying technology, architecture, or algorithms</li>
        <li className="mb-2 leading-relaxed">Creating derivative works based on the Platform&#39;s code or design</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Impersonation and Misrepresentation:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Impersonating KALLKEYY, its employees, representatives, or affiliates</li>
        <li className="mb-2 leading-relaxed">Impersonating another User or person</li>
        <li className="mb-2 leading-relaxed">Misrepresenting your identity, affiliation, or credentials</li>
        <li className="mb-2 leading-relaxed">Creating fake or misleading Accounts</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Spam and Unsolicited Communications:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Sending spam, unsolicited messages, or promotional content to other Users</li>
        <li className="mb-2 leading-relaxed">Engaging in phishing, social engineering, or deceptive practices</li>
        <li className="mb-2 leading-relaxed">Posting or transmitting unsolicited advertising or commercial solicitations</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Offensive or Harmful Content:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Uploading, posting, or transmitting:</li>
        <li className="mb-2 leading-relaxed">Illegal, harmful, threatening, abusive, harassing, defamatory, or obscene content</li>
        <li className="mb-2 leading-relaxed">Content that promotes violence, discrimination, or hatred</li>
        <li className="mb-2 leading-relaxed">Content that infringes intellectual property or privacy rights</li>
        <li className="mb-2 leading-relaxed">Sexually explicit or pornographic content</li>
        <li className="mb-2 leading-relaxed">Content that violates any applicable law or regulation</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Competitive or Malicious Activities:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Using the Platform to benefit competitors or harm KALLKEYY&#39;s business interests</li>
        <li className="mb-2 leading-relaxed">Engaging in activities designed to damage KALLKEYY&#39;s reputation or goodwill</li>
        <li className="mb-2 leading-relaxed">Posting false or misleading reviews or ratings</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">11.3 Consequences of Prohibited Conduct</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">Violation of these prohibitions may result in:</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Immediate Account suspension or termination</strong> without notice</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Legal action</strong>, including civil and criminal prosecution</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Liability</strong> for damages, losses, costs, and expenses incurred by KALLKEYY</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Reporting</strong> to law enforcement or regulatory authorities</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Forfeiture</strong> of any outstanding balances, credits, or rewards</p>
      <br />
      <p className="text-white mb-4 leading-relaxed">KALLKEYY reserves the right to <strong className="font-bold">cooperate</strong> with law enforcement authorities and provide User information in connection with investigations of illegal activity.</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">12. THIRD-PARTY SERVICES AND INTEGRATIONS</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">12.1 Third-Party Service Providers</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">The Platform integrates and relies upon third-party services to facilitate operations, including but not limited to:</p>
      <br />
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed"><strong className="font-bold">Razorpay</strong> - Payment processing. Website: <a href="https://razorpay.com" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">razorpay.com</a>. Privacy Policy: <a href="https://razorpay.com/privacy" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
        <li className="mb-2 leading-relaxed"><strong className="font-bold">Shiprocket</strong> - Logistics and shipping. Website: <a href="https://shiprocket.in" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">shiprocket.in</a>. Privacy Policy: <a href="https://shiprocket.in/privacy-policy" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
        <li className="mb-2 leading-relaxed"><strong className="font-bold">MSG91</strong> - SMS and WhatsApp OTP. Website: <a href="https://msg91.com" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">msg91.com</a>. Privacy Policy: <a href="https://msg91.com/privacy" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
        <li className="mb-2 leading-relaxed"><strong className="font-bold">Google Analytics</strong> - Website analytics. Website: <a href="https://google.com/analytics" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">google.com/analytics</a>. Privacy Policy: <a href="https://google.com/policies/privacy" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
        <li className="mb-2 leading-relaxed"><strong className="font-bold">Google OAuth</strong> - Authentication. Website: <a href="https://google.com" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">google.com</a>. Privacy Policy: <a href="https://google.com/policies/privacy" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
        <li className="mb-2 leading-relaxed"><strong className="font-bold">Vercel</strong> - Hosting. Website: <a href="https://vercel.com" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">vercel.com</a>. Privacy Policy: <a href="https://vercel.com/legal/privacy-policy" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
        <li className="mb-2 leading-relaxed"><strong className="font-bold">MongoDB Atlas</strong> - Database. Website: <a href="https://mongodb.com" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">mongodb.com</a>. Privacy Policy: <a href="https://mongodb.com/privacy" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
        <li className="mb-2 leading-relaxed"><strong className="font-bold">Nodemailer</strong> - Email delivery. Website: nodemailer.com. Privacy Policy: Varies by provider.</li>
        <li className="mb-2 leading-relaxed"><strong className="font-bold">Hostinger</strong> - Domain registration. Website: <a href="https://hostinger.com" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">hostinger.com</a>. Privacy Policy: <a href="https://hostinger.com/privacy" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
      </ul>

      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">12.2 No Control Over Third-Party Services</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Important Disclaimer:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- KALLKEYY does <strong className="font-bold">not control, operate, or assume responsibility</strong> for the actions, policies, practices, or performance of Third-Party Service Providers</p>
      <p className="text-white mb-4 leading-relaxed">- KALLKEYY is <strong className="font-bold">not responsible</strong> for:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Errors, delays, failures, or interruptions caused by Third-Party Service Providers</li>
        <li className="mb-2 leading-relaxed">Data breaches, security incidents, or privacy violations by Third-Party Service Providers</li>
        <li className="mb-2 leading-relaxed">Changes to third-party terms, policies, or services</li>
        <li className="mb-2 leading-relaxed">Availability or reliability of third-party services</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">12.3 Third-Party Terms and Policies</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Your Responsibility:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Your use of third-party services is subject to the <strong className="font-bold">terms of service and privacy policies</strong> of those Third-Party Service Providers</p>
      <p className="text-white mb-4 leading-relaxed">- You are encouraged to <strong className="font-bold">review</strong> the terms and privacy policies of each Third-Party Service Provider before using their services</p>
      <p className="text-white mb-4 leading-relaxed">- KALLKEYY makes <strong className="font-bold">no representations or warranties</strong> regarding the practices or policies of Third-Party Service Providers</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">12.4 Third-Party Links</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">External Websites:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">The Platform may contain links to third-party websites, social media platforms, or services</li>
        <li className="mb-2 leading-relaxed">KALLKEYY does <strong className="font-bold">not endorse</strong> or assume responsibility for the content, accuracy, or practices of linked third-party websites</li>
        <li className="mb-2 leading-relaxed">Accessing third-party websites is <strong className="font-bold">at your own risk</strong></li>
        <li className="mb-2 leading-relaxed">KALLKEYY is <strong className="font-bold">not liable</strong> for any damages, losses, or harm resulting from your use of third-party websites</li>
      </ul>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">13. WARRANTIES AND DISCLAIMERS</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">13.1 &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; Basis</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">No Warranties:</strong></p>
      <p className="text-white mb-4 leading-relaxed">The Platform, all Products, and all Services are provided on an <strong className="font-bold">&quot;AS IS&quot;</strong> and <strong className="font-bold">&quot;AS AVAILABLE&quot;</strong> basis <strong className="font-bold">WITHOUT ANY WARRANTIES OR REPRESENTATIONS OF ANY KIND</strong>, whether express, implied, statutory, or otherwise.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">TO THE MAXIMUM EXTENT PERMITTED BY LAW, KALLKEYY EXPRESSLY DISCLAIMS ALL WARRANTIES, INCLUDING BUT NOT LIMITED TO:</strong></p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">13.2 Disclaimers of Specific Warranties</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Merchantability and Fitness for Purpose:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- KALLKEYY disclaims all warranties of <strong className="font-bold">merchantability</strong>, <strong className="font-bold">fitness for a particular purpose</strong>, <strong className="font-bold">quality</strong>, or <strong className="font-bold">suitability</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Products may not be suitable for your specific needs or expectations</li>
        <li className="mb-2 leading-relaxed">KALLKEYY makes no representation that Products will meet your requirements</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Non-Infringement:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- KALLKEYY disclaims all warranties of <strong className="font-bold">non-infringement</strong> of third-party rights</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">While KALLKEYY respects intellectual property rights, KALLKEYY does not guarantee that the Platform or Products do not infringe any third-party rights</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Accuracy and Completeness:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY does not warrant that:</li>
        <li className="mb-2 leading-relaxed">Content on the Platform is accurate, complete, reliable, current, or error-free</li>
        <li className="mb-2 leading-relaxed">Product descriptions, images, or specifications are entirely accurate</li>
        <li className="mb-2 leading-relaxed">Pricing is free from errors or omissions</li>
        <li className="mb-2 leading-relaxed">Information provided is suitable for any particular purpose</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Uninterrupted or Error-Free Access:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY does not warrant that:</li>
        <li className="mb-2 leading-relaxed">The Platform will be available, accessible, or operational at all times</li>
        <li className="mb-2 leading-relaxed">Access to the Platform will be uninterrupted, timely, secure, or error-free</li>
        <li className="mb-2 leading-relaxed">Defects, errors, or bugs will be corrected</li>
        <li className="mb-2 leading-relaxed">The Platform is free from viruses, malware, or other harmful components</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Third-Party Services:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY does not warrant the availability, reliability, accuracy, or performance of Third-Party Service Providers</li>
        <li className="mb-2 leading-relaxed">KALLKEYY is not responsible for third-party errors, delays, or failures</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">13.3 Assumption of Risk</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">You Acknowledge and Accept That:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Use of the Platform and purchase of Products is <strong className="font-bold">at your sole risk</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">You are responsible for evaluating the accuracy, completeness, and usefulness of all information and Content</li>
        <li className="mb-2 leading-relaxed">You bear all risks associated with using the Platform, including technical, security, and financial risks</li>
        <li className="mb-2 leading-relaxed">KALLKEYY has no obligation to ensure the Platform meets your specific needs or expectations</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">13.4 Jurisdictional Variations</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">Some jurisdictions do not allow disclaimers of implied warranties or limitations on consumer rights. If you are located in such a jurisdiction, some or all of the above disclaimers may not apply to you, and you may have additional rights under applicable consumer protection laws.</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">14. LIMITATION OF LIABILITY</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">14.1 Exclusion of Consequential Damages</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL KALLKEYY, ITS OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, AFFILIATES, SUPPLIERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO:</strong></p>
      <br />
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Loss of profits, revenue, sales, or business opportunities</li>
        <li className="mb-2 leading-relaxed">Loss of data, information, or goodwill</li>
        <li className="mb-2 leading-relaxed">Business interruption or downtime</li>
        <li className="mb-2 leading-relaxed">Loss of anticipated savings or benefits</li>
        <li className="mb-2 leading-relaxed">Cost of procurement of substitute goods or services</li>
        <li className="mb-2 leading-relaxed">Reputational harm or damage</li>
        <li className="mb-2 leading-relaxed">Emotional distress or mental anguish</li>
        <li className="mb-2 leading-relaxed">Any other intangible losses</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">WHETHER ARISING FROM:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Breach of contract</li>
        <li className="mb-2 leading-relaxed">Tort (including negligence)</li>
        <li className="mb-2 leading-relaxed">Strict liability</li>
        <li className="mb-2 leading-relaxed">Statutory violation</li>
        <li className="mb-2 leading-relaxed">Any other legal theory</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">EVEN IF KALLKEYY HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</strong></p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">14.2 Cap on Total Liability</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">KALLKEYY&#39;S TOTAL AGGREGATE LIABILITY</strong> arising out of or related to these Terms, your use of the Platform, or any Products purchased, <strong className="font-bold">SHALL NOT EXCEED THE TOTAL AMOUNT YOU PAID TO KALLKEYY</strong> for the specific Product or Service giving rise to the claim <strong className="font-bold">in the 12 months preceding the claim</strong>, or <strong className="font-bold">INR 5,000</strong> (whichever is less).</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">This limitation applies to all claims, collectively, including but not limited to:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Breach of contract</li>
        <li className="mb-2 leading-relaxed">Breach of warranty</li>
        <li className="mb-2 leading-relaxed">Product defects or non-conformity</li>
        <li className="mb-2 leading-relaxed">Misrepresentation or fraud</li>
        <li className="mb-2 leading-relaxed">Negligence or gross negligence</li>
        <li className="mb-2 leading-relaxed">Strict liability</li>
        <li className="mb-2 leading-relaxed">Violation of statutory or regulatory obligations</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">14.3 Basis of the Bargain</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">You acknowledge and agree that:</p>
      <p className="text-white mb-4 leading-relaxed">- The limitations of liability set forth in this Section reflect a <strong className="font-bold">reasonable allocation of risk</strong> between you and KALLKEYY</p>
      <p className="text-white mb-4 leading-relaxed">- These limitations are an <strong className="font-bold">essential basis of the bargain</strong> between you and KALLKEYY</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">KALLKEYY would not provide the Platform or Products without these limitations</li>
        <li className="mb-2 leading-relaxed">These limitations shall apply <strong className="font-bold">even if any limited remedy fails of its essential purpose</strong></li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">14.4 Jurisdictional Variations</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">Some jurisdictions do not allow limitations on liability for consequential or incidental damages or limitations on implied warranties. If you are located in such a jurisdiction, some or all of the above limitations may not apply to you, and you may have additional rights under applicable consumer protection laws.</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">15. INDEMNIFICATION</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">15.1 Your Indemnification Obligations</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">You agree to <strong className="font-bold">indemnify, defend, and hold harmless</strong> KALLKEYY, its parent companies, subsidiaries, affiliates, officers, directors, employees, agents, contractors, licensors, suppliers, and partners (collectively, the &quot;<strong className="font-bold">Indemnified Parties</strong>&quot;) from and against any and all claims, demands, actions, suits, proceedings, investigations, liabilities, damages, losses, costs, and expenses (including reasonable attorneys&#39; fees, expert fees, and litigation costs) arising out of or related to:</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Your Conduct:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Your use or misuse of the Platform or Services</li>
        <li className="mb-2 leading-relaxed">Your violation of these Terms or any applicable law or regulation</li>
        <li className="mb-2 leading-relaxed">Your violation of any third-party rights, including intellectual property, privacy, or contractual rights</li>
        <li className="mb-2 leading-relaxed">Your User Content or any content you submit, post, or transmit through the Platform</li>
        <li className="mb-2 leading-relaxed">Your fraudulent, negligent, or wrongful conduct</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Your Account:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Any activity occurring under your Account, whether authorized or unauthorized</li>
        <li className="mb-2 leading-relaxed">Unauthorized use of your Account resulting from your failure to maintain security</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Product Use:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Your use, misuse, or modification of Products purchased from KALLKEYY</li>
        <li className="mb-2 leading-relaxed">Claims arising from your resale or redistribution of Products (if unauthorized)</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Third-Party Claims:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Any third-party claims, demands, or actions arising from your use of the Platform or purchase of Products</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">15.2 Defense and Settlement</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Your Obligations:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- You must <strong className="font-bold">promptly notify</strong> KALLKEYY of any claim for which you are required to indemnify the Indemnified Parties</p>
      <p className="text-white mb-4 leading-relaxed">- You must provide KALLKEYY with <strong className="font-bold">reasonable cooperation and assistance</strong> in defending such claim</p>
      <p className="text-white mb-4 leading-relaxed">- You must <strong className="font-bold">not settle</strong> any claim without KALLKEYY&#39;s prior written consent</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">KALLKEYY&#39;s Rights:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- KALLKEYY reserves the right to <strong className="font-bold">assume exclusive defense and control</strong> of any claim subject to indemnification</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">If KALLKEYY assumes defense, you must cooperate fully and provide all necessary assistance</li>
        <li className="mb-2 leading-relaxed">KALLKEYY may settle any claim in its sole discretion</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">15.3 Survival</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">Your indemnification obligations shall <strong className="font-bold">survive</strong> termination of these Terms, closure of your Account, or cessation of your use of the Platform.</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">16. TERMINATION</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">16.1 Termination by KALLKEYY</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">KALLKEYY&#39;s Rights:</strong></p>
      <p className="text-white mb-4 leading-relaxed">KALLKEYY reserves the <strong className="font-bold">absolute and unconditional right</strong> to suspend, restrict, or terminate your access to the Platform or your Account <strong className="font-bold">immediately, without prior notice or liability</strong>, for any reason or no reason, including but not limited to:</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Grounds for Termination:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Violation of these Terms or any applicable policy</li>
        <li className="mb-2 leading-relaxed">Fraudulent, abusive, illegal, or unethical conduct</li>
        <li className="mb-2 leading-relaxed">Providing false or misleading information</li>
        <li className="mb-2 leading-relaxed">Engaging in activity harmful to KALLKEYY&#39;s reputation, business, or interests</li>
        <li className="mb-2 leading-relaxed">Chargebacks, payment disputes, or payment failures</li>
        <li className="mb-2 leading-relaxed">Abuse of promotional offers, discounts, or loyalty programs</li>
        <li className="mb-2 leading-relaxed">Multiple or repeated policy violations</li>
        <li className="mb-2 leading-relaxed">Suspected security breach or unauthorized Account access</li>
        <li className="mb-2 leading-relaxed">Prolonged Account inactivity</li>
        <li className="mb-2 leading-relaxed">At KALLKEYY&#39;s sole discretion for any reason</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Effect of Termination by KALLKEYY:</strong></p>
      <p className="text-white mb-4 leading-relaxed">Upon termination:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Your right to access and use the Platform immediately ceases</li>
        <li className="mb-2 leading-relaxed">Your Account is deactivated and you lose access to all Account features, data, and history</li>
        <li className="mb-2 leading-relaxed">You must immediately cease all use of the Platform</li>
        <li className="mb-2 leading-relaxed">All outstanding payment obligations survive termination</li>
        <li className="mb-2 leading-relaxed">KALLKEYY may retain certain data as required by law or for legitimate business purposes</li>
        <li className="mb-2 leading-relaxed">You remain liable for all activities that occurred prior to termination</li>
        <li className="mb-2 leading-relaxed">KALLKEYY is not liable for any damages, losses, or consequences resulting from termination</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">16.2 Termination by User</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">User-Initiated Termination:</strong></p>
      <p className="text-white mb-4 leading-relaxed">You may terminate your Account and cease using the Platform at any time by:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Contacting <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a> and requesting Account deletion</li>
        <li className="mb-2 leading-relaxed">Following Account deletion procedures (if available on the Platform)</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Effect of User Termination:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Your personal data will be processed according to our Privacy Policy</li>
        <li className="mb-2 leading-relaxed">You will lose access to Account features, order history, and saved information</li>
        <li className="mb-2 leading-relaxed">Pending orders may be canceled or fulfilled at KALLKEYY&#39;s discretion</li>
        <li className="mb-2 leading-relaxed">Outstanding payment obligations remain enforceable</li>
        <li className="mb-2 leading-relaxed">Loyalty rewards, credits, or balances may be forfeited</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">16.3 Survival of Provisions</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">The following provisions shall <strong className="font-bold">survive termination</strong> of these Terms:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Sections related to Intellectual Property Rights</li>
        <li className="mb-2 leading-relaxed">Indemnification obligations</li>
        <li className="mb-2 leading-relaxed">Limitations of Liability</li>
        <li className="mb-2 leading-relaxed">Disclaimers</li>
        <li className="mb-2 leading-relaxed">Dispute Resolution and Arbitration</li>
        <li className="mb-2 leading-relaxed">Governing Law and Jurisdiction</li>
        <li className="mb-2 leading-relaxed">Any other provisions that by their nature should survive termination</li>
      </ul>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">17. FORCE MAJEURE</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">17.1 Definition of Force Majeure</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">&quot;<strong className="font-bold">Force Majeure Event</strong>&quot; means any event, circumstance, or cause beyond KALLKEYY&#39;s reasonable control that prevents, delays, or hinders KALLKEYY&#39;s performance of its obligations under these Terms, including but not limited to:</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Natural Disasters:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Earthquakes, floods, tsunamis, hurricanes, cyclones, tornadoes, or other natural calamities</li>
        <li className="mb-2 leading-relaxed">Fires, explosions, or environmental disasters</li>
        <li className="mb-2 leading-relaxed">Epidemics, pandemics, or public health emergencies (e.g., COVID-19)</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Government Actions:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Acts of government, government restrictions, regulations, or orders</li>
        <li className="mb-2 leading-relaxed">Import or export restrictions, embargoes, or sanctions</li>
        <li className="mb-2 leading-relaxed">Lockdowns, curfews, or movement restrictions</li>
        <li className="mb-2 leading-relaxed">Changes in law or regulatory requirements</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Civil Disturbances:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">War, invasion, terrorism, or armed conflict</li>
        <li className="mb-2 leading-relaxed">Riots, civil unrest, or public disorder</li>
        <li className="mb-2 leading-relaxed">Strikes, lockouts, or labor disputes (affecting KALLKEYY or Third-Party Service Providers)</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Technical and Infrastructure Failures:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Power outages, electrical grid failures, or utility disruptions</li>
        <li className="mb-2 leading-relaxed">Internet outages, telecommunications failures, or network disruptions</li>
        <li className="mb-2 leading-relaxed">Cyberattacks, hacking, or data breaches (beyond KALLKEYY&#39;s control)</li>
        <li className="mb-2 leading-relaxed">Third-Party Service Provider failures or unavailability</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Supply Chain Disruptions:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Supplier failures, production delays, or raw material shortages</li>
        <li className="mb-2 leading-relaxed">Transportation disruptions, port closures, or logistics failures</li>
        <li className="mb-2 leading-relaxed">Customs delays or regulatory hold-ups</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Other Unforeseeable Events:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Any other event, circumstance, or cause beyond KALLKEYY&#39;s reasonable control</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">17.2 Effect of Force Majeure</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Suspension of Obligations:</strong></p>
      <p className="text-white mb-4 leading-relaxed">If a Force Majeure Event occurs, KALLKEYY&#39;s obligations under these Terms shall be <strong className="font-bold">suspended</strong> to the extent and for the duration that performance is prevented, delayed, or hindered by the Force Majeure Event.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">No Liability:</strong></p>
      <p className="text-white mb-4 leading-relaxed">KALLKEYY shall <strong className="font-bold">not be liable</strong> for:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Failure to perform or delay in performing any obligation under these Terms</li>
        <li className="mb-2 leading-relaxed">Order delays, cancellations, or non-fulfillment</li>
        <li className="mb-2 leading-relaxed">Service interruptions or Platform unavailability</li>
        <li className="mb-2 leading-relaxed">Any damages, losses, or consequences arising from the Force Majeure Event</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">17.3 Notification and Mitigation</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Notification:</strong></p>
      <p className="text-white mb-4 leading-relaxed">KALLKEYY will make reasonable efforts to notify affected Users of a Force Majeure Event and its expected impact on Orders, deliveries, or Services.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Mitigation:</strong></p>
      <p className="text-white mb-4 leading-relaxed">KALLKEYY will use commercially reasonable efforts to mitigate the impact of the Force Majeure Event and resume normal operations as soon as reasonably practicable.</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">17.4 Termination Due to Prolonged Force Majeure</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">If a Force Majeure Event continues for more than <strong className="font-bold">30 consecutive days</strong>, either party may terminate the affected Order(s) or these Terms by providing written notice to the other party. Refunds for canceled Orders will be processed in accordance with KALLKEYY&#39;s Refund Policy.</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">18. GOVERNING LAW AND JURISDICTION</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">18.1 Governing Law</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">These Terms, and any disputes arising out of or related to these Terms, your use of the Platform, or any Products or Services, shall be <strong className="font-bold">governed by and construed in accordance with the laws of India</strong>, without regard to its conflict of law principles.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Applicable Laws Include:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">The Indian Contract Act, 1872</li>
        <li className="mb-2 leading-relaxed">The Consumer Protection Act, 2019</li>
        <li className="mb-2 leading-relaxed">The Consumer Protection (E-Commerce) Rules, 2020</li>
        <li className="mb-2 leading-relaxed">The Information Technology Act, 2000</li>
        <li className="mb-2 leading-relaxed">The Sale of Goods Act, 1930</li>
        <li className="mb-2 leading-relaxed">Any other applicable Indian laws and regulations</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">18.2 Exclusive Jurisdiction</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">You <strong className="font-bold">irrevocably and unconditionally agree</strong> that:</p>
      <p className="text-white mb-4 leading-relaxed">- Any disputes, claims, or controversies arising out of or related to these Terms, the Platform, or any Products or Services shall be subject to the <strong className="font-bold">exclusive jurisdiction of the competent courts located in New Delhi, India</strong></p>
      <p className="text-white mb-4 leading-relaxed">- You <strong className="font-bold">consent to personal jurisdiction</strong> in New Delhi, India</p>
      <p className="text-white mb-4 leading-relaxed">- You <strong className="font-bold">waive any objection</strong> to venue or forum non conveniens in New Delhi, India</p>
      <p className="text-white mb-4 leading-relaxed">- You <strong className="font-bold">will not bring any action</strong> in any other jurisdiction or forum</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Exception:</strong> This exclusive jurisdiction clause does not prevent KALLKEYY from seeking injunctive relief or other equitable remedies in any jurisdiction where such relief is necessary to protect KALLKEYY&#39;s Intellectual Property or other rights.</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">19. DISPUTE RESOLUTION AND ARBITRATION</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">19.1 Pre-Arbitration Dispute Resolution</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Informal Resolution:</strong></p>
      <p className="text-white mb-4 leading-relaxed">Before initiating arbitration or litigation, you agree to attempt to resolve any dispute informally by:</p>
      <ol className="list-decimal list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Contacting KALLKEYY at <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a> with a detailed description of the dispute</li>
        <li className="mb-2 leading-relaxed">Providing KALLKEYY with a reasonable opportunity (30 days) to resolve the dispute amicably</li>
        <li className="mb-2 leading-relaxed">Engaging in good faith negotiations to reach a mutually acceptable resolution</li>
      </ol>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">19.2 Binding Arbitration</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Arbitration Agreement:</strong></p>
      <p className="text-white mb-4 leading-relaxed">If informal resolution is unsuccessful, you agree that any dispute, claim, or controversy arising out of or related to these Terms (except as excluded below) shall be <strong className="font-bold">resolved exclusively through binding arbitration</strong> in accordance with the <strong className="font-bold">Arbitration and Conciliation Act, 1996</strong> (as amended).</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Arbitration Procedures:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Seat of Arbitration:</strong> New Delhi, India</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Language:</strong> English</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Number of Arbitrators:</strong> One (1) arbitrator mutually agreed upon by the parties; if no agreement within 30 days, appointed by the appointing authority under the Arbitration and Conciliation Act, 1996</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Governing Rules:</strong> Indian Arbitration and Conciliation Act, 1996</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Arbitration Costs:</strong> Each party shall bear its own costs and fees; arbitrator&#39;s fees shall be shared equally unless the arbitrator awards otherwise</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Arbitration Award:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- The arbitrator&#39;s decision and award shall be <strong className="font-bold">final and binding</strong> on both parties</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">The award may be enforced in any court of competent jurisdiction</li>
        <li className="mb-2 leading-relaxed">Limited grounds for appeal as provided under the Arbitration and Conciliation Act, 1996</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">19.3 Exceptions to Arbitration</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">The following disputes are <strong className="font-bold">excluded from arbitration</strong> and may be brought in court:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Claims for injunctive relief or equitable remedies to protect Intellectual Property rights</li>
        <li className="mb-2 leading-relaxed">Claims involving amounts below the jurisdictional threshold for small claims courts (if applicable)</li>
        <li className="mb-2 leading-relaxed">Claims that cannot be arbitrated under applicable law</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">19.4 Class Action Waiver</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">YOU AND KALLKEYY AGREE THAT:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- All disputes shall be resolved on an <strong className="font-bold">individual basis only</strong></p>
      <p className="text-white mb-4 leading-relaxed">- You <strong className="font-bold">waive the right</strong> to participate in any class action, collective action, or representative proceeding</p>
      <p className="text-white mb-4 leading-relaxed">- You <strong className="font-bold">may not</strong> act as a class representative, private attorney general, or in any representative capacity</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Arbitration shall not be consolidated with any other arbitration or proceeding without both parties&#39; consent</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">If the class action waiver is found to be unenforceable, the arbitration agreement shall be void, and disputes shall be resolved in court in accordance with Section 18 (Governing Law and Jurisdiction).</strong></p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">19.5 Survival</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">This arbitration agreement shall <strong className="font-bold">survive</strong> termination of these Terms.</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">20. ENTIRE AGREEMENT AND SEVERABILITY</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">20.1 Entire Agreement</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">These Terms, together with:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">The Privacy Policy</li>
        <li className="mb-2 leading-relaxed">The Return, Refund, and Exchange Policy</li>
        <li className="mb-2 leading-relaxed">The Shipping and Delivery Policy</li>
        <li className="mb-2 leading-relaxed">The Cookie Policy</li>
        <li className="mb-2 leading-relaxed">Any other policies or notices referenced herein</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed">constitute the <strong className="font-bold">entire agreement</strong> between you and KALLKEYY regarding your use of the Platform and purchase of Products, and <strong className="font-bold">supersede all prior or contemporaneous agreements, understandings, representations, or communications</strong> (whether oral, written, or electronic) between you and KALLKEYY.</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">20.2 Severability</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">If any provision of these Terms is held to be <strong className="font-bold">invalid, illegal, or unenforceable</strong> by a court of competent jurisdiction or arbitrator:</p>
      <p className="text-white mb-4 leading-relaxed">- Such provision shall be <strong className="font-bold">modified</strong> to the minimum extent necessary to make it valid and enforceable</p>
      <p className="text-white mb-4 leading-relaxed">- If modification is not possible, the provision shall be <strong className="font-bold">severed</strong> from these Terms</p>
      <p className="text-white mb-4 leading-relaxed">- The <strong className="font-bold">remaining provisions</strong> shall remain in full force and effect</p>
      <p className="text-white mb-4 leading-relaxed">- The invalidity of one provision shall <strong className="font-bold">not affect</strong> the validity or enforceability of any other provision</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">20.3 Waiver</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">No Waiver by Failure to Enforce:</strong></p>
      <p className="text-white mb-4 leading-relaxed">KALLKEYY&#39;s failure to enforce any provision of these Terms, or to exercise any right or remedy, shall <strong className="font-bold">not constitute a waiver</strong> of such provision, right, or remedy.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">No Continuing Waiver:</strong></p>
      <p className="text-white mb-4 leading-relaxed">No waiver by KALLKEYY of any breach or default shall be deemed a <strong className="font-bold">continuing waiver</strong> or a waiver of any other breach or default.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Waiver Must Be in Writing:</strong></p>
      <p className="text-white mb-4 leading-relaxed">Any waiver must be <strong className="font-bold">in writing and signed</strong> by an authorized representative of KALLKEYY to be effective.</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">20.4 Assignment</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">KALLKEYY&#39;s Right to Assign:</strong></p>
      <p className="text-white mb-4 leading-relaxed">KALLKEYY may assign, transfer, or delegate these Terms or any rights or obligations hereunder to any third party (including in connection with a merger, acquisition, sale of assets, or restructuring) <strong className="font-bold">without your consent</strong>.</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Your Restriction on Assignment:</strong></p>
      <p className="text-white mb-4 leading-relaxed">You may <strong className="font-bold">not assign, transfer, or delegate</strong> these Terms or any rights or obligations hereunder without KALLKEYY&#39;s prior written consent. Any attempted assignment in violation of this provision is <strong className="font-bold">void</strong>.</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">21. UPDATES AND AMENDMENTS TO TERMS</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">21.1 Right to Modify</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">KALLKEYY reserves the <strong className="font-bold">unconditional and absolute right</strong> to modify, amend, update, or replace these Terms at any time, in its sole discretion, for any reason, including but not limited to:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Changes in applicable laws or regulations</li>
        <li className="mb-2 leading-relaxed">Business operational changes or improvements</li>
        <li className="mb-2 leading-relaxed">Introduction of new features, Products, or Services</li>
        <li className="mb-2 leading-relaxed">Clarification of existing provisions</li>
        <li className="mb-2 leading-relaxed">Addressing security or legal concerns</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">21.2 Notice of Changes</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Material Changes:</strong></p>
      <p className="text-white mb-4 leading-relaxed">For material changes affecting your rights or obligations:</p>
      <p className="text-white mb-4 leading-relaxed">- Notice will be provided via <strong className="font-bold">website banner</strong>, <strong className="font-bold">email notification</strong> to your registered email address, or <strong className="font-bold">in-platform alert</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Material changes will be effective <strong className="font-bold">30 days after posting</strong> or such longer period as required by law</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Non-Material Changes:</strong></p>
      <p className="text-white mb-4 leading-relaxed">For non-material changes (clarifications, corrections, or administrative updates):</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Changes may be posted directly without separate notification</li>
        <li className="mb-2 leading-relaxed">Changes are effective immediately upon posting</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">21.3 Acceptance of Updated Terms</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Continued Use Constitutes Acceptance:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- Your continued use of the Platform after the effective date of any changes constitutes your <strong className="font-bold">binding acceptance</strong> of the modified Terms</p>
      <p className="text-white mb-4 leading-relaxed">- If you do not agree to the modified Terms, you must <strong className="font-bold">immediately discontinue use</strong> of the Platform and close your Account</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Review Responsibility:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- It is <strong className="font-bold">your responsibility</strong> to review these Terms periodically for updates</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">The &quot;Last Updated&quot; date at the top of these Terms indicates the date of the most recent revision</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">21.4 Archival of Previous Versions</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">KALLKEYY may maintain archives of previous versions of these Terms. You may request access to previous versions by contacting <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a>.</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">22. NOTICES AND COMMUNICATIONS</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">22.1 Notices to KALLKEYY</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">All notices, requests, demands, or other communications to KALLKEYY under these Terms must be in <strong className="font-bold">writing</strong> and delivered via:</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Email:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">support@kallkeyy.com</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Subject: &quot;Legal Notice - [Your Name]&quot;</li>
        <li className="mb-2 leading-relaxed">Include your full name, Account email, Order number (if applicable), and detailed description of the matter</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Postal Mail:</strong></p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">KALLKEYY</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Dwarka, New Delhi, India</li>
        <li className="mb-2 leading-relaxed">[Complete address to be provided]</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Effective Date of Notices:</strong></p>
      <p className="text-white mb-4 leading-relaxed">Notices to KALLKEYY are deemed received:</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Email:</strong> Upon transmission (if sent during Business Hours) or the next Business Day (if sent outside Business Hours)</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Postal Mail:</strong> 5 Business Days after posting</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">22.2 Notices to Users</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">KALLKEYY may provide notices, communications, or disclosures to you via:</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Email:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Sent to the email address associated with your Account</li>
        <li className="mb-2 leading-relaxed">You are responsible for ensuring your email address is current and accurate</li>
        <li className="mb-2 leading-relaxed">You must check your email regularly, including spam/junk folders</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">In-Platform Notifications:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Displayed on the Platform dashboard, Account page, or as pop-up alerts</li>
        <li className="mb-2 leading-relaxed">You must check the Platform regularly for notifications</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Website Banner:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Prominent notices displayed on the homepage or throughout the Platform</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">SMS or WhatsApp:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Sent to the phone number associated with your Account (for Order updates, OTP, or urgent notices)</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Effective Date of Notices:</strong></p>
      <p className="text-white mb-4 leading-relaxed">Notices to you are deemed received:</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">Email:</strong> Immediately upon transmission or within 24 hours (whichever is earlier)</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">In-Platform:</strong> Upon display or posting</p>
      <p className="text-white mb-4 leading-relaxed">- <strong className="font-bold">SMS/WhatsApp:</strong> Upon transmission</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">22.3 Consent to Electronic Communications</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">By using the Platform, you <strong className="font-bold">consent to receive communications from KALLKEYY electronically</strong> (via email, SMS, WhatsApp, or in-platform notifications). Electronic communications satisfy any legal requirement that communications be in writing.</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">23. ACCESSIBILITY AND CUSTOMER SUPPORT</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">23.1 Platform Accessibility</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">KALLKEYY strives to make the Platform accessible to individuals with disabilities, in accordance with applicable accessibility standards and best practices. If you experience accessibility issues, contact <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a> for assistance.</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">23.2 Customer Support</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Contact Information:</strong></p>
      <p className="text-white mb-4 leading-relaxed">For any questions, concerns, complaints, or support requests, contact:</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Email:</strong> <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a></p>
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Response Time:</strong> 1-2 Business Days for acknowledgment; resolution within 5-7 Business Days (depending on complexity)</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Support Hours:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Email support is available 24/7 (responses during Business Hours)</li>
        <li className="mb-2 leading-relaxed">Business Hours: Monday to Saturday, 10:00 AM to 6:00 PM IST (excluding public holidays)</li>
      </ul>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">What We Can Help With:</strong></p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Order status, tracking, and delivery inquiries</li>
        <li className="mb-2 leading-relaxed">Account issues and password resets</li>
        <li className="mb-2 leading-relaxed">Product information and recommendations</li>
        <li className="mb-2 leading-relaxed">Returns, exchanges, and refunds</li>
        <li className="mb-2 leading-relaxed">Payment issues and transaction queries</li>
        <li className="mb-2 leading-relaxed">Technical issues or bugs</li>
        <li className="mb-2 leading-relaxed">General inquiries and feedback</li>
        <li className="mb-2 leading-relaxed">Privacy and data requests</li>
        <li className="mb-2 leading-relaxed">Complaints and grievances</li>
      </ul>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">24. GENERAL PROVISIONS</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">24.1 Relationship of Parties</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">Nothing in these Terms creates any partnership, joint venture, employment, agency, or franchise relationship between you and KALLKEYY. You have no authority to bind KALLKEYY or make representations on its behalf.</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">24.2 Independent Contractors</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">You and KALLKEYY are independent contractors. KALLKEYY is not your employer, and you are not KALLKEYY&#39;s employee, agent, or representative.</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">24.3 No Third-Party Beneficiaries</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">These Terms are for the benefit of you and KALLKEYY only. No third party (except the Indemnified Parties under Section 15) has any right to enforce or rely upon these Terms.</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">24.4 Interpretation</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">In case of ambiguity or conflict:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">These Terms shall be construed fairly and not strictly for or against either party</li>
        <li className="mb-2 leading-relaxed">Ambiguities shall not be resolved against the drafting party</li>
        <li className="mb-2 leading-relaxed">Headings and section titles are for convenience only and do not affect interpretation</li>
      </ul>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">24.5 Counterparts and Electronic Signatures</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">These Terms may be accepted electronically (by clicking &quot;I Agree,&quot; using the Platform, or creating an Account). Electronic acceptance has the same legal effect as a handwritten signature.</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">25. ACKNOWLEDGMENT AND CONSENT</h2>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">25.1 Express Acknowledgment</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">By accessing, browsing, or using the Platform, creating an Account, or placing an Order, you <strong className="font-bold">explicitly acknowledge and confirm</strong> that:</p>
      <br />
      <p className="text-white mb-4 leading-relaxed">1. You have <strong className="font-bold">read these Terms in their entirety</strong></p>
      <p className="text-white mb-4 leading-relaxed">2. You <strong className="font-bold">understand these Terms</strong> and agree to be bound by them</p>
      <p className="text-white mb-4 leading-relaxed">3. You <strong className="font-bold">consent to all provisions</strong> set forth herein, including:</p>
      <ul className="list-disc list-inside mb-6 text-white space-y-2 ml-4">
        <li className="mb-2 leading-relaxed">Arbitration agreement and class action waiver (Section 19)</li>
        <li className="mb-2 leading-relaxed">Limitation of liability (Section 14)</li>
        <li className="mb-2 leading-relaxed">Disclaimers of warranties (Section 13)</li>
        <li className="mb-2 leading-relaxed">Indemnification obligations (Section 15)</li>
        <li className="mb-2 leading-relaxed">Governing law and jurisdiction (Sections 18-19)</li>
      </ul>
      <p className="text-white mb-4 leading-relaxed">4. You have the <strong className="font-bold">legal capacity</strong> to enter into binding contracts</p>
      <p className="text-white mb-4 leading-relaxed">5. You are <strong className="font-bold">not prohibited</strong> from using the Platform under applicable law</p>
      <p className="text-white mb-4 leading-relaxed">6. You <strong className="font-bold">accept responsibility</strong> for compliance with these Terms</p>
      <p className="text-white mb-4 leading-relaxed">7. You <strong className="font-bold">acknowledge the risks</strong> associated with using the Platform and purchasing Products</p>
      <p className="text-white mb-4 leading-relaxed">8. You have been given the <strong className="font-bold">opportunity to seek legal advice</strong> before accepting these Terms</p>
      <br />

      <h3 className="text-2xl font-semibold mt-8 mb-4 text-[#b90e0a]">25.2 Voluntary and Informed Consent</h3>
      <br />
      <p className="text-white mb-4 leading-relaxed">You acknowledge that your acceptance of these Terms is <strong className="font-bold">voluntary, informed, and without coercion</strong>, and that you have had adequate opportunity to review and understand the provisions herein.</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />

      <h2 className="text-3xl font-bold mt-12 mb-6 text-[#b90e0a]">26. CONTACT INFORMATION</h2>
      <br />
      <p className="text-white mb-4 leading-relaxed">For any questions, complaints, legal notices, or support requests, please contact:</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">KALLKEYY</strong></p>
      <p className="text-white mb-4 leading-relaxed">Dwarka, New Delhi, India</p>
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">Email:</strong> <a href="mailto:support@kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400">support@kallkeyy.com</a></p>
        <p className="text-white text-sm"><strong className="font-bold">Website:</strong> <a href="https://www.kallkeyy.com" className="text-[#b90e0a] underline hover:text-red-400" target="_blank" rel="noopener noreferrer">www.kallkeyy.com</a></p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">EFFECTIVE DATE:</strong> November 1, 2025</p>
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">LAST UPDATED:</strong> November 1, 2025</p>
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">© 2025 KALLKEYY. All Rights Reserved.</strong></p>
      <br />
      <p className="text-white mb-4 leading-relaxed">All content, legal text, brand identifiers, trademarks, logos, and Intellectual Property are the exclusive property of KALLKEYY, protected under the <strong className="font-bold">Copyright Act, 1957</strong>, the <strong className="font-bold">Trade Marks Act, 1999</strong>, and applicable international treaties and conventions. Unauthorized use, reproduction, or distribution is strictly prohibited and may result in civil and criminal liability.</p>
      <br />
      <hr className="my-8 border-white/20" />
      <br />
      <p className="text-white mb-4 leading-relaxed"><strong className="font-bold">END OF TERMS OF SERVICE</strong></p>
        </div>
      </div>
    </div>
  );
}
