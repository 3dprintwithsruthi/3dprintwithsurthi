import { Heart } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-gray-100 bg-white py-8">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-center space-y-4 px-4 text-center">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-500">
                    <span>&copy; {new Date().getFullYear()} All rights reserved.</span>
                    <span className="hidden sm:inline">&bull;</span>
                    <span className="block sm:inline">3D Print with Sruthi</span>
                </div>

                <div className="flex items-center text-xs text-gray-400 hover:text-gray-600 transition-colors duration-300">
                    <span>Made by</span>
                    <span className="mx-1 font-semibold text-indigo-500">
                        Jasvanth. S
                    </span>
                    <Heart className="ml-1 h-3 w-3 text-red-400 fill-red-400" />
                </div>
            </div>
        </footer>
    );
}
