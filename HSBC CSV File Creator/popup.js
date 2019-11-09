downloadCsv.onclick = function(element) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.executeScript(
          tabs[0].id,
          {file: 'content.js'});
    });
  };

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