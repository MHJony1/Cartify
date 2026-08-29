import Link from 'next/link';
import { EmptyState } from '@/components/shared/EmptyState';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <EmptyState
        icon={<FileQuestion className="h-16 w-16 text-muted-foreground" />}
        title="Page Not Found"
        message="The page you are looking for doesn't exist or has been moved."
        action={
          <Link
            href="/"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors hover:bg-primary/90"
          >
            Return Home
          </Link>
        }
      />
    </div>
  );
}
