import time
#from loguru import logger
from timeloop import Timeloop
from datetime import timedelta
from main import execute

#logger.add("scheduled.log")
tl = Timeloop()

@tl.job(interval=timedelta(minutes=10))
def sample_job_every_10min():
    execute()

tl.start()

while True:
    try:
        time.sleep(1)
    except KeyboardInterrupt:
        tl.stop()
        break