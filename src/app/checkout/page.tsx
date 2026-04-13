'use client'

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getProfileForCheckoutAction, uploadPaymentProofAction, placeOrderAction } from "@/app/checkout/actions";
import { createClient } from "@/lib/supabase/client";
import {
  contactSchema,
  shippingSchema,
  paymentSchema,
  type ContactFormData,
  type ShippingFormData,
  type PaymentFormData
} from "@/lib/validations/checkout";
import {
  Check,
  ChevronRight,
  CreditCard,
  Mail,
  MapPin,
  Phone,
  Truck,
  ArrowLeft,
  LogIn,
  X,
  Loader2,
  Eye,
  EyeOff
} from "lucide-react";
import { toast } from "sonner";
import LoadingSpinner from "@/components/LoadingSpinner";
import { slideFromRightVariants, fadeVariants, buttonPress } from "@/lib/animations";

type Step = "contact" | "shipping" | "payment" | "review";

const steps: { id: Step; title: string; icon: any }[] = [
  { id: "contact", title: "Contact", icon: Mail },
  { id: "shipping", title: "Shipping", icon: Truck },
  { id: "payment", title: "Payment", icon: CreditCard },
  { id: "review", title: "Review", icon: Check },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<Step>("contact");
  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Form data storage
  const [contactData, setContactData] = useState<ContactFormData | null>(null);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);

  const supabaseRef = useRef(createClient());
  const supabase = supabaseRef.current;
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    // Safety timeout to prevent infinite loading
    const timer = setTimeout(() => {
      if (isLoadingProfile) {
        setIsLoadingProfile(false);
        toast.error("Slow network detected. Some data may not be pre-filled.");
      }
    }, 15000); // 15 seconds timeout

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error("Session fetch error:", error);
        setIsLoadingProfile(false);
        return;
      }

      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoadingProfile(false);
      }
    }).catch(err => {
      console.error("Unexpected session error:", err);
      setIsLoadingProfile(false);
    });

    return () => clearTimeout(timer);
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const result = await getProfileForCheckoutAction(userId);
      if (result.data) setProfile(result.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Redirect if cart is empty (but not after order placement)
  useEffect(() => {
    if (items.length === 0 && !isSubmitting && !orderPlaced) {
      router.push("/cart/");
    }
  }, [items.length, isSubmitting, orderPlaced, router]);

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const shippingCost = 200;
  const finalTotal = totalPrice + shippingCost;

  const handleStepComplete = (step: Step, data: any) => {
    if (step === "contact") setContactData(data);
    if (step === "shipping") setShippingData(data);
    if (step === "payment") setPaymentData(data);

    setCompletedSteps(prev => [...prev, step]);

    const nextStepIndex = currentStepIndex + 1;
    if (nextStepIndex < steps.length) {
      setCurrentStep(steps[nextStepIndex].id);
    }
  };

  const handleFinalSubmit = async () => {
    if (!shippingData || !paymentData || !contactData) {
      toast.error("Please complete all checkout steps");
      return;
    }

    setIsSubmitting(true);

    try {
      const addressString = `${shippingData.firstName} ${shippingData.lastName}, ${shippingData.address}, ${shippingData.city}, ${shippingData.state}, ${shippingData.zipCode}, ${shippingData.country}`;
      const orderItems = items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.sale_price || item.product.price,
        size: item.size,
        color: item.color
      }));

      const isGuest = !session?.user?.id;
      const guestInfo = isGuest ? {
        email: contactData.email,
        name: `${shippingData.firstName} ${shippingData.lastName}`,
        phone: contactData.phone
      } : undefined;

      // Upload payment proof if online payment
      let paymentProofUrl: string | null = null;
      if (paymentData.method === 'online' && paymentData.proofFile) {
        const fd = new FormData();
        fd.append('file', paymentData.proofFile);
        fd.append('clientId', session?.user?.id || 'guest');
        const uploadResult = await uploadPaymentProofAction(fd);
        if (uploadResult.error) throw new Error(uploadResult.error);
        paymentProofUrl = uploadResult.url || null;
      }

      toast.loading('Creating your order...');

      const result = await placeOrderAction({
        clientId: session?.user?.id || null,
        totalAmount: finalTotal,
        items: orderItems,
        shippingAddress: addressString,
        paymentMethod: paymentData.method,
        paymentProofUrl,
        onlineMethod: paymentData.onlineMethod,
        guestInfo,
      });

      toast.dismiss();
      if (result.error) throw new Error(result.error);
      toast.success('Order placed successfully!');

      const order = result.data;

      setOrderPlaced(true);
      clearCart();
      if (isGuest) {
        localStorage.removeItem('habiba_cart');
      }

      // Send order confirmation email — non-blocking but with proper error logging
      const customerEmail = contactData!.email;
      const customerName = `${shippingData!.firstName} ${shippingData!.lastName}`;
      fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-secret': process.env.NEXT_PUBLIC_INTERNAL_API_SECRET || '',
        },
        body: JSON.stringify({
          type: 'order_placed',
          to: customerEmail,
          data: {
            name: customerName,
            trackingNumber: order.tracking_number || order.id.slice(0, 8).toUpperCase(),
            totalAmount: finalTotal,
            paymentMethod: paymentData!.method === 'cod' ? 'Cash on Delivery' : `Bank Transfer (${paymentData!.onlineMethod || 'Online'})`,
            items: items.map(item => ({
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.sale_price || item.product.price
            }))
          }
        })
      })
        .then(async (res) => {
          if (!res.ok) console.error(`[Order] Email API error (${res.status}):`, await res.text());
        })
        .catch(err => console.error('[Order] Email send failed:', err));

      router.push(`/checkout/success?id=${order.id}&method=${paymentData!.method}`);

    } catch (error: any) {
      console.error("Order placement failed:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="font-heading text-3xl md:text-4xl font-light">Checkout</h1>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.id === currentStep;
              const isCompleted = completedSteps.includes(step.id);

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <motion.div
                      className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : isActive
                          ? "border-primary text-primary"
                          : "border-border text-muted-foreground"
                        }`}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </motion.div>
                    <span className={`text-xs font-body mt-2 hidden sm:block ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`h-[2px] flex-1 mx-2 transition-colors ${isCompleted ? "bg-primary" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {isLoadingProfile ? (
                <div className="flex flex-col items-center justify-center py-20 bg-background border border-border">
                  <LoadingSpinner />
                  <p className="text-sm font-body text-muted-foreground mt-4">Loading your information...</p>
                </div>
              ) : (
                <>
                  {currentStep === "contact" && (
                    <ContactForm
                      key="contact"
                      initialData={profile ? { email: profile.email, phone: profile.phone_number || "" } : null}
                      onComplete={(data) => handleStepComplete("contact", data)}
                      onLoginSuccess={(newSession, newProfile) => {
                        setSession(newSession);
                        setProfile(newProfile);
                      }}
                    />
                  )}
                  {currentStep === "shipping" && (
                    <ShippingForm
                      key="shipping"
                      initialData={profile ? {
                        firstName: profile.full_name?.split(' ')[0] || "",
                        lastName: profile.full_name?.split(' ').slice(1).join(' ') || ""
                      } : null}
                      onComplete={(data) => handleStepComplete("shipping", data)}
                    />
                  )}
                  {currentStep === "payment" && (
                    <PaymentForm
                      key="payment"
                      initialData={null}
                      onComplete={(data) => handleStepComplete("payment", data)}
                    />
                  )}
                  {currentStep === "review" && (
                    <ReviewStep
                      key="review"
                      contactData={contactData!}
                      shippingData={shippingData!}
                      paymentData={paymentData!}
                      onSubmit={handleFinalSubmit}
                      isSubmitting={isSubmitting}
                    />
                  )}
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background border border-border p-6 sticky top-24"
            >
              <h2 className="font-heading text-xl mb-4">Order Summary</h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3">
                    <div className="w-16 h-20 bg-muted overflow-hidden flex-shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-sm truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} • {item.color} • Qty: {item.quantity}
                      </p>
                      <p className="text-sm font-medium mt-1">{formatPrice((item.product.sale_price || item.product.price) * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-4 space-y-2 text-sm font-body">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatPrice(200)}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-semibold text-base">
                  <span>Total</span>
                  <span className="font-heading">{formatPrice(finalTotal)}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Contact Form Component
function ContactForm({
  onComplete,
  initialData,
  onLoginSuccess
}: {
  onComplete: (data: ContactFormData) => void,
  initialData: Partial<ContactFormData> | null,
  onLoginSuccess: (session: any, profile: any) => void
}) {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData || {}
  });
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const supabaseLoginRef = useRef(createClient());
  const supabaseLogin = supabaseLoginRef.current;

  const onSubmit = (data: ContactFormData) => {
    onComplete(data);
    toast.success("Contact information saved!");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const { data, error } = await supabaseLogin.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
      });

      if (error) {
        setLoginError(error.message);
        return;
      }

      if (data.session?.user) {
        // Fetch profile to auto-fill fields
        const profileResult = await getProfileForCheckoutAction(data.session.user.id);
        if (profileResult.data) {
          const profile = profileResult.data;
          setValue('email', profile.email || '');
          setValue('phone', profile.phone_number || '');
          onLoginSuccess(data.session, profile);
        }
        setShowLoginModal(false);
        toast.success('Logged in! Your information has been filled automatically.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <motion.div
      variants={slideFromRightVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-background border border-border p-6 md:p-8"
    >
      <div className="mb-6">
        <h2 className="font-heading text-2xl mb-2">Contact Information</h2>
        <p className="text-sm text-muted-foreground">We&apos;ll use this to send order updates</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-body font-medium mb-2">
            Email Address <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              {...register("email")}
              type="email"
              placeholder="your@email.com"
              className="w-full pl-10 pr-4 py-3 border border-border bg-transparent focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-body font-medium mb-2">
            Phone Number <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              {...register("phone")}
              type="tel"
              placeholder="+92 334 8438007"
              className="w-full pl-10 pr-4 py-3 border border-border bg-transparent focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
        </div>

        <motion.button
          {...buttonPress}
          type="submit"
          className="w-full bg-foreground text-background py-4 font-body font-medium tracking-wider uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
        >
          Continue to Shipping <ChevronRight className="w-4 h-4" />
        </motion.button>

        {/* Login option */}
        {!initialData?.email && (
          <div className="text-center pt-2">
            <div className="relative flex items-center justify-center gap-3 mb-3">
              <div className="h-px bg-border flex-1" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">or</span>
              <div className="h-px bg-border flex-1" />
            </div>
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline transition-colors"
            >
              <LogIn className="w-4 h-4" />
              Login to autofill your information
            </button>
          </div>
        )}
      </form>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl w-full max-w-md p-8 relative shadow-2xl"
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <LogIn className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-xl font-bold">Login to Continue</h3>
                <p className="text-sm text-muted-foreground mt-1">Your details will be filled automatically</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary focus:bg-white transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary focus:bg-white transition-all text-sm pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg p-2.5">{loginError}</p>
                )}

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-primary text-white py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loginLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                  ) : (
                    <><LogIn className="w-4 h-4" /> Sign In & Continue</>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Shipping Form Component
function ShippingForm({
  onComplete,
  initialData
}: {
  onComplete: (data: ShippingFormData) => void,
  initialData: Partial<ShippingFormData> | null
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ShippingFormData>({
    resolver: zodResolver(shippingSchema),
    defaultValues: initialData || {}
  });

  const onSubmit = (data: ShippingFormData) => {
    onComplete(data);
    toast.success("Shipping address saved!");
  };

  return (
    <motion.div
      variants={slideFromRightVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-background border border-border p-6 md:p-8"
    >
      <div className="mb-6">
        <h2 className="font-heading text-2xl mb-2">Shipping Address</h2>
        <p className="text-sm text-muted-foreground">Where should we deliver your order?</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-body font-medium mb-2">
              First Name <span className="text-destructive">*</span>
            </label>
            <input
              {...register("firstName")}
              className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:border-primary transition-colors"
            />
            {errors.firstName && <p className="text-xs text-destructive mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-body font-medium mb-2">
              Last Name <span className="text-destructive">*</span>
            </label>
            <input
              {...register("lastName")}
              className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:border-primary transition-colors"
            />
            {errors.lastName && <p className="text-xs text-destructive mt-1">{errors.lastName.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-body font-medium mb-2">
            Address <span className="text-destructive">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <input
              {...register("address")}
              placeholder="Street address, P.O. box"
              className="w-full pl-10 pr-4 py-3 border border-border bg-transparent focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          {errors.address && <p className="text-xs text-destructive mt-1">{errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-body font-medium mb-2">
              City <span className="text-destructive">*</span>
            </label>
            <input
              {...register("city")}
              className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:border-primary transition-colors"
            />
            {errors.city && <p className="text-xs text-destructive mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-body font-medium mb-2">
              State/Province <span className="text-destructive">*</span>
            </label>
            <input
              {...register("state")}
              className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:border-primary transition-colors"
            />
            {errors.state && <p className="text-xs text-destructive mt-1">{errors.state.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-body font-medium mb-2">
              Postal Code <span className="text-destructive">*</span>
            </label>
            <input
              {...register("zipCode")}
              className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:border-primary transition-colors"
            />
            {errors.zipCode && <p className="text-xs text-destructive mt-1">{errors.zipCode.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-body font-medium mb-2">
              Country <span className="text-destructive">*</span>
            </label>
            <select
              {...register("country")}
              className="w-full px-4 py-3 border border-border bg-transparent focus:outline-none focus:border-primary transition-colors"
            >
              <option value="">Select country</option>
              <option value="Pakistan">Pakistan</option>
              <option value="India">India</option>
              <option value="Bangladesh">Bangladesh</option>
              <option value="UAE">United Arab Emirates</option>
              <option value="UK">United Kingdom</option>
              <option value="USA">United States</option>
            </select>
            {errors.country && <p className="text-xs text-destructive mt-1">{errors.country.message}</p>}
          </div>
        </div>

        <motion.button
          {...buttonPress}
          type="submit"
          className="w-full bg-foreground text-background py-4 font-body font-medium tracking-wider uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
        >
          Continue to Payment <ChevronRight className="w-4 h-4" />
        </motion.button>
      </form>
    </motion.div>
  );
}

// Payment Form Component
function PaymentForm({
  onComplete,
  initialData
}: {
  onComplete: (data: PaymentFormData) => void,
  initialData: Partial<PaymentFormData> | null
}) {
  const { register, watch, setValue, handleSubmit, formState: { errors } } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: "cod",
      ...initialData
    }
  });

  const method = watch("method");
  const onlineMethod = watch("onlineMethod");
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const onSubmit = (data: PaymentFormData) => {
    onComplete(data);
    toast.success("Payment details saved!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        e.target.value = "";
        return;
      }
      setFileName(file.name);
      setValue("proofFile", file);
    }
  };

  const bankAccounts = [
    {
      id: 'sadapay' as const,
      name: 'Sadapay',
      color: '#1c1c1c',
      accountName: 'Habiba Minhas',
      accountNumber: '03121531511',
      badge: 'Recommended',
      badgeColor: 'bg-green-100 text-green-700'
    },
    {
      id: 'jazzcash' as const,
      name: 'JazzCash',
      color: '#bf202f',
      accountName: 'Habiba Minhas',
      accountNumber: '03348438007',
      badge: null,
      badgeColor: ''
    },
    {
      id: 'easypaisa' as const,
      name: 'Easypaisa',
      color: '#3AAA35',
      accountName: 'Habiba Minhas',
      accountNumber: '03348438007',
      badge: null,
      badgeColor: ''
    },
    {
      id: 'askari' as const,
      name: 'Askari Bank',
      color: '#003366',
      accountName: 'Habiba Minhas',
      accountNumber: '0000000000000',
      iban: 'PK00ASKI0000000000000000',
      badge: null,
      badgeColor: ''
    }
  ];

  return (
    <motion.div
      variants={slideFromRightVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-background border border-border p-6 md:p-8"
    >
      <div className="mb-6">
        <h2 className="font-heading text-2xl mb-2">Payment Method</h2>
        <p className="text-sm text-muted-foreground">Select how you want to pay</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* Payment Method Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col gap-3 transition-all ${method === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}>
            <div className="flex justify-between items-start">
              <Truck className={`w-6 h-6 ${method === 'cod' ? 'text-primary' : 'text-muted-foreground'}`} />
              <input type="radio" value="cod" {...register("method")} className="accent-primary w-4 h-4" />
            </div>
            <div>
              <span className={`block font-body font-medium ${method === 'cod' ? 'text-primary' : 'text-foreground'}`}>Cash on Delivery</span>
              <span className="text-xs text-muted-foreground">Pay with cash upon delivery</span>
            </div>
          </label>

          <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col gap-3 transition-all ${method === 'online' ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}>
            <div className="flex justify-between items-start">
              <CreditCard className={`w-6 h-6 ${method === 'online' ? 'text-primary' : 'text-muted-foreground'}`} />
              <input type="radio" value="online" {...register("method")} className="accent-primary w-4 h-4" />
            </div>
            <div>
              <span className={`block font-body font-medium ${method === 'online' ? 'text-primary' : 'text-foreground'}`}>Bank Transfer</span>
              <span className="text-xs text-muted-foreground">Sadapay / JazzCash / Easypaisa / Askari</span>
            </div>
          </label>
        </div>
        {errors.method && <p className="text-sm text-destructive">{errors.method.message}</p>}

        {/* Bank Transfer Options */}
        <AnimatePresence>
          {method === 'online' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 overflow-hidden"
            >
              <div className="bg-muted/50 p-4 rounded-xl space-y-3">
                <h3 className="font-medium text-sm">Select Account to Transfer:</h3>

                {bankAccounts.map((account) => (
                  <label key={account.id} className={`flex items-center gap-4 p-4 rounded-xl border bg-background cursor-pointer transition-all ${onlineMethod === account.id ? 'border-primary ring-1 ring-primary shadow-sm' : 'border-border hover:border-gray-300'}`}>
                    <input type="radio" value={account.id} {...register("onlineMethod")} className="accent-primary" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold" style={{ color: account.color }}>{account.name}</span>
                        {account.badge && (
                          <span className={`text-[10px] ${account.badgeColor} px-2 py-0.5 rounded-full font-medium`}>{account.badge}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium">{account.accountName}</p>
                      <p className="text-sm text-muted-foreground font-mono">{account.accountNumber}</p>
                      {account.iban && (
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">IBAN: {account.iban}</p>
                      )}
                    </div>
                  </label>
                ))}
                {errors.onlineMethod && <p className="text-sm text-destructive">{errors.onlineMethod.message}</p>}
              </div>

              {/* Info message */}
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                After uploading your payment proof, our team will verify and confirm your order within 24 hours.
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Upload Transaction Screenshot <span className="text-destructive">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                  onDragEnter={() => setDragActive(true)}
                  onDragLeave={() => setDragActive(false)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("File size must be less than 5MB");
                        return;
                      }
                      setFileName(file.name);
                      setValue("proofFile", file);
                    }
                  }}
                >
                  <input
                    type="file"
                    id="proof-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="proof-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="bg-muted p-3 rounded-full">
                      <Check className={`w-6 h-6 ${fileName ? 'text-green-500' : 'text-muted-foreground'}`} />
                    </div>
                    {fileName ? (
                      <>
                        <p className="text-sm font-medium text-green-600">{fileName}</p>
                        <p className="text-xs text-muted-foreground">Click to change</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium">Click to upload or drag & drop</p>
                        <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                      </>
                    )}
                  </label>
                </div>
                {errors.proofFile && <p className="text-sm text-destructive">{errors.proofFile.message as string}</p>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          {...buttonPress}
          type="submit"
          className="w-full bg-foreground text-background py-4 font-body font-medium tracking-wider uppercase hover:bg-foreground/90 transition-colors flex items-center justify-center gap-2"
        >
          Review Order <ChevronRight className="w-4 h-4" />
        </motion.button>
      </form>
    </motion.div>
  );
}

// Review Step Component
function ReviewStep({
  contactData,
  shippingData,
  paymentData,
  onSubmit,
  isSubmitting
}: {
  contactData: ContactFormData;
  shippingData: ShippingFormData;
  paymentData: PaymentFormData;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  return (
    <motion.div
      variants={slideFromRightVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-background border border-border p-6 md:p-8"
    >
      <div className="mb-6">
        <h2 className="font-heading text-2xl mb-2">Review Your Order</h2>
        <p className="text-sm text-muted-foreground">Please verify all details before placing your order</p>
      </div>

      <div className="space-y-6">
        {/* Contact Info */}
        <div className="pb-6 border-b border-border">
          <h3 className="font-body font-medium mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Contact Information
          </h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{contactData.email}</p>
            <p>{contactData.phone}</p>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="pb-6 border-b border-border">
          <h3 className="font-body font-medium mb-3 flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            Shipping Address
          </h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>{shippingData.firstName} {shippingData.lastName}</p>
            <p>{shippingData.address}</p>
            <p>{shippingData.city}, {shippingData.state} {shippingData.zipCode}</p>
            <p>{shippingData.country}</p>
          </div>
        </div>

        {/* Payment Method */}
        <div className="pb-6 border-b border-border">
          <h3 className="font-body font-medium mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Payment Method
          </h3>
          <div className="text-sm text-muted-foreground">
            {paymentData.method === 'cod' ? (
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Cash on Delivery</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span className="capitalize">Online Transfer - {paymentData.onlineMethod}</span>
                </div>
                {paymentData.proofFile && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded text-xs">
                    <Check className="w-3 h-3" />
                    <span>Slip Uploaded: {paymentData.proofFile.name}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <motion.button
        {...buttonPress}
        onClick={onSubmit}
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground py-4 font-body font-medium tracking-wider uppercase hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <LoadingSpinner size="sm" className="border-primary-foreground border-t-transparent" />
            Processing Order...
          </>
        ) : (
          <>
            Place Order <Check className="w-4 h-4" />
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
