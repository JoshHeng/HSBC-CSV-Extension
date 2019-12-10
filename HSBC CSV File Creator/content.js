startDate = undefined;
endDate = undefined;
lastAcountNumber = undefined;

chrome.storage.local.get(['filterByDate', 'startDate', 'endDate', 'mode'], function(data) {
    if (data['filterByDate']) {
        startDate = new Date(data['startDate']);
        endDate = new Date(data['endDate']);
        startDate.setHours(0);
        endDate.setHours(0);
    }
    mode = data['mode'];
    if (mode == undefined) mode = 0; //Mode: 0 (disabled), 1 (dashboard), 2 (statement viewer)

    if (mode == 1) {
        ClickViewMore(function() {
            GetTransactions(true, function(transactions) {
                GetAccountNumber(true, transactions, function(transactions, accountNumber) {
                    DownloadCsv(transactions, accountNumber);
                });
            });
        });
    }
    else if (mode == 2) {
        GetTransactions(false, function(transactions) {
            GetAccountNumber(false, transactions, function(transactions, accountNumber) {
                DownloadCsv(transactions, accountNumber);
            });
        });
    }
});

function ClickViewMore(callback) {
    if (!document.getElementsByClassName('viewMoreBtn')[0].classList.contains('noDisplay')) {
        document.getElementsByClassName('viewMoreBtn')[0].click();
        setTimeout(ClickViewMore, 500);
    }
    else {
        callback();
    }
}

function GetTransactions(dashboard, callback) {
    table = undefined
    if (dashboard) {
        table = document.getElementById('_dapTransactionGrid').childNodes[0].childNodes[0].childNodes[2].childNodes[1];
    }
    else {
        table = document.getElementsByClassName('gridxMain')[0].childNodes[1];
    }
    
    transactions = [];
    for (i=1; i < table.childNodes.length - 1; i++) {
        row = table.childNodes[i].childNodes[0].childNodes[0].childNodes[0];
        transaction = ""

        if (dashboard) {
            date = new Date(row.childNodes[0].childNodes[0].innerText.substring(5));

            reference = ""
            referenceElements = row.childNodes[0].childNodes[1].childNodes;
            for (x=1; x < referenceElements.length; x++) {
                if (x > 1) reference += " - ";
                reference += referenceElements[x].innerText;
            }

            amount = parseFloat(row.childNodes[0].childNodes[2].innerText.substring(7).replace(/,/g, ''));
            balance = parseFloat(row.childNodes[0].childNodes[3].innerText.substring(8).replace(/,/g, ''));
            transaction = [date.toLocaleDateString('en-GB'), reference, amount, balance];
        }
        else {
            date = new Date(row.childNodes[0].innerText.substring(5));

            reference = ""
            referenceElements = row.childNodes[1].childNodes;
            for (x=1; x < referenceElements.length; x++) {
                if (x > 1) reference += " - ";
                reference += referenceElements[x].innerText;
            }

            amount = parseFloat(row.childNodes[2].innerText.substring(7).replace(/,/g, ''));
            balance = parseFloat(row.childNodes[3].innerText.substring(8).replace(/,/g, ''));
            transaction = [date.toLocaleDateString('en-GB'), reference, amount, balance];
        }
        

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

    callback(transactions);
}

function GetAccountNumber(dashboard, passThrough, callback) {
    if (dashboard) {
        accountNumber = document.getElementById('_dapAccountSnapshot').childNodes[0].childNodes[7].childNodes[3].innerText.substring(8).substring(5, 9);
    }
    else {
        console.log(document.getElementsByClassName('loanDetailsWrapper')[0].childNodes);
        accountNumber = document.getElementsByClassName('loanDetailsWrapper')[0].childNodes[3].innerText.substring(8).substring(5, 9);
    }

    callback(passThrough, accountNumber);
}
function DownloadCsv(transactions, accountNumber) {
    var csv = ["Date,Description,Amount,Balance"];

    for (i = 0; i < transactions.length; i++) {
        csv += "\n" + transactions[i].join(",");
    }

    var name = 'HSBC Statement';
    if (accountNumber != undefined) {
        name += ' ' + accountNumber;
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