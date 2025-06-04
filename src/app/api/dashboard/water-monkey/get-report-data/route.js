import { toTimestamp } from "@/src/functions/toTimestamp"

export async function POST(req){

    const { device, start, end, variables, flow_variables } = await req.json()

    let values = {}

    if(!start || !end || start == "undefined" || end == "undefined" || start == null || end == null){
        return new Response(JSON.stringify({"status": "error", "message": "Please select a start and end date or a Quick Report option"}))
    }else{ 
        if(variables.length < 9){
            return new Response(JSON.stringify({"status": "error", "message": "There was an error requesting the aggregated variables: some variables were not found, only " + variables.length + " out of 9" }))
        }else{
            let count = 0
            for(let i = 0; i <= variables.length; i++){
                try{
                    let response = await fetch(`https://cs.api.ubidots.com/api/v1.6/variables/${variables[i].id}/statistics/sum/${start}/${end}`, {
                        headers: {
                            "X-Auth-Token": process.env.UBIDOTS_AUTHTOKEN
                        }
                    })
                    let data = await response.json()
                    values[variables[i].label] = data.sum
                }catch(e){
                    return new Response(JSON.stringify({"status": "error", "message": "There was an error requesting the aggregated variables: " + e}))
                }finally{
                    count = count + 1
                    if(count === variables.length){
                        let count1 = 0
                        let timestamp_end = toTimestamp(new Date())
                        let timestamp_start =  Number(timestamp_end) - 2592000000
                        for(let i = 0; i <= flow_variables.length; i++){
                            try{
                                let response = await fetch(`https://cs.api.ubidots.com/api/v1.6/variables/${flow_variables[i].id}/statistics/mean/${timestamp_start}/${timestamp_end}`, {
                                    headers: {
                                        "X-Auth-Token": process.env.UBIDOTS_AUTHTOKEN
                                    }
                                })
                                let data = await response.json()
                                values[flow_variables[i].label] = data.mean
                            }catch(e){
                                return new Response(JSON.stringify({"status": "error", "message": "There was an error requesting the average variables: " + e}))
                            }finally{
                                count1 = count1 + 1
                                if(count1 === flow_variables.length){
                                    return new Response(JSON.stringify({"status": "ok", "data": values}))
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

