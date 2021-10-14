import clsx from 'clsx'
import React from 'react'

const Layout: React.FC<{}> = ({ children }) => {
  return (
    <div className="w-full">
      <nav></nav>

      <div>
        <main>{children}</main>
      </div>

      <footer></footer>
    </div>
  )
}

export default Layout
