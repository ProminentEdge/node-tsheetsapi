# node-tsheetsapi
(Unofficial) Simple TSheets node.js API Helper.

**Features**: 

- Support Bearer Token authentication
- Supports pagination
- List / Add / Update or Delete on (almost) any endpoint
- Supports q promises

## Supported endpoints

- `/users`
- `/groups`
- `/jobcodes`
- `/jobcode_assignments`
- `/timesheets`
- `/timesheets_deleted`
- `/geolocations`
- `/reports`
- `/last_modfied`
- `/notifications`
- `/reminders`
- `/schedule_calendars`
- `/schedule_events`
- `/managed_clients`

## Install 
```
npm install tsheetsapi --save
```

## Basic Usage

All the endpoints are named exactly like in the [TSheets docs](https://developers.tsheets.com/docs/api/).

The `.add()` and `.update()` methods need a data field in the parameters object:

```
{
  data : [{}, {}, ...]
}
```

Instead, the `.list()` and `.delete()` methods do not require a data field, you can just specify your parameters right away. 


### Authentication
```
var TSheetsApi = require('tsheetsapi');

var tapi = new TSheetsApi({
        	bearerToken : '<your-access-token>'
           });
```
### List users
```
tapi.users().list()
    .then(console.log)
```

### List jobcodes
```
tapi.jobcodes().list()
    .then(console.log);
```

### Add schedule event
```

var params = {
  data : [{
        schedule_calendar_id : '<your-id>',
        start : '2017-06-12T15:19:21+00:00',
        end   : '2017-06-13T15:19:21+00:00',
        all_day : true
  }]
};

tapi.schedule_events.add(params)
    .then(console.log);

```

