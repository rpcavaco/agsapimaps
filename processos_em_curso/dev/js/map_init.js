
var QueriesMgr = {
	
	queries: {},
	mapView: null,
	xhr: null, 
	resultsLayers: {
		pt: null,
		ln: null,
		pol: null
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
	
	displayResults: function(p_results, p_symb, p_qrykey, opt_where_txt, opt_adic_callback) {

		const features = p_results.features.map(function(graphic) {
			graphic.symbol = p_symb;
			return graphic;
		});

		if (opt_adic_callback) {
			opt_adic_callback(p_qrykey, p_results);
		}

		this.displayFeats(features, p_qrykey, opt_where_txt)

	},
	
	displayFeats: function(p_feats, p_qrykey, opt_where_txt) {

		const gtype = this.queries[p_qrykey]["gtype"];
		this.clearResults(gtype);
		
		if (p_feats.length > 0) {

			if (this.mapView) {

				if (gtype == 'pt') {
					let pzoom_scale = 1000;
					if (this.queries[p_qrykey]["zoomscale"] !== undefined) {
						pzoom_scale = parseInt(this.queries[p_qrykey]["zoomscale"]);
					}			
                    this.mapView.goTo({ target: p_feats, scale: pzoom_scale });
				} else {
					let extent = null;
					for (let i=0; i<p_feats.length; i++) {
						if (extent) {
							extent.union(p_feats[i].geometry.extent);
						} else {
							extent = p_feats[i].geometry.extent.clone();
						}
					}
			
					extent = extent.clone().expand(this.queries[p_qrykey]["expand"]);
					this.mapView.goTo({ target: extent });
				}
			}
			this.resultsLayers[gtype].addMany(p_feats);

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
	
	executeQuery: function(p_qrykey, p_argslist, opt_adic_callback) {
		
		if (this.queries[p_qrykey]["type"] == "onfeatlayer") {
			
		const fl = this.queries[p_qrykey]["flayer"];
		const queryObj = fl.createQuery();
		queryObj.where = String.format(this.queries[p_qrykey]["template"], ...p_argslist);
			(function(p_this, p_qryobj, p_symb, opt_adic_callback) {
			fl.queryFeatures(p_qryobj).then(function(qresults) {
					p_this.displayResults(qresults, p_symb, p_qrykey, queryObj.where, opt_adic_callback);
			});
			})(this, queryObj, this.queries[p_qrykey]["symb"], opt_adic_callback);
			
		} else {
			
			this.abortPreviousSearchCall();
			(function(p_this, pp_qrykey, p_symb) {

				p_this.xhr = ajaxSender(p_this.queries[pp_qrykey]["url"], function() { 

					if (this.readyState === this.DONE) {

						if (this.status == 200) {

							if (this.responseText.length < 1) {
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
									RadioButtonLayersControl.changeVisibilty(maplayer, true, true);
								}					
													
								const _gtype0 = jresp[resp_keys[0]]['geomtype'].toLowerCase();
								const _gtype1 = _gtype0.replace("st_", "")
								const _gtype2 = _gtype1.replace("multi", "")
								const gtype = _gtype2.replace("linestring", "polyline")
								
								const spref = jresp[resp_keys[0]]['srid'];
								
								let feat, geom, attrs, newGraphicMData, graphicsList = [];
								
								for (let i=0; i<jresp[resp_keys[0]].features.length; i++) {
									
									feat = jresp[resp_keys[0]].features[i];
									geom = feat.geometry;
									attrs = feat.attributes;

									newGraphicMData = {
										type: gtype,
										rings: geom.paths,
										spatialReference: { wkid:spref }
									};

									graphicsList.push(new QueriesMgr.graphicReference({
										geometry: newGraphicMData,
										symbol: p_symb,
										attributes: attrs
									}));
								}
								
								p_this.displayFeats(graphicsList,  pp_qrykey, null);
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
			})(this, p_qrykey, this.queries[p_qrykey]["symb"]);
		}
	},
	
	init: function() {	
		for (let k in QUERIES_CFG) {
			this.queries[k] = {};
			this.queries[k]["gtype"] = QUERIES_CFG[k]["gtype"];
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
EventFire = {
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

RadioButtonLayersControl = {
	layerItems: {},
	set: function(p_key, p_value) {
		this.layerItems[p_key] = p_value;
	},
	changeVisibilty(p_this_layerid, p_visible, opt_do_change) {
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
		if (opt_do_change) {
			this.layerItems[p_this_layerid].visible = p_visible;
			this.layerItems[p_this_layerid].panel.open = p_visible;
		}
	}

	
};

require([
	"esri/Map",
	"esri/Basemap",
	"esri/Graphic",
	"esri/layers/MapImageLayer",
	"esri/layers/FeatureLayer",
	"esri/layers/GraphicsLayer",
	//"esri/layers/WMSLayer",
	"esri/views/MapView",
	"esri/geometry/Extent",
	"esri/core/watchUtils",
	"esri/widgets/LayerList",
	"esri/widgets/ScaleBar",
	"esri/widgets/CoordinateConversion"
	//"esri/widgets/Expand",
	//"dgrid/Grid",
], function(
	Map,
	Basemap,
	Graphic,
	MapImageLayer,
	FeatureLayer,
	GraphicsLayer,
	//WMSLayer,
	MapView,
	Extent,
	watchUtils,
	LayerList,
	ScaleBar,
	CoordinateConversion
	//Expand,
	//Grid,
) {

	const bmil = new MapImageLayer({
		url: MAPLAYERS["base"]["url"],
		title: "Basemap"
	  });
	if (MAPLAYERS["base"]["layerId"] !== undefined) {
		bmil["layerId"] = MAPLAYERS["base"]["layerId"];
	}

	var basemap = new Basemap({
		baseLayers: [
			bmil
		],
		title: "basemap",
		id: "basemap"
	});

	// ========================================================================
	//  Layers, mapa base e MapView 
	// ========================================================================

	const layerDict = {}, layerorder = [], layers = [], flayers=[];
	let lyrcfg;
	
	for (let lkey in MAPLAYERS) {
		if (lkey == "base") {
			continue;
		}
		if (LYR_TITLES[lkey] === undefined) {
			lyrcfg = { id: lkey, url: MAPLAYERS[lkey]["url"] };
		} else {
			lyrcfg = { id: lkey, title: LYR_TITLES[lkey], url: MAPLAYERS[lkey]["url"] };
		}
		if (MAPLAYERS[lkey]["layerId"] !== undefined) {
			lyrcfg["layerId"] = MAPLAYERS[lkey]["layerId"];
		}
		layerDict[lkey] = new MapImageLayer(lyrcfg);
		layerorder.push(lkey);
	}

	for (let lkey in FEATLAYERS) {
		flayers.push(lkey);
		if (LYR_TITLES[lkey] === undefined) {
			lyrcfg = { id: lkey, url: FEATLAYERS[lkey]["url"] };
		} else {
			lyrcfg = { id: lkey, title: LYR_TITLES[lkey], url: FEATLAYERS[lkey]["url"] };
		}
		if (FEATLAYERS[lkey]["layerId"] !== undefined) {
			lyrcfg["layerId"] = FEATLAYERS[lkey]["layerId"];
		}
		layerDict[lkey] = new FeatureLayer(lyrcfg);
		layerorder.push(lkey);
	}
	
	layerorder.sort();

	for (let i=0; i<layerorder.length; i++) {
		layers.push(layerDict[layerorder[i]]);
	}

	// adicionar layer de resultados de pesquisa
    for (let k in QueriesMgr.resultsLayers) {
        QueriesMgr.resultsLayers[k] = new GraphicsLayer();   
        layers.push(QueriesMgr.resultsLayers[k]);
    }
	
	QueriesMgr.graphicReference = Graphic;
	QueriesMgr.extn = Extent;
	
	const the_map = new Map({
		basemap: basemap,
		layers: layers
	});
	
	//  instanciar as FeatureLayer das pesquisas
	for (let k in QueriesMgr.queries) {
		if (QueriesMgr.queries[k]["type"] == "onfeatlayer") {
		if (QueriesMgr.queries[k]["layerId"] !== undefined) {
			QueriesMgr.queries[k]["flayer"] = new FeatureLayer({ id: k, url: QueriesMgr.queries[k]["url"], layerId: QueriesMgr.queries[k]["layerId"] });	
		} else {
			QueriesMgr.queries[k]["flayer"] = new FeatureLayer({ id: k, url: QueriesMgr.queries[k]["url"] });	
		}	
	}	
	}	
	
	const view = new MapView({
		container: "viewDiv", // Reference to the view div created in step 5
		map: the_map, // Reference to the map object created before the view
		extent: new Extent(VIEW_EXTENT),
		highlightOptions: HIGHLIGHT_OPTS	
	});
	// ========================================================================


	// ========================================================================
	//  Widgets
	// ========================================================================
	//  Layerlist / legenda + funcionalidade relacionada layers
	// ------------------------------------------------------------------------	
	// const radioButtonLayerItems = {};

	const layerList = new LayerList({
		view: view,
		listItemCreatedFunction: function(event) {
			const item = event.item;
			if (item.layer.type != "group") {

				/* LayerInteractionMgr definido em when_view_ready.js, que deverá
				*   ser carregado antes desta source.
				*  Podem ser tentativamente carregadas todas as layers, 
				*   as que não estiverem configuradas para a interacção
				*   serão silenciosamente rejeitadas.
				*/
				if (typeof LayerInteractionMgr != 'undefined') {
					LayerInteractionMgr.addLayer(item.layer.id, item.layer, true);
				}

				const lidx = LYRS_DA_LEGENDA.indexOf(item.layer.id);
				const found = (lidx >= 0);				
				if (found) {

					if (typeof LayerInteractionMgr != 'undefined') {
						if (!LayerInteractionMgr.hasSelection()) {
						    LayerInteractionMgr.select(item.layer.id);
						}
					}

					item.visible = (lidx == 0);
					item.panel = {
						content: "legend",
						open: (lidx == 0)
					};
					(function(p_item, p_this_layerid, p_mapview) {
						p_item.watch("visible", function(visible){
							// evitar a repetição massiça causada pelo sucessivo firing deste evento
							if (EventFire.checkEqLastValueChange("layerviz", p_this_layerid, visible)) {
								return;
							}
							RadioButtonLayersControl.changeVisibilty(p_this_layerid, visible);
							
							for (let lyrk in EXTENTS2CHK_ON_LYRVIZ_CHANGE) {
								if (EXTENTS2CHK_ON_LYRVIZ_CHANGE[lyrk] === undefined) {
									continue;
								}
								const ext_to = new Extent(EXTENTS2CHK_ON_LYRVIZ_CHANGE[lyrk].env);
								const scale_to = EXTENTS2CHK_ON_LYRVIZ_CHANGE[lyrk].scale;
								if (visible && p_this_layerid == lyrk && (!p_mapview.extent.intersects(ext_to) || p_mapview.scale > (2.0 * scale_to))) {
									p_mapview.goTo({ target: ext_to });
									break;
								}
							}

						});
					})(item, item.layer.id, view);
					RadioButtonLayersControl.set(item.layer.id, item);

				} else {
					item.layer.listMode = "hide";
				}
			}
		}
	});
	view.ui.add(layerList, "top-right");
	// ========================================================================
	

	// ------------------------------------------------------------------------
	//  Display de coordenadas e barra de escala
	// ------------------------------------------------------------------------
	//var ccExpand, 
	let ccwdg, scalebar;

	if (COORDSDISPLAY_SHOW) {

		ccwdg = new CoordinateConversion({
			view: view,
			multipleConversions: true
		});
		view.ui.add(ccwdg, "bottom-left");
		/* Esconder dentro de um Expand
		ccExpand = new Expand({
			view: view,
			content: ccwdg
		});
		view.ui.add(ccExpand, "bottom-left");
		*/

		// Limpeza dos formatos indesejados no disp de coordenadas
		ccwdg.when(function() {
			for (var i=0; i<2; i++) {
				ccwdg.formats.forEach(function(fmt, i) {
					if (fmt.name == 'mgrs' || fmt.name == 'ddm' || fmt.name == 'usng') {
						ccwdg.formats.remove(fmt)
					};
				});
			}
		});
	}

	// ------------------------------------------------------------------------
	//  ..... barra de escala
	// ------------------------------------------------------------------------
	if (SCALEBAR_SHOW) {
		scalebar = new ScaleBar({
			view: view,
			unit: "metric"
		});
		view.ui.add(scalebar, "bottom-left");
	}
	// ------------------------------------------------------------------------
	//  Final dos widgets
	// ========================================================================


	view.popup.autoOpenEnabled = false;
/*view.on("click", function(event) {
  // Get the coordinates of the click on the view
  // around the decimals to 3 decimals
  for (var v in event.mapPoint) {
	  console.log(v);
  }
  var lat = Math.round(event.mapPoint.latitude * 1000) / 1000;
  var lon = Math.round(event.mapPoint.longitude * 1000) / 1000;
  view.popup.open({
    // Set the popup's title to the coordinates of the clicked location
    title: "Reverse geocode: [" + lon + ", " + lat + "], " + event.mapPoint.x + ", " + event.y,
    location: event.mapPoint // Set the location of the popup to the clicked location
  });
});	
*/
	view.when(function() {

		const selLyrId = LYRS_SELECCAO_INTERACTIVA[0];
		let selLayer = layerDict[selLyrId];

		const spEmLoteam = document.getElementById("sp-emloteam");
		if (spEmLoteam) {
			if (selLyrId.indexOf("_loteam") > 1) {
				spEmLoteam.style.visibility = 'visible';
			} else {
				spEmLoteam.style.visibility = 'hidden';
			}
		}

		console.assert(selLayer!=null, "selLayer está indefinida, popup desativado");		
		console.assert(typeof when_view_ready === 'function', "função 'when_view_ready' está indefinida, popup desativado");		

		QueriesMgr.mapView = view;

		if (selLayer!=null && typeof when_view_ready === 'function') {	
			when_view_ready(view, "queryResults", Extent);
		}
		
	});
	
	
	// ========================================================================
	//  Binding a eventos da Mapview:
	//		- mostrar / esconder o GIF do "carregamento em curso"
	//		- editar a "attribution"
	// ========================================================================
    watchUtils.whenTrue(view, "updating", function(evt) {
		showLoaderImg();
    });
	
	// Final de uma atualização da view (ocorre em vários momentos antes do final do carregamento de todos os elementos)
    watchUtils.whenFalse(view, "updating", function(evt) {
		var divattr = document.getElementsByClassName('esri-attribution__powered-by');
		changeAtrribution(divattr);
		hideLoaderImg();
    });	

	watchUtils.whenTrue(view, "stationary", function() {
		if (view.extent) {
			for (let i=0; i<SCALE_LIMIT_FUNCS.length; i++) {
				SCALE_LIMIT_FUNCS[i](view.scale);
			}
		}
	});		
	// ========================================================================
	
});



		
		
