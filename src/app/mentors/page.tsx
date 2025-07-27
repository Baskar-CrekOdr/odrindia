"use client"

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { getAllMentors, MentorWithIdeas } from '@/lib/mentors-service';
import { Search, Filter } from 'lucide-react';
import MentorCard from '@/components/mentors/MentorCard';
import MentorDetailModal from '@/components/mentors/MentorDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

export default function MentorsPage() {
  const [mentors, setMentors] = useState<MentorWithIdeas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMentor, setSelectedMentor] = useState<MentorWithIdeas | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  
  // Fetch mentors on component mount - this now only gets approved mentors
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const data = await getAllMentors();
        setMentors(data);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMentors();
  }, []);
  
  // Log mentors data for debugging
  // useEffect(() => {
  //   if (mentors.length > 0) {
  //     console.log("Loaded mentors:", mentors);
  //   }
  // }, [mentors]);

  // Filter mentors based on search term
  const filteredMentors = mentors.filter(mentor => {
    const matchesSearch = 
      (mentor.name && mentor.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mentor.email && mentor.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mentor.institution && mentor.institution.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mentor.organization && mentor.organization.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mentor.city && mentor.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mentor.country && mentor.country.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (mentor.expertise && mentor.expertise.toLowerCase().includes(searchTerm.toLowerCase()));
      
    // Only show approved mentors or assume approved if field is missing
    const isApproved = mentor.approved !== false;
    
    return matchesSearch && isApproved;
  });
  
  // Show login message by default for non-authenticated users
  const showLoginMessage = !user;
  
  const handleMentorClick = (mentor: MentorWithIdeas) => {
    setSelectedMentor(mentor);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl font-bold text-gray-900 mb-3"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Our <span className="text-blue-600">Mentors</span>
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Meet the experts who guide innovative ideas and projects in our ODR community
          </motion.p>
        </div>
        
        {/* Search and filter section */}
        <motion.div 
          className="mb-10 flex flex-col sm:flex-row gap-4 items-center justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search mentors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-gray-200"
            />
          </div>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Filter size={16} />
            <span>Sort By</span>
          </Button>
        </motion.div>
        
        {/* Mentors grid */}
        {/* First, check if loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-5">
                <div className="flex flex-col items-center">
                  <Skeleton className="h-32 w-32 rounded-full mb-4" />
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-2" />
                  <Skeleton className="h-4 w-20 mb-3" />
                  <Skeleton className="h-9 w-full mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : 
        /* Next, prioritize login message for non-authenticated users */
        showLoginMessage ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-lg mx-auto bg-gradient-to-b from-blue-50 to-white p-8 rounded-xl border border-blue-100 shadow-lg">
              <div className="mb-6 text-blue-600 relative">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-100 rounded-full opacity-40"></div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-indigo-100 rounded-full opacity-30"></div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-blue-800 mb-4">Login to know more about the mentors of the ODR Lab</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">Connect with our expert mentors who can guide you through your innovation journey and help you realize your ideas</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-md text-lg transition-all shadow-sm hover:shadow"
                  onClick={() => window.location.href = '/signup'}
                >
                  Sign Up
                </Button>
                <Button 
                  className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-200 px-8 py-3 rounded-md text-lg transition-all shadow-sm hover:shadow"
                  onClick={() => window.location.href = '/signin'}
                >
                  Log In
                </Button>
              </div>
            </div>
          </motion.div>
        ) : 
        /* For authenticated users, show mentor cards or "no results" message */
        filteredMentors.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
            variants={containerAnimation}
            initial="hidden"
            animate="show"
          >
            {filteredMentors.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onClick={() => handleMentorClick(mentor)}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 shadow p-8">
              <h3 className="text-xl font-medium text-gray-700 mb-2">No mentors found</h3>
              <p className="text-gray-500">Try adjusting your search criteria</p>
            </div>
          </motion.div>
        )}
      </div>
      
      {/* Mentor detail modal */}
      <MentorDetailModal
        mentor={selectedMentor}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
}
