import Head from 'next/head'

const name = 'QRCode.Quest'
const url = 'https://qrcode.quest'

const Meta: React.FC<{
  title: string
  description?: string
  image?: string
}> = ({
  title: pageTitle,
  description = `Create automated scavenger hunts using QR codes, and easily track your players' progress`,
  image = url + '/img/og/basic.png',
  children,
}) => {
  const title = pageTitle ? `${pageTitle} 📱 ${name} 🔍` : name

  return (
    <Head>
      <meta key="og_locale" property="og:locale" content="en_US" />
      <meta key="og_type" property="og:type" content="website" />
      <meta key="og_site" property="og:site_name" content={name} />
      <title key="title">{title}</title>
      <meta key="og_title" property="og:title" content={title} />
      <meta key="tw_title" name="twitter:title" content={title} />
      {description && (
        <>
          <meta key="desc" name="description" content={description} />
          <meta key="og_desc" property="og:description" content={description} />
          <meta
            key="tw_desc"
            name="twitter:description"
            content={description}
          />
        </>
      )}
      {image && (
        <>
          <meta key="og_img" property="og:image" content={image} />
          <meta
            key="tw_card"
            name="twitter:card"
            content="summary_large_image"
          />
          <meta key="tw_img" name="twitter:image" content={image} />
        </>
      )}
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/favicon/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon/favicon-16x16.png"
      />
      <link rel="manifest" href="/favicon/site.webmanifest" />
      <link
        rel="mask-icon"
        href="/favicon/safari-pinned-tab.svg"
        color="#b02ff1"
      />
      <link rel="shortcut icon" href="/favicon/favicon.ico" />
      <meta name="apple-mobile-web-app-title" content="QRCode.Quest" />
      <meta name="application-name" content="QRCode.Quest" />
      <meta name="msapplication-TileColor" content="#9f00a7" />
      <meta name="msapplication-config" content="/favicon/browserconfig.xml" />
      <meta name="theme-color" content="#B02FF1" />

      {children}
    </Head>
  )
}

export default Meta
