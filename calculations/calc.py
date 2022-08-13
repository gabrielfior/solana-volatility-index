from dataclasses import asdict
from typing import Dict, List
from utils import *
import datetime
import loguru
import numpy as np
import itertools

class VolatilityHandler:
    def calculate_volatility(self, items: List[Dict]):
        # get list of items, return per exchange
        implied_vol = {}
        for exchange, group in itertools.groupby(items,lambda x: x['exchange']):
            values = [] # for later mean
            for item in list(group):
                try:
                    implied_vol_for_exchange = get_implied_volatility_from_item(item)
                    values.append(implied_vol_for_exchange)
                except Exception as e:
                    loguru.logger.exception(e)
                    continue
            # take mean
            mean_implied_vol = np.mean(values)
            implied_vol[exchange] = mean_implied_vol
        
        # Add datetime
        return implied_vol

    def store_implied_vol(self, implied_vol_for_exchange: Dict):
        # ToDo - Store in s3 (datetime | exchange | implied_vol)
        implied_vol_for_exchange['datetime'] = datetime.datetime.now()
        raise Exception('Implement me')