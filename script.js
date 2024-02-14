let orderByV = 'marketCap';
let orderDirectionV = false;
let limitV = 100;
let offsetV = 0;
let activePage = 0;
let lastPage;

async function init() {
  getAllCoins();
  getLastInRank();
}

async function getLastInRank() {
  const url = `https://coinranking1.p.rapidapi.com/coins?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=24h&tiers%5B0%5D=1&orderBy=marketCap&orderDirection=asc&limit=1&offset=0`;

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
    displayPagination(result.data.coins);
  } catch (error) {
    console.error(error);
  }
}

function displayPagination([lastCoin]) {
  // console.log(lastCoin.rank);
  // ilość stron = lastCoin.rank / limitV
  const pagesCount = lastCoin.rank / limitV;
  console.log(lastCoin.rank);

  const mainDivElement = document.getElementById('table-navigation');

  const paginationElements = Array.from({ length: lastCoin.rank % limitV === 0 ? pagesCount : pagesCount + 1 }, (_, index) => index);
  lastPage = paginationElements.length - 1;
  console.log(lastPage);

  mainDivElement.innerHTML = `
        <div class="pagination">
          <div class="pagination-elements">
            <a href="#" id='back'>&laquo;</a>
            ${paginationElements.map((page) => `<a id=p-${page} ${activePage === page ? 'class=active' : ''} href="#" onclick="goPagination(${page})">${page + 1}</a>`).join('')}
            <a href="#" id='next'>&raquo;</a>
          </div>
        </div>
    `;
}

function goPagination(pageCount) {
  offsetV = pageCount * limitV;

  const curActivePag = document.getElementById(`p-${activePage}`);
  curActivePag.classList.remove('active');

  const newActivePag = document.getElementById(`p-${pageCount}`);
  newActivePag.classList.add('active');

  activePage = pageCount;

  const backPag = document.getElementById('back');
  const nextPag = document.getElementById('next');

  if (activePage !== 0) {
    backPag.setAttribute('onclick', `goPagination(${pageCount - 1})`);
  } else {
    backPag.removeAttribute('onclick');
  }
  if (activePage !== lastPage) {
    nextPag.setAttribute('onclick', `goPagination(${pageCount + 1})`);
  } else {
    nextPag.removeAttribute('onclick');
  }

  getAllCoins(orderByV, orderDirectionV, limitV, offsetV);
}

async function getAllCoins(orderBy = 'marketCap', orderDirection = false, limit = 50, offset = 0) {
  const url = `https://coinranking1.p.rapidapi.com/coins?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=24h&tiers%5B0%5D=1&orderBy=${orderBy}&orderDirection=${
    orderDirection ? 'asc' : 'desc'
  }&limit=${limit}&offset=${offset}`;

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
    orderByV = 'marketCap';
    getAllCoins(orderByV, orderDirectionV, limitV, offsetV);
  });
  document.querySelector('.price-button').addEventListener('click', function (e) {
    e.preventDefault();
    orderDirectionV = !orderDirectionV;
    orderByV = 'price';
    getAllCoins(orderByV, orderDirectionV, limitV, offsetV);
  });
  document.querySelector('.change-button').addEventListener('click', function (e) {
    e.preventDefault();
    orderDirectionV = !orderDirectionV;
    orderByV = 'change';
    getAllCoins(orderByV, orderDirectionV, limitV, offsetV);
  });
}

init();
// const timestamp = 1707769816 * 1000;
// console.log(new Date(timestamp));

function displayData(coins) {
  //const coins = result.data.coins;

  // console.log(coins);

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
- [x] pagination -> by using offset and division by the limit of rows in table (for automatic scalable pagination - check the rank number of the last item in table)
*/
