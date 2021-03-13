

function SwitchingPanel(p_dom_elem, opt_display_attribute_str) {

    this.dom_elem = p_dom_elem;

	if (opt_display_attribute_str == null) {
		this.vis_display_attribute = "block";
	} else {
		this.vis_display_attribute = opt_display_attribute_str;
	}
	this.dom_elem.style.display = this.vis_display_attribute;
    
	this.setVisible = function(p_is_visible) {
		if (p_is_visible) {
			this.dom_elem.style.display = this.vis_display_attribute;
		} else {
			this.dom_elem.style.display = "none";
		}
	}
}

function SwitchingPanelCollection(p_collname) {

    this.collname = p_collname;
	this.panels = {};
	this.panelorder = [];
	this.active_panel = null;
	this.iterator_current_key = null;
	this._findPanel = function(p_panel_key) {
		if (Object.keys(this.panels).indexOf(p_panel_key) < 0) {
			return null;
		}
		return this.panels[p_panel_key];
	};
	/*this.getPanel = function(p_panel_key) {
		return this._findPanel(p_panel_key)
	};*/
	this.clear = function() {
		if (this.panelorder.length > 0) {
			this.panels = {};
			this.panelorder = [];
			this.active_panel = null;
			this.iterator_current_key = null;
		}
	};
	this.addPanel = function(p_panel_dom_elem, p_panel_key, b_first_isvisible, opt_display_attribute_str) {
		if (this._findPanel(p_panel_key) != null) {
			console.error("SwitchingPanelCollection - addPanel, panel already exists: %s", p_panel_key);
			return false;
		}
		this.panels[p_panel_key] = new SwitchingPanel(p_panel_dom_elem, opt_display_attribute_str);
		this.panelorder.push(p_panel_key);
		if (this.active_panel == null) {
			this.active_panel = this.panels[p_panel_key];
			this.active_panel.setVisible(b_first_isvisible);
		} else {
			this.panels[p_panel_key].setVisible(false);
		}
		return true;
	};
	this.activatePanel = function(p_panel_key) {
		if (this._findPanel(p_panel_key) == null) {
			console.error("SwitchingPanelCollection - activatePanel, missing panel: %s", p_panel_key);
			return false;
		}
		for (let k in this.panels) {
			if (k == p_panel_key) {
				this._findPanel(k).setVisible(true);
				this.active_panel = this._findPanel(k);
			} else {
				this._findPanel(k).setVisible(false);
			}
		}
		return true;
	};
	this.hideAllPanels = function() {
		for (let k in this.panels) {
			this._findPanel(k).setVisible(false);
		}
		return true;
	};
	this._showActivePanel = function(p_do_show) {
		if (this.active_panel != null) {
			this.active_panel.setVisible(true);
		} else {
			console.error("SwitchingPanelCollection "+this.collname+" showActivePanel: no active panel.");
		}
	};
	this.showActivePanel = function() {
		this._showActivePanel(true);
	};
	this.hideActivePanel = function() {
		this._showActivePanel(false);
	};

	// iterator

	this.resetIteration = function() {
		this.iterator_current_key = null;
	};

	this.getCurrentIteration = function() {
		let ret = null, idx, rec, prevkey=null, nextkey=null;

		if (this.iterator_current_key != null) {
			idx = this.panelorder.indexOf(this.iterator_current_key);
			rec = this._findPanel(this.iterator_current_key)
			if (idx < (this.panelorder.length-1)) {
				nextkey = this.panelorder[idx + 1];
			}
			if (idx > 0) {
				prevkey = this.panelorder[idx - 1];
			}
			if (rec != null) {
				ret = {
					is_first: (idx == 0),
					is_last: (idx == (this.panelorder.length-1)),
					key: this.iterator_current_key,
					prevkey: prevkey,
					nextkey: nextkey,
					content: rec
				}
			}
		}

		return ret;
	};

	this.iterateNext = function() {
		let idx, ret=null;
		if (this.iterator_current_key == null) {
			idx = 0;
		} else {
			idx = this.panelorder.indexOf(this.iterator_current_key) + 1;
		}

		if (idx < this.panelorder.length) {
			this.iterator_current_key = this.panelorder[idx];
			ret = this.getCurrentIteration();
		} else {
			this.iterator_current_key = null;
		}

		return ret;
	};
}


function RecordPanelSwitcher() {

	/*
	Class for switching pages of record oriented content.
	Each "record" is a collection of one or more "pages".
	Only one "page", from either of the existing "records", is visible at any time. 
	*/

	this.recordorder = [],
	this.iterator_current_key = null,
	this.rotator_current_key = null,
	this.registos_fmt = "";
	this.max_attrs_per_page = 20;
	this.records = {
	};

	this.recKey = function(p_recnum) {
		const rn = formatPaddingDigits(p_recnum,0,4)	
		return "rec" + rn;
	};

	this.isRecKey = function(p_key) {
		return p_key.indexOf("rec") == 0;
	};

	this.pageKey = function(p_pgnum) {
		const rn = formatPaddingDigits(p_pgnum,0,4)	
		return "page" + rn;
	};

	this.clear = function() {
		if (this.recordorder.length > 0) {
			this.records = {};
			this.recordorder = [];
			this.iterator_current_key = null;
		}
	};

	this._findRecord = function(p_reckey) {
		ret = null;

		if (Object.keys(this.records).indexOf(p_reckey) >= 0) {
			ret = this.records[p_reckey];
		}

		return ret;
	};

	this.newRecord = function(p_reckey) {
		if (this._findRecord(p_reckey) != null) {
			console.error("PanelSwitcher - newRecord, record already exists = %s", p_reckey);
			return false;
		}

		this.records[p_reckey] = new SwitchingPanelCollection(p_reckey);
		this.recordorder.push(p_reckey);

		return true;
	};

	this.addPanel = function(p_reckey, p_panel_dom_elem, p_panel_key, opt_display_attribute_str) {
		const rec = this._findRecord(p_reckey);
		if (rec == null) {
			console.error("PanelSwitcher - addPanel, record does not exist = %s", p_reckey);
			return false;
		}
		let first_isvisible = true;
		if (Object.keys(this.records).length > 1) {
			// subsequent records first page is active but not visible
			first_isvisible = false;
		}
		return rec.addPanel(p_panel_dom_elem, p_panel_key, first_isvisible, opt_display_attribute_str);
	};

	this.activatePanel = function(p_reckey, p_panel_key) {

		const rec = this._findRecord(p_reckey)
		if (rec == null) {
			console.error("PanelSwitcher - activatePanel, record does not exist: %s", p_reckey);
			return false;
		}

		let ret = false;
		let tmp_rec = null;

		for (let tmp_rec_key in this.records) {

			tmp_rec = this.records[tmp_rec_key];
			if (tmp_rec_key == p_reckey) {
				tmp_rec.activatePanel(p_panel_key);
			} else {
				tmp_rec.hideAllPanels();
			}

		}

		return ret;
	};

	this.showActivePanel = function(p_reckey) {
		const rec = this._findRecord(p_reckey)
		if (rec == null) {
			console.error("PanelSwitcher - showActivePanel, record does not exist: %s", p_reckey);
			return false;
		}

		rec.showActivePanel();
	};

	this.resetIteration = function() {
		this.iterator_current_key = null;
	};

	this._getCurrentRecord = function(p_is_iteration_or_rotation) {

		let ret = null, rec, currkey, prevreckey=null, nextreckey=null;

		if (p_is_iteration_or_rotation) {
			currkey = this.iterator_current_key;
		} else {
			currkey = this.rotator_current_key;
			if (currkey == null) {
				this.rotator_current_key = this.recordorder[0];
				currkey = this.rotator_current_key;
			}
		}

		if (currkey != null) {
			idx = this.recordorder.indexOf(currkey);
			rec = this._findRecord(currkey)
			if (idx < (this.recordorder.length-1)) {
				nextreckey = this.recordorder[idx + 1];
			}
			if (idx > 0) {
				prevreckey = this.recordorder[idx - 1];
			}		
			if (rec != null) {
				ret = {
					is_first: (idx == 0),
					is_last: (idx == (this.recordorder.length-1)),
					reckey: currkey,
					prevreckey: prevreckey,
					nextreckey: nextreckey,
					content: rec
				}
			}
		}

		return ret;
	};

	this.getCurrentIteration = function() {
		return this._getCurrentRecord(true);
	};

	this.iterateNext = function() {

		let idx = null;
		let ret = null;
		if (this.iterator_current_key == null) {
			idx = 0;
		} else {
			idx = this.recordorder.indexOf(this.iterator_current_key) + 1;
		}

		if (idx < this.recordorder.length) {
			this.iterator_current_key = this.recordorder[idx];
			ret = this.getCurrentIteration();
		} else {
			this.iterator_current_key = null;
		}

		return ret;
	};

	// rotation

	this.resetRotation = function() {
		if (this.recordorder.length > 0) {
			this.rotator_current_key = this.recordorder[0];
		}
	};

	this.rotateToEnd = function() {
		if (this.recordorder.length > 0) {
			this.rotator_current_key = this.recordorder[this.recordorder.length-1];
		}
	};

	this.getCurrentRotation = function() {
		return this._getCurrentRecord(false);
	};

	this.rotateNext = function() {
		let num=-1, ret = this.getCurrentRotation();
		if (ret == null) {
			console.warn("RecordPanelSwitcher: rotateNext failed, no 'current rotation' before rotate");
		} else {
			ret.content.hideAllPanels();
			if (ret.nextreckey!=null) {
				this.rotator_current_key = ret.nextreckey;
			} else {
				this.resetRotation(); 
			}
			ret = this.getCurrentRotation();
			if (ret == null) {
				console.warn("RecordPanelSwitcher: rotateNext failed, no 'current rotation' after rotate");
			} else {
				ret.content.showActivePanel();
			}
			num = this.recordorder.indexOf(this.rotator_current_key) + 1;
		}
		return num;
	};

	this.rotatePrev = function() {
		let num=-1, ret = this.getCurrentRotation();
		if (ret == null) {
			console.warn("RecordPanelSwitcher: rotatePrev failed, no 'current rotation' before rotate");
		} else {
			ret.content.hideAllPanels();
			if (ret.prevreckey!=null) {
				this.rotator_current_key = ret.prevreckey;
			} else {
				this.rotateToEnd(); 
			}
			ret = this.getCurrentRotation();
			if (ret == null) {
				console.warn("RecordPanelSwitcher: rotatePrev failed, no 'current rotation' after rotate");
			} else {
				ret.content.showActivePanel();
			}
			num = this.recordorder.indexOf(this.rotator_current_key) + 1;
		}
		return num;
	};

	this.generatePanels = function(p_records, p_attrs_cfg, p_parentdiv_id, p_heightv) {
	
		if (!p_records.length) {
			return;
		}

		const resultsDiv = document.getElementById(p_parentdiv_id);
		if (resultsDiv == null) {
			console.warn("RecordPanelSwitcher: generatePanels, parent div not found:", p_parentdiv_id);
			return;
		}

		resultsDiv.style.height = p_heightv;

		while (resultsDiv.firstChild) {
			resultsDiv.removeChild(resultsDiv.firstChild);
		}

		if (p_records.length>1) {

			// abrir espaço para inserir botões de navegação entre registos
			const navDiv = document.createElement("div");
			resultsDiv.appendChild(navDiv);
			navDiv.setAttribute("class", "navdiv");

			const navInnerDiv = document.createElement("div");
			navDiv.appendChild(navInnerDiv);
			navInnerDiv.setAttribute("class", "graybtn recnav-container");
			
			let btEl = document.createElement("button");
			btEl.setAttribute("class", "left-arrow");
			navInnerDiv.appendChild(btEl);
			let spEl = document.createElement("div");
			btEl.appendChild(spEl);
			(function(p_btEl, p_rec_rps, p_nrows) {
				attEventHandler(p_btEl, 'click', 
					function(evt) {
						const num = p_rec_rps.rotatePrev();
						const el = document.getElementById("rec-nav-nums");
						if (el) {
							el.textContent = String.format(p_rec_rps.registos_fmt, num, p_nrows);
						}
					}
				);							
			})(btEl, this, p_records.length);

			spEl = document.createElement("div");
			spEl.setAttribute("id", "rec-nav-nums");
			navInnerDiv.appendChild(spEl);
			spEl.textContent = String.format(this.registos_fmt, 1, p_records.length);

			btEl = document.createElement("button");
            btEl.setAttribute("class", "right-arrow");
            navInnerDiv.appendChild(btEl);
            spEl = document.createElement("div");
            btEl.appendChild(spEl);
            (function(p_btEl, p_rec_rps, p_nrows) {
                attEventHandler(p_btEl, 'click',
                    function(evt) {
                        const num = p_rec_rps.rotateNext();
                        const el = document.getElementById("rec-nav-nums");
                        if (el) {
                            el.textContent = String.format(p_rec_rps.registos_fmt, num, p_nrows);
                        }
                    }
                );                           
            })(btEl, this, p_records.length);
		}

		let ulEl, reckey, pagekey, pageNum, liEl, pageDiv, pgNavDiv, attrs_per_page_cnt;
		let lbl, fmt, preval, val, d;

		for (let i=0; i<p_records.length; i++) {
						
			reckey = this.recKey(i+1);
			pageNum = 0;
			ulEl = null;
			pageDiv = null;
			attrs_per_page_cnt = 0;

			pagekey = this.pageKey(pageNum+1)
			this.newRecord(reckey);
			
			for (let fld in p_attrs_cfg) {

				lbl = p_attrs_cfg[fld][0];
				fmt = p_attrs_cfg[fld][1];
				preval = p_records[i][fld];

				if (preval == null || preval.length==0) {
					continue;
				}

				switch (fmt) {
					case 'date':
						d = new Date(0);
						d.setUTCSeconds(preval / 1000);
						val = d.toLocaleDateString();
						break;

					default:
						val = preval;
				}

				if (pageDiv == null || attrs_per_page_cnt >= this.max_attrs_per_page) {	
					if (pageDiv) {
						this.addPanel(reckey, pageDiv, pagekey);
						pageNum++;
						pagekey = this.pageKey(pageNum+1);
						attrs_per_page_cnt = 0;
					}
					pageDiv = document.createElement("div");	
					resultsDiv.appendChild(pageDiv);				
					ulEl = document.createElement("ul");
					pageDiv.appendChild(ulEl);				
					ulEl.setAttribute("class", "attrs-list");
				}
				
				liEl = document.createElement("li");
				ulEl.appendChild(liEl);
				liEl.setAttribute("class", "nobull");
				liEl.insertAdjacentHTML('afterBegin', lbl);
				spEl = document.createElement("span");
				spEl.setAttribute("style", "float: right");
				spEl.textContent = val;
				liEl.appendChild(spEl);

				attrs_per_page_cnt++;
			}
			// todo - não fazer se n houver conteudo
			if (pageDiv != null) {
				this.addPanel(reckey, pageDiv, pagekey);
			}

		} // for row in  rows
		// atualizar mensagem "1 de n registos"

		let recPanels, recpaneliter, recpanel_count;

		this.resetIteration(); 
		let recpanelcoll = this.iterateNext();
		while (recpanelcoll) {

			recPanels = recpanelcoll.content;
			recPanels.resetIteration(); 
			recpaneliter = recPanels.iterateNext();
			recpanel_count = 0;

			while (recpaneliter && recpanel_count < 50) {

				recpanel_count++;
				pgNavDiv = document.createElement("div");
				recpaneliter.content.dom_elem.appendChild(pgNavDiv);
				pgNavDiv.setAttribute("class", "pagenavdiv");

				const largerbtnDiv = document.createElement("div");
				pgNavDiv.appendChild(largerbtnDiv);
				largerbtnDiv.setAttribute("class", "graybtn larger-button-pagenav-left");	


				spEl = document.createElement("div");
				spEl.setAttribute("id", "rec-nav-nums");
				navInnerDiv.appendChild(spEl);
				spEl.textContent = String.format(this.registos_fmt, 1, p_records.length);

				

				// inserir botões de navegação entre páginas do mesmo registo
				if (!recpaneliter.is_first) {
					btEl = document.createElement("button");
					btEl.setAttribute("class", "left-arrow");
					largerbtnDiv.appendChild(btEl);
					spEl = document.createElement("div");
					largerbtnDiv.appendChild(spEl);
					spEl.textContent = "Página anterior";
					(function(p_btEl, p_rec_rps, p_reckey, p_panelkey) {
						attEventHandler(p_btEl, 'click', 
							function(evt) {
								p_rec_rps.activatePanel(p_reckey, p_panelkey);
							}
						);							
					})(largerbtnDiv, this, recpanelcoll.reckey, recpaneliter.prevkey);
				}
				if (!recpaneliter.is_last) {
					btEl = document.createElement("button");
					btEl.setAttribute("class", "graybtn right-arrow");
					pgNavDiv.appendChild(btEl);
					spEl = document.createElement("div");
					btEl.appendChild(spEl);
					spEl.textContent = "Página seguinte";
					(function(p_btEl, p_rec_rps, p_reckey, p_panelkey) {
						attEventHandler(p_btEl, 'click', 
							function(evt) {
								p_rec_rps.activatePanel(p_reckey, p_panelkey);
							}
						);							
					})(btEl, this, recpanelcoll.reckey, recpaneliter.nextkey);
				}
				recpaneliter = recPanels.iterateNext();
			}
			recpanelcoll = this.iterateNext();
		}		
	};

};

/*

	CSS Classes:

	- navdiv
	- graybtn 
	- just-right
	- left-arrow
	- rec-nav-nums
*/