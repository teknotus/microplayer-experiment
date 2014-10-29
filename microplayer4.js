function PlayerFactory() {
    this.players = [];
    var protocol = window.location.protocol;

    var Player = function(id) {
	this.id = id;
    };

    Player.prototype.init = function() {
	this.pDiv = document.createElement('div');
	this.pDiv.style.display = 'inline-block';
	this.pDiv.style.position = 'fixed';
	this.dummy = document.createElement('div');
	this.dummy.style['padding-top'] = '56.25%';
	this.pDiv.appendChild(this.dummy);
	this.pFrame = document.createElement('iframe');
	var seamless = document.createAttribute('seamless');
	this.pFrame.setAttributeNode(seamless);
	this.pFrame.addEventListener('load', this.onIframeLoad.bind(this),
				     true);
	this.pFrame.frameborder = '0';
	this.pFrame.width = this.pFrame.height = '100%';
	this.pFrame.style.position = 'absolute';
	this.pFrame.style.top = '0px';
	this.pFrame.style.right = '0px';
	this.pFrame.style.bottom = '0px';
	this.pFrame.style.left = '0px';
	this.pDiv.appendChild(this.pFrame);
	this.dropDiv = document.createElement('div');
	this.dropDiv.player = this;
	
	this.dropDiv.style['pointer-events'] = 'none';

	this.dropDiv.style['z-index'] = 1;
	this.dropDiv.style.position = 'absolute';
	this.dropDiv.style.top = '0px';
	this.dropDiv.style.right = '0px';
	this.dropDiv.style.bottom = '0px';
	this.dropDiv.style.left = '0px';
	/*this.dropDiv.addEventListener('dragover', this.onDragover
	  .bind(this), true);
	  this.dropDiv.addEventListener('drop', this.onDrop.bind(this), true);*/
	this.pDiv.appendChild(this.dropDiv);
	return this;
    };
    Player.prototype.post = function(obj) {
	if (this.site === 'youtube') {
	    obj.id = this.id;
	}
	this.pFrame.contentWindow.postMessage(JSON.stringify(obj), protocol
					      + '//' + this.domain);
    };
    Player.prototype.command = function(command) {
	var args = Array.prototype.slice.call(arguments, 1);
	var comObj = {};
	if (this.site === 'youtube') {
	    comObj['event'] = "command";
	    comObj['func'] = command;
	    comObj['args'] = args;
	} else if (this.site === 'vimeo') {
	    comObj['method'] = command;
	    comObj['value'] = args[0];
	}
	this.post(comObj);
    };
    Player.prototype.registerListenersYouTube = function() {
	this.post({
	    'event' : 'listening',
	    'id' : this.id
	});
    };
    Player.prototype.registerListenersVimeo = function() {
	var listeners = [ 'ready', 'loadProgress', 'playProgress', 'play',
			  'pause', 'finish', 'seek' ];
	for (var l = listeners.length, i = 0; i < l; i++) {
	    this.post({
		"method" : "addEventListener",
		"value" : listeners[i]
	    });
	}
    };
    Player.prototype.onIframeLoad = function(e) {
	if (this.pFrame.src) {
	    var regex = new RegExp(protocol
				   + '\\/\\/(\\w+\\.(youtube|vimeo)\\.\\w+)\\/');
	    var results = this.pFrame.src.match(regex);
	    var domain, site;
	    domain = site = '';
	    if (results.length === 3) {
		this.domain = domain = results[1];
		this.site = site = results[2];
		console.log('loaded iframe from domain: ' + domain
			    + ' site: ' + site);
		if (site === 'youtube') {
		    this.registerListenersYouTube();
		}
	    }
	}
    };
    Player.prototype.loadPlayerYouTube = function(videoID, autoplay,
						  cueStart) {
	var args = arguments;
	this.pFrame.sandbox = "allow-same-origin allow-scripts";
	var url = protocol
	    + '//www.youtube.com/embed/'
	    + videoID
	    + '?autohide=1'
	    + '&vq=small'
	    + '&iv_load_policy=3&rel=1&modestbranding=0&showinfo=1&enablejsapi=1&controls=0';
	if (args[1]) {
	    url += '&autoplay=1';
	}
	if (cueStart > 0) {
	    url += '&start=' + cueStart;
	}
	this.pFrame.src = url;
    };
    Player.prototype.loadPlayerVimeo = function(videoID) {
	var args = arguments;
	/*this.pFrame.sandbox = "allow-same-origin allow-scripts allow-popups";*/
	var url = protocol + '//player.vimeo.com/video/' + videoID
	    + '?api=1' + '&player_id=' + this.id;
	if (args[1]) {
	    url += '&autoplay=1';
	}
	this.pFrame.src = url;
    };
    Player.prototype.setWidth = function(w) {
	this.pDiv.style.width = w + "px";
    };
    Player.prototype.setHeight = function(h) {
	this.pDiv.style.height = h + "px";
    };
    Player.prototype.setTop = function(t) {
	this.pDiv.style.top = t + "px";
    };
    Player.prototype.setLeft = function(l) {
	this.pDiv.style.left = l + "px";
    };
    this.createPlayer = function(id) {
	var player = new Player(id);
	this.players.push(player);
	player.init();
	return player;
    };
}
PlayerFactory.prototype.onMessage = function(e) {
    /*//console.log(e.origin);*/
    for (var l = this.players.length, i = 0; i < l; i++) {
	if (this.players[i].pFrame.contentWindow === e.source) {
	    var player = this.players[i];
	    /*//console.log('message for player: ' + player.id);*/
	    break;
	}
    }
};
PlayerFactory.prototype.addListener = function() {
    window.addEventListener('message', this.onMessage.bind(this), false);
    return this;
};
var contain,foo,bar,baz,qux;
var factory = new PlayerFactory().addListener();
function getVideoId() {
    var url = Android.getUrl();
    var site = url.match('.+(youtube|vimeo).+')[1];
    if(site === 'youtube'){
	return { 'site': site,
		 'id': url.match(/.*(youtube).*v=([^&]*).*/)[2]
	       };
    }else if(site === 'vimeo'){
	return { 'site': site,
		 'id': url.match('.+vimeo.com/([\\d]+)$')[1]
	       };
    }else{
	return "";
    }
}
window.onload = function() {
    console.log("width: " + document.documentElement.clientWidth);
    console.log("height: " + document.documentElement.clientHeight);
    contain = document.createElement('div');
    contain.style.height='100%';
    document.body.style.border='0';
    document.body.style.padding='0';
    document.body.style.margin='0';
    document.body.style['background-color']='#000';
    document.body.style.color='#999';
    foo = factory.createPlayer('foo');
    foo.pDiv.className='player';
    contain.appendChild(foo.pDiv);
    document.body.appendChild(contain);
    var setting_top = Android.getTop();
    console.log("setting_top: " + setting_top);
    foo.setTop(setting_top);
    var vidid = getVideoId();
    if(vidid.site === 'youtube'){
	foo.loadPlayerYouTube(vidid.id,false,0);
    }else if(vidid.site === 'vimeo'){
	foo.loadPlayerVimeo(vidid.id,false,0);
    }
};

