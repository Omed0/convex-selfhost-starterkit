import { SignForm } from '@/lib/convex/components/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm">
        <h1 className="mb-8 text-center text-2xl font-bold">
          Sign in to your account
        </h1>
        <SignForm />
      </div>
    </div>
  );
}
