# How it works

`api` : Set up a local Websocket server as the middleware to communicate with frontend and backend AioQ program via RabbitMQ.

`frontend`: Built with Next.js

`aioquant-app`: Backend Running Strategy.

# Websocket Data Structure

```javascript

target = 'frontend' / 'backend'

// This message is from frontend 2 backend
message = {
    // request to change params
    request:
        {
            title: targetValue, // ex: allow open trade
            value: valueToChange // bool:
        }
};


// This message is from backend 2 frontend
message = {
    // The `status` and the `response` field may not be send
    // list all status - read only
    // example: account value, leverage, ... only 2 columns

    // The default READ-ONLY status that has been sent every 5 seconds.
    status: [{
        title: String
        value: String
    }, {}...],

    // the Changable Params
    params: [{
        title: String,
        type: "String, Boolean, Number", // 3 options
        value: String,
    }, {}...],

    // Response to the frontend's command to change `params`
    response: [{
        title: String,
        isSucceed: Boolean
    }, ... ],

    // THE LOG
    loggingInfo: "", 
    loggingWarning: "",
    loggingError: "
}
```


