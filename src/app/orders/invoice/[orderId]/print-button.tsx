"use client";

export function PrintButton() {
    return (
        <button
            onClick={() => window.print()}
            className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-2 font-semibold text-white hover:from-indigo-700 hover:to-purple-700"
        >
            Print Invoice
        </button>
    );
}
