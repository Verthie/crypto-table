let orderDirectionV = false;
let limitV = 50;

async function getAllCoins(orderBy = 'marketCap', orderDirection = false, limit = 50) {
  const url = `https://coinranking1.p.rapidapi.com/coins?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=24h&tiers%5B0%5D=1&orderBy=${orderBy}&orderDirection=${
    orderDirection ? 'asc' : 'desc'
  }&limit=${limit}&offset=0`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '92cafd2032msh75252a91a66893ap1128bdjsn75fcdc8c70ba',
      'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com',
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    displayData(result.data.coins);
  } catch (error) {
    console.error(error);
  }

  document.querySelector('.rank-button').addEventListener('click', function (e) {
    e.preventDefault();
    orderDirectionV = !orderDirectionV;
    getAllCoins('marketCap', orderDirectionV);
  });
  document.querySelector('.price-button').addEventListener('click', function (e) {
    e.preventDefault();
    orderDirectionV = !orderDirectionV;
    getAllCoins('price', orderDirectionV);
  });
  document.querySelector('.change-button').addEventListener('click', function (e) {
    e.preventDefault();
    orderDirectionV = !orderDirectionV;
    getAllCoins('change', orderDirectionV);
  });
}

getAllCoins();
// const timestamp = 1707769816 * 1000;
// console.log(new Date(timestamp));

function displayData(coins) {
  //const coins = result.data.coins;

  console.log(coins);

  const mainDivElement = document.getElementById('main');

  mainDivElement.innerHTML = `
        <table id="coinsTable">
            <thead>
                <th class="rank-button">Rank</th>
                <th>Coin</th>
                <th class="price-button">Price</th>
                <th class="change-button">Change</th>
            </thead>
            <tbody id="coinsData"></tbody>
        </table>
    
    `;

  const coinsDataElement = document.getElementById('coinsData');

  coins.forEach((coin) => {
    coinsDataElement.innerHTML += `
            <tr id="${coin.uuid}">
                <td>${coin.rank}</td>
                  <td class="coinType">
                    <span>
                      <img src="${coin.iconUrl}" alt="icon ${coin.symbol}">
                      ${coin.name} ${coin.symbol}
                    </span>
                    <button onclick="window.open('${coin.coinrankingUrl}', '_blank')">Page</button>
                  </td>
                  <td class="${setColor(coin.change)}">${coin.price}</td>
                <td class="${setColor(coin.change)}">${coin.change}</td>
            </tr>
        `;
  });

  /* Wyświetlenie listy:
    mainDivElement.innerHTML = "<ul>";
    coins.forEach(coin => {
        mainDivElement.innerHTML += `
            <li>${coin.symbol}, ${coin.name} </li>
        `;
    } )
    mainDivElement.innerHTML += "</ul>";
    */
}

function setColor(change) {
  change = parseFloat(change);
  if (change > 0) {
    return 'textGreen';
  } else if (change < 0) {
    return 'textRed';
  } else return '';
}

function changeLimit() {}

/*
//todo
- [x] style improvement
- [x] sorting functionallity by clicking on headers (ascending and descending)
- [] graph creation by using chart.js for generation -> using get 24h coin price and placing timestamps in the x-axis and the price in y-axis
- [!] database - classic SQL
  - [] initial create -> use get coin to get information about a coin and place it in database; a list of coins by using get coins and then connect them with relations
  - [] update -> for updating the current prices, changes and rank (1 button somewhere; maybe on the navbar)
  - [] create -> creating snapshots from 24h coin price for the chosen coin using a button near a graph
  - [] delete -> snapshot delete from database using another html site with snapshots (navbar will allow to get to the snapshots)
  - [] read -> read snapshots from database (navbar will allow to get to the snapshots)
- [] prompt -> allows setting the limit of coins shown in the list when clicked on a button (maybe on the navbar)
- [] alert -> when updating records ("records updated successfully") or just an alert button for triggering alerts or alert for confirmation on database actions
- [?] html5 -> navbar and footnote
- [] pagination -> by using offset and division by the limit of rows in table (for automatic scalable pagination - check the rank number of the last item in table)
*/
