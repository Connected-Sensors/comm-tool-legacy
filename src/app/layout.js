import './globals.css'
import { Fira_Sans } from 'next/font/google'
import { UserProvider } from '../context/userContext'
import { WMDashboardContextProvider } from '../context/wmDashboardContext'

const firasans = Fira_Sans({ 
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  style: 'normal',
  subsets: ['latin-ext'],
  variable: "--font-firasans",
  display: "swap"
})

export const metadata = {
  title: 'Connected Sensors | Water Monkey | Commissioning Tool',
  description: 'Connected Sensors | Water Monkey | Commissioning Tool',
  icons: {
    icon: '/public/cs.png',
  },
}


export default async function RootLayout({ children  }) {

  return (
    <html lang="en">
      <UserProvider>
        <WMDashboardContextProvider>
          <body className={`${firasans.variable} font-sans`}>
              {children}
          </body>
        </WMDashboardContextProvider>
      </UserProvider>
    </html>
  )
}
