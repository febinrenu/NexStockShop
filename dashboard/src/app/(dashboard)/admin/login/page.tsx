'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { adminService } from '@/services/api/admin-service';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setLoading(true);
      setError(null);
      await adminService.login({ email, password });
      router.push('/admin');
    } catch (err) {
      console.error(err);
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || 'Invalid administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoBypass = () => {
    localStorage.setItem('auth_token', 'mock-admin-token-12345');
    localStorage.setItem('auth_admin', JSON.stringify({
      id: 'mock-admin-id',
      name: 'Platform Super Admin (Demo)',
      email: 'admin@trippleshop.test',
    }));
    router.push('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px]" />

      <div className="max-w-md w-full space-y-6 z-10">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-center justify-center mx-auto text-indigo-400">
            <Shield className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">Platform Super-Admin Sign In</h2>
          <p className="text-xs text-slate-400">Access the TrippleShop platform configuration panel</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl">
          {error && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-300 p-3 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin Email Address"
              type="email"
              required
              placeholder="admin@trippleshop.test"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950 border-slate-800 text-white"
            />
            <Input
              label="Secret Key Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-950 border-slate-800 text-white"
            />

            <Button type="submit" isLoading={loading} className="w-full flex items-center justify-center gap-1.5 shadow-md">
              <Lock className="h-4 w-4" />
              <span>Authenticate Session</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleDemoBypass}
              className="w-full flex items-center justify-center gap-1.5 border-slate-800 text-slate-400 hover:text-white mt-2 bg-slate-950/20"
            >
              <span>Demo / Development Login Bypass</span>
            </Button>
          </form>
        </div>

        {/* Developer help credentials box */}
        <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-4 text-center text-xxs text-slate-500 leading-relaxed max-w-xs mx-auto">
          <p className="font-semibold text-slate-400 uppercase tracking-wider mb-1">Development Notice</p>
          <p>
            Local seeder credentials: <span className="font-mono text-indigo-400">admin@trippleshop.test</span> / <span className="font-mono text-indigo-400">password</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
