CREATE TABLE prod_serum_option (
    serum_market_address VARCHAR(250),
    exchange VARCHAR(250),
    interest_rate FLOAT,
    live BOOLEAN,
    strike FLOAT,
    expiry_date DATE,
    kind VARCHAR(250),
    mark_price FLOAT,
    delta VARCHAR(100),
    implied_volatility VARCHAR(100),
    vega FLOAT,
    price FLOAT,
    confidence FLOAT,
    price_status FLOAT,
    current_datetime TIMESTAMP NOT NULL
);