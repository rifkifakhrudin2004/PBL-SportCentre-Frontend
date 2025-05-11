"use client";

export default function LoadingState() {
  return (
    <div className="container flex flex-col justify-center items-center mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Memuat Halaman</h1>
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
} 