"use client"

import TimeRangeSelector from "@/src/components/Dashboard/TimeRangeSelector/page"
import { useContext, useEffect, useState } from 'react'
import { wmDashbaordContext } from '@/src/context/wmDashboardContext'
import Loader from "@/src/components/loader/page"
import AddressHeader from "@/src/components/Dashboard/AddressHeader/page"
import ActionsTab from "@/src/components/Dashboard/ActionsTab/page"
import MainChart from "@/src/components/Dashboard/MainChart/page"
import LowerChartContainer from "@/src/components/Dashboard/LowerChartContainer/page"
import Message from "@/src/components/Message/page"
import CSVModal from "@/src/components/CSVModal/page"
import Calendar from '@/public/calendar.svg'
import Image from "next/image"
import RecalibrateModal from "@/src/components/Dashboard/RecalibrateModal/page"
import RecalculateModal from "@/src/components/Dashboard/RecalculateModal/page"
import RecommissionModal from "@/src/components/Dashboard/RecommissionModal/page"
import { userContext } from "@/src/context/userContext"

const Dashboard = ({ params }) => {

    const { timeRangeStart, timeRangeEnd, runReport, setRunReport, loader, setLoader, setTimeRangeStart, setTimeRangeEnd, error, setError, setMetric, metric, exportDashbaord } = useContext(wmDashbaordContext)
    const { userSession, user } = useContext(userContext)
    const [lastValues, setLastValues] = useState(userContext)
    const [device, setDevice] = useState()
    const [mainChartValues, setMainChartValues] = useState()
    const [reportStart, setReportStart] = useState()
    const [reportEnd, setReportEnd] = useState()
    const [message, setMessage] = useState()
    const [cubic, setCubic] = useState(false)
    const [deviceOfflineAlert, setDeviceOfflineAlert] = useState()
    const [highUsageAlert, setHighUsageAlert] = useState()
    const [leakAlert, setLeakAlert] = useState()
    const [leakPercentageAlert, setLeakPercentageAlert] = useState()
    const [csvModal, setCsvModal] = useState(false)
    const [recommissionModal, setRecommissionModal] = useState(false)
    const [recalculate, setRecalculate] = useState(false)
    const [recalibrateModal, setRecalibrateModal] = useState(false)
    const [errorMessage, setErrorMessage] = useState()

    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

    useEffect(()=>{
      setLoader(true)
      let label
      setError()
      setMainChartValues()
      fetch(`/api/dashboard/water-monkey/get-device?id=${params.id}`)
      .then(resp => resp.json())
      .then(data => {
        if(data.status === "ok"){
          let commStage = JSON.parse(data.device.properties.commission_stage)
          if(commStage.stage === 'recalibrate'){
            setMessage('Remember that your device recalibration process is pending revision.')
          }else if(commStage.stage === 'recalibration_failed'){
            setErrorMessage(`Your recalibration process has failed: ${commStage.message}`)
          }
          setDevice(data.device)
          label = data.device.label
          fetch(`/api/dashboard/water-monkey/get-last-values?device=${params.id}`)
          .then(resp => resp.json())
          .then(data => {
            if(data.status === 'ok'){
              setMetric((device && device.properties && device.properties.volume_measurement_unit && device.properties.volume_measurement_unit === 1) ? "gallons" : (device && device.properties && device.properties.volume_measurement_unit && device.properties.volume_measurement_unit === 0) ? "liters" : "liters" )
              setDeviceOfflineAlert((data.data.device_offline_alert && data.data.device_offline_alert.value) ? data.data.device_offline_alert.value : undefined)
              setHighUsageAlert((data.data.high_usage_alert && data.data.high_usage_alert.value) ? data.data.high_usage_alert.value : undefined)
              setLeakAlert((data.data.leak_alert && data.data.leak_alert.value) ? data.data.leak_alert.value : undefined)
              setLeakPercentageAlert((data.data.leak_percentage_alert && data.data.leak_percentage_alert.value) ? data.data.leak_alert.value : undefined)
              setLastValues(data.data)
              if(timeRangeStart && timeRangeEnd){
                setReportStart({timestamp: timeRangeStart, timezone: timezone})
                setReportEnd({timestamp: timeRangeEnd, timezone: timezone})
                fetch(`/api/dashboard/water-monkey/get-report-data`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    "device": params.id,
                    "start": timeRangeStart,
                    "end": timeRangeEnd,
                    "variables": device.variables,
                    "flow_variables": device.flow_variables,
                  })

                })
                .then(res => res.json())
                .then(data => {
                  if(data.status === "ok"){
                    setMainChartValues(data.data)
                  }else if(data.status === "error"){
                    setError(data.message)
                  }
                })
                .finally(()=> {
                  setTimeRangeStart()
                  setTimeRangeEnd()
                  setLoader(false)
                })
              }else{
                setTimeRangeStart()
                setTimeRangeEnd()
                setLoader(false)
              }
            }else if(data.status === 'error'){
              setError(data.message)
              setLoader(false)
            }
          })
        }else if(data.status === "error"){
          setError(data.message)
          setLoader(false)
        }
      })
      
    }, [runReport])

    const setNewMetric = (newMetric, id) => {
      setTimeRangeStart(reportStart && reportStart.timestamp ? reportStart.timestamp : '')
      setTimeRangeEnd(reportEnd && reportEnd.timestamp ? reportEnd.timestamp : '')
      setLoader(true)
      fetch(`/api/dashboard/water-monkey/actions/set_metric`, {
        method: 'POST',
        body: JSON.stringify({
          metric: newMetric,
          device: id
        })
      })
      .then(res => res.json())
      .then(data => {
        if(data.status === "ok"){
          setMessage(`Metric successfully changed to ${newMetric === 0 ? "liters" : "gallons"}`)
          setRunReport(!runReport)
        }else{
          setLoader(false)
          setMessage(data.message)
        }
      })
    }

    const handleCubic = () => {
      setCubic(!cubic)
    }

    const handleDeviceOfflineAlert = (device, prev_status) => {
      fetch('/api/dashboard/water-monkey/actions/alerts/device_offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device: device,
          prev_status: deviceOfflineAlert
        })
      })
      .then(res => res.json())
      .then(data => {
        if(data.status === "ok"){
          setDeviceOfflineAlert(data.data.value)
          setMessage("The Device Offline alert status has been successfuly changed.")
        }else if(data.status === "error"){
          setMessage(data.message)
        }
      })
    }

    const handleHighUsageAlert = (device, prev_status) => {
      fetch('/api/dashboard/water-monkey/actions/alerts/high_usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device: device,
          prev_status: highUsageAlert
        })
      })
      .then(res => res.json())
      .then(data => {
        if(data.status === "ok"){
          setHighUsageAlert(data.data.value)
          setMessage("The High Usage alert status has been successfuly changed.")
        }else if(data.status === "error"){
          setMessage(data.message)
        }
      })
    }

    const handleLeakAlert = (device, prev_status) => {
      fetch('/api/dashboard/water-monkey/actions/alerts/leak', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device: device,
          prev_status: leakAlert
        })
      })
      .then(res => res.json())
      .then(data => {
        if(data.status === "ok"){
          setLeakAlert(data.data.value)
          setMessage("The Leak alert status has been successfuly changed.")
        }else if(data.status === "error"){
          setMessage(data.message)
        }
      })
    }

    const handleLeakPercentageAlert = (device, prev_status) => {
      fetch('/api/dashboard/water-monkey/actions/alerts/leak_percentage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device: device,
          prev_status: leakPercentageAlert
        })
      })
      .then(res => res.json())
      .then(data => {
        if(data.status === "ok"){
          setLeakPercentageAlert(data.data.value)
          setMessage("The Leak Percentage alert status has been successfuly changed.")
        }else if(data.status === "error"){
          setMessage(data.message)
        }
      })
    }

  return (
    <>
      {
        loader &&
        <Loader />
      }
      {
        recalculate && device &&
        <RecalculateModal 
          setRecalculate={setRecalculate}
          setRecommissionModal={setRecommissionModal}
          setMessage={setMessage}
          setRecalibrateModal={setRecalibrateModal}
          org={device.organization}
          label={device.label}
          timezone={timezone}
          email={userSession.user.email}
        />
      }
      {
        recommissionModal && device &&
        <RecommissionModal 
          setRecommissionModal={setRecommissionModal}
          meterType={lastValues.meter_type.value}
          commStage={JSON.parse(device.properties.commission_stage)}
          volumePerPulse={device.properties.meter_type === "Compound" ? {
              "primary": device.properties.primary_pulse_volume,
              "secondary": device.properties.secondary_pulse_volume
            } : {
              "primary": device.properties.primary_pulse_volume
          }}
          label={device.label}
          id={params.id}
          timezone={timezone}
          email={userSession.user.email}
          setLoader={setLoader}
          setMessage={setMessage}
          user={user}
          org={device.organization}
          propertyType={device.properties.property_type}
        />
      }
      {
        recalibrateModal && device &&
        <RecalibrateModal 
          setRecalibrateModal={setRecalibrateModal} 
          setMessage={setMessage}
          label={device.label}
          timezone={timezone}
          meterType={lastValues.meter_type.value}
          commStage={JSON.parse(device.properties.commission_stage)}
          user={user}
          org={device.organization}
          email={userSession.user.email}
          setLoader={setLoader}
        />
      }
      {
        csvModal && device &&
        <CSVModal 
          device={device.label} 
          setCsvModal={setCsvModal} 
          setLoader={setLoader}
          setMessage={setMessage}
        />
      }
      <div className='container-dashboard bg-grey-light z-0'>
        {
          errorMessage && !loader &&
          <Message 
            message={errorMessage} 
            setMessage={setErrorMessage} 
            time={100000} 
            type={"error"} 
          />
        }
        { 
          message && !loader &&
          <Message 
            message={message} 
            setMessage={setMessage}
          />
        }
        <TimeRangeSelector setMessage={setMessage}/>
        {
          device && lastValues &&
          <>
            <ActionsTab 
              alerts={[{name: "Device Offline", value: deviceOfflineAlert, setter: handleDeviceOfflineAlert, label: device.label}, {name: "High Usage", value: highUsageAlert, setter: handleHighUsageAlert, label: device.label}, {name: "Leak", value: leakAlert, setter: handleLeakAlert, label: device.label}, {name: "Leak %", value: leakPercentageAlert, setter: handleLeakPercentageAlert, label: device.label}]}
              unit={{value1: "Liters", value2: "Gallons", value: metric === 'liters' ? 0 : 1 , setter: setNewMetric}}
              unitOrCubic={{liters: {value: cubic, value1: "L/G", value2: "m3/ft3", setter: handleCubic}, cubic: {value: 0, value1: "g", value2: "ft3", setter: handleCubic}}}
              device={device.label}
              consumption={mainChartValues && {liters: mainChartValues.water_consumption_per_update, gallons: mainChartValues.water_consumption_per_update}}
              days={reportEnd && reportStart && (Number(reportEnd.timestamp) - Number(reportStart.timestamp))/86400000}
              metric={metric}
              setCsvModal={setCsvModal}
              setRecalibrateModal={setRecalculate}
              exportDashbaord={exportDashbaord}
            />
            <div className="dashboard_to_print w-full">
              <AddressHeader 
                address={device.properties.address} 
              />
              {
                mainChartValues &&
                <div className="flex flex-col w-full h-full">
                  <MainChart 
                    mainChartValues={mainChartValues} 
                    lastValues={lastValues} 
                    reportStart={reportStart} 
                    reportEnd={reportEnd} 
                    meterType={lastValues.meter_type.value}
                    metric={metric}
                    cubic={cubic}
                  />
                    <LowerChartContainer
                      label={device.label}
                      reportStart={reportStart} 
                      reportEnd={reportEnd} 
                      meterType={lastValues.meter_type.value}
                      metric={metric}
                    />
                </div>
              }
            </div>
          </>
        }
        {
          error &&
          <p className="error-message">{error}</p>
        }
        {
          !timeRangeStart && !timeRangeEnd && !loader && !mainChartValues &&
          <div className="mt-[2rem] flex flex-col items-center justify-center w-[100%] h-[100%] grow">
            <Image 
              src={Calendar}
              alt="calednar icon"
              className="scale-[0.7]"
            />
            <p className="text-[1.2rem] md:text-[1.7rem] font-semibold text-grey text-center">Select a quick report or a start and end date above</p>
          </div>
        }
      </div>
    </>
    
  )
}

export default Dashboard