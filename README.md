microplayer-experiment
======================

An experimental web video player

Started with an empty head, and body. Then started adding stuff via javascript console, and when stuff worked okay I copied it to a script tag in the head. I plan on writing an Angular directive based on this, but the core currently has no dependencies. This won't work when loaded into browser as a file. It must be run from at least a localhost web server do to how web security works. 

Note the CSS for microplayer5 works with firefox, but previous versions haven't been fixed yet.

#Live demo

[Squakathon version](http://teknotus.github.io/microplayer-experiment/microplayer3.html)  
[Javascript admirers version](http://teknotus.github.io/microplayer-experiment/microplayer5.html)  

# References

* [Reverse engineering YouTube postMessage](http://stackoverflow.com/questions/7443578/youtube-iframe-api-how-do-i-control-a-iframe-player-thats-already-in-the-html)
* [Blog Post on YouTube/Vimeo postMessage](https://eamann.com/tech/youtube-postmessage/)
* [YouTube reference](https://developers.google.com/youtube/js_api_reference)
* [Vimeo reference](http://developer.vimeo.com/player/js-api#universal-with-postmessage)
