var contain,foo,bar,baz;
var messageData = {};
function createSvgDocument(){
    var docType = document.implementation.createDocumentType('svg',
							     '-//W3C//DTD SVG 1.1//EN',
							     'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd');
    var svgDoc = document.implementation.createDocument(
	'http://www.w3.org/2000/svg', 'svg', docType);
    return svgDoc;
}
function createSvgDataUrl(node){
    var xSerializer = new XMLSerializer();
    var svgString = xSerializer.serializeToString(node);
    var svgBlob = new Blob([svgString], {type: "image/svg+xml;charset=utf-8"});
    var dataUrl = self.URL.createObjectURL(svgBlob);
    return dataUrl;
}
function genStar(n,s){
    var a = ((n-1) * Math.PI)/n;
    var p = [];
    for(var i = 0; i < n; i++){
	p.push(Math.sin(i*a + a/(n-1))*s);
	p.push(Math.cos(i*a + a/(n-1))*s);
    } return 'M' + p.join(' ') + 'Z';
}
//stdfs = document.createAttribute('allowfullscreen');
//wkfs = document.createAttribute('webkitallowfullscreen');
//mfs = document.createAttribute('mozallowfullscreen');
//contain.setAttributeNode(stdfs);
//contain.setAttributeNode(wkfs);
//contain.setAttributeNode(mfs);
//fsheading = document.createElement('button');
//fsheading.style.position = 'fixed';
//fsheading.style.bottom = '12px';
//fsheading.style.right = '35px';
//var fstext = document.createTextNode('Go Fullscreen');
//fsheading.appendChild(fstext);
//document.body.appendChild(fsheading);
//fsheading.addEventListener('click',gofullscreen,false);

window.addEventListener('message',gotMessage,false);
//myframe.src = 'http://www.youtube.com/embed/9bZkp7q19f0?iv_load_policy=3&rel=0&modestbranding=0&showinfo=1&start=245&end=248&enablejsapi=1&autohide=1'
//window.setTimeout(function(){
//myframe.contentWindow.postMessage(JSON.stringify({"event": "command","func": "loadVideoById","args": ['ASO_zypdnsQ'],"id": "foo"}), "*");
//},11000);


function PlayerFactory(){
    this.players = [];
    var protocol = window.location.protocol;
    var Player = function(id){
	this.id = id;
    };
    Player.prototype.init = function(){
	this.pDiv = document.createElement('div');
	this.pDiv.style.display = 'inline-block';
	this.pDiv.style.position = 'fixed';
/*	this.dummy = document.createElement('div');
	this.dummy.style['padding-top'] = '56.25%';
	this.pDiv.appendChild(this.dummy); */
	this.pFrame = document.createElement('iframe');
	var seamless = document.createAttribute('seamless');
	this.pFrame.setAttributeNode(seamless);
	this.pFrame.addEventListener('load',this.onIframeLoad.bind(this),true);
	this.pFrame.frameborder = '0';
	this.pFrame.width = this.pFrame.height = '100%';
	this.pFrame.style.position = 'absolute';
	this.pFrame.style.top = '0px';
	this.pFrame.style.right = '0px';
	this.pFrame.style.bottom = '0px';
	this.pFrame.style.left = '0px';
	this.pDiv.appendChild(this.pFrame);
/*	this.dropDiv = document.createElement('div');
	this.dropDiv.player = this;
	//this.dropDiv.style['pointer-events'] = 'none';
	this.dropDiv.style['z-index'] = 1;
	this.dropDiv.style.position = 'absolute';
	this.dropDiv.style.top = '0px';
	this.dropDiv.style.right = '0px';
	this.dropDiv.style.bottom = '0px';
	this.dropDiv.style.left = '0px';
	this.dropDiv.addEventListener('dragover',this.onDragover.bind(this),true);
	this.dropDiv.addEventListener('drop',this.onDrop.bind(this),true);
	this.pDiv.appendChild(this.dropDiv);
*/	return this;
    };
    Player.prototype.post = function(obj){
	if(this.site === 'youtube'){
	    obj.id = this.id;
	}
	/*this.pFrame.contentWindow.postMessage(
	  JSON.stringify(obj), protocol + '//' + this.domain);*/
	this.pFrame.contentWindow.postMessage(
	    JSON.stringify(obj), '*');
    };
    Player.prototype.command = function(command){
	var args = Array.prototype.slice.call(arguments,1);
	var comObj = {};
	if(this.site === 'youtube'){
	    comObj['event'] = "command";
	    comObj['func'] = command;
	    comObj['args'] = args;
	} else if(this.site === 'vimeo'){
	    comObj['method'] = command;
	    comObj['value'] = args[0];
	}
	this.post(comObj);
    }
    Player.prototype.registerListenersYouTube = function(){
	this.post({'event':'listening','id':this.id});
    };
    Player.prototype.registerListenersVimeo = function(){
	var listeners = [
	    'ready',
	    'loadProgress',
	    'playProgress',
	    'play',
	    'pause',
	    'finish',
	    'seek'
	];
	for(var l = listeners.length, i = 0 ; i < l ; i++){
	    this.post({"method": "addEventListener", "value": listeners[i] });
	}
    };
    Player.prototype.onIframeLoad = function(e){
	if(this.pFrame.src){
	    var regex = new RegExp(protocol +
				   '\\/\\/(\\w+\\.(youtube|vimeo)\\.\\w+)\\/');
	    var results = this.pFrame.src.match(regex);
	    var domain,site;
	    domain = site = '';
	    if(results.length === 3){
		this.domain = domain = results[1];
		this.site = site = results[2];
		console.log('loaded iframe from domain: ' + domain + ' site: ' + site);
		if(site === 'youtube'){
		    this.registerListenersYouTube();
		}
	    }
	}
    };
    Player.prototype.onDragover = function(e){
	e.preventDefault();
	console.log('dragover');
	return false;
    };
    Player.prototype.onDrop = function(e){
	e.preventDefault();
	console.log('drop');
	typeIndex = Array.prototype.indexOf.call(
	    e.dataTransfer.types,'text/uri-list');
	//var types = Array.prototype.slice.call(e.dataTransfer.types,0);
	//for(var t in types){
	//  console.log('type: ' + types[t]);
	//}
	if(typeIndex > -1){
	    uriList = e.dataTransfer.getData('text/uri-list').match(/[^\r\n]+/g);
	    for(var u in uriList){
		if(/#.*/.test(uriList[u])){ console.log('comment'); continue; }
		console.log('got a uri: ' + uriList[u]);
		var parts = uriList[u].match(/.*(youtube).*v=([^&]*).*/);
		this.loadPlayerYouTube(parts[2]);
		return;
	    } 
	}
	return;
    };
    Player.prototype.loadPlayerYouTube = function(videoID,autoplay,cueStart){
	var args = arguments;
	this.pFrame.sandbox = "allow-same-origin allow-scripts";
	var url = protocol + '//www.youtube.com/embed/' + videoID + '?autohide=1' +
	    '&iv_load_policy=3&rel=0&modestbranding=0&showinfo=1&enablejsapi=1&controls=1&vq=small';
	if(args[1]){
	    url += '&autoplay=1';
	}
	if(cueStart > 0){
	    url += '&start=' + cueStart;
	}
	this.pFrame.src = url;
    };
    Player.prototype.loadPlayerVimeo = function(videoID){
	var args = arguments;
	this.pFrame.sandbox = "allow-same-origin allow-scripts allow-popups";
	var url = protocol + '//player.vimeo.com/video/' + videoID + '?api=1' +
	    '&player_id=' + this.id;
	if(args[1]){
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
PlayerFactory.prototype.onMessage = function(e){
    //console.log(e.origin);
    for(var l = this.players.length, i = 0 ; i < l ; i++){
	if(this.players[i].pFrame.contentWindow === e.source){
	    var player = this.players[i];
	    //console.log('message for player: ' + player.id);
	    break;
	}
    }
}
PlayerFactory.prototype.addListener = function(){
    window.addEventListener('message',this.onMessage.bind(this),false);
    return this;
};
//var contain,foo,bar,baz,qux;
var factory = new PlayerFactory().addListener();
function getVideoId(url) {
    //var url = Android.getUrl();
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
    contain.style.height='50%';
    document.body.style.border='0';
    document.body.style.padding='0';
    document.body.style.margin='0';
    document.body.style['background-color']='#000';
    document.body.style.color='#999';
    foo = factory.createPlayer('foo');
    foo.pDiv.className='player player-topleft';
    bar = factory.createPlayer('bar');
    bar.pDiv.className='player player-topright';
    //baz = factory.createPlayer('baz');
    //baz.pDiv.className='player player-bottomcenterright';
    //qux = factory.createPlayer('qux');
    //qux.pDiv.className='player player-bottomright';

    //myframe = leftPlayer.pFrame;
    contain.appendChild(foo.pDiv);
    contain.appendChild(bar.pDiv);
//    contain.appendChild(baz.pDiv);
//    contain.appendChild(qux.pDiv);
    playbutton = document.createElement('button');
    playclick = document.createAttribute('onclick');
    playclick.nodeValue = "playAll()";
    playbutton.setAttributeNode(playclick);
    playbutton.innerHTML = 'play';
    contain.appendChild(playbutton);
    //myframe.style.position = 'absolute';
    //myframe.style.border = '0px';
    var stdfs = document.createAttribute('allowfullscreen');
    var wkfs = document.createAttribute('webkitallowfullscreen');
    var mfs = document.createAttribute('mozallowfullscreen');
    contain.setAttributeNode(stdfs);
    contain.setAttributeNode(wkfs);
    contain.setAttributeNode(mfs);
    var bfc = document.body.firstChild;
    document.body.insertBefore(contain,bfc);
//    var setting_top = Android.getTop();
//    console.log("setting_top: " + setting_top);
//    foo.setTop(setting_top);
//    var vidid = getVideoId();
//    if(vidid.site === 'youtube'){
//	foo.loadPlayerYouTube(vidid.id,false,0);
//    }else if(vidid.site === 'vimeo'){
//	foo.loadPlayerVimeo(vidid.id,false,0);
    addPlayers = function(){
	foo.loadPlayerYouTube('9bZkp7q19f0',false,0);
	bar.loadPlayerVimeo('27855315',false,0);
	//baz.loadPlayerYouTube('2zNSgSzhBfM',false,0);
	//qux.loadPlayerYouTube('ASO_zypdnsQ',false,0);
    }
    var playerposition = 0;
    rotatePlayers = function(){
	if(arguments.length > 0 && arguments[0] == 'b'){
	    playerposition += 3;
	    playerposition = --playerposition % 3;
	} else {
	    playerposition = ++playerposition % 3;
	}
	if(playerposition == 0){
	    foo.pDiv.className="player player-bottomleft";
	    bar.pDiv.className="player player-topcenter";
	    //baz.pDiv.className="player player-bottomright";
	}
	if(playerposition == 1){
	    foo.pDiv.className="player player-bottomright";
	    bar.pDiv.className="player player-bottomleft";
	    //baz.pDiv.className="player player-topcenter";
	}
	if(playerposition == 2){
	    foo.pDiv.className="player player-topcenter";
	    bar.pDiv.className="player player-bottomright";
	    //baz.pDiv.className="player player-bottomleft";
	}
    }
    makeBig = function(bigplayer){
	bigplayer.pDiv.className = 'player player-topcenter';
	if(foo != bigplayer){ foo.pDiv.className = 'player player-bottomleft';}
	if(bar != bigplayer){ bar.pDiv.className = 'player player-bottomcenterleft';}
	//if(baz != bigplayer){ baz.pDiv.className = 'player player-bottomcenterright';}
	if(qux != bigplayer){ qux.pDiv.className = 'player player-bottomright';}
    }
    makeBigListener = function(e){
	makeBig(e.target.player);
    }
    playAll = function(){
        foo.command('mute')
	foo.command('playVideo');
        bar.command('setVolume',0);
	bar.command('play');
	//baz.command('playVideo');
	//qux.command('playVideo');
    }
    pauseAll = function(){
	foo.command('pauseVideo');
	bar.command('pause');
	//baz.command('pauseVideo');
	//qux.command('pauseVideo');
    }
/*    foo.dropDiv.addEventListener('click',makeBigListener, false);
    bar.dropDiv.addEventListener('click',makeBigListener, false);
*/    //baz.dropDiv.addEventListener('click',makeBigListener, false);
    //qux.dropDiv.addEventListener('click',makeBigListener, false);
    addPlayers()
}
//window.setTimeout(function(){
//myframe.setAttribute('sandbox', 'allow-same-origin allow-scripts allow-popups');
//myframe.src = "http://player.vimeo.com/video/27855315?api=1";
//},20000);
//window.setTimeout(function(){
//myframe.contentWindow.postMessage(JSON.stringify({"method": "play", "value": "28544156" }), "*");
//},25000);
//window.setTimeout(function(){
//myframe.src = "http://player.vimeo.com/video/28544156?api=1";
//},30000);
//window.setTimeout(function(){
//myframe.contentWindow.postMessage(JSON.stringify({"method": "play", "value": "28544156" }), "*");
//},35000);

//function iframeLoaded(e){
//  console.log('iframe loaded');
// youtube
//myframe.contentWindow.postMessage(JSON.stringify({"event": "listening", "id":"foo" }), "*");
// vimeo
//myframe.contentWindow.postMessage(JSON.stringify({"method": "addEventListener", "value": "ready" }), "*");
//myframe.contentWindow.postMessage(JSON.stringify({"method": "addEventListener", "value": "loadProgress" }), "*");
//myframe.contentWindow.postMessage(JSON.stringify({"method": "addEventListener", "value": "playProgress" }), "*");
//myframe.contentWindow.postMessage(JSON.stringify({"method": "addEventListener", "value": "play" }), "*");
//myframe.contentWindow.postMessage(JSON.stringify({"method": "addEventListener", "value": "pause" }), "*");
//myframe.contentWindow.postMessage(JSON.stringify({"method": "addEventListener", "value": "finish" }), "*");
//myframe.contentWindow.postMessage(JSON.stringify({"method": "addEventListener", "value": "seek" }), "*");
//}

function gotMessage(e){
    //console.log('got message: ' + e.data);
    var ytPlayerStates = {
	'-1': 'unstarted',
	'0':  'ended',
	'1':  'playing',
	'2':  'paused',
	'3':  'buffering',
	'4':  'cued'
    };
    var origin = e.origin;
    var source = e.source
    var srcElement = e.srcElement;
    var data = JSON.parse(e.data);
    if(typeof messageData[origin] === 'undefined'){
	messageData[origin] = {};
    }
    var base = messageData[origin];
    for(var key in data){
	if(typeof base[key] === 'undefined'){
	    base[key] = {};
	}
	if(key === 'event'){
	    base.event[data.event] = true;
	} else if(key === 'id'){
	    base.id = data[key];
	} else if(key === 'info'){
	    if(typeof base.info === 'undefined'){
		base.info = {};
	    }
	    var info = data.info;
	    for(var infoKey in info){
		//        console.log('infoKey: ' + infoKey);
		if(typeof info[infoKey] !== 'undefined' &&
		   base.info[infoKey] !== info[infoKey] &&
		   typeof info[infoKey] !== 'object' &&
		   !/^(currentTime|videoLoadedFraction|videoBytesLoaded)$/
		   .test(infoKey)){
		    var from,to;
		    if(infoKey === 'playerState'){
			from = ytPlayerStates[base.info[infoKey]];
			to = ytPlayerStates[info[infoKey]];
		    } else {
			from = base.info[infoKey];
			to = info[infoKey];
		    }
		    console.log('player ' + infoKey + ' from: ' + from +
				' to: ' + to);
		}
		if(typeof info[infoKey] === 'object' &&
		   typeof base.info[infoKey] === 'object'){
		    for(var objKey in info[infoKey]){
			if(base.info[infoKey][objKey] !== info[infoKey][objKey]){
			    console.log( infoKey + ':' + objKey + ' changed from ' +
					 base.info[infoKey][objKey] + ' to ' +
					 info[infoKey][objKey]);
			}
		    }
		}
		base.info[infoKey] = info[infoKey];
	    }
	} else if(key === 'data'){
	    if(typeof base.data === 'undefined'){
		base.data = {};
	    }
	    for(var dataKey in data.data){
		base.data[dataKey] = data.data[dataKey];
	    }
	} else {
	    console.log('unknown key: ' + key);
	}
    }
    var scope = angular.element(document.getElementById("angular")).scope();
    scope.$apply(function(){
        scope.data = messageData;
    })
    //  console.log('parsed');
}
function gofullscreen(){
    console.log('trying to fullscreen');
    //myframe.webkitRequestFullScreen();
    //myframe.mozRequestFullScreen();
    //myframe.requestFullscreen();
    if (myframe.requestFullscreen) {
	myframe.requestFullscreen();
    } else if (myframe.mozRequestFullScreen) {
	myframe.mozRequestFullScreen();
    } else if (myframe.webkitRequestFullscreen) {
	myframe.webkitRequestFullscreen();
    }
}
