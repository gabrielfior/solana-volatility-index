import sqlalchemy
import os
import pandas as pd
import dotenv
dotenv.load_dotenv()

class DB:
    
    OPTIONS_DATA_TABLENAME = 'prod_serum_option'
    IMPLIED_VOL_TABLENAME = 'implied_volatility'

    def __init__(self) -> None:
        user = os.environ['DB_USERNAME']
        pw = os.environ['DB_PASSWORD']
        host = os.environ['DB_HOST'] 
        db_url = f'postgresql://{user}:{pw}@{host}:5432'
        self.engine = sqlalchemy.create_engine(db_url)
    
    def retrieve_options_data(self):
        df = pd.read_sql_query(f'select * from {self.OPTIONS_DATA_TABLENAME} where live = true', self.engine)
        # We round down to minute to avoid 
        df['datetime_round_min'] = pd.to_datetime(df.current_datetime).dt.round('min')
        grouped = df.groupby('datetime_round_min')
        return list(grouped)
    
    def store_implied_vol(self, date_to_implied_vol_for_exchange):
        records = []
        for datetime_idx,v in date_to_implied_vol_for_exchange.items():
            for exchange,iv in v.items():

                record = dict(current_datetime=datetime_idx, exchange = exchange, implied_volatility=iv, 
                delta=None, gamma=None, theta=None, vega=None, rho=None)
                records.append(record)
    
        # We overwrite the data every time on the destination table. A better approach would be to append only new data. To do in the future.
        # Might be interesting to retrieve delta, gamma, etc from iv calc
        write_df = pd.DataFrame.from_records(records)
        write_df.to_sql(self.IMPLIED_VOL_TABLENAME, self.engine, if_exists='replace', index=True)

        with self.engine.connect() as con:
            con.execute(f'ALTER TABLE {self.IMPLIED_VOL_TABLENAME} ADD PRIMARY KEY ("index");')