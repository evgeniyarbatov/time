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

            var tableContainer = document.getElementById('clock-records');
            var table = document.createElement('table');

            data.Items.forEach(function(item) {
                var row = table.insertRow();
                var cell = row.insertCell()

                if (item['event'] == 'set') {
                    cell.textContent = 'Time set ' + epochToDaysAgo(item['timestamp'])
                } else if (item['event'] == 'record') {
                    cell.textContent = epochToDaysAgo(item['timestamp']) + 
                    ' ' + clockTimeDelta(item['timestamp'], item['clockTimestamp']);
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