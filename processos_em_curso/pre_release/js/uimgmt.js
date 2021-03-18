
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
		return (ret < minv ? minv : ret);		
	};
		
	this.widfunc = function(p_elapsedq) {
		const maxw = this.winsize.width / 6;
		const minw = 130;
		
		let ret = minw + (maxw-minw) * this.stepperq(p_elapsedq);
		return (ret < minw ? minw : ret);		
	};

	this.leftfunc = function(p_elapsedq) {
		const maxv = (this.winsize.width - (this.winsize.width / 4)) / 2.0;
		const minv = 60;
		
		let ret = minv + (maxv-minv) * this.stepperq(p_elapsedq);
		return (ret < minv ? minv : ret);		
	};

	this.fntszfunc = function(p_elapsedq) {
		const maxv = 42;
		const minv = 22;
		
		let ret = minv + (maxv-minv) * this.stepperq(p_elapsedq);
		return (ret < minv ? minv : ret);		
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
					wdg.style[prop] = f(p_elapsedq) + "px";
				}
			}
		}
		
		function finalstep() {
			execanimstep(1);
			const l = [
				["logotxt", false],
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

	initialAnimation();

	

}

(function() {
	init_ui();
})();

