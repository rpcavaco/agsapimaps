
var QueriesMgr = {
	
	queries: {},
	mapView: null,
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
	
	displayResults: function(p_results, p_symb, p_qrykey, p_where_txt) {

		const gtype = this.queries[p_qrykey]["gtype"];
		this.clearResults(gtype);
		const features = p_results.features.map(function(graphic) {
			graphic.symbol = p_symb;
			return graphic;
		});

		if (features.length > 0) {

			if (this.mapView) {

				if (gtype == 'pt') {
					let pzoom_scale = 1000;
					if (this.queries[p_qrykey]["zoomscale"] !== undefined) {
						pzoom_scale = parseInt(this.queries[p_qrykey]["zoomscale"]);
					}			
                    this.mapView.goTo({ target: features, scale: pzoom_scale });
				} else {
					let extent = null;
					for (let i=0; i<features.length; i++) {
						if (extent) {
							extent.union(features[i].geometry.extent);
						} else {
							extent = features[i].geometry.extent.clone();
						}
					}
			
					extent = extent.clone().expand(1.5);
					this.mapView.goTo({ target: extent });
				}
				
			}
			this.resultsLayers[gtype].addMany(features);

		} else {
			console.warn("zero features encontradas na query", p_qrykey, ", filtro:", p_where_txt);
		}

	},
	
	executeQuery: function(p_qrykey, p_argslist) {
		const fl = this.queries[p_qrykey]["flayer"];
		const queryObj = fl.createQuery();
		queryObj.where = String.format(this.queries[p_qrykey]["template"], ...p_argslist);
		(function(p_this, p_qryobj, p_symb) {
			fl.queryFeatures(p_qryobj).then(function(qresults) {
				p_this.displayResults(qresults, p_symb, p_qrykey, queryObj.where);
			});
		})(this, queryObj, this.queries[p_qrykey]["symb"]);
	},
	
	init: function() {	
		for (let k in QUERIES_CFG) {
			this.queries[k] = {};
			this.queries[k]["gtype"] = QUERIES_CFG[k]["gtype"];
			this.queries[k]["url"] = QUERIES_CFG[k]["url"];
			this.queries[k]["template"] = QUERIES_CFG[k]["template"];
			this.queries[k]["symb"] = QUERIES_CFG[k]["symb"];
			if (QUERIES_CFG[k]["layerId"] !== undefined) {
                this.queries[k]["layerId"] = QUERIES_CFG[k]["layerId"];
            }			
			if (QUERIES_CFG[k]["zoomscale"] !== undefined) {
                this.queries[k]["zoomscale"] = QUERIES_CFG[k]["zoomscale"];
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

require([
	"esri/Map",
	"esri/Basemap",
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
	
	const the_map = new Map({
		basemap: basemap,
		layers: layers
	});
	
	//  instanciar as FeatureLayer das pesquisas
	for (let k in QueriesMgr.queries) {
		if (QueriesMgr.queries[k]["layerId"] !== undefined) {
			QueriesMgr.queries[k]["flayer"] = new FeatureLayer({ id: k, url: QueriesMgr.queries[k]["url"], layerId: QueriesMgr.queries[k]["layerId"] });	
		} else {
			QueriesMgr.queries[k]["flayer"] = new FeatureLayer({ id: k, url: QueriesMgr.queries[k]["url"] });	
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
	const layerList = new LayerList({
		view: view,
		listItemCreatedFunction: function(event) {
			const item = event.item;
			if (item.layer.type != "group") {
				const found = (LYRS_DA_LEGENDA.indexOf(item.layer.id) >= 0);				
				if (found) {
					item.panel = {
						content: "legend",
						open: true
					};
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

		let selLayer = layerDict[LYRS_SELECCAO_INTERACTIVA[0]];

		console.assert(selLayer!=null, "selLayer está indefinida, popup desativado");		
		console.assert(typeof when_view_ready === 'function', "função 'when_view_ready' está indefinida, popup desativado");		

		QueriesMgr.mapView = view;

		if (selLayer!=null && typeof when_view_ready === 'function') {	
			when_view_ready(view, selLayer, "queryResults");
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
	// ========================================================================
	
});



		
		