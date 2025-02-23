#URL Shortener
It stores the shortened URL and the original URL in a Mongo Database.
When the server recieves an http request at a shortened URL, it searches for that shortened URL in the Database and the corresponding original URL to which it is meant to redirect to.