"use client";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  error: string;
};

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="container mx-auto py-12 px-4 flex flex-col items-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-16 w-16 mx-auto text-red-500 mb-4" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Terjadi Kesalahan</h1>
        <div className="p-4 mb-6 text-red-700 bg-red-50 rounded-lg border border-red-100">
          <p className="font-medium">{error}</p>
        </div>
        <Button 
          onClick={() => window.location.reload()}
          className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-lg transition-colors"
        >
          Coba Lagi
        </Button>
      </div>
    </div>
  );
} 