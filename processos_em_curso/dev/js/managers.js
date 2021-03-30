
var QueriesMgr = {
	
	queries: {},
	mapView: null,
	xhr: null, 
	resultsLayers: {
		point: null,
		polyline: null,
		polygon: null
	},

	clearResults: function(opt_type) {
		let lyr;
		if (opt_type != null) {
            if (Object.keys(this.resultsLayers).indexOf(opt_type) >= 0) {
                lyr = this.resultsLayers[opt_type];
                if (lyr) {
                    lyr.removeAll();
                }
            }
        } else {
            for (let k in this.resultsLayers) {
                lyr = this.resultsLayers[k];
                if (lyr) {
					lyr.removeAll();
                }
            }
        }
	},

	displayResults: function(p_results, p_symb, p_qrykey, b_show_attrs, opt_where_txt, opt_adic_callback) {

		/*if (p_results.features.length > 0) {
			console.log(p_results.features[0]);
			console.log(JSON.stringify(p_results.features[0]));
		};*/

		
		const features = p_results.features.map(function(graphic) {
			if (graphic.geometry.type == "polyline" || graphic.geometry.type == "polygon") {
				graphic.symbol = p_symb.line;
			} else {
				graphic.symbol = p_symb.marker;
			}
			return graphic;
		});

		if (opt_adic_callback) {
			opt_adic_callback(p_qrykey, p_results);
		}

		this.displayFeats(features, p_qrykey, b_show_attrs, opt_where_txt)

	},
	
	displayFeats: function(p_feats, p_qrykey, b_show_attrs, opt_where_txt) {
		
		let maingtype = null, featsPerGeomType = {};

		for (let i=0; i<this.queries[p_qrykey]["gtypes"].length; i++) {
			this.clearResults(this.queries[p_qrykey]["gtypes"][i]);
		}
		
		if (p_feats.length > 0) {
			
			let gtype;
			for (let i=0; i<p_feats.length; i++) {
				gtype = p_feats[i].geometry.type;
				featsPerGeomType[gtype] = p_feats[i];
			}
			
			let gtypes = Object.keys(featsPerGeomType);			
			if (gtypes.length == 1) {
				maingtype = gtypes[0];
			};
			
			if (this.mapView) {

				if (maingtype != null && maingtype == 'point') {
					let pzoom_scale = 1000;
					if (this.queries[p_qrykey]["zoomscale"] !== undefined) {
						pzoom_scale = parseInt(this.queries[p_qrykey]["zoomscale"]);
					}			
                    this.mapView.goTo({ target: p_feats, scale: pzoom_scale });
				} else {
					let extent = null;
					for (let i=0; i<p_feats.length; i++) {
						if (p_feats[i].geometry.type != 'point') {
							if (extent) {
								extent.union(p_feats[i].geometry.extent);
							} else {
								extent = p_feats[i].geometry.extent.clone();
							}
						}
					}
					
					extent = extent.clone().expand(this.queries[p_qrykey]["expand"]);
					this.mapView.goTo({ target: extent });
				}
			}
			this.resultsLayers[gtype].addMany(p_feats);
			
			const rows = p_feats.map(function(feature) {
				// console.log(feature.attributes);
				return feature.attributes;
			});
			
			if (b_show_attrs) {
				RecordsViewMgr.show("main", rows);
			}

		} else {
			console.warn("zero features encontradas na query", p_qrykey, ", filtro:", opt_where_txt);
		}
	},
	
    abortPreviousSearchCall: function() {
    	if (this.xhr != null) {
    		this.xhr.abort();
    		this.xhr = null;
    	}
    },	
	
	executeQuery: function(p_qrykey, p_argslist, b_show_attrs, opt_adic_callback) {
		
		if (this.queries[p_qrykey]["type"] == "onfeatlayer") {
			
			const fl = this.queries[p_qrykey]["flayer"];
			const queryObj = fl.createQuery();
			queryObj.where = String.format(this.queries[p_qrykey]["template"], ...p_argslist);
			(function(p_this, p_qryobj, p_symb, opt_adic_callback) {
				fl.queryFeatures(p_qryobj).then(function(qresults) {
					p_this.displayResults(qresults, p_symb, p_qrykey, b_show_attrs, queryObj.where, opt_adic_callback);
				});
			})(this, queryObj, this.queries[p_qrykey]["symb"], opt_adic_callback);
			
		} else {
			
			this.abortPreviousSearchCall();
			(function(p_this, pp_qrykey, p_symb, pb_show_attrs) {

				p_this.xhr = ajaxSender(p_this.queries[pp_qrykey]["url"], function() { 

					if (this.readyState === this.DONE) {

						if (this.status == 200) {

							if (this.responseText.length < 1) {
								MessagesController.setMessage("Não encontrado", true, true);
								return;
							}
							let jresp;

							try {
								jresp = JSON.parse(this.responseText);
							} catch(e) {
								console.log(this.responseText);
								console.error(e);
								return;
							}
							
							const resp_keys = Object.keys(jresp);
							let maplayer;
							// HARDCODED -- só vai ao primeiro resultado
							if (resp_keys.length >= 1) {
								
								maplayer = p_this.queries[pp_qrykey]["qrylyr2maplyr"][resp_keys[0]];
								if (maplayer) {
									LayervizMgr.changeVisibilty(maplayer, true, true);
								}					
													
								const _gtype0 = jresp[resp_keys[0]]['geomtype'].toLowerCase();
								const _gtype1 = _gtype0.replace("st_", "")
								const _gtype2 = _gtype1.replace("multi", "")
								const gtype = _gtype2.replace("linestring", "polyline")
								
								const spref = jresp[resp_keys[0]]['srid'];
								
								let symb, feat, geom, attrs, newGraphicMData, graphicsList = [];
								
								for (let i=0; i<jresp[resp_keys[0]].features.length; i++) {
									
									feat = jresp[resp_keys[0]].features[i];
									geom = feat.geometry;
									attrs = feat.attributes;
									
									if (geom.paths !== undefined) {
										if (gtype == 'polygon') {
											newGraphicMData = {
												type: gtype,
												rings: geom.paths,
												spatialReference: { wkid:spref }
											};
											symb = p_symb.line;
										} else {
											newGraphicMData = {
												type: gtype,
												paths: geom.paths,
												spatialReference: { wkid:spref }
											};
											symb = p_symb.line;
										}
									} else {
										newGraphicMData = {
											type: gtype,
											x: geom.x,
											y: geom.y,
											spatialReference: { wkid:spref }
										};
										symb = p_symb.marker;
									}

									graphicsList.push(new QueriesMgr.graphicReference({
										geometry: newGraphicMData,
										symbol: symb,
										attributes: attrs
									}));
								}
								
								p_this.displayFeats(graphicsList,  pp_qrykey, pb_show_attrs, null);
							} 
						}
					}
					/* TODO - else mandar para a records area do autocomplete */
					
					
				}, JSON.stringify({
						alias:"pec_findbydoc",
						filtervals: p_argslist, 
						lang:"pt"
					}), 
					p_this.xhr
				);
			})(this, p_qrykey, this.queries[p_qrykey]["symb"], b_show_attrs);
		}
	},
	
	init: function() {	
		for (let k in QUERIES_CFG) {
			this.queries[k] = {};
			this.queries[k]["gtypes"] = QUERIES_CFG[k]["gtypes"];
			this.queries[k]["type"] = QUERIES_CFG[k]["type"];
			this.queries[k]["url"] = QUERIES_CFG[k]["url"];
			if (QUERIES_CFG[k]["template"] !== undefined) {
                this.queries[k]["template"] = QUERIES_CFG[k]["template"];
            }			
			this.queries[k]["symb"] = QUERIES_CFG[k]["symb"];
			if (QUERIES_CFG[k]["layerId"] !== undefined) {
                this.queries[k]["layerId"] = QUERIES_CFG[k]["layerId"];
            }			
			if (QUERIES_CFG[k]["zoomscale"] !== undefined) {
                this.queries[k]["zoomscale"] = QUERIES_CFG[k]["zoomscale"];
            }
			if (QUERIES_CFG[k]["qrylyr2maplyr"] !== undefined) {
                this.queries[k]["qrylyr2maplyr"] = QUERIES_CFG[k]["qrylyr2maplyr"];
            }
			if (QUERIES_CFG[k]["expand"] !== undefined) {
                this.queries[k]["expand"] = QUERIES_CFG[k]["expand"];
            } else {
                this.queries[k]["expand"] = 1.0;
			}
			
			
		}
	}
	
	// precisa de inicialização de feat. layers com isto, dentro de view.when:
	/*
	{
		for (let k in QueriesMgr.queries) {
		QueriesMgr.queries[k]["flayer"] = new FeatureLayer({ id: k, url: QueriesMgr.queries[k]["url"] });		
	}
	*/

	
};

(function() {
	QueriesMgr.init();
})();

// Evitar a repetição inutil nos listeners de alterações
var EventFire = {
	registry: {},
	checkEqLastValueChange: function(p_type, p_key, p_value) {
		
		let ret = false;
		if (this.registry[p_type] === undefined) {
			this.registry[p_type] = {};
		}
		if (this.registry[p_type][p_key] === undefined) {
			this.registry[p_type][p_key] = p_value;
		} else {
			ret = (this.registry[p_type][p_key] == p_value);
			if (!ret) {
				this.registry[p_type][p_key] = p_value;
			}
		}

		return ret;
	}
};
	
var LayervizMgr = {
	mode: null,
	layerItems: {},
	set: function(p_key, p_value) {
		this.layerItems[p_key] = p_value;
	},
	changeVisibilty(p_this_layerid, p_visible, opt_do_change) {
		if (this.mode == 'radiobutton') {
			for (let lyrId in this.layerItems) {
				if (p_visible) {
					if (lyrId != p_this_layerid && this.layerItems[lyrId].visible) {
						this.layerItems[lyrId].visible = false;
						this.layerItems[lyrId].panel.open = false;
						this.layerItems[p_this_layerid].panel.open = true;

						if (typeof LayerInteractionMgr != 'undefined') {
							LayerInteractionMgr.select(p_this_layerid);
						}
					}
				}
			}
		}
		if (opt_do_change) {
			this.layerItems[p_this_layerid].visible = p_visible;
			this.layerItems[p_this_layerid].panel.open = p_visible;
		}
	},
	init: function() {		
		if (typeof LAYERVIZ_MODE != 'undefined') {
			this.mode = LAYERVIZ_MODE;
		}
	}
};

(function() {
	LayervizMgr.init();
})();

var RecordsViewMgr = {
	panels: {},
	init: function() {
		let cfg;
		for (let k in RECORD_PANELS_CFG) {
			cfg = RECORD_PANELS_CFG[k];
			if (cfg["type"] == 'switcher') {
				this.panels[k] = new RecordPanelSwitcher();
				this.panels[k].max_attrs_per_page = cfg["max_attrs_per_page"];
				this.panels[k].rotator_msg = cfg["rotator_msg"];
				this.panels[k].rotator_msg = cfg["rotator_msg"];
				this.panels[k].attr_cfg = cfg["attr_cfg"];
				this.panels[k].height_limits = cfg["height_limits"];
			}
		}
	},
	_get: function(p_key) {
		if (this.panels[p_key] === undefined) {
			throw new Error("RecordsViewMgr _get: no such key:"+p_key);
		}
		return this.panels[p_key];
	},
	clear: function(p_key) {
		this._get(p_key).clear();
	},
	_valcount: function(p_key, p_rows) {
		let maxcnt=0, valcount;
		let attr_cfg = this._get(p_key).attr_cfg; 
		for (let i=0; i<p_rows.length; i++) {  
			valcount = 0;
			for (let fld in attr_cfg) {
				let preval = p_rows[i][fld];
				if (preval == null || preval.length==0) {
					continue;
				}
				valcount++;
			}
			if (valcount > maxcnt) {
				maxcnt = valcount;
			}
		}   
		return maxcnt;
	},	
	generatePanels: function(p_key, p_records, p_parentdiv_id, p_heightv) {

		let heightv=null;
		let height_limits = this._get(p_key).height_limits; 
		let max_attrs_per_page = this._get(p_key).max_attrs_per_page; 
		
		let valcount = Math.min(max_attrs_per_page, this._valcount("main", p_records));
		for (let i=0; i<height_limits.length; i++) {
			if (height_limits[i][0] >= valcount) {
				heightv = height_limits[i][1];
				break;
			}
		}
		if (heightv == null) {
			// se heightv nao tiver sido definida, colocar valor mais alto
			heightv = height_limits[height_limits.length-1][1];
		}
		
		const panelSwitcher = this._get(p_key);
		panelSwitcher.clear();
		panelSwitcher.generatePanels(p_records, p_parentdiv_id, heightv);
	},
	show: function(p_records) {
		// para implementar			em classe estendida
		throw new Error("show not implemented");	
	}
	

};

(function() {
	RecordsViewMgr.init();
})();





		
		
