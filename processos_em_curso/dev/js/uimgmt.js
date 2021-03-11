
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

function showLoaderImg() {
	document.getElementById("loading").style.display = "block";
};

function hideLoaderImg() {
	document.getElementById("loading").style.display = "none";	
};

function sizeWidgets() {

	var winsize = {
		width: window.innerWidth || document.body.clientWidth,
		height: window.innerHeight || document.body.clientHeight,
	};
	//var minified_boxes = false;
	
	var wdg1, wdg2, wdg3, wdgB, wdg = document.getElementById("loc_inputbox");
	if (wdg) {
		var w, w2;
		if (parseInt(winsize.width) > 1200) {
			w = '450px';
			w2 = '420px';
		} else if (parseInt(winsize.width) > 530) {
			w = '350px';
			w2 = '320px';
		} else if (parseInt(winsize.width) > 430) {
			w = '265px';
			w2 = '235px';
		} else {
			w = '180px';
			w2 = '150px';	
		}
		wdg.style.width = w;
	}

	wdg = document.getElementById("loc_cleansearchbtn");	
	if (wdg) {
		if (parseInt(winsize.width) > 490) {
			wdg.style.fontSize = '14px';
			wdg.style.width = '90px';
		} else {
			wdg.style.fontSize = '12px';
			wdg.style.width = '40px';	
		}				
	}
	
	wdg = document.getElementById("loc_content");	
	if (wdg)  {
		if (parseInt(winsize.width) > 490) {
			wdg.style.left = '65px';
		} else {
			wdg.style.left = '40px';
		}				
	}

}

class Geocode_LocAutoCompleter extends LocAutoCompleter {
	constructor(
			p_url,
			p_srid,
			p_widgets
		) {
		super("geocode", 
			{
				url: p_url,
				outsrid: p_srid
			}
			, p_widgets);
	}

	beforeResponseDone(p_respobj) {
		hideLoaderImg();
	}	

	beforeExecSearch() {
		showLoaderImg();	
	}	
	
	// Sem widgets de publicação resultados Localizador
	/*clearPublishingWidgets() {

	}*/

	deleteHandler() {

		this.cleanSearch();

		// TODO
		// this, clearPublishingWidge

        /*NPolHighlighter.clear();
        NPolHighlighter.clearMarked();
       
        if (MAPCTRL) {
            MAPCTRL.unregisterOnDrawFinish("highlighttopo");
            MAPCTRL.clearTransient();
            MAPCTRL.clearTemporary();
           
            MAPCTRL.setMessenger(
                function(p_msg) {
                    MessagesController.setMessage(p_msg, "INFO");
                }
            );
            MAPCTRL.setWarner(
                function(p_msg) {
                    MessagesController.setMessage(p_msg, "WARN");
                }
            );           
        }*/
	}

}

function init_ui() {

	// Init UI não-ESRI


	/*================================
	*
	* Autocomplete
	*
	==================================*/

	// NOVO =======================================================


	AutocompleteObjMgr.add(Geocode_LocAutoCompleter(AJAX_ENDPOINTS.QRY, 3763, 
		{
			parentdiv: "loc_content",
			textentry: "loc_inputbox",
			cleanbutton: "loc_cleansearchbtn",
			recordsarea: "loc_resultlistarea"
		}
	));
	


	// ajustar ao tamanho disponível 
	sizeWidgets();

	// Titulo que se desvanece
	var titlefader = new DivFader("titlearea", TITLE_FADING_MSECS);
	titlefader.hideMessage(true);

	

}