import Link from 'next/link';
import { Heart, Instagram, Mail, MapPin, Printer } from "lucide-react";

export function Footer() {
    return (
        <footer className="relative border-t border-gray-100 bg-white pt-16 pb-8 overflow-hidden z-10 mt-auto">
            {/* Elegant Background Decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent opacity-70" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-24 bg-gradient-to-b from-indigo-50 to-transparent blur-3xl -z-10" />

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    {/* Brand & Info Column */}
                    <div className="space-y-6 xl:col-span-1">
                        <Link href="/" className="flex items-center gap-3 w-fit group">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shadow-indigo-200 group-hover:shadow-indigo-300 transition-all duration-300 group-hover:-translate-y-0.5">
                                <Printer className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                3D Print with Sruthi
                            </span>
                        </Link>
                        <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
                            Bringing your imagination to life through premium quality custom 3D printing designed with precision and care.
                        </p>
                        <div className="flex space-x-5 pt-2">
                            <a href="#" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                                <span className="sr-only">Instagram</span>
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="mailto:3dprintwithsruthi@gmail.com" className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300 hover:-translate-y-1 border border-gray-100">
                                <span className="sr-only">Email</span>
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold leading-6 text-gray-900 tracking-wider uppercase">Shop</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li>
                                        <Link href="/#products" className="text-sm leading-6 text-gray-500 hover:text-indigo-600 hover:pl-2 transition-all duration-300 flex items-center before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-indigo-600 before:mr-2 before:opacity-0 hover:before:opacity-100">
                                            All Products
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/cart" className="text-sm leading-6 text-gray-500 hover:text-indigo-600 hover:pl-2 transition-all duration-300 flex items-center before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-indigo-600 before:mr-2 before:opacity-0 hover:before:opacity-100">
                                            Your Cart
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/orders" className="text-sm leading-6 text-gray-500 hover:text-indigo-600 hover:pl-2 transition-all duration-300 flex items-center before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-indigo-600 before:mr-2 before:opacity-0 hover:before:opacity-100">
                                            Track Orders
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-10 md:mt-0">
                                <h3 className="text-sm font-semibold leading-6 text-gray-900 tracking-wider uppercase">Legal</h3>
                                <ul role="list" className="mt-6 space-y-4">
                                    <li>
                                        <Link href="#" className="text-sm leading-6 text-gray-500 hover:text-indigo-600 hover:pl-2 transition-all duration-300 flex items-center before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-indigo-600 before:mr-2 before:opacity-0 hover:before:opacity-100">
                                            Terms & Conditions
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm leading-6 text-gray-500 hover:text-indigo-600 hover:pl-2 transition-all duration-300 flex items-center before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-indigo-600 before:mr-2 before:opacity-0 hover:before:opacity-100">
                                            Privacy Policy
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="#" className="text-sm leading-6 text-gray-500 hover:text-indigo-600 hover:pl-2 transition-all duration-300 flex items-center before:content-[''] before:w-1 before:h-1 before:rounded-full before:bg-indigo-600 before:mr-2 before:opacity-0 hover:before:opacity-100">
                                            Refund Policy
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Contact Info Block */}
                        <div className="hidden md:block">
                            <h3 className="text-sm font-semibold leading-6 text-gray-900 tracking-wider uppercase">Contact Us</h3>
                            <ul role="list" className="mt-6 space-y-5">
                                <li className="flex gap-4 group cursor-default">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 border border-gray-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                                        <Mail className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div className="flex flex-col flex-1 justify-center">
                                        <span className="text-xs font-medium text-gray-900">Email assistance</span>
                                        <span className="text-sm text-gray-500">3dprintwithsruthi@gmail.com</span>
                                    </div>
                                </li>
                                <li className="flex gap-4 group cursor-default">
                                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gray-50 border border-gray-100 group-hover:bg-purple-50 group-hover:border-purple-100 transition-colors">
                                        <MapPin className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div className="flex flex-col flex-1 justify-center">
                                        <span className="text-xs font-medium text-gray-900">Location</span>
                                        <span className="text-sm text-gray-500">Tamil Nadu, India</span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar Content */}
                <div className="mt-16 border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-6 pb-2">
                    <p className="text-xs leading-5 text-gray-500">
                        &copy; {new Date().getFullYear()} 3D Print with Sruthi. All rights reserved.
                    </p>

                    <div className="flex items-center text-xs text-gray-500 bg-white shadow-sm px-4 py-2 rounded-full border border-gray-100 hover:shadow-md transition-all hover:border-indigo-200">
                        <span className="mr-1.5 font-medium">Crafted </span>
                        <span className="font-medium">by</span>
                        <a
                            href="https://Jasvanth-S.github.io/my_portfolio"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-1.5 font-bold text-indigo-600 hover:text-purple-600 transition-colors bg-indigo-50 hover:bg-purple-50 px-2 py-0.5 rounded-md"
                        >
                            Jasvanth. S
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
