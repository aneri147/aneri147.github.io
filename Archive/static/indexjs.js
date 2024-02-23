

function handleStockSearchFormSubmit() {
    const form = document.getElementById('stockSearchForm');

    
    const closeIcon = document.getElementById('Close-Icon');
    if (closeIcon) {
        closeIcon.addEventListener('click', function() {
            document.getElementById('result-container').innerHTML = ''; 
            document.getElementById('Search-Name').value = ''; 
        });
    }

    

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const stockSymbol = document.getElementById('Search-Name').value.trim();
        if (stockSymbol) {
            searchStock(stockSymbol);
        } else {
            console.log('Please enter a stock ticker symbol.');
        }
    });
}


function searchStock(stockSymbol) {
    console.log('Searching for stock:', stockSymbol);
    fetch(`/search?symbol=${stockSymbol}`)
        .then(response => response.json())
        .then(data => {
            if (data.error=="No symbol found") {
                document.getElementById('result-container').innerHTML = `<div class="error-card">
                <p>Error: No record has been found, Please enter a valid symbol</p>
            </div>`;
            } else {
                
                displayResults(data);
            }
        })
        .catch(error => console.error('Error fetching stock data:', error));
}




function displayResults(data) {
    const tradingDay = new Date(data[1].t * 1000).toLocaleDateString("en-US");
    const changeAmountArrowHtml = data[1].d > 0 ? "./img/GreenArrowUp.png"  : "./img/RedArrowDown.png" ;
    const changePercentArrowHtml = data[1].dp > 0 ? "./img/GreenArrowUp.png"  : "./img/RedArrowDown.png" ;
    let stockPriceData = data[4].results.map(point => [point.t, point.c]);
    let volumeData = data[4].results.map(point => [point.t, point.v]);
    const tabsHtml = generateTabsHtml();
    const companyContentHtml = generateCompanyTabContent(data[0]);
    const stockSummaryContentHtml = generateStockSummaryTabContent(data[0].ticker,data[1],data[2][0],tradingDay,changeAmountArrowHtml,changePercentArrowHtml);
    const latestNewsContentHtml =  
    `<div id="LatestNews" class="tab-content" style="display:none;font-family: sans-serif;">${
        generateLatestNewsTabContent(data)
     }</div>`

    const chartsContentHtml = 
    `<div id="Charts" class="tab-content" style="display:none;">
    <div id="chart-container"></div>
    ${generateChartsTabContent()};
</div>`



    
    
   

    const resultHtml = `
    ${tabsHtml}
    ${chartsContentHtml}
    ${latestNewsContentHtml}
    ${companyContentHtml}
    ${stockSummaryContentHtml}

  
`;
    document.getElementById('result-container').innerHTML = resultHtml;
    openTab(null, 'Company');
    renderHighcharts(data[0].ticker,stockPriceData, volumeData);
}


function generateCompanyTabContent(companyData) {
    return `
        <div id="Company" class="tab-content">
            <img src="${companyData.logo}" alt="${companyData.name} Logo" class="company-logo">
            <table style="margin-left:50px;">
                <tr><td>Company Name</td><td>${companyData.name}</td></tr>
                <tr><td>Stock Ticker Symbol</td><td>${companyData.ticker}</td></tr>
                <tr><td>Stock Exchange Code</td><td>${companyData.exchange}</td></tr>
                <tr><td>Company IPO Date</td><td>${companyData.ipo}</td></tr>
                <tr><td>Category</td><td>${companyData.finnhubIndustry}</td></tr>
            </table>
        </div>
    `;
}

function generateStockSummaryTabContent(ticker, stockData, recommendationTrends, tradingDay, changeAmountArrowHtml, changePercentArrowHtml) {
    return `
        <div id="StockSummary" class="tab-content">
            
            <table style="margin-right:10px;">
                <tr><td>Stock Ticker Symbol</td><td>${ticker}</td></tr>
                <tr><td>Trading Day</td><td>${tradingDay}</td></tr>
                <tr><td>Previous Closing Price</td><td>${stockData.pc}</td></tr>
                <tr><td>Opening Price</td><td>${stockData.o}</td></tr>
                <tr><td>High Price</td><td>${stockData.h}</td></tr>
                <tr><td>Low Price</td><td>${stockData.l}</td></tr>
                <tr><td>Change</td><td>${stockData.d}<img src="${changeAmountArrowHtml}"  style="width:15px; height:15px; margin-left:5px;" ></td></tr>
                <tr><td>Change Percent</td><td>${stockData.dp}<img src="${changePercentArrowHtml}"  style="width:15px; height:15px; margin-left:5px;"></td></tr>
                </table>
                <div class="recommendation-trends">
                <span class="strongSell">Strong<br/>Sell</span>
                <span class="recommendation strong-sell">${recommendationTrends.strongSell}</span>
                <span class="recommendation sell">${recommendationTrends.sell}</span>
                <span class="recommendation hold">${recommendationTrends.hold}</span>
                <span class="recommendation buy">${recommendationTrends.buy}</span>
                <span class="recommendation strong-buy">${recommendationTrends.strongBuy}</span>
                <span class="strongBuy">Strong<br/>Buy</span>
                </div>
                <div id="RecommendationTrends">Recommendation Trends</div>
                </div>
                `;
                }



function generateChartsTabContent() {
    return `
    <div id="chart-container"></div>
    `;
}

function generateLatestNewsTabContent(data) {
    const validNewsItems = data[3].filter(item => item.image && item.url && item.headline && item.datetime).slice(0, 5);
    
    const newsItemsHtml = validNewsItems.map(newsItem => {
        const newsDate = new Date(newsItem.datetime * 1000).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
        return `<div class="news-card">
                    <img class="news-image" src="${newsItem.image}" alt="News">
                    <div class="news-content">
                        <div class="news-headline">${newsItem.headline}</div>
                        <div class="news-date">${newsDate}</div>
                        <a href="${newsItem.url}" target="_blank" class="news-link">See Original Post</a>
                    </div>
                </div>`;
    }).join('');

    return newsItemsHtml;
}




function generateTabsHtml() {
    return `
        <div class="tabs">
            <button class="tab-button" onclick="openTab(event, 'Company')">Company</button>
            <button class="tab-button" onclick="openTab(event, 'StockSummary')">Stock Summary</button>
            <button class="tab-button" onclick="openTab(event, 'Charts')">Charts</button>
            <button class="tab-button" onclick="openTab(event, 'LatestNews')">Latest News</button>
        </div>
    `;
}


function openTab(evt, tabName) {
    var i, tabcontent, tabbuttons;

    tabcontent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tabbuttons = document.getElementsByClassName("tab-button");
    for (i = 0; i < tabbuttons.length; i++) {
        tabbuttons[i].classList.remove("active");
    }

    document.getElementById(tabName).style.display = "grid";
    document.getElementById(tabName).style.justifyContent = "center";
    if (evt && evt.currentTarget) {
        evt.currentTarget.className += " active";
    }
}

function renderHighcharts(ticker,stockPriceData, volumeData) {

    console.log("High charts")
    console.log("Stock",stockPriceData);
    console.log("VolumeData",volumeData);
    Highcharts.stockChart('chart-container', {
        chart: {
            zoomType: 'x'
        },
        title: {
            text: `Stock Price ${ticker} ${new Date().toISOString().split('T')[0]}`
        },
        subtitle: {
            text: 'Source: <a href="https://polygon.io/" target="_blank">Polygon.io</a>',
            useHTML: true
        },
        xAxis: {
            type: 'datetime',
            labels: {
                format: '{value:%e %b}'
            }
        },
        yAxis: [{
            title: {
                text: 'Stock Price'
            },
            opposite: false,
            height: '100%',
            
            tickAmount:6
        }, {
            title: {
                text: 'Volume'
            },
            opposite: true, 
            height: '100%',
            offset: 0,
            
            tickAmount:6,
            min: 0,
            max: Math.max(...volumeData.map(point => point[1])) * 2,
        }],
        series: [{
            type: 'area',
            name: 'Stock Price',
            data: stockPriceData,
            yAxis: 0,
            tooltip: {
                valueDecimals: 2
            },
            fillColor: {
                linearGradient: {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops: [
                    [0, Highcharts.getOptions().colors[0]],
                    [1, Highcharts.color(Highcharts.getOptions().colors[0]).
                    setOpacity(0).get('rgba')]
                ]
                },
            threshold: null 
            }, {
            type: 'column',
            name: 'Volume',
            data: volumeData,
            yAxis: 1,
            color: 'black',
            
            }],
        rangeSelector: {
            buttons: [{
                type: 'day',
                count: 7,
                text: '7d'
                }, {
                type: 'day',
                count: 15,
                text: '15d'
                }, {
                type: 'month',
                count: 1,
                text: '1m'
                }, {
                type: 'month',
                count: 3,
                text: '3m'
                }, {
                type: 'month',
                count: 6,
                text: '6m'
            }],
            inputEnabled: false, 
            selected: 4 
        },
        navigator: {
            enabled: true
        },
        plotOptions:{
            column: {
            pointWidth:4,
            },
            series:{
                pointRange: 1,
                },

        }

        });
            }



document.addEventListener('DOMContentLoaded', handleStockSearchFormSubmit);



