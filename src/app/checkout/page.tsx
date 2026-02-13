'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/products";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderService } from "@/services/order.service";
import { ClientService } from "@/services/client.service";
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
  ArrowLeft
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

  // Form data storage
  const [contactData, setContactData] = useState<ContactFormData | null>(null);
  const [shippingData, setShippingData] = useState<ShippingFormData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);

  const supabase = createClient();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    // Safety timeout to prevent infinite loading
    const timer = setTimeout(() => {
        if (isLoadingProfile) {
            console.warn("Checkout initialization timed out, forcing load.");
            setIsLoadingProfile(false);
            toast.error("Slow network detected. Some data may not be pre-filled.");
        }
    }, 8000); // 8 seconds timeout

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
  }, [supabase]);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log("Fetching user profile for:", userId);
      const data = await ClientService.getProfile(userId);
      console.log("Profile fetched:", data ? "Found" : "Not Found");
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !isSubmitting) {
      router.push("/cart");
    }
  }, [items.length, isSubmitting, router]);

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const shippingCost = totalPrice >= 5000 ? 0 : 200;
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
    setIsSubmitting(true);

    try {
      if (session?.user?.id && shippingData && paymentData) {
        const addressString = `${shippingData.address}, ${shippingData.city}, ${shippingData.state}, ${shippingData.zipCode}, ${shippingData.country}`;
        const orderItems = items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        }));

        const promise = OrderService.placeOrder(
          session.user.id,
          finalTotal,
          orderItems,
          addressString,
          paymentData.method,
          paymentData.proofFile // Will be undefined if COD
        );

        toast.promise(promise, {
            loading: 'Creating your order...',
            success: (order) => {
                // Clear cart
                clearCart();
                // Redirect
                router.push(`/checkout/success?order=${order.id.slice(0, 8).toUpperCase()}`);
                return `Order placed successfully! Order #${order.id.slice(0, 8).toUpperCase()}`;
            },
            error: (err) => `Order failed: ${err.message}`
        });

        await promise; // Wait for it to complete to handle local state (redirect happens in success callback but we wait here to ensure no race conditions if needed, though with promise toast it handles it)

      } else {
        // Guest order logic simulation (fallback)
         await new Promise(resolve => setTimeout(resolve, 1500));
         clearCart();
         router.push(`/checkout/success?order=GUEST-${Date.now().toString().slice(-6)}`);
         toast.success("Guest order placed successfully!");
      }

    } catch (error: any) {
      console.error("Order placement failed:", error);
      console.error("Error details:", {
        message: error?.message,
        code: error?.code,
        details: error?.details,
        hint: error?.hint
      });
      // Toasts handled above, but if it was a synchronous error before the promise, we need a toast
      if (!isSubmitting) toast.error(`Failed to place order: ${error?.message || "Unknown error"}`);
      // Toasts handled above
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
                      initialData={profile ? { cardName: profile.full_name || "" } : null}
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
              <h3 className="font-heading text-xl mb-4">Order Summary</h3>
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
                      <p className="text-sm font-medium mt-1">{formatPrice(item.product.price * item.quantity)}</p>
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
                  <span className={shippingCost === 0 ? "text-green-600" : ""}>
                    {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
                  </span>
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
  initialData
}: {
  onComplete: (data: ContactFormData) => void,
  initialData: Partial<ContactFormData> | null
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: initialData || {}
  });

  const onSubmit = (data: ContactFormData) => {
    onComplete(data);
    toast.success("Contact information saved!");
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
        <p className="text-sm text-muted-foreground">We'll use this to send order updates</p>
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
              placeholder="+92 300 1234567"
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
      </form>
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
  const [fileName, setFileName] = useState<string | null>(initialData?.proofFile?.name || null);

  const onSubmit = (data: PaymentFormData) => {
    onComplete(data);
    toast.success("Payment details saved!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            toast.error("File size must be less than 5MB");
            e.target.value = ""; // Clear input
            return;
        }
        setFileName(file.name);
        setValue("proofFile", file);
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
                    <span className="text-xs text-muted-foreground">Pay with cash upon arrival</span>
                </div>
            </label>

            <label className={`cursor-pointer border-2 rounded-xl p-4 flex flex-col gap-3 transition-all ${method === 'online' ? 'border-primary bg-primary/5' : 'border-border hover:border-gray-300'}`}>
                <div className="flex justify-between items-start">
                    <CreditCard className={`w-6 h-6 ${method === 'online' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <input type="radio" value="online" {...register("method")} className="accent-primary w-4 h-4" />
                </div>
                <div>
                    <span className={`block font-body font-medium ${method === 'online' ? 'text-primary' : 'text-foreground'}`}>Online Transfer</span>
                    <span className="text-xs text-muted-foreground">Sadapay / JazzCash</span>
                </div>
            </label>
        </div>
        {errors.method && <p className="text-sm text-destructive">{errors.method.message}</p>}

        {/* Online Payment Details */}
        <AnimatePresence>
            {method === 'online' && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-6 overflow-hidden"
                >
                    <div className="bg-muted p-4 rounded-lg space-y-4">
                        <h3 className="font-medium text-sm">Select Account to Transfer:</h3>
                        
                        <label className={`flex items-center gap-4 p-3 rounded border bg-background cursor-pointer transition-colors ${onlineMethod === 'sadapay' ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
                            <input type="radio" value="sadapay" {...register("onlineMethod")} className="accent-primary" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#1c1c1c]">Sadapay</span>
                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active</span>
                                </div>
                                <p className="text-sm font-medium mt-1">Hunain Ahmed</p>
                                <p className="text-sm text-muted-foreground font-mono">0310 5589055</p>
                            </div>
                        </label>

                        <label className={`flex items-center gap-4 p-3 rounded border bg-background cursor-pointer transition-colors ${onlineMethod === 'jazzcash' ? 'border-primary ring-1 ring-primary' : 'border-border'}`}>
                            <input type="radio" value="jazzcash" {...register("onlineMethod")} className="accent-primary" />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#bf202f]">JazzCash</span>
                                </div>
                                <p className="text-sm font-medium mt-1">Hunain Ahmed</p>
                                <p className="text-sm text-muted-foreground font-mono">0315 6383689</p>
                            </div>
                        </label>
                        {errors.onlineMethod && <p className="text-sm text-destructive">{errors.onlineMethod.message}</p>}
                    </div>

                    {/* File Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium">Upload Transaction Slip</label>
                        <div 
                            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'}`}
                            onDragEnter={() => setDragActive(true)}
                            onDragLeave={() => setDragActive(false)}
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
             {/* Fallback for legacy/card */}
            {paymentData.cardNumber && (
                <p>Card ending in {paymentData.cardNumber.slice(-4)}</p>
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
