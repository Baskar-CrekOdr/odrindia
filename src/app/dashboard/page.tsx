'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AlertCircle, User, Briefcase, Lightbulb, XCircle, Edit, MapPin, Building } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserAvatar } from '@/components/ui/user-avatar';
import ProfileEditor from '@/components/profile/ProfileEditor';
export default function Dashboard() {
  // Use auth hook to get user data and refresh function
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  // Redirect to complete-profile if user needs to complete profile
  useEffect(() => {
    if (user && user.needsProfileCompletion) {
      router.replace('/complete-profile');
    }
  }, [user, router]);
  const [loading, setLoading] = useState(false);
  const [isProfileEditorOpen, setIsProfileEditorOpen] = useState(false);
  const [stats, setStats] = useState({
    ideasCount: 0,
    collaborationsCount: 0,
    mentorshipsCount: 0
  });


  // Show error messages from profile update or stats fetch
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleProfileUpdate = async () => {
    try {
      await refreshUser();
      setErrorMsg(null);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to update profile");
    }
  };

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        const response = await apiFetch('/user/stats');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          setErrorMsg(errorData.error || `Failed with status: ${response.status}`);
          throw new Error(errorData.error || `Failed with status: ${response.status}`);
        }
        const data = await response.json();
        setStats(data);
      } catch (error: any) {
        setErrorMsg(error?.message || 'Failed to fetch user stats.');
        console.error('Failed to fetch user stats:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.id) {
      fetchUserStats();
    }
  }, [user?.id]);

  return (
    <div className="max-w-5xl mx-auto p-5 space-y-6">
      {/* Show error message if present */}
      {errorMsg && (
        <div className="mb-4">
          <div className="flex items-center gap-2 bg-red-100 border border-red-300 text-red-800 rounded px-4 py-2">
            <AlertCircle className="w-5 h-5" />
            <span>{errorMsg}</span>
          </div>
        </div>
      )}
      {/* Profile Header Section */}
      <Card className="border-none shadow-sm bg-gradient-to-r from-[#0a1e42] to-[#3a86ff]">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <UserAvatar 
              user={
                user
                  ? {
                      name: user.name,
                      imageAvatar: user.imageAvatar ?? undefined,
                    }
                  : undefined
              }
              size="xl"
              className="h-20 w-20 border-4 border-white/20"
              fallbackClassName="bg-white/10 text-white text-xl font-semibold"
            />
            
            <div className="flex-1 text-white">
              <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name}</h1>
              <p className="text-white/80 mb-2">
                {user?.userRole?.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
              </p>
              
              <div className="flex flex-wrap gap-4 text-sm text-white/70">
                {user?.city && user?.country && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user.city}, {user.country}</span>
                  </div>
                )}
                
                {/* Role-specific information */}
                {user?.userRole === 'INNOVATOR' && (user as any)?.innovator?.institution && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{(user as any).innovator.institution}</span>
                  </div>
                )}
                
                {user?.userRole === 'MENTOR' && (user as any)?.mentor?.organization && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{(user as any).mentor.organization}</span>
                  </div>
                )}
                
                {user?.userRole === 'OTHER' && (user as any)?.other?.workplace && (
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{(user as any).other.workplace}</span>
                  </div>
                )}
              </div>
            </div>
            
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsProfileEditorOpen(true)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Status Messages */}
      {/* Show pending approval status for mentors */}
      {(user?.hasMentorApplication && !user?.isMentorApproved) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <h3 className="flex items-center text-yellow-800 font-medium">
              <AlertCircle className="w-5 h-5 mr-2" /> Mentor Approval Pending
            </h3>
            <p className="text-yellow-700 mt-1">
              Your mentor application is pending approval. You&apos;ll have full access to mentor features once approved.
            </p>
          </CardContent>
        </Card>
      )}
      
      {/* Show message for users whose mentor application was rejected */}
      {user?.userRole === "OTHER" && user?.mentorRejectionReason && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <h3 className="flex items-center text-red-800 font-medium">
              <XCircle className="w-5 h-5 mr-2" /> Mentor Application Rejected
            </h3>
            <p className="text-red-700 mt-1">
              Your mentor application was not approved. Reason: {user.mentorRejectionReason || "No reason provided."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white hover:bg-red-50 border-red-200 text-red-700"
                onClick={() => window.location.href = "/contact-admin"}>
                Contact Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white hover:bg-red-50 border-red-200 text-red-700"
                onClick={() => window.location.href = "/apply-mentor"}>
                Apply Again as Mentor
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full mr-4">
                <Lightbulb className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Your Ideas</h3>
                <p className="text-3xl font-bold text-[#0a1e42] mt-1">{stats.ideasCount}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Ideas you&apos;ve created</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Collaborations</h3>
                <p className="text-3xl font-bold text-[#0a1e42] mt-1">{stats.collaborationsCount}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Projects you&apos;re contributing to</p>
          </CardContent>
        </Card>
        
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <Briefcase className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-800">Mentorships</h3>
                <p className="text-3xl font-bold text-[#0a1e42] mt-1">{stats.mentorshipsCount}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {user?.userRole === "MENTOR" ? "Projects you're mentoring" : "Projects where you have mentors"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Actions or Additional Content */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-[#0a1e42]">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your recent activity and updates will appear here.
          </p>
        </CardContent>
      </Card>

      {/* Profile Editor Modal */}
      <ProfileEditor
        isOpen={isProfileEditorOpen}
        onClose={() => setIsProfileEditorOpen(false)}
        onSave={handleProfileUpdate}
      />
    </div>
  );
}