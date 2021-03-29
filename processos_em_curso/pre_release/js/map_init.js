
function sizeWidgetsMode() {
	
	let ret, winsize = {
		width: window.innerWidth || document.body.clientWidth,
		height: window.innerHeight || document.body.clientHeight,
	};

	if (parseInt(winsize.width) > 1200) {       
		ret = 4;
	} else if (parseInt(winsize.width) > 530) {       
		ret = 3;
	} else if (parseInt(winsize.width) > 430) {       
		ret = 2;
	} else {       
		ret = 1;
	}       
	
	return ret;
}

RecordsViewMgr.show = function(p_key, p_records) {
	
	if (p_key == "main") {
	// esconder msg introdutória
		const mainmsgDiv = document.getElementById("mainmsg");
		if (mainmsgDiv) {
			mainmsgDiv.style.display = "none"
                }
	
		const spEmLoteam = document.getElementById("sp-emloteam");
		if (spEmLoteam) {
			if (LayerInteractionMgr.selectedLayerId.indexOf("_loteam") > 1) {
				spEmLoteam.style.visibility = 'visible';
				} else {
				spEmLoteam.style.visibility = 'hidden';
						}
					}
				}
				
	RecordsViewMgr.generatePanels(p_key, p_records, "queryResults");	
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
							LayervizMgr.changeVisibilty(p_this_layerid, visible);
							
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
					LayervizMgr.set(item.layer.id, item);

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
	let szmode = sizeWidgetsMode();


	if (COORDSDISPLAY_SHOW && szmode > 2) {

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



		
		
