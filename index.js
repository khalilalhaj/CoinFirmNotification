import fetch from "node-fetch";

let MS_PER_MINUTE = 60000;

let BITACESS_KEY = process.env.Bitacess_key;
let COINFIRM_KEY = process.env.CoinFirm_key;

async function fetchAllReports() {
  let headersList = {
    Authorization: `Bearer ${COINFIRM_KEY}`,
  };

  let reports = await fetch("https://api.coinfirm.com/v3/users/me/reports", {
    method: "GET",
    headers: headersList,
  });

  return reports.json();
}

function getCurrentCTDTime() {
  return new Date(
    new Date().getTime() +
      new Date().getTimezoneOffset() * MS_PER_MINUTE +
      3600000 * -5
  );
}

async function fetchTransactions(limit = 10, durationInMinutes = 5) {
  //get current time, convert it to cdt
  let now = getCurrentCTDTime();

  //   console.log(now.toTimeString());

  now.setMinutes(now.getMinutes() - durationInMinutes);

  //   console.log(now.toTimeString());

  let timestamp = now.getTime();

  let headersList = {
    key: BITACESS_KEY,
  };

  let response = await fetch(
    `https://work-api.bitaccessbtm.com/api/partner/v2/transactions?limit=${limit}`,
    {
      method: "GET",
      headers: headersList,
    }
  );
  return response.json();
}

function getAddresses(transactions) {
  let addresses = transactions["transactions"]
    .map((ele) => ele["public_key"])
    .filter((ele) => ele != undefined);

  return [...new Set(addresses)];
}

async function postAMLReport(address) {
  let headersList = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${COINFIRM_KEY}`,
  };

  await fetch(`https://api.coinfirm.com/v3/reports/aml/standard/${address}`, {
    method: "GET",
    headers: headersList,
  }).catch((err) => console.log(err));
}

async function main() {
  console.log(BITACESS_KEY);
  console.log(COINFIRM_KEY);

  // let h = 24;
  // let transactions = await fetchTransactions(100, h * 60);
  // let customersAddresses = getAddresses(transactions);

  // let reports = await fetchAllReports();
  // let filteredAddresses = customersAddresses.filter((address) => {
  //   for (const report of reports) {
  //     if (report["address"] == address) {
  //       //if exists
  //       const time = report["time"];
  //       const reportMonth = new Date(time).getMonth() + 1;
  //       const currentMonth = getCurrentCTDTime().getMonth() + 1;
  //       return currentMonth - reportMonth > 6;
  //     }
  //   }
  //   return true;
  // });

  // for (const address of filteredAddresses.slice(0, 4)) {
  //   await postAMLReport(address);
  // }
}

await main();
