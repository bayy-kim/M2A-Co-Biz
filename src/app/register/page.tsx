"use client"

import { useState, useActionState, useRef } from "react"
import { Badge, Group, FileText, ArrowLeft, ArrowRight, Check, Verified, ShieldCheck, LifeBuoy, Loader2 } from "lucide-react"
import Link from "next/link"
import { register, type RegisterState } from "./actions"

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const totalSteps = 3
  const formRef = useRef<HTMLFormElement>(null)

  const [state, formAction, pending] = useActionState<RegisterState, FormData>(register, {})

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1)
  }
  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (step < totalSteps) {
      nextStep()
      return
    }
    const form = formRef.current
    if (!form) return
    const fd = new FormData(form)
    formAction(fd)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="fixed top-0 w-full z-50 bg-surface shadow-sm h-16 flex items-center px-lg md:px-xl justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
            <span className="text-on-primary-container font-bold text-headline-md">M</span>
          </div>
          <h1 className="text-headline-md font-bold text-primary">M2A Co-Biz</h1>
        </div>
        <div className="hidden md:block">
          <span className="text-on-surface-variant text-label-md">
            Already registered?{" "}
            <Link href="/login" className="text-primary font-bold">Sign In</Link>
          </span>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-12 px-gutter flex justify-center items-start">
        <div className="w-full max-w-4xl">
          {state.message === "Registration submitted successfully! Redirecting..." ? (
            <div className="flex flex-col items-center justify-center py-xxl">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-xl">
                <Check className="w-10 h-10 text-success" />
              </div>
              <h2 className="text-headline-lg text-primary mb-2">Registration Submitted!</h2>
              <p className="text-body-md text-on-surface-variant text-center max-w-md">
                Your application is being reviewed. We&apos;ll notify you at your email once approved.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-xxl">
                <div className="flex justify-between items-center mb-4 px-2">
                  {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center flex-1">
                      <div className="flex flex-col items-center gap-2">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                          s < step ? "bg-success text-white" : s === step ? "bg-primary text-on-primary ring-4 ring-primary-container/20" : "bg-surface-container-highest text-on-surface-variant"
                        }`}>
                          {s < step ? <Check className="w-[18px] h-[18px]" /> : s}
                        </div>
                        <span className={`text-label-sm ${s <= step ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                          {s === 1 ? "Information" : s === 2 ? "Documents" : "Consent"}
                        </span>
                      </div>
                      {s < totalSteps && (
                        <div className="flex-grow h-0.5 bg-surface-container-highest mx-4 mb-6 rounded-full relative overflow-hidden">
                          <div className="absolute left-0 top-0 h-full bg-primary transition-all duration-500" style={{ width: s < step ? "100%" : "0%" }} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {state.message && state.message !== "Registration submitted successfully! Redirecting..." && (
                <div className="mb-lg p-lg bg-error-container text-on-error-container rounded-lg text-label-md">
                  {state.message}
                </div>
              )}

              <form ref={formRef} onSubmit={handleSubmit} className="bg-surface/80 backdrop-blur-md rounded-xl p-lg md:p-xxl shadow-lg border border-white/30">
                <section className={step !== 1 ? "hidden" : ""}>
                  <div className="mb-xl">
                    <h2 className="text-headline-lg text-primary mb-2">Business Identification</h2>
                    <p className="text-on-surface-variant text-body-md">Please provide your legal personal and business details to start your journey with M2A Co-Biz.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div className="flex flex-col gap-xs">
                      <label className="text-label-md text-on-surface" htmlFor="fullName">Full Name</label>
                      <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="fullName" name="fullName" placeholder="Legal name as per KTP" type="text" required />
                      {state.errors?.fullName && <span className="text-error text-label-sm">{state.errors.fullName[0]}</span>}
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="text-label-md text-on-surface" htmlFor="email">Email</label>
                      <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="email" name="email" placeholder="name@business.com" type="email" required />
                      {state.errors?.email && <span className="text-error text-label-sm">{state.errors.email[0]}</span>}
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="text-label-md text-on-surface" htmlFor="phone">Phone Number</label>
                      <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="phone" name="phone" placeholder="+62 812 XXXX XXXX" type="tel" required />
                      {state.errors?.phone && <span className="text-error text-label-sm">{state.errors.phone[0]}</span>}
                    </div>
                    <div className="flex flex-col gap-xs">
                      <label className="text-label-md text-on-surface" htmlFor="businessType">Business Type</label>
                      <select className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="businessType" name="businessType" required>
                        <option value="UMKM">UMKM (Product)</option>
                        <option value="JASA">Jasa (Service)</option>
                      </select>
                      {state.errors?.businessType && <span className="text-error text-label-sm">{state.errors.businessType[0]}</span>}
                    </div>
                    <div className="flex flex-col gap-xs md:col-span-2">
                      <label className="text-label-md text-on-surface" htmlFor="businessName">Shop / Business Name</label>
                      <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="businessName" name="businessName" placeholder="Your business brand name" type="text" required />
                      {state.errors?.businessName && <span className="text-error text-label-sm">{state.errors.businessName[0]}</span>}
                    </div>
                    <div className="flex flex-col gap-xs md:col-span-2">
                      <label className="text-label-md text-on-surface" htmlFor="password">Password</label>
                      <input className="rounded-lg border-outline-variant focus:ring-primary focus:border-primary px-lg py-md bg-surface text-on-surface transition-all" id="password" name="password" placeholder="Min. 8 characters" type="password" required />
                      {state.errors?.password && <span className="text-error text-label-sm">{state.errors.password[0]}</span>}
                    </div>
                  </div>
                </section>

                <section className={step !== 2 ? "hidden" : ""}>
                  <div className="mb-xl">
                    <h2 className="text-headline-lg text-primary mb-2">Document Verification</h2>
                    <p className="text-on-surface-variant text-body-md">Securely upload your legal documents for verification. Accepted formats: JPG, PNG, or PDF (Max 5MB).</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
                    <div className="flex flex-col items-center justify-center p-xl border-2 border-dashed border-outline-variant rounded-xl hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer relative overflow-hidden">
                      <input aria-label="Upload KTP" className="absolute inset-0 opacity-0 cursor-pointer" name="ktp" type="file" />
                      <Badge className="text-primary-container w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                      <span className="text-headline-md text-on-surface mb-1">KTP</span>
                      <span className="text-label-sm text-on-surface-variant text-center">Identity Card (Required)</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-xl border-2 border-dashed border-outline-variant rounded-xl hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer relative overflow-hidden">
                      <input aria-label="Upload Kartu Keluarga" className="absolute inset-0 opacity-0 cursor-pointer" name="kartuKeluarga" type="file" />
                      <Group className="text-primary-container w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                      <span className="text-headline-md text-on-surface mb-1">Kartu Keluarga</span>
                      <span className="text-label-sm text-on-surface-variant text-center">Family Card (Required)</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-xl border-2 border-dashed border-outline-variant rounded-xl hover:border-primary hover:bg-primary/5 transition-all group cursor-pointer relative overflow-hidden">
                      <input aria-label="Upload Izin Usaha" className="absolute inset-0 opacity-0 cursor-pointer" name="izinUsaha" type="file" />
                      <FileText className="text-on-surface-variant w-12 h-12 mb-4 group-hover:scale-110 transition-transform" />
                      <span className="text-headline-md text-on-surface mb-1">Izin Usaha</span>
                      <span className="text-label-sm text-on-surface-variant text-center italic">Optional Document</span>
                    </div>
                  </div>
                  <div className="mt-xl p-lg bg-surface-container-low rounded-lg border border-outline-variant flex items-center gap-lg">
                    <div className="w-16 h-16 rounded bg-surface-container-highest overflow-hidden flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-label-md font-bold text-on-surface">Ensure documents are legible</p>
                      <p className="text-label-sm text-on-surface-variant">Blurred or cropped documents will delay your application approval process.</p>
                    </div>
                  </div>
                </section>

                <section className={step !== 3 ? "hidden" : ""}>
                  <div className="mb-xl">
                    <h2 className="text-headline-lg text-primary mb-2">Final Consent</h2>
                    <p className="text-on-surface-variant text-body-md">Review our terms and provide consent to finalize your seller registration.</p>
                  </div>
                  <div className="space-y-lg">
                    <div className="p-lg bg-surface-container rounded-xl">
                      <h3 className="text-headline-md text-on-surface mb-lg">Data Privacy Agreement</h3>
                      <div className="max-h-48 overflow-y-auto text-label-md text-on-surface-variant pr-lg">
                        <p className="mb-4">M2A Co-Biz is committed to protecting your personal data. By proceeding, you agree that we may collect, store, and process your business information solely for the purposes of managing the seller hub and providing financial community services.</p>
                        <p className="mb-4">We do not share your sensitive data with third-party marketers. All document uploads are encrypted and stored in secure cloud environments compliant with regional privacy standards.</p>
                        <p>Your shop information will be visible to community members within the M2A ecosystem to facilitate transactions and business networking.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-md pt-4">
                      <div className="flex h-6 items-center">
                        <input className="h-5 w-5 rounded border-outline text-primary focus:ring-primary cursor-pointer transition-all" id="consent" name="consent" type="checkbox" />
                      </div>
                      <div className="text-body-md">
                        <label className="font-medium text-on-surface" htmlFor="consent">I hereby declare that all information provided is true and I agree to the{" "}<a className="text-primary underline" href="#">Terms of Service</a>{" "}and{" "}<a className="text-primary underline" href="#">Privacy Policy</a>.</label>
                      </div>
                    </div>
                    {state.errors?.consent && <span className="text-error text-label-sm ml-xl">{state.errors.consent[0]}</span>}
                  </div>
                  <div className="mt-xxl grid grid-cols-1 md:grid-cols-2 gap-lg">
                    <div className="flex items-center gap-md p-lg bg-secondary-container/30 rounded-xl">
                      <ShieldCheck className="w-6 h-6 text-secondary" />
                      <div>
                        <p className="text-label-md font-bold text-on-secondary-container">Trust Guaranteed</p>
                        <p className="text-label-sm text-on-secondary-container/80">Secured with enterprise-level encryption.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-md p-lg bg-tertiary-container/10 rounded-xl">
                      <LifeBuoy className="w-6 h-6 text-tertiary" />
                      <div>
                        <p className="text-label-md font-bold text-on-tertiary-fixed-variant">Human Review</p>
                        <p className="text-label-sm text-on-tertiary-fixed-variant/80">Our team reviews apps within 48 hours.</p>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="flex items-center justify-between pt-xl border-t border-outline-variant mt-xxl">
                  <button className={`px-xl py-lg rounded-lg text-label-md text-primary hover:bg-primary/5 transition-all flex items-center gap-2 ${step === 1 ? "invisible" : ""}`} onClick={prevStep} type="button">
                    <ArrowLeft className="w-[20px] h-[20px]" /> Back
                  </button>
                  <div className="flex-grow" />
                  {step < totalSteps ? (
                    <button className="px-xl py-lg bg-primary text-on-primary rounded-lg text-label-md shadow-sm hover:bg-primary-container active:scale-[0.97] transition-all flex items-center gap-2" onClick={nextStep} type="button">
                      Next Step <ArrowRight className="w-[20px] h-[20px]" />
                    </button>
                  ) : (
                    <button className="px-xl py-lg bg-accent-gold text-white rounded-lg text-label-md shadow-lg hover:brightness-110 active:scale-[0.97] transition-all flex items-center gap-2" disabled={pending} type="submit">
                      {pending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      {pending ? "Submitting..." : "Submit Application"}
                      {!pending && <ArrowRight className="w-[20px] h-[20px]" />}
                    </button>
                  )}
                </div>
              </form>

              <footer className="mt-xl text-center text-on-surface-variant/60 text-label-sm">
                &copy; 2024 M2A Co-Biz. All Rights Reserved. Professional Business Hub.
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
