import math

class PriceForecaster:
    def __init__(self):
        pass

    def forecast(self, current_price, lower_bound, upper_bound, local_cagr=0.04, macro_rate=0.025):
        total_growth_rate = local_cagr + macro_rate
        
        projections = {}
        for years in [1, 3, 5]:
            multiplier = math.pow(1 + total_growth_rate, years)
            forecast_price = current_price * multiplier
            
            # Bounds expand over time (sqrt of time factor for variance expansion)
            bound_expansion = math.sqrt(years)
            margin = (upper_bound - current_price) * bound_expansion
            
            f_lower = forecast_price - margin
            f_upper = forecast_price + margin
            
            projections[f"{years}Y"] = {
                'predicted_price': round(forecast_price, 2),
                'lower_bound': round(f_lower, 2),
                'upper_bound': round(f_upper, 2)
            }
            
        return projections
