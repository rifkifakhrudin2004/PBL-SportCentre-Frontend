"use client";

import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  error: string;
};

export default function ErrorState({ error }: ErrorStateProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Booking</h1>
      <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg">
        <p>{error}</p>
      </div>
      <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
    </div>
  );
} 