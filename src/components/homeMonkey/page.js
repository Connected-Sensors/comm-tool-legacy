"use client"

import Image from "next/image"
import HomeMonkeyLogo from '@/public/homeMonkeyLogo.svg'
import DeviceOffline from '@/public/monkeyAlerts/deviceOffline.svg'
import HighUsage from '@/public/monkeyAlerts/highUsage.svg'
import Leak from '@/public/monkeyAlerts/Leak.svg'
import LeakPercentage from '@/public/monkeyAlerts/LeakPercentage.svg'
import { useEffect, useState } from "react"
import Link from "next/link"

const HomeMonkey = ({ monkey }) => {

    let [alerts, setAlerts] = useState({})
    let [commissionStage, setcommissionStage] = useState()

    useEffect(()=>{
        monkey.properties.commission_stage !== undefined && setcommissionStage(monkey.properties.commission_stage)
        if(monkey.properties.commission_stage && monkey.properties.commission_stage.stage && monkey.properties.commission_stage.stage === 'commissioned'){
            fetch(`/api/devices/water-monkey/get-alerts?device=${monkey.label}`)
            .then(res => res.json())
            .then(data => {
                if(data.status === "ok"){
                    setAlerts(data.alerts)
                }else{
                    console.log(`There was an error getting the alerts for ${monkey.name}`)
                }
            })
        }
    }, [])

  return (
    <div className={`w-full h-30 md:max-h30 flex flex-row items-center justify-between border-b-[0.5px] border-grey flex-wrap lg:p-1 ${commissionStage && (commissionStage.stage === 'none' || commissionStage.stage === 'first reading' || commissionStage.stage === 'second reading') ? 'order-0' : 'order-1'}`}>
        <div className="flex flex-row justify-center cursor-pointer md:justify-start items-center w-full md:w-1/2">
            <Image 
                src={HomeMonkeyLogo}
                alt="Home Monkey Logo"
                className="md:mr-4 hidden md:flex md:scale-100"
            />
            <Link 
                href={commissionStage && (commissionStage.stage === 'none' || commissionStage.stage === 'first reading' || commissionStage.stage === 'second reading') ? `/comm-tool/step-3/${monkey.label}` : (commissionStage && (commissionStage.stage === 'commissioned' || commissionStage.stage === 'recalibration_failed' || commissionStage.stage === 'recalibrate')) ? `/dashboard/${monkey.id}` : `/comm-tool/step-2/${monkey.label}`}
            >
                <p className="home-text home-text-hover">{monkey.properties && monkey.properties.address ? monkey.properties.address : `${"Water Monkey ID: " + monkey.id}`}</p>
            </Link>
        </div>
        { commissionStage && (commissionStage.stage === 'none' || commissionStage.stage === 'first reading' || commissionStage.stage === 'second reading'|| commissionStage.stage === 'recalibrate' || commissionStage.stage === 'recalibration_failed') 
            ?
            <div className="w-full md:w-1/2 flex h-14 flex-row items-center justify-end">
                <p className="text-center md:text-end w-full text-blue-hard text-sm md:font-semibold lg:text-base mt-4 md:mt-0">{commissionStage.stage === 'none' ? "Commissioning Stage: Pending First Reading" : commissionStage.stage === 'first reading' ? "Commissioning Stage: Pending Second Reading" : commissionStage.stage === 'second reading' ? "Commissioning Stage: Pending Final Confirmation" : commissionStage.stage === 'recalibrate' ? "Pending Recommission Confirmation" : commissionStage.stage === 'recalibration_failed' && "Recalibration Failed"}</p>
            </div>
            :
            (!commissionStage) ?
            <div className="w-full md:w-1/2 flex h-14 flex-row items-center justify-center">
                <p className="text-center md:text-end w-full text-blue-hard text-sm md:font-semibold lg:text-base mt-4 md:mt-0">Commissioning Stage: Pending Water Monkey Details</p>
            </div>
            :
            alerts ?
                <div className="w-full md:w-1/2 flex h-14 flex-row items-center justify-end">
                    <div className="w-1/4 lg:w-32 flex items-center justify-center hover:scale-125 duration-500">
                        <Image 
                            src={DeviceOffline}
                            alt="Device Offline Indicator"
                            className={`scale-75 lg:scale-100 ${alerts && alerts.device_offline_alert && alerts.device_offline_alert === 1 && 'bg-yellow rounded-md'}`}
                        />
                        <div className="hover:opacity-100 duration-500 opacity-0 absolute text-center font-semibold z-10 w-[55px] h-[55px] flex flex-col justify-end items-bottom">
                            <p className="text-xs leading-3 text-dark-grey font-outline-2">Device Offline</p>
                        </div>
                    </div>
                    <div className="w-1/4 lg:w-32 flex items-center justify-center hover:scale-125 duration-500">
                        <Image 
                            src={HighUsage}
                            alt="High usage Indicator"
                            className={`scale-75 lg:scale-100 ${alerts && alerts.high_usage_alert && alerts.high_usage_alert === 1 && 'bg-yellow rounded-md'}`}
                        />
                        <div className="hover:opacity-100 duration-500 opacity-0 absolute text-center font-semibold z-10 w-[55px] h-[55px] flex flex-col justify-end items-bottom">
                            <p className="text-xs leading-3 text-dark-grey font-outline-2">High Usage</p>
                        </div>
                    </div>
                    <div className="w-1/4 lg:w-32 flex items-center justify-center hover:scale-125 duration-500">
                        <Image 
                            src={Leak}
                            alt="Leak Indicator"
                            className={`scale-75 lg:scale-100 ${alerts && alerts.leak_alert && alerts.leak_alert === 1 && 'bg-yellow rounded-md'}`}
                        />
                        <div className="hover:opacity-100 duration-500 opacity-0 absolute text-center font-semibold z-10 w-[55px] h-[55px] flex flex-col justify-end items-bottom">
                            <p className="text-xs leading-3 text-dark-grey font-outline-2">Leak</p>
                        </div>
                    </div>
                    <div className="w-1/4 lg:w-32 flex flex-col items-center justify-center hover:scale-125 duration-500">
                        <Image 
                            src={LeakPercentage}
                            alt="Leak Percentage Indicator"
                            className={`scale-75 lg:scale-100 ${alerts && alerts.leak_percentage_alert && alerts.leak_percentage_alert === 1 && 'bg-yellow rounded-md'}`}
                        />
                        <div className="hover:opacity-100 duration-500 opacity-0 absolute text-center font-semibold z-10 w-[55px] h-[50px] flex flex-col justify-end items-bottom">
                            <p className="text-xs leading-3 text-dark-grey font-outline-2">Leak %</p>
                        </div>
                    </div>
                </div>
                :
                <div className="w-full md:w-1/2 flex h-14 flex-row items-center justify-center">
                    <p className="text-center md:text-end w-full text-blue-hard text-sm md:font-semibold lg:text-base mt-4 md:mt-0">Waiting for Water Monkey Alert Status...</p>
                </div>
        }
    </div>
  )
}

export default HomeMonkey