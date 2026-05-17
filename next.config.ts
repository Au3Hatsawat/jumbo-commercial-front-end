import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  /* config options here */
  // allowedDevOrigins: ['192.168.1.2'],
  output: "standalone",
};

export default withNextIntl(nextConfig);
