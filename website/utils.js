AWS.config.region = 'ap-southeast-1';
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'ap-southeast-1:81202562-9736-4d84-b6db-ef1ac336bba6'
});

function epochToDaysAgo(epochTimestamp) {
    var currentTime = Date.now() / 1000;
    var difference = currentTime - epochTimestamp;
    var days = Math.floor(difference / (60 * 60 * 24));
    var result = days > 0 ? days + " days ago" : "today";
    return result;
}

function clockTimeDelta(now, clockTime) {
    const delta = Math.abs(clockTime - now);
    return clockTime > now ? delta + "s ahead" : delta + "s behind";
}

function renderTimestamp(timestamp) {
    var date = new Date(timestamp * 1000);
  
    var hours = date.getHours();
    var minutes = date.getMinutes();
  
    if (minutes < 10) {
      minutes = '0' + minutes;
    }
  
    return hours + ':' + minutes;
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function renderNotice(text) {
    const notice = document.getElementById('notice');
    notice.textContent = text;
    notice.style.display = 'block';
}

function renderDBRecords(clockID) {
    AWS.config.credentials.get(function(err) {
        if (err) {
            console.error('Failed to get AWS credentials', err);
            return;
        }

        docClient = new AWS.DynamoDB.DocumentClient();
        docClient.scan({
            TableName: 'clock-tracker',
            FilterExpression: 'clockId = :id',
            ExpressionAttributeValues: {
                ":id": clockID,
            },
            Limit: 100
        }, function(err, data) {
            if (err) {
                console.error('Failed to scan DynamoDB', err);
                return;
            }

            var tableBody = document.getElementById('clock-records');
 
            data.Items.forEach(function(item) {
                var row = tableBody.insertRow();

                var actionCell = row.insertCell(0);
                actionCell.innerHTML = capitalize(item['event']);

                var dateCell = row.insertCell(1);
                dateCell.innerHTML = epochToDaysAgo(item['timestamp']);

                var infoCell = row.insertCell(2);
                if (item['event'] == 'record') {
                    infoCell.innerHTML = clockTimeDelta(item['clockTimestamp'], item['timestamp']);
                } else if (item['event'] == 'set') {
                    infoCell.innerHTML = renderTimestamp(item['timestamp']);
                }

            });

            tableContainer.appendChild(table);
        });
    });
}

function saveToDB(event, clockID) {
    AWS.config.credentials.get(function(err) {
        if (err) {
            console.error('Failed to get AWS credentials', err);
            return;
        }

        var clockDate = new Date();
        clockDate.setHours(document.getElementById('hours').value);
        clockDate.setMinutes(document.getElementById('minutes').value);
        clockDate.setSeconds(document.getElementById('seconds').value);

        docClient = new AWS.DynamoDB.DocumentClient();
        docClient.put({
            TableName: 'clock-tracker',
            Item: {
                'timestamp': Math.floor(Date.now() / 1000),
                'clockId': clockID,
                'clockTimestamp': Math.floor(clockDate.getTime() / 1000),
                'event': event,
            }
        }, function(err, data) {
            if (err) {
                console.error('Failed to update DynamoDB', err);
                return;
            }
            renderNotice('Saved');
        });
    });
}