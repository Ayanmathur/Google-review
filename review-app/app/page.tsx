import Link from "next/link";
import { Star, QrCode, TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 selection:bg-blue-500/30 flex flex-col justify-between overflow-x-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full bg-blue-900/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-gray-900 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-white text-lg tracking-tight">
            <span className="bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              ReviewFlow
            </span>
          </div>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 hover:bg-gray-800 border border-gray-800 text-sm font-medium text-white transition-all duration-200"
          >
            Admin Panel
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 pt-20 pb-16 flex-grow flex flex-col items-center text-center space-y-10 relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/40 border border-blue-900/50 text-blue-400 text-xs font-semibold tracking-wide uppercase">
          <Star className="w-3.5 h-3.5 fill-current" />
          AI-Powered Reputation Management
        </div>

        {/* Headline */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
            Transform Happy Customers Into{" "}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-500 bg-clip-text text-transparent">
              5-Star Google Reviews
            </span>
          </h1>
          <p className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Automate feedback routing. Happy customers are guided to write AI-assisted Google reviews, while private feedback is collected to resolve complaints before they go public.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md">
          <Link
            href="/admin"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
          >
            Launch Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 pt-16 w-full text-left">
          {/* Card 1 */}
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6 hover:border-gray-700/60 transition-all duration-300 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Smart Sentiment Routing</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Customers rating 4–5 stars are instantly routed to your Google business link, while lower ratings go to a private admin form.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6 hover:border-gray-700/60 transition-all duration-300 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
              <Star className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Gemini AI Copy-Writer</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Happy customers get personalized, professionally drafted reviews generated instantly, copied automatically to their clipboard.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6 hover:border-gray-700/60 transition-all duration-300 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mb-4">
              <QrCode className="w-5 h-5 text-violet-400" />
            </div>
            <h3 className="text-white font-semibold mb-2">Instant QR Generator</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Generate and download print-ready QR codes for table cards, receipts, or storefronts directly from the dashboard.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-8 bg-gray-950/40">
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

