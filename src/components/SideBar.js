"use client"

import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

function SideBar() {
    // Use the useSession hook to access session data
    const { data: session } = useSession()

    // State to manage mobile menu visibility
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Toggle mobile menu
    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen)
    }

    // Render menu items
    const MenuItems = () => (
        <nav>
            <ul className="text-white">
                <li className="mb-2">
                    <Link href="/" className="block p-2 hover:bg-blue-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                        Dashboard
                    </Link>
                </li>
                <li className="mb-2">
                    <Link href="/leads" className="block p-2 hover:bg-blue-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                        Leads
                    </Link>
                </li>
                <li className="mb-2">
                    <Link href="/customers" className="block p-2 hover:bg-blue-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                        Customers
                    </Link>
                </li>
                <li className="mb-2">
                    <Link href="/projects" className="block p-2 hover:bg-blue-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                        Projects
                    </Link>
                </li>
                <li className="mb-2">
                    <Link href="/appointments" className="block p-2 hover:bg-blue-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                        Appointments
                    </Link>
                </li>
                <li className="mb-2">
                    <Link href="/reports" className="block p-2 hover:bg-blue-700 rounded" onClick={() => setIsMobileMenuOpen(false)}>
                        Reports
                    </Link>
                </li>
            </ul>
        </nav>
    )

    return (
        <>
            {/* Hamburger Menu for Mobile */}
            <button
                className="md:hidden fixed top-1 right-1 z-50 p-2 text-black rounded"
                onClick={toggleMobileMenu}
            >
                {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Sidebar for Desktop */}
            <aside className="hidden md:flex md:w-64 bg-blue-800 text-white p-4 flex-col">
                <div className="text-2xl font-bold mb-8">CRM</div>
                <MenuItems />

                <div className="mt-24 pt-8">
                    <div className="flex items-center p-2">
                        <div>
                            {session ? (
                                <p className="text-sm font-medium">
                                    {session.user.name}
                                </p>
                            ) : (
                                <button className="font-medium">
                                    <Link href={`/login`}>
                                        Login
                                    </Link>
                                </button>
                            )}
                            <p className="text-xs text-blue-300">{session?.user?.email}</p>
                        </div>
                    </div>
                    {session && (
                        <button
                            className="w-full mt-2 p-2 text-sm hover:bg-blue-700 rounded"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                        >
                            Logout
                        </button>
                    )}
                </div>
            </aside>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-blue-800 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                >
                    <div
                        className="p-4 pt-20"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="text-2xl font-bold mb-8 text-white">CRM</div>
                        <MenuItems />

                        <div className="mt-auto pt-8">
                            <div className="flex items-center p-2">
                                <div>
                                    {session ? (
                                        <p className="text-sm font-medium text-white">
                                            {session.user.name}
                                        </p>
                                    ) : (
                                        <button className="text-white">
                                            <Link href={`/login`}>
                                                Login
                                            </Link>
                                        </button>
                                    )}
                                    <p className="text-xs text-blue-300">{session?.user?.email}</p>
                                </div>
                            </div>
                            {session && (
                                <button
                                    className="w-full mt-2 p-2 text-sm hover:bg-blue-700 rounded text-white"
                                    onClick={() => signOut({ callbackUrl: "/login" })}
                                >
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default SideBar