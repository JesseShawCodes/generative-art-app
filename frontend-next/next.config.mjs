/** @type {import('next').NextConfig} */
const nextConfig = {
  sassOptions: {
    // Bulma 1.0.4 still uses the legacy Sass if() function internally. This is
    // upstream code we cannot change, so silence just that deprecation.
    silenceDeprecations: ["if-function"],
  },
};

export default nextConfig;
