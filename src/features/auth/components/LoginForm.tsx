'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useLogin, useGoogleLogin } from '../hooks';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { AxiosError } from 'axios';

export const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    try {
      await loginMutation.mutateAsync({ email, password });
      router.push(redirectUrl);
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Invalid email or password. Please try again.');
      }
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10 text-left">
        <h1 className="text-[28px] font-normal tracking-tight text-neutral-900 mb-2">Welcome back</h1>
        <p className="text-[15px] text-neutral-500 font-light">Sign in to continue to Cartify</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50/50 border border-red-100 text-[13px] text-red-600 text-center">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-none border-neutral-300 focus:border-black focus:ring-0 px-4 py-6 text-[15px] shadow-none bg-transparent"
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loginMutation.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">
                Password
              </label>
              <Link 
                href="/forgot-password" 
                className="text-[13px] text-neutral-500 hover:text-black transition-colors"
                tabIndex={-1}
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-none border-neutral-300 focus:border-black focus:ring-0 px-4 py-6 text-[15px] shadow-none pr-12 bg-transparent"
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loginMutation.isPending}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 focus:outline-none focus:text-neutral-900 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full rounded-none py-6 uppercase tracking-[0.15em] font-semibold text-[13px] bg-black text-white hover:bg-neutral-800 transition-all"
          disabled={loginMutation.isPending}
        >
          {loginMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
      </form>

      <div className="mt-8 relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-200" />
        </div>
        <div className="relative bg-white px-4 text-[13px] text-neutral-500 font-light">
          or continue with
        </div>
      </div>

      <div className="mt-8 flex justify-center w-full">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            if (credentialResponse.credential) {
              try {
                await googleLoginMutation.mutateAsync(credentialResponse.credential);
                router.push(redirectUrl);
              } catch (err) {
                if (err instanceof AxiosError && err.response?.data?.message) {
                  setError(err.response.data.message);
                } else {
                  setError('Failed to authenticate with Google.');
                }
              }
            }
          }}
          onError={() => {
            setError('Google Login was cancelled or failed.');
          }}
          useOneTap
          text="continue_with"
          theme="outline"
          size="large"
          shape="rectangular"
          width="420"
        />
      </div>

      <div className="mt-10 text-center text-[13px] text-neutral-500 font-light">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-black font-semibold hover:underline underline-offset-4">
          Create account
        </Link>
      </div>
    </div>
  );
};
