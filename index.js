import fetch from "node-fetch";
// import dotenv from "dotenv";
// dotenv.config();

const BITACESS_KEY = process.env.Bitacess_key;
const COINFIRM_KEY = process.env.CoinFirm_key;

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
    new Date().getTime() + new Date().getTimezoneOffset() * 60000 + 3600000 * -5
  );
}

async function fetchTransactions(limit, durationInMinutes) {
  //get current time, convert it to cdt
  let now = getCurrentCTDTime();

  console.log(now.toTimeString());

  now.setMinutes(now.getMinutes() - durationInMinutes);

  let timestamp = now.getTime();

  let headersList = {
    key: BITACESS_KEY,
  };

  let response = await fetch(
    `https://work-api.bitaccessbtm.com/api/partner/v2/transactions?limit=${limit}&status=coins sent&start_time=${timestamp}`,
    {
      method: "GET",
      headers: headersList,
    }
  );

  return response.json();
}

function getAddresses(transactions) {
  let addresses = transactions["transactions"].map((ele) => ele["public_key"]);
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

function monthDiff(d1, d2) {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months <= 0 ? 0 : months;
}

async function main() {
  let h = 10; //fetch all before 10 hours
  let transactions = await fetchTransactions(1000, h * 60);

  let customersAddresses = getAddresses(transactions);
  // console.log(customersAddresses);
  // console.log(customersAddresses.length);

  let reports = await fetchAllReports();
  let filteredAddresses = customersAddresses.filter((address) => {
    for (const report of reports) {
      if (report["address"] == address) {
        //if exists
        const time = report["time"];
        const reportMonth = new Date(time);
        const currentMonth = getCurrentCTDTime();
        return monthDiff(currentMonth, reportMonth) > 6;
      }
    }
    return true;
  });

  for (const address of filteredAddresses) {
    await postAMLReport(address);
    console.log("address reported");
  }
}

await main();
