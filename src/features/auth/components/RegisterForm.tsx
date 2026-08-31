'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRegister, useGoogleLogin, useUploadImage } from '../hooks';
import { GoogleLogin } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import { AxiosError } from 'axios';

export const RegisterForm = () => {
  const router = useRouter();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerMutation = useRegister();
  const googleLoginMutation = useGoogleLogin();
  const uploadMutation = useUploadImage();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      let imageUrl = undefined;
      
      if (imageFile) {
        imageUrl = await uploadMutation.mutateAsync(imageFile);
      }

      await registerMutation.mutateAsync({ 
        firstName, 
        lastName, 
        phone, 
        email, 
        password,
        image: imageUrl,
      });
      router.push('/login?registered=true');
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Failed to create account. Please try again.');
      }
    }
  };

  return (
    <div className="w-full">
      <div className="mb-10 text-left">
        <h1 className="text-[28px] font-normal tracking-tight text-neutral-900 mb-2">Create your account</h1>
        <p className="text-[15px] text-neutral-500 font-light">Join Cartify and enjoy a seamless shopping experience</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50/50 border border-red-100 text-[13px] text-red-600 text-center">
            {error}
          </div>
        )}

        <div className="space-y-5">
          {/* Profile Image Upload */}
          <div className="flex flex-col items-center justify-center space-y-3 mb-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center group cursor-pointer" onClick={() => document.getElementById('profileImage')?.click()}>
              {imagePreview ? (
                <img src={imagePreview} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 group-hover:text-black transition-colors">Avatar</span>
              )}
              <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center transition-all">
                <span className="text-white text-[10px] font-bold uppercase tracking-widest">Upload</span>
              </div>
            </div>
            <input 
              type="file" 
              id="profileImage" 
              accept="image/jpeg,image/png,image/webp" 
              className="hidden" 
              onChange={handleImageChange}
              disabled={registerMutation.isPending || uploadMutation.isPending}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">
                First Name
              </label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-none border-neutral-300 focus:border-black focus:ring-0 px-4 py-6 text-[15px] shadow-none bg-transparent"
                placeholder="First name"
                autoComplete="given-name"
                disabled={registerMutation.isPending}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">
                Last Name
              </label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-none border-neutral-300 focus:border-black focus:ring-0 px-4 py-6 text-[15px] shadow-none bg-transparent"
                placeholder="Last name"
                autoComplete="family-name"
                disabled={registerMutation.isPending}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">
              Phone Number
            </label>
            <div className="relative flex border border-neutral-300 focus-within:border-black transition-colors">
              <div className="flex items-center px-4 bg-neutral-50 border-r border-neutral-300">
                <span className="text-[14px] text-neutral-600">🇧🇩 +880</span>
              </div>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-none border-0 focus:ring-0 px-4 py-6 text-[15px] shadow-none bg-transparent flex-1 w-full"
                placeholder="01XXXXXXXXX"
                autoComplete="tel-national"
                disabled={registerMutation.isPending}
                required
              />
            </div>
          </div>

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
              disabled={registerMutation.isPending}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-none border-neutral-300 focus:border-black focus:ring-0 px-4 py-6 text-[15px] shadow-none pr-12 bg-transparent"
                placeholder="Create a password"
                autoComplete="new-password"
                disabled={registerMutation.isPending}
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

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-[11px] font-bold uppercase tracking-widest text-neutral-900">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-none border-neutral-300 focus:border-black focus:ring-0 px-4 py-6 text-[15px] shadow-none pr-12 bg-transparent"
                placeholder="Confirm your password"
                autoComplete="new-password"
                disabled={registerMutation.isPending}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 focus:outline-none focus:text-neutral-900 transition-colors"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full rounded-none py-6 uppercase tracking-[0.15em] font-semibold text-[13px] bg-black text-white hover:bg-neutral-800 transition-all"
          disabled={registerMutation.isPending}
        >
          {registerMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            'Create Account'
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
                router.push('/');
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
        Already have an account?{' '}
        <Link href="/login" className="text-black font-semibold hover:underline underline-offset-4">
          Sign in
        </Link>
      </div>
    </div>
  );
};
