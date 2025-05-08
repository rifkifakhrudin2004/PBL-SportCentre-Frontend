import Link from 'next/link';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-background border-t py-2 md:py-4">
      <div className="container flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Sport Center.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <Link href="/about" className="text-sm text-muted-foreground hover:underline">
            Tentang Kami
          </Link>
          <Link href="/contact" className="text-sm text-muted-foreground hover:underline">
            Kontak
          </Link>
          <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
            Syarat dan Ketentuan
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
            Kebijakan Privasi
          </Link>
        </div>
      </div>
    </footer>
  );
} 