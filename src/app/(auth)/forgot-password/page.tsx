import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Forgot Password | Cartify',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex-grow flex flex-col items-center justify-center p-8 bg-white relative">
      <div className="text-center max-w-md w-full">
        <h1 className="text-3xl font-light tracking-tight text-black mb-3">Forgot Password</h1>
        <p className="text-sm text-neutral-500 font-light mb-8">
          Password reset functionality is currently unavailable. Please contact support if you are unable to access your account.
        </p>
        <Link href="/login">
          <Button className="w-full rounded-none py-6 uppercase tracking-wider font-medium text-sm">
            Return to Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
}
