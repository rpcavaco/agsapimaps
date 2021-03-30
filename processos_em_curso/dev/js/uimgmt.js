
function changeAtrribution(p_nodes) {
	let mode = sizeWidgetsMode();
	if (p_nodes!=null && p_nodes.length > 0) {
		var node = p_nodes[0];
		if (node.innerText.indexOf("ower") > 0) {
			if (mode < 3) {
				if (ATTR_TEXT_MIN != null) {
					node.innerText = ATTR_TEXT_MIN;
				}
			} else {
				if (ATTR_TEXT != null) {
					node.innerText = ATTR_TEXT;
				}
			}
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

	let mode = sizeWidgetsMode();
	
	let wdg = document.getElementById("loc_inputbox");
	let wdg3, wdg2 = document.getElementById("loc_resultlistarea");
	wdg3 = document.getElementById("loc_content");

	if (wdg!=null && wdg2!=null) {       
		let mcw, w;
		if (mode == 4) {       
			w = '450px';
			mcw = '480';
		} else if (mode == 3) {       
			w = '350px';
			mcw = '400';
		} else if (mode == 2) {       
			w = '280px';
			mcw = '280';
		} else {       
			w = '270px';
			mcw = '250';
		}       
		wdg.style.width = w;
		wdg2.style.width = w;
		MessagesController.width = mcw;
	} 

	let v;
	if (mode > 2) {
		v = 200;
	} else {
		v = 55;
	}
	MessagesController.left = v;
	wdg3.style.left = v + "px";

	MessagesController.reshape();

	wdg = document.getElementById("loc_cleansearchbtn");	
	if (wdg) {
		if (mode > 2) {
			wdg.style.fontSize = '14px';
			wdg.style.width = '90px';
		} else {
			wdg.style.fontSize = '12px';
			wdg.style.width = '46px';	
		}				
	}
	
	wdg = document.getElementById("logo");	
	if (wdg)  {
		if (mode > 2) {
			wdg.style.display = 'block';
		} else {
			wdg.style.display = 'none';
		}				
	}

	wdg = document.getElementById("gridDiv");	
	if (wdg)  {
		if (mode > 2) {
			wdg.style.width = '485px';
		} else {
			wdg.style.width = '270px';
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

	altQueriesHandler(p_trimmed_qrystr) {
	
		const notTopoRegEx = new RegExp("(nud|nup|p|alv|\\d+)\/", 'i');
		const nupRegEx = new RegExp("^(nud|nup|p)\/\\d{3,8}\/\\d{2,4}", 'i');
		const alvCMPEx = new RegExp("^alv\/\\d{1,8}\/\\d{2,4}\/(dmu|cmp)", 'i');
		const alvSRUEx = new RegExp("^\\d{3,8}\/\\d{2,4}\/sru", 'i');
		if (notTopoRegEx.test(p_trimmed_qrystr)) {
			this.emptyCurrentRecords();
			if (nupRegEx.test(p_trimmed_qrystr)) {
				QueriesMgr.executeQuery("byDoc", [ p_trimmed_qrystr ], true);
			}
			if (alvCMPEx.test(p_trimmed_qrystr)) {
				QueriesMgr.executeQuery("byDoc", [ p_trimmed_qrystr ], true);
			}
			if (alvSRUEx.test(p_trimmed_qrystr)) {
				QueriesMgr.executeQuery("byDoc", [ p_trimmed_qrystr ], true);
			}
			return false;
			
		}
		return true;		
	}
					
	

}


function initialAnimation () {
	
	this.winsize = {
		width: window.innerWidth || document.body.clientWidth,
		height: window.innerHeight || document.body.clientHeight,
	};
	
	this.init_offset_x = 0.3;
	this.hinge = {
			x: 0.7, y: 0.98
		};
	this.m1 = - (1 - this.hinge.y) / (this.hinge.x - this.init_offset_x);
	this.m2 = - this.hinge.y / (1 - this.hinge.x),
	this.b1 = 1 - (m1 * this.init_offset_x), 
	this.b2 = this.hinge.y - (m2 * this.hinge.x)
	
	this.rnd = function(p_val) {
		return p_val; // Math.round(p_val * 100) / 100;
	}
	
	this.stepperq = function(p_elapsedq) {
		let ret = this.rnd(this.b1 + this.m1 * p_elapsedq);
		if (ret <= this.hinge.y) {
			ret =  this.rnd(this.b2 + this.m2 * p_elapsedq);
		}
		return ret;
	};
	
	this.topfunc = function(p_elapsedq) {
		const maxv = (this.winsize.height - (this.winsize.height / 4)) / 2.0;
		const minv = 12;
		
		let ret = minv + (maxv-minv) * this.stepperq(p_elapsedq);
		return (ret < minv ? minv : ret).toString() + "px";		
	};
		
	this.widfunc = function(p_elapsedq) {
		const maxw = this.winsize.width / 6;
		const minw = 130;
		
		let ret = minw + (maxw-minw) * this.stepperq(p_elapsedq);
		return (ret < minw ? minw : ret).toString() + "px";		
	};

	this.leftfunc = function(p_elapsedq) {
		let mode = sizeWidgetsMode();
		let maxv, minv;
		if (mode > 2) {
			maxv = (this.winsize.width - (this.winsize.width / 4)) / 2.0;
			minv = 60;
		} else {
			maxv = 70;
			minv = 60;
		}
		
		let ret = minv + (maxv-minv) * this.stepperq(p_elapsedq);
		return (ret < minv ? minv : ret).toString() + "px";		
	};

	this.fntszfunc = function(p_elapsedq) {
		let maxv;
		const minv = 22;
		
		let mode = sizeWidgetsMode();
		if (mode > 2) {
			maxv = 42;
		} else {
			maxv = 34;
		}
		
		let ret = minv + (maxv-minv) * this.stepperq(p_elapsedq);
		return (ret < minv ? minv : ret).toString() + "px";		
	};

	this.clrfunc = function(p_elapsedq) {
		const clr1 = "#fff";
		const clr2 = "#6b80b5";
		const clr3 = "#0f2f7e";
		
		if (this.stepperq(p_elapsedq) < 0.5) {
			return clr3;
		} else if (this.stepperq(p_elapsedq) < 0.8) {
			return clr2;
		} else {
			return clr1;
		}
	};

	this.animItems = {
		"logofloater": {
			"top": function(p_elapsedq) {
				return this.topfunc(p_elapsedq);
			},
			"left": function(p_elapsedq) {
				return this.leftfunc(p_elapsedq);
			},
			"font-size": function(p_elapsedq) {
				return this.fntszfunc(p_elapsedq);
			}
			
		},
		"logo": {
			/* "top": function(p_elapsedq) {
				return this.topfunc(p_elapsedq);
			},
			"left": function(p_elapsedq) {
				return this.leftfunc(p_elapsedq);
			}, */
			"width": function(p_elapsedq) {
				return this.widfunc(p_elapsedq);
			}
			
		},
		"logotxt": {
			"color": function(p_elapsedq) {
				return this.clrfunc(p_elapsedq);
			}
			
		},

	};
		
	
	this.run = function() {
		
		let start = null;
		const p_timeextent = INITIAL_ANIM_MSECS;

		function execanimstep(p_elapsedq) {		
			let f, wdg;
			for (let k in this.animItems) {
				wdg = document.getElementById(k);
				if (wdg == null) {
					break;
				}
				for (let prop in this.animItems[k]) {
					f = this.animItems[k][prop];
					wdg.style[prop] = f(p_elapsedq);
				}
			}
		}
		
		function finalstep() {
			execanimstep(1);
			const l = [
				["logotxt", false],
				["legDiv", true],
				["legDivCloser", true],
				["gridDivContainer", true],
				["loading", true],
				["loc_inputbox", true]
			];
			for (let w,i=0; i<l.length; i++) {
				w = document.getElementById(l[i][0]); 
				if (w) {
					w.style.visibility = l[i][1] ? "visible" : "hidden";
				}
			}
			
			MessagesController.setMessage(INTRO_MSG, true);
		}
		
		function animstep(timestamp) {
			if (start==null) {
				start = timestamp;
			}
			const elapsed = timestamp - start;
			let elapsedq = elapsed / p_timeextent;
			
			elapsedq = (elapsedq <= 1 ? elapsedq : 1);		
			execanimstep(elapsedq);

			if (elapsed <= p_timeextent) { 
				window.requestAnimationFrame(animstep);
			} else {
				finalstep();
			}	

		}
		window.requestAnimationFrame(animstep);
	};
	
	this.run();

	
}

var MessagesController = {
	
	// Constantes
	elemid: "msgsdiv",
	minwidth: 300,
	maxwidth: 550,
	messageTimeout: MSG_TIMEOUT_SECS * 1000,
	shortMessageTimeout: MSG_TIMEOUT_SECS * 500,
	charwidth: 10,
	padding: 26,
	rowheight: 28,
	
	messageText: "",
	lines: 0,
	width: 0,
	height: 0,
	isvisible: false,
	timer: null,
	
	reshape: function() {
		
		if (!this.isvisible) {
			return;
		}
		
		var msgsdiv = document.getElementById(this.elemid);

		// this.height = msgsdiv.clientHeight;

		msgsdiv.style.width = this.width + 'px';
		//msgsdiv.style.height = this.height + 'px';
		//msgsdiv.style.top = this.top + 'px';
		msgsdiv.style.left = this.left + 'px';
	},
	
	
	setMessage: function(p_msg_txt, p_is_timed, p_is_warning) {
		this.messageText = p_msg_txt;
		var iconimg=null, msgsdiv = document.getElementById(this.elemid);
		if (this.timer != null) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		if (msgsdiv!=null) {

			while (msgsdiv.firstChild) {
				msgsdiv.removeChild(msgsdiv.firstChild);
			}			
			iconimg = document.createElement("img");
			if (p_is_warning) {
				iconimg.src = "media/warning-5-32.png";
			} else {
				iconimg.src = "media/info-3-32.png";
			}

			msgsdiv.appendChild(iconimg);
			
			var p = document.createElement("p");
			//var cont = document.createTextNode(this.messageText);
			//p.appendChild(cont);
			p.insertAdjacentHTML('afterBegin', this.messageText);
			msgsdiv.appendChild(p);
			
			msgsdiv.style.display = '';
			msgsdiv.style.opacity = 1;
			this.isvisible = true;
		}
		this.reshape();

		let tmo;
		if (p_is_timed) {
			if (p_is_warning) {
				tmo = this.shortMessageTimeout;
			} else {
				tmo = this.messageTimeout;
			}
			this.timer = setTimeout(function() { MessagesController.hideMessage(true); }, tmo);
		}
	},
	
	hideMessage: function(do_fadeout) {
		if (!this.isvisible) {
			return;
		}
		this.timer = null;
		var msgsdiv = document.getElementById(this.elemid);
		this.isvisible = false;
		if (do_fadeout) 
		{
			fadeout(msgsdiv);
		} 
		else 
		{
			if (msgsdiv!=null) {
				msgsdiv.style.display = 'none';
			}
		}
	}  	
}

function legend_viz(p_doshow) {
	const w1 = document.getElementById("legDivCloser");
	const w2 = document.getElementById("legDiv");
	if (w1!=null && w2!=null) {
		if (p_doshow) {
			w1.classList.remove("closed");
			w1.classList.add("opened");
			w2.style.visibility = "visible";
		} else {
			w1.classList.remove("opened");
			w1.classList.add("closed");
			w2.style.visibility = "hidden";
		}
	}
}

function legend_viz_toggle(p_this_elem) {
	const doshow = ! p_this_elem.classList.contains("opened"); 
	legend_viz(doshow);
}

function init_ui() {
	// Init UI não-ESRI
	AutocompleteObjMgr.add(new Geocode_LocAutoCompleter(AJAX_ENDPOINTS.locqry, VIEW_SRID, 
		{
			parentdiv: "loc_content",
			textentry: "loc_inputbox",
			cleanbutton: "loc_cleansearchbtn",
			recordsarea: "loc_resultlistarea"
		}
	));

	AutocompleteObjMgr.bindEventHandlers();

	// mouse click sobre a mensagem flutuante fecha-a
	attEventHandler('msgsdiv', 'click',
		function(evt) {
			MessagesController.hideMessage(true);
		}
	);

	attEventHandler('help_icon', 'click',
		function(evt) {
			MessagesController.setMessage(HELP_MSG, false);
		}
	);
		
	attEventHandler('legDivCloser', 'click',
		function(evt) {
			legend_viz_toggle(this); 
		}
	);
		

	// ajustar ao tamanho disponível 
	sizeWidgets();

	initialAnimation();
	
}

(function() {
	init_ui();
})();

