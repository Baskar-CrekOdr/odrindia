"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';
import { MentorWithIdeas } from '@/lib/mentors-service';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MentorDetailModalProps {
  mentor: MentorWithIdeas | null;
  isOpen: boolean;
  onClose: () => void;
}

const MentorDetailModal: React.FC<MentorDetailModalProps> = ({ 
  mentor, 
  isOpen, 
  onClose 
}) => {
  if (!mentor) return null;

  // Get mentor image with fallback handling
  const getMentorImage = () => {
    if (mentor.imageAvatar) return mentor.imageAvatar;
    return mentor.id ? `/mentor/${mentor.id}.png` : undefined;
  };
  
  // Generate fallback initials from mentor's name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent 
        className="w-11/12 md:w-10/12 lg:w-4/5 max-w-7xl max-h-[90vh] p-4 md:p-6 bg-gradient-to-b from-white to-blue-50" 
        style={{ minWidth: "min(95vw, 1200px)" }}
      >
        <DialogHeader className="pb-3 border-b border-blue-100">
          <DialogTitle className="text-2xl font-bold flex items-center justify-between text-blue-800">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-sky-500">
              Mentor Profile
            </span>
          </DialogTitle>
          <DialogDescription className="text-blue-600">
            Detailed information about this mentor
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-150px)] px-1 md:px-2 overflow-y-auto">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 py-3 lg:py-4">
            {/* Left side - Mentor details */}
            <div className="w-full lg:w-1/3 flex flex-col">
              <div className="flex flex-col items-center mb-4">
                <Avatar className="w-28 h-28 md:w-40 md:h-40 mb-4 border-4 border-sky-300 shadow-lg">
                  <AvatarImage 
                    src={getMentorImage()}
                    alt={mentor.name || 'Mentor'}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-sky-600 text-white text-xl md:text-3xl font-bold">
                    {getInitials(mentor.name || 'Mentor')}
                  </AvatarFallback>
                </Avatar>
                
                <h2 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 text-center text-blue-900 break-words w-full px-2">
                  {mentor.name}
                </h2>
                <p className="text-blue-600 mb-2 text-center break-all w-full px-2">
                  {mentor.email}
                </p>
                
                {mentor.approved !== undefined && (
                  <Badge className={`mb-3 ${mentor.approved ? 'bg-green-100 hover:bg-green-200 text-green-800' : 'bg-amber-100 hover:bg-amber-200 text-amber-800'}`}>
                    {mentor.approved ? 'Approved Mentor' : 'Approval Pending'}
                  </Badge>
                )}
              </div>
              
              <div className="bg-white rounded-xl p-4 w-full shadow-sm border border-blue-100 hover:shadow-md transition-shadow duration-300">
                <h3 className="font-semibold text-lg mb-3 text-blue-800 border-b border-blue-100 pb-2">
                  Mentor Details
                </h3>
                
                <div className="space-y-2.5">
                  {mentor.mentorType && (
                    <div className="text-sm flex flex-col">
                      <span className="font-medium text-blue-700">Mentor Type:</span>
                      <span className="text-gray-700 break-words">
                        {mentor.mentorType.replace(/_/g, ' ')}
                      </span>
                    </div>
                  )}
                  
                  {(mentor.city || mentor.country) && (
                    <div className="text-sm flex flex-col">
                      <span className="font-medium text-blue-700">Location:</span>
                      <span className="text-gray-700 break-words">
                        {[mentor.city, mentor.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  
                  {(mentor.institution || mentor.organization) && (
                    <div className="text-sm flex flex-col">
                      <span className="font-medium text-blue-700">Institution/Organization:</span>
                      <span className="text-gray-700 break-words">{mentor.institution || mentor.organization}</span>
                    </div>
                  )}
                  
                  {mentor.role && (
                    <div className="text-sm flex flex-col">
                      <span className="font-medium text-blue-700">Role:</span>
                      <span className="text-gray-700 break-words">{mentor.role}</span>
                    </div>
                  )}
                  
                  {mentor.expertise && (
                    <div className="text-sm flex flex-col">
                      <span className="font-medium text-blue-700">Expertise:</span>
                      <span className="text-gray-700 break-words">{mentor.expertise}</span>
                    </div>
                  )}
                  
                  {mentor.highestEducation && (
                    <div className="text-sm flex flex-col">
                      <span className="font-medium text-blue-700">Education:</span>
                      <span className="text-gray-700 break-words">{mentor.highestEducation}</span>
                    </div>
                  )}
                  
                  <div className="text-sm flex flex-col">
                    <span className="font-medium text-blue-700">Joined:</span>
                    <span className="text-gray-700">
                      {formatDistanceToNow(new Date(mentor.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                {mentor.description && (
                  <div className="mt-4 pt-3 border-t border-blue-100">
                    <h3 className="font-semibold text-md mb-2 text-blue-800">About</h3>
                    <p className="text-sm text-gray-600 break-words whitespace-pre-wrap">
                      {mentor.description}
                    </p>
                  </div>
                )}
                
                {mentor.odrLabUsage && (
                  <div className="mt-4 pt-3 border-t border-blue-100">
                    <h3 className="font-semibold text-md mb-2 text-blue-800">ODR Lab Usage</h3>
                    <p className="text-sm text-gray-600 break-words whitespace-pre-wrap">
                      {mentor.odrLabUsage}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Right side - Ideas being mentored */}
            <div className="w-full lg:w-2/3 mt-4 lg:mt-0">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-100">
                <h3 className="font-bold text-xl text-blue-800 flex items-center">
                  Ideas Being Mentored
                  <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-700 border-blue-300">
                    {mentor.ideas?.length || mentor.mentoringIdeas?.length || 0}
                  </Badge>
                </h3>
              </div>
              
              {(mentor.ideas && mentor.ideas.length > 0) ? (
                <div className="space-y-3 md:space-y-4">
                  {mentor.ideas.map((idea) => (
                    <Card key={idea.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border border-blue-100">
                      <CardContent className="p-4">
                        <Link href={`/discussion/${idea.id}`} className="hover:no-underline block">
                          <h4 className="font-semibold text-lg text-blue-700 hover:text-blue-800 mb-2 break-words">
                            {idea.title}
                          </h4>
                        </Link>
                        
                        {idea.caption && (
                          <p className="text-sm text-blue-600 mb-2 break-words">
                            {idea.caption}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-700 line-clamp-3 mb-3 break-words whitespace-pre-wrap">
                          {idea.description || 'No description available'}
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-gray-100">
                          <span className="text-blue-500 my-1">
                            Created {formatDistanceToNow(new Date(idea.createdAt), { addSuffix: true })}
                          </span>
                          <span className="bg-blue-50 px-2 py-1 rounded-full text-blue-700">
                            {(idea.views || 0).toLocaleString()} views
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : mentor.mentoringIdeas && mentor.mentoringIdeas.length > 0 ? (
                <div className="space-y-3 md:space-y-4">
                  {mentor.mentoringIdeas.map((mentorship) => (
                    <Card key={mentorship.idea.id} className="overflow-hidden hover:shadow-md transition-all duration-300 border border-blue-100">
                      <CardContent className="p-4">
                        <Link href={`/discussion/${mentorship.idea.id}`} className="hover:no-underline block">
                          <h4 className="font-semibold text-lg text-blue-700 hover:text-blue-800 mb-2 break-words">
                            {mentorship.idea.title}
                          </h4>
                        </Link>
                        
                        {mentorship.idea.caption && (
                          <p className="text-sm text-blue-600 mb-2 break-words">
                            {mentorship.idea.caption}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-700 line-clamp-3 mb-3 break-words whitespace-pre-wrap">
                          {mentorship.idea.description || 'No description available'}
                        </p>
                        
                        <div className="flex flex-wrap items-center justify-between text-xs pt-2 border-t border-gray-100">
                          <span className="text-blue-500 my-1">
                            Created {formatDistanceToNow(new Date(mentorship.idea.createdAt), { addSuffix: true })}
                          </span>
                          {mentorship.role && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                              {mentorship.role}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="bg-white p-5 rounded-xl text-center border border-blue-100 shadow-sm">
                  <p className="text-blue-600">This mentor is not currently mentoring any ideas.</p>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MentorDetailModal;
