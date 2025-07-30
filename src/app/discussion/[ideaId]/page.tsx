import { Metadata } from "next";
import { Suspense } from "react";
import ClientDiscussionWrapper from "./ClientDiscussionWrapper";

// Updated PageProps type to explicitly indicate both params and searchParams are Promises
type PageProps = {
  params: Promise<{ ideaId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// Use a static metadata approach that doesn't depend on API calls
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // Ensure params is awaited before accessing properties
  const resolvedParams = await params;
  const { ideaId } = resolvedParams;
  
  // Return static metadata that doesn't require API calls
  return {
    title: 'Discussion Details',
    description: 'View and participate in this discussion',
    // Add dynamic params for SEO but don't fetch from API
    openGraph: {
      title: 'Discussion Details',
      description: 'Join the conversation',
      url: `/discussion/${ideaId}`,
    },
  };
}

// Server component - the main page
export default async function DiscussionPage({ params, searchParams }: PageProps) {
  // Ensure params is awaited before accessing properties
  const resolvedParams = await params;
  const { ideaId } = resolvedParams;
  
  // Also await searchParams if needed
  const resolvedSearchParams = await searchParams;
  
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading discussion...</p>
      </div>
    }>
      <ClientDiscussionWrapper ideaId={ideaId} />
    </Suspense>
  );
}



