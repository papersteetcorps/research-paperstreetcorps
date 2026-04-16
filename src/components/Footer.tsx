import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-surface-800 px-6 py-6 text-sm text-surface-500 flex justify-between">
      <div>&copy; {new Date().getFullYear()} Paper Street Corps</div>
      <Link
        href="https://paperstreetcorps.com"
        className="text-surface-600 hover:text-surface-400 transition-colors"
      >
        paperstreetcorps.com
      </Link>
    </footer>
  );
}
