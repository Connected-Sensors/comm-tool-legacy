"use client"

import React from 'react'
import { useContext } from 'react'
import { wmDashbaordContext } from '@/src/context/wmDashboardContext'
import { toTimestamp } from '@/src/functions/toTimestamp'

const TimeRangeSelector = ({ setMessage }) => {

    const { setTimeRangeStart, setTimeRangeEnd, runReport, setRunReport, setQuickReport, setLoader } = useContext(wmDashbaordContext)
    let now = new Date()

  return (
    <div className='bg-blue w-full flex flex-row justify-center lg:justify-end items-center p-2 rounded sticky top-14 z-20'>
        <div className='flex lg:flex-row flex-col'>
            <div className='flex flex-row items-center md:ml-2 flex-wrap '>
                <div className='flex flex-row items-center w-[100%] md:w-full justify-between md:justify-around'>
                    <p className='text-white mr-[1rem] text-[0.85rem] hidden font-semibold md:flex'>Quick Report:</p>
                    <button 
                        className='wm-button-quick-report'
                        onClick={()=> {
                            setTimeRangeStart(toTimestamp(now.getMonth()+1 + "/" + now.getDate() + "/" +  now.getFullYear() + " 00:00:00"))
                            setTimeRangeEnd(toTimestamp(now))
                            setQuickReport('day')
                            setLoader(true)
                            setRunReport(!runReport)
                        }}
                    >
                        Today
                    </button>
                    <button 
                        className='wm-button-quick-report'
                        onClick={()=> {
                            let startDay = new Date(toTimestamp(now) - (now.getDay()-1)*86400000)
                            setTimeRangeStart(toTimestamp(startDay.getMonth()+1 + "/" + startDay.getDate() + "/" + startDay.getFullYear() + " 00:00:00"))
                            setTimeRangeEnd(toTimestamp(now))
                            setQuickReport('week')
                            setLoader(true)
                            setRunReport(!runReport)
                        }}
                    >
                        This Week
                    </button>
                    <button 
                        className='wm-button-quick-report'
                        onClick={()=> {
                            setTimeRangeStart(toTimestamp(now.getMonth()+1 + "/1/" +  now.getFullYear() + " 00:00:00"))
                            setTimeRangeEnd(toTimestamp(now))
                            setQuickReport('month')
                            setLoader(true)
                            setRunReport(!runReport)
                        }}
                    >
                        This Month
                    </button>
                    <button 
                        className='wm-button-quick-report'
                        onClick={()=> {
                            setTimeRangeStart(toTimestamp("1/1/" +  now.getFullYear() + " 00:00:00"))
                            setTimeRangeEnd(toTimestamp(now))
                            setQuickReport('year')
                            setLoader(true)
                            setRunReport(!runReport)
                        }}
                    >
                        This Year
                    </button>
                </div>
        
            </div>
            <div className='flex flex-row items-center justify-around md:justify-between md:ml-2 mt-[0.5rem] lg:mt-0 flex-wrap'>
                <p className='mr-1 text-white text-[0.85rem] hidden font-semibold md:flex'>Start:</p>
                <input 
                    type="datetime-local" 
                    className='rounded cursor-pointer font-normal p-[0.2rem] text-dark-grey text-[0.75rem] md:mr-0 w-[35%] md:w-[30%] time_range_start'
                />
                <p className='mr-1 text-white text-[0.85rem] ml-[0.5rem] hidden font-semibold md:flex'>End:</p>
                <input 
                    type="datetime-local" 
                    className='rounded cursor-pointer font-normal p-[0.2rem] text-dark-grey text-[0.75rem] w-[35%] md:w-[30%] time_range_end'
                />
                <button 
                className='wm-button-quick-report md:ml-[0.5rem] md:mr-0 md:mt-0 ml-[1rem]'
                onClick={()=> {
                    let start = document.querySelector('.time_range_start').value
                    let end = document.querySelector('.time_range_end').value
                    if(!start || !end){
                        setMessage('Please select a start and end date or a quick report')
                    }else{
                        setTimeRangeStart(toTimestamp(start))
                        setTimeRangeEnd(toTimestamp(end))
                        setLoader(true)
                        setRunReport(!runReport)
                        setQuickReport()
                    }
                }}
                >
                    Run Report
                </button>
            </div>
            
        </div>
    </div>
  )
}

export default TimeRangeSelector