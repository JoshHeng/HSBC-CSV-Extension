startDate = undefined;
endDate = undefined;
lastAcountNumber = undefined;

chrome.storage.local.get(['filterByDate', 'startDate', 'endDate'], function(data) {
    if (data['filterByDate']) {
        startDate = new Date(data['startDate']);
        endDate = new Date(data['endDate']);
        startDate.setHours(0);
        endDate.setHours(0);
    }
    
    ClickViewMore();
});

function ClickViewMore() {
        if (!document.getElementsByClassName('viewMoreBtn')[0].classList.contains('noDisplay')) {
            document.getElementsByClassName('viewMoreBtn')[0].click();
            setTimeout(ClickViewMore, 500);
        }
    else {
        GetTransactions();
    }
}

function GetTransactions() {
    table = document.getElementById('_dapTransactionGrid').childNodes[0].childNodes[0].childNodes[2].childNodes[1];
    transactions = [];
    for (i=0; i < table.childNodes.length; i++) {
        row = table.childNodes[i];

        date = new Date(row.childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerText.substring(5));
        sender = row.childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[1].innerText;
        reference = row.childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes[2].innerText;
        amount = parseFloat(row.childNodes[0].childNodes[0].childNodes[0].childNodes[2].innerText.substring(7).replace(/,/g, ''));
        balance = parseFloat(row.childNodes[0].childNodes[0].childNodes[0].childNodes[3].innerText.substring(8).replace(/,/g, ''));
        transaction = [date.toLocaleDateString('en-GB'), sender + " - " + reference, amount, balance];

        if (startDate != undefined && endDate != undefined) {
            if (date >= startDate && endDate >= date) {
                transactions.push(transaction);
            }
        }
        else {
            transactions.push(transaction);
        }
    }
    transactions = transactions.reverse();

    //Get last account number
    lastAccountNumber = document.getElementById('_dapAccountSnapshot').childNodes[0].childNodes[7].childNodes[3].innerText.substring(8).substring(5, 9);
    
    DownloadCsv(transactions);
}
function DownloadCsv(transactions) {
    var csv = ["Date,Description,Amount,Balance"];

    for (i = 0; i < transactions.length; i++) {
        csv += "\n" + transactions[i].join(",");
    }

    var name = 'HSBC Statement';
    if (lastAccountNumber != undefined) {
        name += ' ' + lastAccountNumber;
    }
    if (startDate != undefined && endDate != undefined) {
        name += ' - ' + startDate.getFullYear() + (startDate.getMonth()+1) + startDate.getDate() + ' ' + endDate.getFullYear() + (endDate.getMonth()+1) + endDate.getDate();
    }
    name += '.csv';

    hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = name;
    hiddenElement.click();
}

