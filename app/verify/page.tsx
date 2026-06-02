"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { isValidPassword } from "@/lib/auth";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  // Validate token on mount
  useEffect(() => {
    if (!token || !email) {
      setError("Geçersiz doğrulama bağlantısı");
      setValidating(false);
      return;
    }

    // Token validated by form submission
    setTokenValid(true);
    setValidating(false);
  }, [token, email]);

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validation
    if (!password || !confirmPassword) {
      setError("Tüm alanlar gereklidir");
      return;
    }

    if (password !== confirmPassword) {
      setError("Parolalar eşleşmemektedir");
      return;
    }

    const validation = isValidPassword(password);
    if (!validation.valid) {
      setError(validation.errors.join(", "));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/email/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, newPassword: password }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.error || "Parola ayarlama başarısız");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/admin");
      }, 2000);
    } catch (err) {
      setError("Sunucu hatası");
      setLoading(false);
    }
  }

  if (validating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-400">Doğrulanıyor...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Geçersiz Bağlantı</h1>
          <p className="text-slate-400 mb-6">Bu doğrulama bağlantısı geçersiz veya süresi dolmuştur.</p>
          <a
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Anasayfaya Dön
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center max-w-md">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-white mb-4">Başarılı!</h1>
          <p className="text-slate-400 mb-6">Parolanız ayarlandı. Admin paneline yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-2">Parolanızı Ayarlayın</h1>
        <p className="text-slate-400 text-sm mb-6">Hesabınıza erişmek için güçlü bir parola belirleyin</p>

        <form onSubmit={handleSetPassword} className="space-y-4">
          <div>
            <label className="text-sm text-slate-400 mb-2 block">E-posta</label>
            <input
              type="email"
              value={email || ""}
              disabled
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-400 text-sm"
            />
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Parola</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="En az 8 karakter, 1 rakam, 1 özel karakter"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition-colors"
            />
            <p className="text-xs text-slate-500 mt-1">
              En az 8 karakter, en az 1 rakam, en az 1 özel karakter (!@#$%^&*)
            </p>
          </div>

          <div>
            <label className="text-sm text-slate-400 mb-2 block">Parola Onayla</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Parolayı tekrarlayın"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            {loading ? "Ayarlanıyor..." : "Parolayı Ayarla"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-400">Yükleniyor...</p>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
