from flask import Flask, request, jsonify
import finnhub
from datetime import datetime
from dateutil.relativedelta import relativedelta
import requests

application = Flask(__name__, static_url_path='', static_folder='static')
finnhub_client = finnhub.Client(api_key="cmvhfv9r01qh7o93kvdgcmvhfv9r01qh7o93kve0")
polygon_api_key="iZcIeZf90n3Y7C2akptbuIjPMp4fAfDV"


@application.route('/')
def index():
    return application.send_static_file('index.html')

@application.route('/search')
def search():
    symbol = request.args.get('symbol')
    if symbol:
        company_data=finnhub_client.company_profile2(symbol=symbol)
        print("company",company_data)
        if not company_data:
            print("no company data")
            return jsonify({"error": "No symbol found"})
        quote_data = finnhub_client.quote(symbol)
        recommdation_data=finnhub_client.recommendation_trends(symbol)
        end_date = datetime.now()
        start_date = end_date - relativedelta(days=30)
        start_date_str = start_date.strftime("%Y-%m-%d")
        end_date_str = end_date.strftime("%Y-%m-%d")
        news = finnhub_client.company_news(symbol, _from=start_date_str, to=end_date_str)

        end_date = datetime.now()
        start_date = end_date - relativedelta(days=30)
        six_months_ago = end_date - relativedelta(months=6, days=1)

        finnhub_start_date_str = start_date.strftime("%Y-%m-%d")
        finnhub_end_date_str = end_date.strftime("%Y-%m-%d")

        news = finnhub_client.company_news(symbol, _from=finnhub_start_date_str, to=finnhub_end_date_str)

        polygon_start_date_str = six_months_ago.strftime("%Y-%m-%d")
        polygon_end_date_str = end_date.strftime("%Y-%m-%d")

        polygon_url = f"https://api.polygon.io/v2/aggs/ticker/{symbol.upper()}/range/1/day/{polygon_start_date_str}/{polygon_end_date_str}?adjusted=true&sort=asc&apiKey={polygon_api_key}"

        polygon_response = requests.get(polygon_url).json()
        return jsonify(company_data,quote_data,recommdation_data,news,polygon_response)
    return jsonify({"error": "No symbol provided"})

if __name__ == '__main__':
    application.run(debug=True)
  