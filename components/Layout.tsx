import clsx from 'clsx'
import React from 'react'

const Layout: React.FC<{}> = ({ children }) => {
  return (
    <div className="w-full">
      <nav></nav>

      <div className="max-w-6xl mx-auto p-8 md:p-32">
        <main>{children}</main>
      </div>

      <footer></footer>
    </div>
  )
}

export default Layout
