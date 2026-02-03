import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl font-bold font-display text-foreground mb-4">404</h1>
      <h2 className="text-xl font-semibold text-foreground mb-2">Halaman Tidak Ditemukan</h2>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Maaf, halaman yang kamu cari tidak ada.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-full font-medium text-primary-foreground bg-primary transition-all hover:scale-105"
      >
        Kembali ke Beranda
      </Link>
    </main>
  );
}
