var https = require('https');
var request = require('request');

var TopSubreddits = [
  "jokes",
  "funny",
  "science",
  "nottheonion",
  "LifeProTips",
  "ShowerThoughts",
  "Sports",
  "history",
  "news",
  "worldnews",
  "technology",
  "todayilearned",
  "gaming",
  "movies",
  "television",
  "music",
  "books",
  "space"
]

exports.handler = (event, context) => {

  try {

    if (event.session.new) {
      // New Session
      console.log("NEW SESSION")
    }

    switch (event.request.type) {

      case "LaunchRequest":
        // Launch Request
        console.log(`LAUNCH REQUEST`)
        context.succeed(
          generateResponse(
            buildSpeechletResponse("Hi, I am reddit bot beep boop. I will fetch a random post from a random top subreddit for you.", true),
            {}
          )
        )
        break;

      case "IntentRequest":
        // Intent Request
        console.log(`INTENT REQUEST`)

        switch(event.request.intent.name) {
          case "GetRandomPost":
            var subreddit = TopSubreddits[Math.floor(Math.random() * TopSubreddits.length)];
            // var subreddit = "jokes"
            var endpoint = `https://www.reddit.com/r/${subreddit}/random.json` // ENDPOINT GOES HERE
            var body = ""
            var r = request(endpoint, function (e, response) {
              https.get(response.request.uri.href, (response) => {
                response.on('data', (chunk) => { body += chunk })
                response.on('end', () => {
                var data = JSON.parse(body)
                var title = data[0].data.children[0].data.title;
                var text = data[0].data.children[0].data.selftext;
                context.succeed(
                  generateResponse(
                    buildSpeechletResponse(`This post is from the sub reddit ${subreddit}. ${title}, ${text}`, true),
                    {}
                  )
                )
                })
              })
            })
            break;

          default:
            throw "Invalid intent"
        }

        break;

      case "SessionEndedRequest":
        // Session Ended Request
        console.log(`SESSION ENDED REQUEST`)
        break;

      default:
        context.fail(`INVALID REQUEST TYPE: ${event.request.type}`)

    }

  } catch(error) { context.fail(`Exception: ${error}`) }

}

// Helpers
buildSpeechletResponse = (outputText, shouldEndSession) => {

  return {
    outputSpeech: {
      type: "PlainText",
      text: outputText
    },
    shouldEndSession: shouldEndSession
  }

}

generateResponse = (speechletResponse, sessionAttributes) => {

  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }

}
