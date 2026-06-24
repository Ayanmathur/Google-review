import Link from "next/link";
import { Star, QrCode, TrendingUp, ShieldCheck, ArrowRight, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 flex flex-col justify-between overflow-x-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full bg-rose-200/20 dark:bg-rose-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-200/20 dark:bg-amber-900/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white text-lg tracking-tight">
            <span className="bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">
              ReviewFlow
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all"
            >
              Client Login
            </Link>
            <Link
              href="/admin"
              className="w-9 h-9 rounded-md bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
              title="Admin Panel"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 pt-20 pb-16 flex-grow flex flex-col items-center text-center space-y-10 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/50 text-rose-700 dark:text-rose-400 text-xs font-semibold tracking-wide uppercase">
          <Star className="w-3.5 h-3.5 fill-current" />
          Smart Reputation Management
        </div>

        {/* Headline */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
            Transform Happy Customers Into{" "}
            <span className="bg-gradient-to-r from-rose-400 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              5-Star Google Reviews
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Automate feedback routing. Happy customers are guided to write personalized Google reviews, while private feedback is collected to resolve complaints before they go public.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-3.5 rounded-md bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm transition-all shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 flex items-center justify-center gap-2"
          >
            Launch Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 pt-16 w-full text-left">
          {/* Card 1 */}
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-md p-6 hover:border-rose-200 dark:hover:border-rose-800/50 transition-all duration-300">
            <div className="w-10 h-10 rounded-md bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-2">Smart Sentiment Routing</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Customers rating 4–5 stars are instantly routed to your Google business link, while lower ratings go to a private admin form.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-md p-6 hover:border-amber-200 dark:hover:border-amber-800/50 transition-all duration-300">
            <div className="w-10 h-10 rounded-md bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-2">Smart Review Writer</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Happy customers get personalized, professionally drafted reviews generated instantly, copied automatically to their clipboard.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-md p-6 hover:border-amber-200 dark:hover:border-amber-800/50 transition-all duration-300">
            <div className="w-10 h-10 rounded-md bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mb-4">
              <QrCode className="w-5 h-5 text-amber-500" />
            </div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-2">Instant QR Generator</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              Generate and download print-ready QR codes for table cards, receipts, or storefronts directly from the dashboard.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8 bg-white/50 dark:bg-gray-950/40">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div>
            &copy; {new Date().getFullYear()} ReviewFlow. All rights reserved.
          </div>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Secure & Privacy Compliant
          </div>
        </div>
      </footer>
    </div>
  );
}
