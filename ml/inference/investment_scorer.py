class InvestmentScorer:
    def __init__(self):
        pass

    def calculate_score(self, predicted_price, listing_price, locality_cagr, annual_rent, confidence_score):
        # 1. Valuation Margin (40%)
        margin = (predicted_price - listing_price) / listing_price
        # Cap margin between -0.2 and 0.2 for scoring
        margin_capped = max(-0.2, min(0.2, margin))
        valuation_score = ((margin_capped + 0.2) / 0.4) * 40  # 0 to 40

        # 2. Growth Potential (25%)
        # Assuming CAGR typical range 2% to 12%
        cagr_capped = max(0.0, min(0.12, locality_cagr))
        growth_score = (cagr_capped / 0.12) * 25  # 0 to 25

        # 3. Rental Yield (20%)
        # Typical yield range 2% to 8%
        yield_pct = (annual_rent / listing_price) if listing_price > 0 else 0
        yield_capped = max(0.0, min(0.08, yield_pct))
        rental_score = (yield_capped / 0.08) * 20  # 0 to 20

        # 4. Risk / Confidence (15%)
        risk_score = (confidence_score / 100) * 15  # 0 to 15

        total_score = valuation_score + growth_score + rental_score + risk_score
        
        # Determine rating
        if total_score >= 80:
            rating = "STRONG BUY"
        elif total_score >= 60:
            rating = "BUY"
        elif total_score >= 40:
            rating = "HOLD"
        else:
            rating = "OVERPRICED"

        return {
            'total_score': round(total_score, 2),
            'rating': rating,
            'sub_scores': {
                'valuation_score': round(valuation_score, 2),
                'growth_score': round(growth_score, 2),
                'rental_score': round(rental_score, 2),
                'risk_score': round(risk_score, 2)
            },
            'gross_yield_pct': round(yield_pct * 100, 2)
        }
