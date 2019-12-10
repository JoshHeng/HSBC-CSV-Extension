downloadCsv.onclick = function(element) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(
          tabs[0].id,
          {file: 'content.js'});
    });
  };

function CheckPage() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var pageValid = false

        var path = tabs[0].url;
        path = path.split('?');
        if (path[0] == "https://www.services.online-banking.hsbc.co.uk/gpib/group/gpib/cmn/layouts/default.html") {
            var pageId = path[1].split('=')[1];
            
            if (pageId == "dashboard") {
                document.getElementById("status-text").innerText = "Dashboard";
                document.getElementById("form").classList.remove("hidden");
                chrome.storage.local.set({'mode': 1});
                pageValid = true;
            }
            else if (pageId == "viewStatements") {
                document.getElementById("status-text").innerText = "Statement Viewer";
                document.getElementById("form").classList.remove("hidden");
                chrome.storage.local.set({'mode': 2});
                pageValid = true;
            }
        }

        if (!pageValid) {
            //Mode: 0 (disabled), 1 (dashboard), 2 (statement viewer)
            chrome.storage.local.set({'mode': 0});
        }
      });
}


function UpdateDates() {
    elements = document.getElementsByClassName('date');

    if(filterByDate.checked) {
        for (i = 0; i < elements.length; i++) {
            elements[i].classList.remove('hidden');
        }
    }
    else {
        for (i = 0; i < elements.length; i++) {
            elements[i].classList.add('hidden');
        }
    }
}

filterByDate.onchange = function(element) {
    value = filterByDate.checked
    chrome.storage.local.set({'filterByDate': value});

    UpdateDates();
}

startDate.onchange = function(element) {
    chrome.storage.local.set({'startDate': startDate.value});
}
endDate.onchange = function(element) {
    chrome.storage.local.set({'endDate': endDate.value});
}

chrome.storage.local.get(['filterByDate', 'startDate', 'endDate'], function(data) {
    if (data['filterByDate'] != undefined) {
        if (data['filterByDate']) {
            filterByDate.setAttribute('checked', 'checked');
        }
        else {
            filterByDate.removeAttribute('checked');
        }
    }
    UpdateDates();
    if (data['startDate'] != undefined) {
        startDate.value = data['startDate'];
    }
    if (data['endDate'] != undefined) {
        endDate.value = data['endDate'];
    }
});
UpdateDates();

CheckPage();