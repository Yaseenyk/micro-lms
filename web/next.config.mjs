/**
 * Static export (docs/01 §2.1): the frontend ships as pure static files to
 * GitHub Pages. It holds only NEXT_PUBLIC_* publishable values — never secrets.
 * All dynamic behaviour is client-side against the Railway API.
 */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  reactStrictMode: true,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
