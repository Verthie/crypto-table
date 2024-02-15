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

  document.querySelector('.rank-button').addEventListener('click', (e) => tableSort(e, 'marketCap'));
  document.querySelector('.price-button').addEventListener('click', (e) => tableSort(e, 'price'));
  document.querySelector('.change-button').addEventListener('click', (e) => tableSort(e, 'change'));

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

  const table = document.getElementById('coinsTable');
  const tableRows = document.querySelectorAll('.expandable-info');

  tableRows.forEach(function (row) {
    const graph = document.getElementById(`graph-${row.id}`);

    row.addEventListener('click', function () {
      if (!row.classList.contains('clicked')) {
        row.classList.add('clicked');
        graph.innerHTML = `<td class="info-graph" colspan="4">Expandable Information</td>`;
        graph.style.display = 'table-row';
      } else {
        row.classList.remove('clicked');
        graph.style.display = 'none';
      }
    });
  });

  table.addEventListener('mouseleave', function () {
    tableRows.forEach(function (row) {
      const rowId = row.id;
      document.getElementById(`graph-${rowId}`).style.display = 'none';
      row.classList.remove('clicked');
    });
  });
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

document.getElementById('limit-button').addEventListener('click', function (e) {
  e.preventDefault();
  changeLimit();
});

document.getElementById('create-button').addEventListener('click', function (e) {
  e.preventDefault();
  try {
    snapshot = localStorage.getItem('coinsData');
    alert('Snapshot created successfully!');
  } catch (error) {
    console.error(error);
  }
});

document.getElementById('display-button').addEventListener('click', function (e) {
  e.preventDefault();
  alert("Remember that snapshots don't have built-in functions such as sorting");
  displaySnapshot();
});

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
