"use client"

import React, { useState, useRef, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronDown, Menu, Search, BookOpen, Users, FileText, ExternalLink, Scale, Home, Info, MessageSquare, Lightbulb, BookOpenCheck, Contact } from "lucide-react"
import { useAuth } from "@/lib/auth"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const navItems = [
	{
		title: "Home",
		href: "/home",
		icon: Home
	},
	{
		title: "About",
		href: "/about",
		icon: Info
	},
	{
		title: "ODR Resources",
		href: "/resources",
		icon: BookOpenCheck,
		children: [
			{
				title: "ODR Info",
				href: "https://odr.info/",
				description:
					"Explore a curated list of resources, articles, and tools related to Online Dispute Resolution (ODR).",
				icon: BookOpen,
			},
			{
				title: "ICODR",
				href: "https://icodr.org/",
				description:
					"ICODR is an international nonprofit, incorporated in the United States, that drives the development, convergence, and adoption of open standards for the global effort to resolve disputes and conflicts using information and communications technology.",
				icon: Scale,
			},
			{
				title:"ODR Standards",
				href: "https://icodr.org/Standards/",
				description:
					"ODR Standards apply to ODR practitioners and to technological platforms, systems, and tools when employed for dispute handling. They are interdependent and must be applied together.",
				icon: Scale
			},
			{
				title: "Mediate",
				href: "https://mediate.com/",
				description:
					"Global source for insightful mediation resources and trusted mediator  connections.",
				icon: Users,
			},
			
		],
	},
	{
		title: "Chatbot",
		href: "/chatbot",
		icon: MessageSquare
	},
	{
		title: "Idea Board",
		href: "/submit-idea",
		icon: Lightbulb
	},
	{
		title: "ODR Lab",
		href: "/odrlabs",
		icon: BookOpen
	},
	{
		title: "Mentors",
		href: "/mentors",
		icon: Users
	},
	{
		title: "Contact",
		href: "/contact",
		icon: Contact
	},
]

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false)
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
	const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
	const [profileDropdown, setProfileDropdown] = useState(false)
	const { user: currentUser, loading, logout, refreshUser } = useAuth()

	// Force refresh user data when component mounts
	useEffect(() => {
		refreshUser();
	}, [refreshUser]);
	
	// Handle user logout
	const handleLogout = () => {
		logout()
		setProfileDropdown(false)
	}
	
	// Handle external link navigation
	const handleExternalLinkClick = () => {
		// Close any open dropdowns when navigating to external site
		setActiveDropdown(null);
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				activeDropdown &&
				dropdownRefs.current[activeDropdown] &&
				!dropdownRefs.current[activeDropdown]?.contains(event.target as Node)
			) {
				setActiveDropdown(null)
			}

			// Close profile dropdown when clicking outside
			const profileButton = document.getElementById("profile-button")
			const profileDropdownElement = document.getElementById("profile-dropdown")
			if (
				profileDropdown &&
				event.target !== profileButton &&
				!profileDropdownElement?.contains(event.target as Node)
			) {
				setProfileDropdown(false)
			}
		}

		document.addEventListener("mousedown", handleClickOutside)
		return () => {
			document.removeEventListener("mousedown", handleClickOutside)
		}
	}, [activeDropdown, profileDropdown])

	// Improved dropdown toggle function
	const toggleDropdown = (title: string) => {
		// Always toggle regardless of current state
		// This ensures it works even when coming back from external sites
		setActiveDropdown(prev => prev === title ? null : title);
	}

	// Reset dropdown state when window regains focus (returning from external site)
	useEffect(() => {
		const handleFocus = () => {
			// Reset dropdown state on focus return
			setActiveDropdown(null);
		};

		window.addEventListener('focus', handleFocus);
		return () => {
			window.removeEventListener('focus', handleFocus);
		};
	}, []);

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-white">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<div className="flex items-center gap-2">
					<Link href="/" className="flex items-center space-x-2">
						<div className="relative h-10 w-40">
							<Image
								src="/Logobg.svg"
								alt="ODR Logo"
								fill
								className="object-contain"
								priority
							/>
						</div>
					</Link>
				</div>

				{/* Desktop Navigation - xl and up (above lg/1280px) */}
				<nav className="hidden xl:block">
					<ul className="flex items-center space-x-5">
						{navItems.map((item) => (
							<li key={item.title} className="relative">
								{item.children ? (
									<Popover>
										<PopoverTrigger asChild>
											<button
												className={cn(
													"group flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-200",
													"text-slate-800 hover:text-blue-600 rounded-md hover:bg-blue-50 transform hover:scale-105",
													activeDropdown === item.title && "text-blue-600 bg-blue-50"
												)}
												onClick={() => toggleDropdown(item.title)}
												// Ensure this button can be used to open/close dropdown even after returning
												type="button"
												aria-expanded={activeDropdown === item.title}
												aria-controls={`dropdown-${item.title}`}
											>
												{item.icon && (
													<div className={cn(
														"text-slate-500 transition-colors",
														activeDropdown === item.title ? "text-blue-600" : "group-hover:text-blue-600"
													)}>
														{React.createElement(item.icon, { size: 16 })}
													</div>
												)}
												<span>{item.title}</span>
												<ChevronDown
													size={16}
													className={cn(
														"transition-transform duration-200 text-slate-400",
														activeDropdown === item.title && "rotate-180 text-blue-600"
													)}
												/>
												<span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-blue-500/0 via-blue-500/70 to-blue-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
											</button>
										</PopoverTrigger>
										<AnimatePresence>
											{activeDropdown === item.title && (
												<PopoverContent
													id={`dropdown-${item.title}`}
													side="bottom"
													align="start"
													sideOffset={8}
													className="w-[550px] p-0 border border-slate-200 rounded-xl shadow-lg"
													forceMount
													asChild
													ref={(node) => {
														if (node) dropdownRefs.current[item.title] = node;
													}}
												>
													<motion.div
														initial={{ opacity: 0, y: 10 }}
														animate={{ opacity: 1, y: 0 }}
														exit={{ opacity: 0, y: 10 }}
														transition={{ duration: 0.2 }}
													>
														<div className="grid grid-cols-1 gap-3 p-3 bg-white rounded-xl overflow-hidden">
															{item.children.map((child, index) => (
																<Link
																	key={index}
																	href={child.href}
																	onClick={() => {
																		setActiveDropdown(null);
																		if (child.href.startsWith('http')) {
																			handleExternalLinkClick();
																		}
																	}}
																	className="flex gap-3 p-5 rounded-lg hover:bg-blue-50 transition-colors group"
																	target={child.href.startsWith('http') ? "_blank" : undefined}
																	rel={child.href.startsWith('http') ? "noopener noreferrer" : undefined}
																>
																	<div className="flex-shrink-0 mt-1">
																		{child.icon && (
																			<div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center transition-colors group-hover:bg-blue-200">
																				{React.createElement(child.icon, { size: 20 })}
																			</div>
																		)}
																	</div>
																	<div className="flex flex-col flex-1">
																		<div className="font-medium text-slate-900 flex items-center gap-1 group-hover:text-blue-600 transition-colors">
																			{child.title}
																			{child.href.startsWith('http') && (
																				<ExternalLink size={14} className="text-slate-400 group-hover:text-blue-500" />
																			)}
																		</div>
																		<p className="text-sm text-slate-600 mt-1.5 pr-1 leading-relaxed">
																			<span className="text-blue-600 font-medium">{child.title}: </span>
																			{child.description}
																		</p>
																	</div>
																</Link>
															))}
														</div>
													</motion.div>
												</PopoverContent>
											)}
										</AnimatePresence>
									</Popover>
								) : (
									<Link
										href={item.href}
										className={cn(
											"group relative flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all duration-200",
											"text-slate-800 hover:text-blue-600 rounded-md hover:bg-blue-50 transform hover:scale-105"
										)}
									>
										{item.icon && (
											<div className="text-slate-500 group-hover:text-blue-600 transition-colors">
												{React.createElement(item.icon, { size: 16 })}
											</div>
										)}
										<span>{item.title}</span>
										<span className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-blue-500/0 via-blue-500/70 to-blue-500/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
									</Link>
								)}
							</li>
						))}
					</ul>
				</nav>
					{/* Desktop Auth Section - xl and up (above lg/1280px) */}
					{loading ? (
						<div className="hidden xl:flex gap-2 items-center">
							<div className="animate-pulse h-9 w-9 rounded-full bg-slate-200"></div>
							<div className="animate-pulse h-4 w-16 rounded bg-slate-200"></div>
						</div>
					) : currentUser ? (
						<Popover>
							<PopoverTrigger asChild>
								<button
									id="profile-button"
									className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-full transition-all border border-transparent hover:border-slate-200 hover:bg-slate-50"
									aria-label="User menu"
									onClick={() => setProfileDropdown(!profileDropdown)}
								>
									<UserAvatar
										user={currentUser}
										size="sm"
										className="border-2 border-white shadow-sm transition-all"
										fallbackClassName="bg-blue-600 text-white"
									/>
									<div className="flex flex-col items-start">
										<span className="text-sm font-medium text-slate-800 leading-none">
											{currentUser.name.split(' ')[0]}
										</span>                                    <span className="text-xs text-slate-500">
                                        {/* Show role based on actual userRole, with pending indicator if applicable */}
                                        {currentUser.userRole.charAt(0) + currentUser.userRole.slice(1).toLowerCase()}
                                        {currentUser.hasMentorApplication && !currentUser.isMentorApproved && 
                                          currentUser.userRole !== "MENTOR" && " (Mentor Pending)"}
                                    </span>
									</div>
									<ChevronDown 
										size={14} 
										className={cn(
											"text-slate-400 transition-transform duration-200",
											profileDropdown && "rotate-180"
										)} 
									/>
								</button>
							</PopoverTrigger>
							<AnimatePresence>
								{profileDropdown && (
									<PopoverContent
										id="profile-dropdown"
										className="w-[260px] p-1.5 bg-white rounded-xl shadow-xl border-slate-200"
										align="end"
										sideOffset={8}
										forceMount
										asChild
									>
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 10 }}
											transition={{ duration: 0.15 }}
										>
											<div className="p-3 mb-1.5 border-b border-slate-100">
												<div className="flex items-center gap-3">
													<UserAvatar
														user={currentUser}
														size="md"
														className="h-10 w-10 border-2 border-blue-100"
														fallbackClassName="bg-blue-600 text-white"
													/>
													<div>
														<p className="font-medium text-slate-900 leading-tight">
															{currentUser.name}
														</p>
														<p className="text-xs text-slate-500 mt-0.5 truncate max-w-[170px]">
															{currentUser.email}
														</p>
													</div>
												</div>
											</div>

											<Link
												href="/dashboard"
												onClick={() => setProfileDropdown(false)}
												className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50"
											>
												<div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
														<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
														<circle cx="12" cy="7" r="4"></circle>
													</svg>
												</div>
												Your Profile
											</Link>

											{currentUser.userRole === "ADMIN" && (
													
													<Link
														href="/admin/idea-approval"
														onClick={() => setIsOpen(false)}
														className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
															<path d="M12 2H2v10h10V2z"></path>
															<path d="M22 12h-10v10h10V12z"></path>
															<path d="M12 12H2v10h10V12z"></path>
														</svg>
														Idea Approval
													</Link>
												)}
												{currentUser.userRole === "ADMIN" && (
													<Link
														href="/admin/mentor-approval"
														onClick={() => setIsOpen(false)}
														className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg  text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
															<path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
															<path d="M16 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
															<path d="M12 17a5 5 0 0 0-5-5H6a5 5 0 0 0-5 5"></path>
															<path d="M18 17a5 5 0 0 0-5-5h-1a5 5 0 0 0-5 5"></path>
															<line x1="14" y1="7" x2="18" y2="3"></line>
														</svg>
														Mentor Approval
													</Link>
												)}

											<Link
												href="/submit-idea"
												onClick={() => setProfileDropdown(false)}
												className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-slate-700 hover:bg-blue-50"
											>
												<div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
														<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
														<polyline points="14 2 14 8 20 8"></polyline>
														<line x1="12" y1="18" x2="12" y2="12"></line>
														<line x1="9" y1="15" x2="15" y2="15"></line>
													</svg>
												</div>
												Submit an Idea
											</Link>

											<button
												onClick={handleLogout}
												className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 mt-1 border-t border-slate-100 pt-2"
											>
												<div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center">
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
														<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
														<polyline points="16 17 21 12 16 7"></polyline>
														<line x1="21" y1="12" x2="9" y2="12"></line>
													</svg>
												</div>
												Sign out
											</button>
										</motion.div>
									</PopoverContent>
								)}
							</AnimatePresence>
						</Popover>
					) : (
						<div className="hidden xl:flex items-center gap-2">
							<Button asChild className="bg-white border border-slate-300 text-slate-700 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 shadow-sm">
								<Link href="/signin">
									Sign in
								</Link>
							</Button>
							<Button asChild className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
								<Link href="/signup">
									Sign Up
								</Link>
							</Button>
						</div>
					)}

					{/* Mobile Menu Toggle - lg and below (up to 1280px) */}
					<Sheet open={isOpen} onOpenChange={setIsOpen}>
						<SheetTrigger asChild>
							<Button 
								variant="ghost" 
								size="sm" 
								className="h-9 w-9 rounded-full p-0 xl:hidden bg-slate-50 hover:bg-slate-100 text-slate-700"
							>
								<Menu className="h-5 w-5" />
								<span className="sr-only">Toggle menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent 
							side="right" 
							className="w-[300px] sm:w-[350px] bg-sky-50 border-l border-slate-100 p-0"
						>
							<div className="flex flex-col h-full">
								<div className="p-4 border-b border-slate-100">
									<Link
										href="/"
										className="flex items-center space-x-2"
										onClick={() => setIsOpen(false)}
									>
										<div className="relative h-8 w-32">
											<Image
												src="/Logobg.svg"
												alt="ODR Logo"
												fill
												className="object-contain"
												priority
											/>
										</div>
									</Link>
								</div>
								
								{/* Search Box */}
								<div className="px-4 py-3 border-b border-slate-100">
									<div className="relative">
										<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
										<input 
											type="text" 
											placeholder="Search..." 
											className="w-full h-10 pl-9 pr-4 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
										/>
									</div>
								</div>

								{/* Menu Items */}
								<nav className="flex-grow py-4 px-2 overflow-y-auto">
									<div className="flex flex-col gap-1 px-2">
										{navItems.map((item) => (
											<div key={item.title} className="mb-1">
												{item.children ? (
													<div className="mb-1">
														<button
															className="flex justify-between items-center py-2 px-3 w-full rounded-md hover:bg-slate-50 transition-colors"
															onClick={() => toggleDropdown(item.title)}
															type="button"
														>
															<div className="flex items-center gap-2">
																{item.icon && React.createElement(item.icon, { 
																	size: 18,
																	className: "text-blue-500" 
																})}
																<span className="font-medium text-slate-800">
																	{item.title}
																</span>
															</div>
															<ChevronDown size={16} className="text-slate-400" />
														</button>
														{activeDropdown === item.title && (
															<div className="mt-2 ml-3 flex flex-col space-y-4 border-l-2 border-slate-100 pl-3">
																{item.children.map((child) => (
																	<div key={child.title} className="flex flex-col">
																		<Link
																			href={child.href}
																			className="py-2.5 px-3 text-sm flex items-center gap-2.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
																			onClick={() => {
																				setIsOpen(false);
																				if (child.href.startsWith('http')) {
																					handleExternalLinkClick();
																				}
																			}}
																			target={child.href.startsWith('http') ? "_blank" : undefined}
																			rel={child.href.startsWith('http') ? "noopener noreferrer" : undefined}
																		>
																			{child.icon && React.createElement(child.icon, { 
																				size: 18,
																				className: "text-blue-500" 
																			})}
																			<span>{child.title}</span>
																			{child.href.startsWith('http') && (
																				<ExternalLink size={12} className="text-slate-400 ml-auto" />
																			)}
																		</Link>
																		<p className="text-xs text-slate-500 ml-10 mt-1 pr-3 mb-2 leading-relaxed">
																			<span className="text-blue-600 font-medium">{child.title}: </span>
																			{child.description}
																		</p>
																	</div>
																))}
															</div>
														)}
													</div>
												) : (
													<Link
														href={item.href}
														className="flex items-center gap-2 py-2.5 px-3 font-medium text-slate-800 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
														onClick={() => setIsOpen(false)}
													>
														{item.icon && React.createElement(item.icon, { 
															size: 18,
															className: "text-blue-500" 
														})}
														{item.title}
													</Link>
												)}
											</div>
										))}
									</div>
								</nav>
								
								{/* User Section / Auth Buttons */}
								<div className="mt-auto border-t border-slate-100 p-4">
									{loading ? (
										<div className="flex items-center gap-3">
											<div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse"></div>
											<div className="space-y-2">
												<div className="h-4 w-24 bg-slate-200 animate-pulse rounded"></div>
												<div className="h-3 w-32 bg-slate-200 animate-pulse rounded"></div>
											</div>
										</div>
									) : currentUser ? (
										<div className="space-y-4">
											<div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
												<UserAvatar
													user={currentUser}
													size="md"
													className="h-10 w-10 border-2 border-white shadow-sm"
													fallbackClassName="bg-blue-600 text-white"
												/>
												<div>
													<p className="font-medium text-slate-900">
														{currentUser.name}
													</p>
													<p className="text-xs text-slate-500">
														{currentUser.email}
													</p>
													{currentUser.hasMentorApplication && !currentUser.isMentorApproved && (
														<p className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full mt-1 inline-block">
															Mentor Approval Pending
														</p>
													)}
												</div>
											</div>

											<div className="grid grid-cols-1 gap-2">
												<Link 
													href="/dashboard" 
													onClick={() => setIsOpen(false)}
													className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
												>
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
														<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
														<circle cx="12" cy="7" r="4"></circle>
													</svg>
													Your Profile
												</Link>

												{currentUser.userRole === "ADMIN" && (
													
													<Link
														href="/admin/idea-approval"
														onClick={() => setIsOpen(false)}
														className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
															<path d="M12 2H2v10h10V2z"></path>
															<path d="M22 12h-10v10h10V12z"></path>
															<path d="M12 12H2v10h10V12z"></path>
														</svg>
														Idea Approval
													</Link>
												)}
												{currentUser.userRole === "ADMIN" && (
													<Link
														href="/admin/mentor-approval"
														onClick={() => setIsOpen(false)}
														className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
															<path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
															<path d="M16 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
															<path d="M12 17a5 5 0 0 0-5-5H6a5 5 0 0 0-5 5"></path>
															<path d="M18 17a5 5 0 0 0-5-5h-1a5 5 0 0 0-5 5"></path>
															<line x1="14" y1="7" x2="18" y2="3"></line>
														</svg>
														Mentor Approval
													</Link>
												)}

												<Link 
													href="/submit-idea" 
													onClick={() => setIsOpen(false)}
													className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50"
												>
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
														<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
														<polyline points="14 2 14 8 20 8"></polyline>
														<line x1="12" y1="18" x2="12" y2="12"></line>
														<line x1="9" y1="15" x2="15" y2="15"></line>
													</svg>
													Submit an Idea
												</Link>

												<button
													onClick={() => {
														handleLogout()
														setIsOpen(false)
													}}
													className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 rounded-lg border border-red-100 text-sm font-medium text-red-600 hover:bg-red-100"
												>
													<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
														<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
														<polyline points="16 17 21 12 16 7"></polyline>
														<line x1="21" y1="12" x2="9" y2="12"></line>
													</svg>
													Sign out
												</button>
											</div>
										</div>
									) : (
										<div className="grid grid-cols-2 gap-3">
											<Button asChild variant="outline" className="w-full justify-center">
												<Link href="/signin" onClick={() => setIsOpen(false)}>
													Sign In
												</Link>
											</Button>
											<Button asChild className="w-full justify-center bg-blue-600 hover:bg-blue-700">
												<Link href="/signup" onClick={() => setIsOpen(false)}>
													Sign Up
												</Link>
											</Button>
										</div>
									)}
								</div>
							</div>
						</SheetContent>
					</Sheet>
				</div>
		</header>
	)
}
