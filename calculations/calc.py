#import loguru
import numpy as np
import pandas as pd
from utils import *

class VolatilityHandler:

    def calculate_volatility(self, df: pd.DataFrame):
        # get list of items, return per exchange
        implied_vol = {}
        for exchange, group in df.groupby('exchange'):
            values = []  # for later mean
            for item in group.to_dict('records'):
                try:
                    implied_vol_for_exchange = get_implied_volatility_from_item(item)
                    values.append(implied_vol_for_exchange)
                except KindException as e:
                    continue
                except Exception as e:
#                    loguru.logger.exception(e)
                    continue
            # take mean
            mean_implied_vol = np.mean(values)
            implied_vol[exchange] = mean_implied_vol

        return implied_vol
