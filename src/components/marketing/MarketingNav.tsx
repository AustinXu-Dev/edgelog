'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export function MarketingNav() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:grid md:grid-cols-3">
          <Link href="/" className="font-semibold text-xl text-gray-900 tracking-tight">
            Edgelog
          </Link>

          <div className="hidden md:flex items-center justify-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
            </a>
          </div>

          <div className="hidden md:flex items-center justify-end gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Get Started
            </Link>
          </div>

          <div className="md:hidden flex justify-end">
            <button
              className="p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-1">
          <a
            href="#features"
            className="block text-sm text-gray-600 hover:text-gray-900 py-2.5"
            onClick={() => setIsOpen(false)}
          >
            Features
          </a>
          <a
            href="#pricing"
            className="block text-sm text-gray-600 hover:text-gray-900 py-2.5"
            onClick={() => setIsOpen(false)}
          >
            Pricing
          </a>
          <a
            href="#faq"
            className="block text-sm text-gray-600 hover:text-gray-900 py-2.5"
            onClick={() => setIsOpen(false)}
          >
            FAQ
          </a>
          <div className="pt-3 flex flex-col gap-2 border-t border-gray-100 mt-2">
            <Link href="/login" className="text-sm text-gray-600 py-2">
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
