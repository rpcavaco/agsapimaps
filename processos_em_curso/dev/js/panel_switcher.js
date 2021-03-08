

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
		console.log("adding record panel, rec:"+p_reckey+" pan.key:"+p_panel_key)
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
		console.log("     first_isvisible:",first_isvisible);
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
};