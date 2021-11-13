/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/onboardscan',
        destination: '/?fromscan=1&ref=onboarding-qr',
        permanent: false,
      },
    ]
  },
}
