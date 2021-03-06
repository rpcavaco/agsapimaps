

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
	this.active_panel = null;
	this._findPanel = function(p_panel_key) {
		if (Object.keys(this.panels).indexOf(p_panel_key) < 0) {
			return null;
		}
		return this.panels[p_panel_key];
	};
	/*this.getPanel = function(p_panel_key) {
		return this._findPanel(p_panel_key)
	};*/
	this.addPanel = function(p_panel_dom_elem, p_panel_key, opt_display_attribute_str) {
		if (this._findPanel(p_panel_key) != null) {
			console.warn("SwitchingPanelCollection - addPanel, panel already exists: %s", p_panel_key);
			return false;
		}
		this.panels[p_panel_key] = SwitchingPanel(p_panel_dom_elem, opt_display_attribute_str);
		return true;
	};
	this.activatePanel = function(p_panel_key) {
		if (this._findPanel(p_panel_key) == null) {
			console.warn("SwitchingPanelCollection - activatePanel, missing panel: %s", p_panel_key);
			return false;
		}
		for (let k in this.panels) {
			if (k == p_panel_key) {
				this._findPanel(k).setVisible(true);
				this.active_panel = k;
			} else {
				this._findPanel(k).setVisible(false);
			}
		}
		return true;
	};
	this.deactivateAllPanels = function() {
		for (let k in this.panels) {
			this._findPanel(k).setVisible(false);
		}
		return true;
	};
	/*this.showActive = function(p_do_show) {
		if (this.active_panel != null) {
			this.active_panel.setVisible(p_do_show);
		}
	}*/
}

var PanelSwitcherSingleton = {

	collections = {
		"non_excluding": {

		}
	},

	_findColl: function(p_collname, opt_mutual_excluding_group) {
		ret = null;
		if (opt_mutual_excluding_group) {
			if (Object.keys(this.collections).indexOf(opt_mutual_excluding_group) >= 0) {
				if (Object.keys(this.collections[opt_mutual_excluding_group]).indexOf(p_collname) >= 0) {
					ret = this.collections[opt_mutual_excluding_group][p_collname];
				}
			}
		} else {
			if (Object.keys(this.collections["non_excluding"]).indexOf(p_collname) >= 0) {
				ret = this.collections["non_excluding"][p_collname];
			}
		}

		return ret;

	},

	newCollection: function(p_collname, opt_mutual_excluding_group) {
		if (this._findColl(p_collname, opt_mutual_excluding_group) != null) {
			console.warn("PanelSwitcher - newCollection, collection already exists: %s, mutual excl.group: %s", p_collname, opt_mutual_excluding_group);
			return false;
		}
		if (opt_mutual_excluding_group) {
			if (Object.keys(this.collections).indexOf(opt_mutual_excluding_group) < 0) {
				console.warn("PanelSwitcher - newCollection, no mutual excl.group: %s", opt_mutual_excluding_group);
				return false;
			}
			this.collections[opt_mutual_excluding_group][p_collname] = SwitchingPanelCollection(p_collname);
		} else {
			this.collections["non_excluding"][p_collname] = SwitchingPanelCollection(p_collname);
		}
		return true;
	},

	addPanel: function(p_collname, p_panel_dom_elem, p_panel_key, opt_mutual_excluding_group) {
		const coll = this._findColl(p_collname, opt_mutual_excluding_group)
		if (coll == null) {
			console.warn("PanelSwitcher - addPanel, collection does not exist: %s, mutual excl.group: %s", p_collname, opt_mutual_excluding_group);
			return false;
		}
		return coll.addPanel(p_panel_dom_elem, p_panel_key);
	},

	activatePanel: function(p_collname, p_panel_key, opt_mutual_excluding_group) {

		const coll = this._findColl(p_collname, opt_mutual_excluding_group)
		if (coll == null) {
			console.warn("PanelSwitcher - activatePanel, collection does not exist: %s, mutual excl.group: %s", p_collname, opt_mutual_excluding_group);
			return false;
		}

		let ret = false;
		let tmp_coll = null;
		if (opt_mutual_excluding_group != null && opt_mutual_excluding_group != "non_excluding") {
			for (let tmp_coll_key in this.collections[opt_mutual_excluding_group]) {
				tmp_coll = this.collections[tmp_coll_key];
				if (tmp_coll_key == p_collname) {
					tmp_coll.activatePanel(p_panel_key);
				} else {
					tmp_coll.deactivateAllPanels();
				}
			}
		} else {
			ret = coll.activatePanel(p_panel_key);
		}

		return ret;
	}


};