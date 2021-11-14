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
      {
        source: '/demoquest/1',
        destination: '/Foou-SerIHB',
        permanent: false
      },
      {
        source: '/demoquest/2',
        destination: '/UeG24znitul',
        permanent: false
      }
    ]
  },
}
