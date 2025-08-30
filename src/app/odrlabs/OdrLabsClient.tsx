"use client"

import { useState } from "react"
import { Search, Filter, ThumbsUp, MessageSquare } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


type Idea = {
  id: string
  name: string        // From owner.name
  email: string       // From owner.email
  country: string     // From owner.country or default
  title: string       // Added title field from the database
  caption: string     // Added caption field from the database
  description: string
  submittedAt: string
  likes: number
  commentCount: number
  isIdeaOwner?: boolean // Added property to fix error
}

interface OdrLabsClientProps {
  initialIdeas: Idea[]
}

export default function OdrLabsClient({ initialIdeas }: OdrLabsClientProps) {
  const [ideas] = useState<Idea[]>(initialIdeas)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState("all")
  
  // Filter and search ideas
  const filteredIdeas = ideas.filter(idea => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         idea.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (idea.caption && idea.caption.toLowerCase().includes(searchTerm.toLowerCase()))
    
    if (filter === "all") return matchesSearch
    if (filter === "popular") return matchesSearch && idea.likes > 5
    if (filter === "recent") {
      const ideaDate = new Date(idea.submittedAt)
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      return matchesSearch && ideaDate > oneWeekAgo
    }
    if(filter === "myideas") {
      return matchesSearch && idea.isIdeaOwner
    }
    
    return matchesSearch
  })
  
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="bg-[#0a1e42] py-12 text-white md:py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl text-center">
              <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                ODR Lab
              </h1>
              <p className="font-semibold text-xl text-gray-100">Envision  --  Experiment  --  Engage  --  Execute</p>
              <p className="text-lg text-gray-200">
                ODR Lab is a virtual space for dialogue and discussion—a place to brainstorm, share thoughts on common ideas, and collaboratively design and develop those ideas into reality. With cooperative effort and, when needed, guidance from our experienced mentors, turn concepts into actionable solution and Co-create a responsive and inclusive dispute
              </p>
            </div>
          </div>
        </section>
        
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search ideas..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ideas</SelectItem>
                    <SelectItem value="myideas">My Ideas</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="recent">Recently Added</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Link href="/submit-idea">
                <Button className="bg-[#0a1e42] hover:bg-[#263e69]">
                  Submit Your Idea
                </Button>
              </Link>
            </div>
            
            {filteredIdeas.length === 0 ? (
              <div className="flex h-60 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <p className="text-lg font-medium text-gray-500">No ideas match your search criteria</p>
                <p className="text-sm text-gray-400">Try adjusting your search or filter settings</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredIdeas.map((idea) => (
                  <Link href={`/discussion/${idea.id}`} key={idea.id}>
                    <Card className="h-full cursor-pointer transition-shadow hover:shadow-md">
                      <CardHeader>
                        <div className="text-sm font-medium text-gray-500">
                          {idea.country} • {format(new Date(idea.submittedAt), "MMM d, yyyy")}
                        </div>
                        <CardTitle className="line-clamp-2 text-xl text-[#0a1e42]">
                          {idea.title}
                        </CardTitle>
                        {idea.caption && (
                          <p className="text-sm text-gray-600 italic mt-1">
                            {idea.caption}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent>
                        <p className="line-clamp-4 text-gray-600">
                          {idea.description}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <div className="flex w-full items-center justify-between">
                          <div className="text-sm font-medium">By {idea.name}</div>
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <ThumbsUp className="h-4 w-4" />
                              {idea.likes}
                            </span>
                            <span className="flex items-center gap-1 text-sm text-gray-500">
                              <MessageSquare className="h-4 w-4" />
                              {idea.commentCount}
                            </span>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
