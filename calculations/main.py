from calc import VolatilityHandler
from db import DB
#from loguru import logger

def execute():
    v = VolatilityHandler()
    database = DB()
    grouped = database.retrieve_options_data()
    date_to_implied_vol_for_exchange = {}
    for datetime_idx, group in grouped:
        implied_vol = v.calculate_volatility(group)
        date_to_implied_vol_for_exchange[datetime_idx] = implied_vol

    database.store_implied_vol(date_to_implied_vol_for_exchange)
#    logger.info('closing connection')
    database.engine.dispose()
#    logger.info('done')