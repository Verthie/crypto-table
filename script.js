let orderByV = 'marketCap';
let orderDirectionV = false;
let limitV = 100;
let offsetV = 0;
let activePage = 0;
let lastPage;
let snapshot;

function init() {
  getAllCoins();
  getLastInRank();
}

init();

async function getAllCoins() {
  const url = `https://coinranking1.p.rapidapi.com/coins?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=24h&tiers%5B0%5D=1&orderBy=${orderByV}&orderDirection=${
    orderDirectionV ? 'asc' : 'desc'
  }&limit=${limitV}&offset=${offsetV}`;

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
    const coinsData = result.data.coins;
    localStorage.setItem('coinsData', JSON.stringify(coinsData));
    displayData(coinsData);
  } catch (error) {
    console.error(error);
  }
}

function setColor(change) {
  change = parseFloat(change);
  if (change > 0) {
    return 'textGreen';
  } else if (change < 0) {
    return 'textRed';
  } else return '';
}

async function displayData(coins, snapshot = false) {
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

  document.getElementById('back-button').addEventListener('click', function (e) {
    e.preventDefault();
    document.getElementById('back-button').style.display = 'none';
    document.getElementById('create-button').style.display = '';
    document.getElementById('display-button').style.display = '';
    document.getElementById('limit-button').style.display = '';
    document.getElementById('table-navigation').style.display = '';
    init();
  });

  if (snapshot) {
    document.getElementById('back-button').style.display = '';
    document.getElementById('create-button').style.display = 'none';
    document.getElementById('display-button').style.display = 'none';
    document.getElementById('limit-button').style.display = 'none';

    document.querySelector('.rank-button').removeEventListener('click', (e) => tableSort(e, 'marketCap'));
    document.querySelector('.price-button').removeEventListener('click', (e) => tableSort(e, 'price'));
    document.querySelector('.change-button').removeEventListener('click', (e) => tableSort(e, 'change'));
  } else {
    document.querySelector('.rank-button').addEventListener('click', (e) => tableSort(e, 'marketCap'));
    document.querySelector('.price-button').addEventListener('click', (e) => tableSort(e, 'price'));
    document.querySelector('.change-button').addEventListener('click', (e) => tableSort(e, 'change'));
  }

  const coinsDataElement = document.getElementById('coinsData');

  coins.forEach((coin) => {
    coinsDataElement.innerHTML += `
            <tr id="${coin.uuid}" class="expandable-info">
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
            <tr class="expanded-info" id="graph-${coin.uuid}"></tr>
        `;
  });

  // const table = document.getElementById('coinsTable');
  const tableRows = document.querySelectorAll('.expandable-info');

  tableRows.forEach(function (row) {
    const graph = document.getElementById(`graph-${row.id}`);

    row.addEventListener('click', function () {
      if (!row.classList.contains('clicked')) {
        row.classList.add('clicked');
        graph.innerHTML = `
        <td class="info-graph" colspan="4">
          <canvas id="chart-${row.id}" style="width:100%;max-width:700px;margin:auto"></canvas>
        </td>`;
        graph.style.display = 'table-row';
        getDayData(`${row.id}`);
        // generateChart(`chart-${row.id}`);
      } else {
        row.classList.remove('clicked');
        graph.style.display = 'none';
      }
    });
  });

  /* 
  table.addEventListener('mouseleave', function () {
    tableRows.forEach(function (row) {
      const rowId = row.id;
      document.getElementById(`graph-${rowId}`).style.display = 'none';
      row.classList.remove('clicked');
    });
  }); 
  */
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
    const coinsData = result.data.coins;
    displayPagination(coinsData);
  } catch (error) {
    console.error(error);
  }
}

function displayPagination([lastCoin]) {
  // ilość stron = lastCoin.rank / limitV
  const pagesCount = lastCoin.rank / limitV;

  const paginationElements = Array.from({ length: lastCoin.rank % limitV === 0 ? pagesCount : pagesCount + 1 }, (_, index) => index);
  lastPage = paginationElements.length - 1;
  console.log(lastPage);
  console.log('test');

  const mainDivElement = document.getElementById('table-navigation');

  mainDivElement.innerHTML = `
        <div class="pagination">
          <div class="pagination-elements">
            <a href="#" id='back'>&laquo;</a>
            ${paginationElements.map((page) => `<a id=p-${page} ${activePage === page ? 'class=active' : ''} href="#" onclick="goPagination(${page})">${page + 1}</a>`).join('')}
            <a href="#" onclick="goPagination(${activePage + 1})" id='next'>&raquo;</a>
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

// const timestamp = 1707769816 * 1000;
// console.log(new Date(timestamp));

function tableSort(e, orderBy) {
  e.preventDefault();
  orderDirectionV = !orderDirectionV;
  orderByV = orderBy;
  getAllCoins(orderByV, orderDirectionV, limitV, offsetV);
}

function changeLimit() {
  let newLimit = prompt('Enter the new table limit (between 30 and 150)', 100);
  if (newLimit >= 30 && newLimit <= 150 && newLimit != null) {
    limitV = newLimit;
  }
  getAllCoins(orderByV, orderDirectionV, limitV, offsetV);
  getLastInRank();
}

async function displaySnapshot() {
  try {
    const coinsData = JSON.parse(snapshot);
    displayData(coinsData, true);
    removeElements();
  } catch (error) {
    console.error(error);
  }
}

function removeElements() {
  const thElements = document.querySelectorAll('#coinsTable thead th');

  // Iterating through all th elements and removing their classes
  thElements.forEach((thElement) => {
    thElement.className = '';
  });

  document.getElementById('table-navigation').style.display = 'none';
}

document.getElementById('limit-button').addEventListener('click', function (e) {
  e.preventDefault();
  changeLimit();
});

let snapshotCreated;
document.getElementById('create-button').addEventListener('click', function (e) {
  e.preventDefault();
  try {
    snapshot = localStorage.getItem('coinsData');
    alert('Snapshot created successfully!');
    snapshotCreated = true;
  } catch (error) {
    alert("Snapshot wasn't created :(");
  }
});

document.getElementById('display-button').addEventListener('click', function (e) {
  e.preventDefault();
  if (snapshotCreated) {
    displaySnapshot();
  } else {
    console.error(error);
  }
});

async function getDayData(id) {
  const url = `https://coinranking1.p.rapidapi.com/coin/${id}/history?referenceCurrencyUuid=yhjMzLPhuIDl&timePeriod=24h`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': 'bff29b6aa4mshf22a75bb5624f31p152c89jsn427a95e2562d',
      'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com',
    },
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();
    const coinData = result.data.history;
    console.log(coinData);
    generateChart(id, coinData);
  } catch (error) {
    console.error(error);
  }
}

// Chart creation
function generateChart(id, data) {
  const prices = [];
  const timestamps = [];

  for (let i = data.length - 1; i >= 0; i -= 24) {
    prices.push(data[i].price);
    timestamps.push(data[i].timestamp);
  }

  const relativeHours = convertToRelativeHours(timestamps);

  console.log('Prices:', prices);
  console.log('Timestamps:', timestamps);
  console.log('Relative hours:', relativeHours);

  new Chart(`chart-${id}`, {
    type: 'line',
    data: {
      labels: relativeHours,
      datasets: [
        {
          data: prices, // currency value
          borderColor: '#958cdd',
          fill: false,
        },
      ],
    },
    options: {
      legend: { display: false },
    },
  });
}

function convertToRelativeHours(timestamps) {
  const currentTimestamp = Math.floor(Date.now() / 1000); // Aktualny timestamp w sekundach
  const relativeHoursArray = [];

  for (const timestamp of timestamps) {
    const timeDifferenceInSeconds = currentTimestamp - timestamp;
    const relativeHours = Math.floor(timeDifferenceInSeconds / 3600); // 3600 sekund w godzinie

    relativeHoursArray.push(`${relativeHours}h`);
  }

  return relativeHoursArray;
}

/*
//todo
- [x] style improvement
- [x] sorting functionallity by clicking on headers (ascending and descending)
- [] graph creation by using chart.js for generation -> using get 24h coin price and placing timestamps in the x-axis and the price in y-axis
- [!] localStorage
  - [x] initial create -> current snapshot of coins
  - [x] create snapshot -> saving a snapshot of coins data
  - [x] display snapshot -> displaying saved snapshot of coins data
- [x] prompt -> allows setting the limit of coins shown in the list when clicked on a button (maybe on the navbar)
- [x] alert -> when creating and displaying snapshots
- [x] html5 -> navbar and footnote
- [x] pagination -> by using offset and division by the limit of rows in table (for automatic scalable pagination - check the rank number of the last item in table)
*/
