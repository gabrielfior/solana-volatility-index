import {schedule} from "node-cron"
import { execute } from "./main"

const t = schedule('*/5 * * * *', () => {
    console.log("run at: " + new Date().toString)
    execute()
})

t.start()