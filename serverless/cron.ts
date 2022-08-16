import {schedule} from "node-cron"
import { execute } from "./main"

const t = schedule('* * * * *', () => {
    console.log("run at: " + new Date().toString)
    execute()
})

t.start()