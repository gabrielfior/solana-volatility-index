# From https://github.com/dedwards25/Python_Option_Pricing/blob/master/GBS.ipynb
import datetime
import math

from loguru import logger
from scipy.stats import norm

_debug = logger.info


def get_implied_volatility_from_item(item):
    #    option_type = "p" or "c"
    #    fs          = price of underlying
    #    x           = strike
    #    t           = time to expiration
    #    v           = implied volatility
    #    r           = risk free rate
    #    q           = dividend payment
    #    b           = cost of carry
    # cp = Call or Put price
    # def euro_implied_vol(option_type, fs, x, t, r, q, cp):
    required_keys = {'exchange', 'expiry_date', 'price', 'strike', 'mark_price', 'kind'}
    if not required_keys < item.keys():
        diff = required_keys.difference(item.keys())
        raise Exception(f'Keys missing from item, see {diff}')
    elif item['kind'] not in ['call', 'put']:
        raise Exception(f"not an option {item['kind']}")
    risk_free_rate = get_interest_free_rate(item['exchange'])
    time_to_expiry = convert_expiration_to_year(item['expiry_date'])
    call_or_put = 'c' if item['kind'] == 'call' else 'p'

    implied_vol = euro_implied_vol(call_or_put, item['price'], item['strike'], time_to_expiry, risk_free_rate, 0.,
                                   float(item['mark_price']))
    return implied_vol


def convert_expiration_to_year(expiry_date):
    # expiry_date = datetime.datetime.strptime(expiry_date,'%Y-%m-%dT%H:%M:%S.%fZ')
    time_diff_sec = (expiry_date.replace(tzinfo=datetime.timezone.utc) - datetime.datetime.now().replace(
        tzinfo=datetime.timezone.utc)).total_seconds()
    return time_diff_sec / (3600 * 24 * 365)


def get_interest_free_rate(symbol):
    """ Values from solend """
    allowed_symbols = ['ETH', 'BTC', 'SOL']
    if symbol not in allowed_symbols:
        raise Exception(f"Symbol {symbol} not in {allowed_symbols}")

    interest_free_rates = {
        'BTC': 0.04 / 100,
        'ETH': 0.85 / 100,
        'SOL': 2.43 / 100  # 2%
    }
    return interest_free_rates.get(symbol)


def euro_implied_vol(option_type, fs, x, t, r, q, cp):
    b = r - q
    return _gbs_implied_vol(option_type, fs, x, t, r, b, cp)


def euro_implied_vol_76(option_type, fs, x, t, r, cp):
    b = 0
    return _gbs_implied_vol(option_type, fs, x, t, r, b, cp)


def _gbs_implied_vol(option_type, fs, x, t, r, b, cp, precision=.00001, max_steps=100):
    return _newton_implied_vol(_gbs, option_type, x, fs, t, b, r, cp, precision, max_steps)


# The primary class for calculating Generalized Black Scholes option prices and deltas
# It is not intended to be part of this module's public interface

# Inputs: option_type = "p" or "c", fs = price of underlying, x = strike, t = time to expiration, r = risk free rate
#         b = cost of carry, v = implied volatility
# Outputs: value, delta, gamma, theta, vega, rho
def _gbs(option_type, fs, x, t, r, b, v):
    _debug("Debugging Information: _gbs()")
    # -----------
    # Test Inputs (throwing an exception on failure)
    _gbs_test_inputs(option_type, fs, x, t, r, b, v)

    # -----------
    # Create preliminary calculations
    t__sqrt = math.sqrt(t)
    d1 = (math.log(fs / x) + (b + (v * v) / 2) * t) / (v * t__sqrt)
    d2 = d1 - v * t__sqrt

    if option_type == "c":
        # it's a call
        _debug("     Call Option")
        value = fs * math.exp((b - r) * t) * norm.cdf(d1) - x * math.exp(-r * t) * norm.cdf(d2)
        delta = math.exp((b - r) * t) * norm.cdf(d1)
        gamma = math.exp((b - r) * t) * norm.pdf(d1) / (fs * v * t__sqrt)
        theta = -(fs * v * math.exp((b - r) * t) * norm.pdf(d1)) / (2 * t__sqrt) - (b - r) * fs * math.exp(
            (b - r) * t) * norm.cdf(d1) - r * x * math.exp(-r * t) * norm.cdf(d2)
        vega = math.exp((b - r) * t) * fs * t__sqrt * norm.pdf(d1)
        rho = x * t * math.exp(-r * t) * norm.cdf(d2)
    else:
        # it's a put
        _debug("     Put Option")
        value = x * math.exp(-r * t) * norm.cdf(-d2) - (fs * math.exp((b - r) * t) * norm.cdf(-d1))
        delta = -math.exp((b - r) * t) * norm.cdf(-d1)
        gamma = math.exp((b - r) * t) * norm.pdf(d1) / (fs * v * t__sqrt)
        theta = -(fs * v * math.exp((b - r) * t) * norm.pdf(d1)) / (2 * t__sqrt) + (b - r) * fs * math.exp(
            (b - r) * t) * norm.cdf(-d1) + r * x * math.exp(-r * t) * norm.cdf(-d2)
        vega = math.exp((b - r) * t) * fs * t__sqrt * norm.pdf(d1)
        rho = -x * t * math.exp(-r * t) * norm.cdf(-d2)

    _debug("     d1= {0}\n     d2 = {1}".format(d1, d2))
    _debug("     delta = {0}\n     gamma = {1}\n     theta = {2}\n     vega = {3}\n     rho={4}".format(delta, gamma,
                                                                                                        theta, vega,
                                                                                                        rho))
    return value, delta, gamma, theta, vega, rho


def _approx_implied_vol(option_type, fs, x, t, r, b, cp):
    _test_option_type(option_type)

    ebrt = math.exp((b - r) * t)
    ert = math.exp(-r * t)

    a = math.sqrt(2 * math.pi) / (fs * ebrt + x * ert)

    if option_type == "c":
        payoff = fs * ebrt - x * ert
    else:
        payoff = x * ert - fs * ebrt

    b = cp - payoff / 2
    c = (payoff ** 2) / math.pi

    v = (a * (b + math.sqrt(b ** 2 + c))) / math.sqrt(t)

    return v


def _newton_implied_vol(val_fn, option_type, x, fs, t, b, r, cp, precision=.00001, max_steps=100):
    # make sure a valid option type was entered
    _test_option_type(option_type)

    # Estimate starting Vol, making sure it is allowable range
    v = _approx_implied_vol(option_type, fs, x, t, r, b, cp)
    v = max(_GBS_Limits.MIN_V, v)
    v = min(_GBS_Limits.MAX_V, v)

    # Calculate the value at the estimated vol
    value, delta, gamma, theta, vega, rho = val_fn(option_type, fs, x, t, r, b, v)
    min_diff = abs(cp - value)

    _debug("-----")
    _debug("Debug info for: _Newton_ImpliedVol()")
    _debug("    Vinitial={0}".format(v))

    # Newton-Raphson Search
    countr = 0
    while precision <= abs(cp - value) <= min_diff and countr < max_steps:

        v = v - (value - cp) / vega
        if (v > _GBS_Limits.MAX_V) or (v < _GBS_Limits.MIN_V):
            _debug("    Volatility out of bounds")
            break

        value, delta, gamma, theta, vega, rho = val_fn(option_type, fs, x, t, r, b, v)
        min_diff = min(abs(cp - value), min_diff)

        # keep track of how many loops
        countr += 1
        _debug("     IVOL STEP {0}. v={1}".format(countr, v))

    # check if function converged and return a value
    if abs(cp - value) < precision:
        # the search function converged
        return v
    else:
        # if the search function didn't converge, try a bisection search
        return _bisection_implied_vol(val_fn, option_type, fs, x, t, r, b, cp, precision, max_steps)


# ----------
# Find the Implied Volatility using a Bisection search
def _bisection_implied_vol(val_fn, option_type, fs, x, t, r, b, cp, precision=.00001, max_steps=100):
    _debug("-----")
    _debug("Debug info for: _bisection_implied_vol()")

    # Estimate Upper and Lower bounds on volatility
    # Assume American Implied vol is within +/- 50% of the GBS Implied Vol
    v_mid = _approx_implied_vol(option_type, fs, x, t, r, b, cp)

    if (v_mid <= _GBS_Limits.MIN_V) or (v_mid >= _GBS_Limits.MAX_V):
        # if the volatility estimate is out of bounds, search entire allowed vol space
        v_low = _GBS_Limits.MIN_V
        v_high = _GBS_Limits.MAX_V
        v_mid = (v_low + v_high) / 2
    else:
        # reduce the size of the vol space
        v_low = max(_GBS_Limits.MIN_V, v_mid * .5)
        v_high = min(_GBS_Limits.MAX_V, v_mid * 1.5)

    # Estimate the high/low bounds on price
    cp_mid = val_fn(option_type, fs, x, t, r, b, v_mid)[0]

    # initialize bisection loop
    current_step = 0
    diff = abs(cp - cp_mid)

    _debug("     American IVOL starting conditions: CP={0} cp_mid={1}".format(cp, cp_mid))
    _debug("     IVOL {0}. V[{1},{2},{3}]".format(current_step, v_low, v_mid, v_high))

    # Keep bisection volatility until correct price is found
    while (diff > precision) and (current_step < max_steps):
        current_step += 1

        # Cut the search area in half
        if cp_mid < cp:
            v_low = v_mid
        else:
            v_high = v_mid

        cp_low = val_fn(option_type, fs, x, t, r, b, v_low)[0]
        cp_high = val_fn(option_type, fs, x, t, r, b, v_high)[0]

        v_mid = v_low + (cp - cp_low) * (v_high - v_low) / (cp_high - cp_low)
        v_mid = max(_GBS_Limits.MIN_V, v_mid)  # enforce high/low bounds
        v_mid = min(_GBS_Limits.MAX_V, v_mid)  # enforce high/low bounds

        cp_mid = val_fn(option_type, fs, x, t, r, b, v_mid)[0]
        diff = abs(cp - cp_mid)

        _debug("     IVOL {0}. V[{1},{2},{3}]".format(current_step, v_low, v_mid, v_high))

    # return output
    if abs(cp - cp_mid) < precision:
        return v_mid
    else:
        raise GBS_CalculationError(
            "Implied Vol did not converge. Best Guess={0}, Price diff={1}, Required Precision={2}".format(v_mid, diff,
                                                                                                          precision))


# This class defines the Exception that gets thrown when there is a calculation error
class GBS_CalculationError(Exception):
    def __init__(self, mismatch):
        Exception.__init__(self, mismatch)


class GBS_InputError(Exception):
    def __init__(self, mismatch):
        Exception.__init__(self, mismatch)


class _GBS_Limits:
    # An GBS model will return an error if an out-of-bound input is input
    MAX32 = 2147483248.0

    MIN_T = 1.0 / 1000.0  # requires some time left before expiration
    MIN_X = 0.01
    MIN_FS = 0.01

    # Volatility smaller than 0.5% causes American Options calculations
    # to fail (Number to large errors).
    # GBS() should be OK with any positive number. Since vols less
    # than 0.5% are expected to be extremely rare, and most likely bad inputs,
    # _gbs() is assigned this limit too
    MIN_V = 0.005

    MAX_T = 100
    MAX_X = MAX32
    MAX_FS = MAX32

    # Asian Option limits
    # maximum TA is time to expiration for the option
    MIN_TA = 0

    # This model will work with higher values for b, r, and V. However, such values are extremely uncommon. 
    # To catch some common errors, interest rates and volatility is capped to 100%
    # This reason for 1 (100%) is mostly to cause the library to throw an exceptions 
    # if a value like 15% is entered as 15 rather than 0.15)
    MIN_b = -1
    MIN_r = -1

    MAX_b = 1
    MAX_r = 1
    MAX_V = 5


def _test_option_type(option_type):
    if (option_type != "c") and (option_type != "p"):
        raise GBS_InputError("Invalid Input option_type ({0}). Acceptable value are: c, p".format(option_type))


def _gbs_test_inputs(option_type, fs, x, t, r, b, v):
    # -----------
    # Test inputs are reasonable
    _test_option_type(option_type)

    if (x < _GBS_Limits.MIN_X) or (x > _GBS_Limits.MAX_X):
        raise GBS_InputError(
            "Invalid Input Strike Price (X). Acceptable range for inputs is {1} to {2}".format(x, _GBS_Limits.MIN_X,
                                                                                               _GBS_Limits.MAX_X))

    if (fs < _GBS_Limits.MIN_FS) or (fs > _GBS_Limits.MAX_FS):
        raise GBS_InputError(
            "Invalid Input Forward/Spot Price (FS). Acceptable range for inputs is {1} to {2}".format(fs,
                                                                                                      _GBS_Limits.MIN_FS,
                                                                                                      _GBS_Limits.MAX_FS))

    if (t < _GBS_Limits.MIN_T) or (t > _GBS_Limits.MAX_T):
        raise GBS_InputError(
            "Invalid Input Time (T = {0}). Acceptable range for inputs is {1} to {2}".format(t, _GBS_Limits.MIN_T,
                                                                                             _GBS_Limits.MAX_T))

    if (b < _GBS_Limits.MIN_b) or (b > _GBS_Limits.MAX_b):
        raise GBS_InputError(
            "Invalid Input Cost of Carry (b = {0}). Acceptable range for inputs is {1} to {2}".format(b,
                                                                                                      _GBS_Limits.MIN_b,
                                                                                                      _GBS_Limits.MAX_b))

    if (r < _GBS_Limits.MIN_r) or (r > _GBS_Limits.MAX_r):
        raise GBS_InputError(
            "Invalid Input Risk Free Rate (r = {0}). Acceptable range for inputs is {1} to {2}".format(r,
                                                                                                       _GBS_Limits.MIN_r,
                                                                                                       _GBS_Limits.MAX_r))

    if (v < _GBS_Limits.MIN_V) or (v > _GBS_Limits.MAX_V):
        raise GBS_InputError(
            "Invalid Input Implied Volatility (V = {0}). \
            Acceptable range for inputs is {1} to {2}".format(v, _GBS_Limits.MIN_V, _GBS_Limits.MAX_V))
