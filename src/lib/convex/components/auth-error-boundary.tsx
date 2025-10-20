'use client';

import React from 'react';

import { ConvexError } from 'convex/values';

import { Button } from '@/components/ui/button';
import { signOut } from '../auth-client';
interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
  hasError: boolean;
  isReloading: boolean;
}

const CONVEX_ERROR_CODES_TO_HANDLE = ['USER_NOT_FOUND', 'UNAUTHENTICATED', 'BAD_REQUEST', 'FORBIDDEN', 'INTERNAL_SERVER_ERROR'];

export class AuthErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null, hasError: false, isReloading: false };
  }

  override componentDidCatch(error: Error) {
    // Check if this is an authentication error
    if (error instanceof ConvexError && CONVEX_ERROR_CODES_TO_HANDLE.includes(error.data?.code)) {
      this.setState({ isReloading: true });
      // Sign out and reload to clear invalid session
      error.data?.code === 'UNAUTHENTICATED' && signOut().then(() => {
        window.location.reload();
      });

    } else if (error.message.includes('timed out')) {
      this.setState({ isReloading: true });
      window.location.reload();
    } else {
      this.setState({ error, hasError: true });
      // Log other errors to error reporting service
      // window.location.reload();
    }
  }

  override render() {
    if (this.state.isReloading) {
      return null;
    }
    if (this.state.hasError) {
      // Redirecting
      return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-6xl font-bold tracking-tight text-foreground">
            Error
          </h2>

          <p className="text-subtle-foreground text-balance">
            Please try refreshing the page or return to the homepage.
          </p>

          <Button
            variant="outline"
            onClick={() => {
              window.location.href = '/';
            }}
          >
            Back to home
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
