"use client"

import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Loader from '../components/loader/page'
import Portfolio from './(application)/home/home'
import { useContext } from 'react'
import { userContext } from '../context/userContext'

export default function Header() {

  const router = useRouter()
  useEffect(()=>{
    setTimeout(()=>{
      router.push("/home")
    },100)
  }, [])
  
const { loader } = useContext(userContext)

  return (
    <>
      <Head>
        <title>Connected Sensors | Water Monkey | Commissioning Tool</title>
        <meta name="Connected Sensors | Water Monkey | Commissioning Tool" content="Connected Sensors | Water Monkey | Commissioning Tool"/>
        <link rel="icon" href="/public/favicon.ico"/>
      </Head>
      <div className="w-full h-fit">
        { loader ? 
            <Loader />
            :
            <Portfolio />
        }

    </div>
    </>
  )
}
