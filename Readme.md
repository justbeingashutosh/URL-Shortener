# URL Shortener
It stores the shortened URL and the original URL in a Mongo Database.
When the server recieves an http request at a shortened URL, it searches for that shortened URL in the Database and the corresponding original URL to which it is meant to redirect to.

## Error Handling:
The link is checked for spaces in between or absence of atleast a single '.', and marked as an invalid URL, and the corresponding error message is delivered to the client.

## Storage Optimization
The code checks for redundant links entered by the users and instead of generating a new shortened link each time, it returns a shortened link corresponding to the same route if it exists in the database.
The code also checks for variations of the same link. For example, "www.youtube.com", "https://www.youtube.com", "youtube.com" and "https://wwW.yoUtube.com" will all produce the same shortened URL.

## Upcoming Features
Implementation of user authorization and identification to display a history of urls shortened by a particular client overtime.
