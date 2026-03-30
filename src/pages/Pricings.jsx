import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Check, CircleDollarSign, Gauge, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'

const plans = [
  {
    id: "starter",
    stripePlanId: "starter",
    name: "Starter",
    monthlyPrice: 0,
    yearlyTotal: 0,
    credits: "100 credits",
    subtitle: "For trying and learning quickly",
    icon: Zap,
    accent: "from-cyan-400/35 via-sky-500/20 to-blue-600/30",
    button: "Start Free",
    features: [
      "Responsive website generation",
      "Basic AI edit iterations",
      "Core project dashboard",
      "Community model access"
    ]
  },
  {
    id: "pro",
    stripePlanId: "pro",
    name: "Pro",
    monthlyPrice: 19,
    yearlyTotal: 180,
    credits: "1,500 credits",
    subtitle: "For freelancers and fast builders",
    icon: Gauge,
    accent: "from-fuchsia-400/35 via-violet-500/20 to-indigo-600/30",
    button: "Upgrade to Pro",
    popular: true,
    features: [
      "Everything in Starter",
      "Higher website generation quota",
      "Priority free-model routing",
      "Faster deploy workflow"
    ]
  },
  {
    id: "studio",
    stripePlanId: "studio",
    name: "Studio",
    monthlyPrice: 39,
    yearlyTotal: 372,
    credits: "4,000 credits",
    subtitle: "For agencies and product teams",
    icon: ShieldCheck,
    accent: "from-emerald-400/35 via-teal-500/20 to-cyan-600/30",
    button: "Choose Studio",
    features: [
      "Everything in Pro",
      "Large generation capacity",
      "Team-ready operation scale",
      "Premium support priority"
    ]
  }
]

function Pricings() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { userData } = useSelector((state) => state.user)
  const [billingMode, setBillingMode] = useState("monthly")
  const [paymentLoadingPlan, setPaymentLoadingPlan] = useState("")
  const [paymentMessage, setPaymentMessage] = useState("")
  const [paymentError, setPaymentError] = useState("")
  const verifiedSessionRef = useRef("")

  const computedPlans = useMemo(() => {
    return plans.map((plan) => {
      const yearlyEquivalent = plan.yearlyTotal > 0 ? Math.round((plan.yearlyTotal / 12) * 100) / 100 : 0
      const yearlySavings = Math.max(0, plan.monthlyPrice * 12 - plan.yearlyTotal)
      const isYearly = billingMode === "yearly"

      return {
        ...plan,
        headlinePrice: isYearly ? yearlyEquivalent : plan.monthlyPrice,
        suffix: "/mo",
        billingNote: isYearly
          ? `Billed annually at $${plan.yearlyTotal}/year`
          : "Billed monthly",
        yearlySavings
      }
    })
  }, [billingMode])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const checkoutStatus = params.get("checkout")
    const sessionId = params.get("session_id")

    if (!checkoutStatus) return

    if (checkoutStatus === "cancel") {
      setPaymentMessage("Payment was cancelled. You can try again anytime.")
      setPaymentError("")
      navigate("/pricing", { replace: true })
      return
    }

    if (checkoutStatus !== "success" || !sessionId) return
    if (verifiedSessionRef.current === sessionId) return
    verifiedSessionRef.current = sessionId

    const verifySession = async () => {
      setPaymentLoadingPlan("verify-session")
      setPaymentError("")
      setPaymentMessage("")
      try {
        const response = await axios.post(
          `${serverUrl}/api/user/stripe/verify-checkout-session`,
          { sessionId },
          { withCredentials: true }
        )
        if (response?.data?.user) {
          dispatch(setUserData(response.data.user))
        }
        setPaymentMessage(response?.data?.message || "Payment verified successfully.")
      } catch (error) {
        console.error(error)
        setPaymentError(error?.response?.data?.message || "Failed to verify Stripe payment.")
      } finally {
        setPaymentLoadingPlan("")
        navigate("/pricing", { replace: true })
      }
    }

    verifySession()
  }, [location.search, navigate, dispatch])

  const handlePlanCheckout = async (plan) => {
    setPaymentError("")
    setPaymentMessage("")

    if (!userData) {
      navigate("/")
      return
    }

    if (plan.stripePlanId === "starter") {
      navigate("/generate")
      return
    }

    setPaymentLoadingPlan(plan.id)
    try {
      const response = await axios.post(
        `${serverUrl}/api/user/stripe/create-checkout-session`,
        {
          planId: plan.stripePlanId,
          billingMode
        },
        { withCredentials: true }
      )

      const checkoutUrl = response?.data?.checkoutUrl
      if (!checkoutUrl) {
        throw new Error("Stripe checkout URL is missing")
      }
      window.location.assign(checkoutUrl)
    } catch (error) {
      console.error(error)
      setPaymentError(error?.response?.data?.message || "Failed to start Stripe checkout.")
    } finally {
      setPaymentLoadingPlan("")
    }
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-[#05050b] text-white'>
      <AnimatedBackdrop />

      <header className='sticky top-0 z-40 border-b border-white/10 bg-[#060611]/75 backdrop-blur-xl'>
        <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-6'>
          <motion.button
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
            className='flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 hover:bg-white/10 hover:text-white'
            onClick={() => navigate('/')}
          >
            <ArrowLeft size={16} />
            Back
          </motion.button>
          <div className='flex items-center gap-2 text-sm font-semibold tracking-wide'>
            <CircleDollarSign size={15} className='text-cyan-300' />
            CROMP.AI Pricing
          </div>
        </div>
      </header>

      <main className='relative mx-auto max-w-7xl px-6 py-12 md:py-14'>
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className='relative mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10'
        >
          <motion.div
            className='absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-400/25 blur-3xl'
            animate={{ x: [0, 20, 0], y: [0, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className='absolute -bottom-24 -left-10 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl'
            animate={{ x: [0, -16, 0], y: [0, -12, 0] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className='relative z-10 text-center'>
            <p className='mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-zinc-300'>
              <Sparkles size={12} />
              Stripe checkout for monthly and yearly plans
            </p>

            <h1 className='text-4xl font-semibold tracking-tight md:text-5xl'>
              Built for teams that ship fast
            </h1>
            <p className='mx-auto mt-4 max-w-2xl text-zinc-400'>
              Choose monthly for flexibility or yearly for lower effective monthly cost. Both billing modes route to Stripe.
            </p>

            <div className='mt-8 flex justify-center'>
              <div className='relative inline-flex rounded-xl border border-white/10 bg-white/[0.05] p-1'>
                <motion.span
                  layoutId='billing-pill'
                  className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-lg bg-white ${
                    billingMode === "monthly" ? "left-1" : "left-[calc(50%+3px)]"
                  }`}
                  transition={{ type: "spring", stiffness: 320, damping: 28 }}
                />
                <button
                  onClick={() => setBillingMode("monthly")}
                  className={`relative z-10 min-w-28 rounded-lg px-4 py-2 text-sm ${
                    billingMode === "monthly" ? "text-black" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingMode("yearly")}
                  className={`relative z-10 min-w-28 rounded-lg px-4 py-2 text-sm ${
                    billingMode === "yearly" ? "text-black" : "text-zinc-300 hover:text-white"
                  }`}
                >
                  Yearly
                </button>
              </div>
            </div>

            {billingMode === "yearly" && (
              <p className='mt-3 text-xs text-emerald-300'>
                You are in yearly billing mode. Checkout uses annual Stripe pricing.
              </p>
            )}
          </div>
        </motion.section>

        {(paymentMessage || paymentError) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
              paymentError
                ? "border-red-400/30 bg-red-500/10 text-red-200"
                : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
            }`}
          >
            {paymentError || paymentMessage}
          </motion.div>
        )}

        <section className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {computedPlans.map((plan, index) => (
            <motion.article
              key={plan.id}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              whileHover={{ y: -6 }}
              className={`group relative overflow-hidden rounded-2xl border p-6 ${
                plan.popular
                  ? "border-fuchsia-300/35 bg-white/[0.08]"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${plan.accent}`} />
              <div className='pointer-events-none absolute inset-0 bg-black/35' />

              {plan.popular && (
                <span className='absolute right-4 top-4 rounded-full border border-fuchsia-300/30 bg-fuchsia-500/20 px-2 py-1 text-[11px] uppercase tracking-wide text-fuchsia-100'>
                  Most Popular
                </span>
              )}

              <div className='relative z-10'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <h2 className='text-2xl font-semibold'>{plan.name}</h2>
                    <p className='mt-1 text-sm text-zinc-200'>{plan.subtitle}</p>
                  </div>
                  <div className='rounded-lg border border-white/15 bg-white/10 p-2'>
                    <plan.icon size={16} className='text-white' />
                  </div>
                </div>

                <div className='mt-6 flex items-end gap-1'>
                  <motion.span
                    key={`${plan.id}-${billingMode}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='text-4xl font-bold'
                  >
                    ${plan.headlinePrice}
                  </motion.span>
                  <span className='mb-1 text-sm text-zinc-300'>{plan.suffix}</span>
                </div>

                <p className='mt-2 text-xs text-zinc-300'>{plan.billingNote}</p>
                {billingMode === "yearly" && plan.yearlySavings > 0 && (
                  <p className='mt-1 text-xs text-emerald-300'>Save ${plan.yearlySavings}/year compared to monthly billing</p>
                )}
                <p className='mt-2 text-sm text-zinc-100'>{plan.credits}</p>

                <div className='mt-6 space-y-3'>
                  {plan.features.map((feature) => (
                    <div key={feature} className='flex items-center gap-2 text-sm text-zinc-100'>
                      <Check size={14} className='text-emerald-300' />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={paymentLoadingPlan === plan.id || paymentLoadingPlan === "verify-session"}
                  className={`mt-8 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    plan.popular
                      ? "bg-fuchsia-400 text-black hover:bg-fuchsia-300"
                      : "bg-white text-black hover:bg-zinc-200"
                  } disabled:cursor-not-allowed disabled:opacity-60`}
                  onClick={() => handlePlanCheckout(plan)}
                >
                  {paymentLoadingPlan === plan.id
                    ? `Redirecting to Stripe (${billingMode})...`
                    : plan.stripePlanId === "starter"
                    ? plan.button
                    : `${plan.button} (${billingMode})`}
                </motion.button>
              </div>
            </motion.article>
          ))}
        </section>
      </main>
    </div>
  )
}

export default Pricings

function AnimatedBackdrop() {
  return (
    <div className='pointer-events-none absolute inset-0 overflow-hidden'>
      <motion.div
        className='absolute -left-40 top-6 h-96 w-96 rounded-full bg-cyan-400/20 blur-[120px]'
        animate={{ x: [0, 36, 0], y: [0, 14, 0], scale: [1, 1.06, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className='absolute right-[-160px] top-20 h-[30rem] w-[30rem] rounded-full bg-violet-500/20 blur-[130px]'
        animate={{ x: [0, -30, 0], y: [0, -10, 0], scale: [1.06, 1, 1.06] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className='absolute inset-0 opacity-30'
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 30%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.08), transparent 28%)'
        }}
      />
    </div>
  )
}
