

from calc import VolatilityHandler


if __name__ == "__main__":
    v = VolatilityHandler()
    # example items for reference
    items = [{"serumMarketAddress":"4raD3QLB9jKoUTzK48qfx2UdEaVHmc5xF8ZSaNK8vipk",
"exchange":"SOL","live":True,"strike":32,
"expiryDate":"2022-08-19T08:00:00.000Z","kind":"call",
"markPrice":"11.282046","delta":"0.01","impliedVolatility":"1.040269",
"vega":0.21037926345480487,"price":42.694415,
"confidence":0.010675,"priceStatus":1},
{"serumMarketAddress":"6tFP43fEPZaW4Tf7QCpWDLzay6YgRQZ5Unt4bHqJpXeC","exchange":"BTC",
"live":True,"strike":22000,"expiryDate":"2022-08-19T08:00:00.000Z","kind":"put","markPrice":"562.353902",
"delta":"0.26","impliedVolatility":"1.039208","vega":1048.6306910377161,"price":23846.465,
"confidence":13.84915651,"priceStatus":1}
]
    
    implied_vol = v.calculate_volatility(items)
    print(implied_vol)