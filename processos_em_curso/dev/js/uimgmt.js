
function fadeoutAnimFrame(p_element, p_timeextent, p_finalcallback) {

	let start = null;
	let op = 1;
	
	p_element.style.display = 'block';
	p_element.style.filter = 'none';
    p_element.style.opacity = 1;
	
	function step(timestamp) {

		if (start==null) {
			start = timestamp;
		}
		const elapsed = timestamp - start;
		op = 1 - (elapsed / p_timeextent);

        p_element.style.opacity = op;
        p_element.style.filter = 'alpha(opacity=' + op * 100 + ")";

		if (elapsed < p_timeextent) { 
			window.requestAnimationFrame(step);
		} else {
            p_element.style.display = 'none';
            if (p_finalcallback) {
				p_finalcallback();
			}
		}	

	}

	window.requestAnimationFrame(step);
}

function DivFader(p_elemid, p_timeextent, opt_ext_finalize) { // p_fadingheartbeat) {
	
	// Constantes
	// MessagesControllerParams é especifico de cada aplicação, deve estar no init-xxxx.js
	this.elemid = null;
	this.timeextent = 0;
	
	this.isvisible = false;
	this.inited = false;
	this.init = function() {

		if (this.inited) {
			return;
		}
		var msgsdiv = document.getElementById(this.elemid);
		
		if (msgsdiv) {
			attEventHandler(msgsdiv, 'click',
				function(evt) {
					MessagesController.hideMessage(true);
					return finishEvent(evt);
				}
			);
		}
		this.inited = true;
	};
	this.setup = function(p_elemid, p_timeextent, opt_ext_finalize) {  // p_fadingheartbeat) {
		this.elemid = p_elemid;
		this.isvisible = true;
		this.timeextent = p_timeextent;
		this.ext_finalize = opt_ext_finalize;
		
		this.init();
	};
	this.finalize = function() {
		this.isvisible = false;
		if (this.ext_finalize) {
			this.ext_finalize();
		}
	};
	
	this.hideMessage = function(do_fadeout) {
		if (!this.isvisible) {
			return;
		}
		var msgsdiv = document.getElementById(this.elemid);

		if (do_fadeout) {
			fadeoutAnimFrame(msgsdiv, 
							this.timeextent,
							this.finalize);
		} else {
			if (msgsdiv!=null) {
				msgsdiv.style.display = 'none';
			}
			this.finalize();
		}
	};
	
	this.setup(p_elemid, p_timeextent, opt_ext_finalize);  
}

function changeAtrribution(p_nodes) {
	if (p_nodes!=null && p_nodes.length > 0) {
		var node = p_nodes[0];
		if (ATTR_TEXT != null && node.innerText.indexOf("ower") > 0) {
			node.innerText = ATTR_TEXT;
		}
	}
}

function showLoaderImg() {
	document.getElementById("loading").style.display = "block";
}

function hideLoaderImg() {
	document.getElementById("loading").style.display = "none";	
}

function sizeWidgets() {

	let winsize = {
		width: window.innerWidth || document.body.clientWidth,
		height: window.innerHeight || document.body.clientHeight,
	};
	//var minified_boxes = false;

	const width_limit = 490;
	
	let wdg = document.getElementById("loc_inputbox");
	let wdg2 = document.getElementById("loc_resultlistarea");

	if (wdg!=null && wdg2!=null) {       
		let w;
		if (parseInt(winsize.width) > 1200) {       
			w = '450px';
		} else if (parseInt(winsize.width) > 530) {       
			w = '350px';
		} else if (parseInt(winsize.width) > 430) {       
			w = '265px';
		} else {       
			w = '180px';
		}       
		wdg.style.width = w;
		wdg2.style.width = w;
	}       

	wdg = document.getElementById("loc_cleansearchbtn");	
	if (wdg) {
		if (parseInt(winsize.width) > width_limit) {
			wdg.style.fontSize = '14px';
			wdg.style.width = '90px';
		} else {
			wdg.style.fontSize = '12px';
			wdg.style.width = '40px';	
		}				
	}
	
	wdg = document.getElementById("loc_content");	
	if (wdg)  {
		if (parseInt(winsize.width) > width_limit) {
			wdg.style.left = '180px';
		} else {
			wdg.style.left = '40px';
		}				
	}
	
	wdg = document.getElementById("logo");	
	if (wdg)  {
		if (parseInt(winsize.width) > width_limit) {
			wdg.style.display = 'block';
		} else {
			wdg.style.display = 'none';
		}				
	}
}

class Geocode_LocAutoCompleter extends LocAutoCompleter {
	constructor(
			p_url,
			p_srid,
			p_widgets
		) {
		super("geocode", p_url,
			{
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

		if (typeof QueriesMgr != 'undefined') {
			QueriesMgr.clearResults();
		}

		if (typeof LayerInteractionMgr != 'undefined') {
			LayerInteractionMgr.clearFunc();
		}


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
	AutocompleteObjMgr.add(new Geocode_LocAutoCompleter(AJAX_ENDPOINTS.QRY, 3763, 
		{
			parentdiv: "loc_content",
			textentry: "loc_inputbox",
			cleanbutton: "loc_cleansearchbtn",
			recordsarea: "loc_resultlistarea"
		}
	));

	AutocompleteObjMgr.bindEventHandlers();

	// ajustar ao tamanho disponível 
	sizeWidgets();

	// Titulo que se desvanece
	var titlefader = new DivFader("titlearea", TITLE_FADING_MSECS, 
		function() {
			const lc = document.getElementById("loc_inputbox");
			if (lc) {
				lc.style.visibility = "visible";
			}
		}
	);
	titlefader.hideMessage(true);
}

(function() {
	init_ui();
})();

