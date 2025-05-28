export async function GET(req){

    let device = req.nextUrl.searchParams.get("device")

    let variables = {}

    try{
        let response = await fetch(`https://cs.ubidots.site/api/v2.0/variables/?label__in=device_offline_bit,leak_state_bit,leak_percentage_alert,high_usage_alert&fields=label,lastValue,device&device__label__in=${device}&page_size=50000`, {
            method: 'GET',
            headers:{
                'Content-Type':'application/json',
                'X-Auth-Token': process.env.UBIDOTS_AUTHTOKEN
            },
        })
        let data = await response.json()
        if(data.results && data.results[0]){ 
            data.results.forEach(variable => {
                if(variable.label && variable.label === "leak_percentage_alert"){
                    variables.leak_percentage_alert = variable.lastValue.value ? variable.lastValue.value : undefined
                }else{
                    variables.leak_percentage_alert = undefined
                }
                if(variable.label && variable.label === "leak_state_bit"){
                    variables.leak_alert = variable.lastValue.value ? variable.lastValue.value : undefined
                }else{
                    variables.leak_alert = undefined
                }
                if(variable.label && variable.label === "high_usage_alert"){
                    variables.high_usage_alert = variable.lastValue.value ? variable.lastValue.value : undefined
                }else{
                    variables.high_usage_alert = undefined
                }
                if(variable.label && variable.label === "device_offline_bit"){
                    variables.device_offline_alert = variable.lastValue.value ? variable.lastValue.value : undefined
                }else{
                    variables.device_offline_alert = undefined
                }
            })
            return new Response(JSON.stringify({"status": "ok", "alerts": variables}))
        }else{
            return new Response(JSON.stringify({"status": "ok", "alerts": {
                device_offline_alert: undefined,
                leak_alert: undefined,
                high_usage_alert: undefined,
                leak_percentage_alert: undefined
            }}))
        }
    } catch(e){
        return new Response(JSON.stringify({"status": "error", "message": "There was an error requesting alerts for the device " + device + ": " + e }))
    }

}

