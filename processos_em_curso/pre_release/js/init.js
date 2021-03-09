
function DivFader(p_elemid, p_fadingheartbeat) {
	
	// Constantes
	// MessagesControllerParams é especifico de cada aplicação, deve estar no init-xxxx.js
	this.elemid = null;
	this.fadingHeartbeat = 0;
	
	this.isvisible = false;
	this.timer = null;
	this.inited = false;
	this.init = function() {
		if (this.inited) {
			return;
		}
		var msgsdiv = document.getElementById(this.elemid);
		
		attEventHandler(msgsdiv, 'click',
			function(evt) {
				MessagesController.hideMessage(true);
				return finishEvent(evt);
			}
		);
		
		this.inited = true;
	};
	this.setup = function(p_elemid, p_fadingheartbeat) {
		this.elemid = p_elemid;
		var msgsdiv = document.getElementById(this.elemid);
		//msgsdiv.style.display = 'none';
		this.isvisible = true;
		this.fadingHeartbeat = p_fadingheartbeat;
		
		this.init();
	};
	this.finalize = function() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		this.isvisible = false;
	};
	
	this.hideMessage = function(do_fadeout) {
		if (!this.isvisible) {
			return;
		}
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		var msgsdiv = document.getElementById(this.elemid);

		if (do_fadeout) 
		{
			this.timer = fadeout(msgsdiv, 
							this.fadingHeartbeat,
							this.finalize);
		} 
		else 
		{
			if (msgsdiv!=null) {
				msgsdiv.style.display = 'none';
			}
			this.finalize();
		}
	};
	
	this.setup(p_elemid, p_fadingheartbeat);  
	
		
}

function changeAtrribution(p_nodes) {
	if (p_nodes!=null && p_nodes.length > 0) {
		var node = p_nodes[0];
		if (ATTR_TEXT != null && node.innerText.indexOf("ower") > 0) {
			node.innerText = ATTR_TEXT;
		}
	}
};




		
		