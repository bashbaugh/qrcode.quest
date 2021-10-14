import type { NextPage } from 'next'
import Layout from 'components/Layout'
import Meta from 'components/Meta'

const Home: NextPage = () => {
  return <Layout>
    <Meta title='Home' />
    <span className='text-red-600'>hi</span>
  </Layout>
}

export default Home
