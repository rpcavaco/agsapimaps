
function DivFader(p_elemid, p_fadingheartbeat) {
	
	// Constantes
	// MessagesControllerParams é especifico de cada aplicação, deve estar no init-xxxx.js
	this.elemid = null;
	this.fadingHeartbeat = 0;
	
	this.isvisible = false;
	this.timer = null;
	this.inited = false;
	this.init = function() {
		if (this.inited) {
			return;
		}
		var msgsdiv = document.getElementById(this.elemid);
		
		attEventHandler(msgsdiv, 'click',
			function(evt) {
				MessagesController.hideMessage(true);
				return finishEvent(evt);
			}
		);
		
		this.inited = true;
	};
	this.setup = function(p_elemid, p_fadingheartbeat) {
		this.elemid = p_elemid;
		var msgsdiv = document.getElementById(this.elemid);
		//msgsdiv.style.display = 'none';
		this.isvisible = true;
		this.fadingHeartbeat = p_fadingheartbeat;
		
		this.init();
	};
	this.finalize = function() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		this.isvisible = false;
	};
	
	this.hideMessage = function(do_fadeout) {
		if (!this.isvisible) {
			return;
		}
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = null;
		}
		var msgsdiv = document.getElementById(this.elemid);

		if (do_fadeout) 
		{
			this.timer = fadeout(msgsdiv, 
							this.fadingHeartbeat,
							this.finalize);
		} 
		else 
		{
			if (msgsdiv!=null) {
				msgsdiv.style.display = 'none';
			}
			this.finalize();
		}
	};
	
	this.setup(p_elemid, p_fadingheartbeat);  
	
		
}

function changeAtrribution(p_nodes) {
	if (p_nodes!=null && p_nodes.length > 0) {
		var node = p_nodes[0];
		if (ATTR_TEXT != null && node.innerText.indexOf("ower") > 0) {
			node.innerText = ATTR_TEXT;
		}
	}
};

require([
	"esri/config",
	"esri/WebMap",
	"esri/views/MapView",
	"esri/core/watchUtils",
	"esri/widgets/LayerList",
	"esri/widgets/ScaleBar",
	"esri/widgets/CoordinateConversion",
	//"esri/widgets/Expand",
	//"dgrid/Grid",
	"dojo/query",
	"dojo/_base/array"
], function(
	esriConfig, 
	WebMap,
	MapView,
	watchUtils,
	LayerList,
	ScaleBar,
	CoordinateConversion,
	//Expand,
	//Grid,
	query,
	array
) {
	var titlefader = new DivFader("titlearea", 120.0);
	titlefader.hideMessage(true);

	// ========================================================================
	//  Mapa base e MapView 
	// ========================================================================
	esriConfig.portalUrl = WEBMAP_SOURCE;

	const webmap = new WebMap({
	  portalItem: { // autocasts as new PortalItem()
		id: PORTALITEM_ID
	  }
	});
	const view = new MapView({
		container: "viewDiv", // Reference to the view div created in step 5
		map: webmap // Reference to the map object created before the view
	});
	// ========================================================================


	// ========================================================================
	//  Widgets
	// ========================================================================
	//  Layerlist / legenda + funcionalidade relacionada layers
	// ------------------------------------------------------------------------	
		
	var selLayer = null;  // Layer a usar para a sel. interativa
	
	const layerList = new LayerList({
		view: view,
		listItemCreatedFunction: function(event) {
			const item = event.item;
			if (item.layer.type != "group") {
				if (selLayer == null && item.layer.layerId == LYR_SELECCAO_INTERACTIVA) {
					selLayer = item.layer;
				}
				const found = (array.indexOf(LYRS_DA_LEGENDA, item.layer.layerId) >= 0);				
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
	

	// ------------------------------------------------------------------------
	//  Display de coordenadas e barra de escala
	// ------------------------------------------------------------------------
	var ccExpand, ccwdg, scalebar;

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
		
		console.assert(selLayer!=null, "selLayer está indefinida, popup desativado");		

		if (selLayer!=null) {	

			let hlight; //, grid;

			function qryFeats(scrPt) {
				const pt = view.toMap(scrPt);
				selLayer.queryObjectIds({
					geometry: pt,
					spatialRelationship: "intersects",
					returnGeometry: false,
					outFields: ["*"]
				}).then(
					function(objectIds) {
						
						if(objectIds==null || objectIds.length==0) { return; }
						
						view.whenLayerView(selLayer).then(
							function(layerView) {
								if (hlight) {
									hlight.remove();
								}
								hlight = layerView.highlight(objectIds);
							}
						);
						
						return selLayer.queryRelatedFeatures({
							outFields: Object.keys(ATTRS_CFG),
							relationshipId: selLayer.relationships[0].id,
							objectIds: objectIds
						});

					}					
				).then(
					function(relatedFeatureSetByObjectId){
					
						if (!relatedFeatureSetByObjectId) { return; }
						// Create a grid with the data
						
						Object.keys(relatedFeatureSetByObjectId)
						  .forEach(function(objectId){

							// get the attributes of the FeatureSet
							const relatedFeatureSet = relatedFeatureSetByObjectId[objectId];
							const rows = relatedFeatureSet.features.map(function(feature) {
								console.log(feature.attributes);
							  return feature.attributes;
							});

							if (!rows.length) {
							  return;
							}

							// create a new div for the grid of related features
							// append to queryResults div inside of the gridDiv
							const gridDiv = document.createElement("div")
							const results = document.getElementById("queryResults");
							results.appendChild(gridDiv);

							// destroy current grid if exists
							/*
							if (grid) {
							  grid.destroy();
							}
							// create new grid to hold the results of the query
							grid = new Grid({
							  columns: Object.keys(rows[0]).map(function(fieldName) {
								return {
								  label: fieldName,
								  field: fieldName,
								  sortable: true
								};
							  })
							}, gridDiv);

							// add the data to the grid
							grid.renderArray(rows);
							*/

							// Listas

							let row, ulEl, liEl;
							for (let i=0; i<rows.length; i++) {
								ulEl = document.createElement("ul");
								gridDiv.appendChild(ulEl);
								for (let fld in rows[i]) {
									liEl = document.createElement("li");
									ulEl.appendChild(liEl);
									liEl.innerText = String.format("{0}: {1}", ATTRS_CFG[fld], rows[i][fld]);
								}
								break; // solamente uma row, por enquanto
							}

						});
						//clearbutton.style.display = "inline";
					}
				).catch(
					function(error) {
						console.error(error);
					}
				);
			}

			function clearMap(){
				if (hlight) {
					hlight.remove();
				}
				/* if (grid) {
					grid.destroy();
				} */
				//clearbutton.style.display = "none";
			}
		
			/*selLayer.load().then(function() {
				return g = new Grid();
			});*/
			
			view.on("click", function(evt) {
				clearMap();
				qryFeats(evt);
			});
			
		}
			
	}); 

	
	
	// ========================================================================
	//  Binding a eventos da Mapview:
	//		- mostrar / esconder o GIF do "carregamento em curso"
	//		- editar a "attribution"
	// ========================================================================
    watchUtils.whenTrue(view, "updating", function(evt) {
		document.getElementById("loading").style.display = "block";
    });
	
	// Final de uma atualização da view (ocorre em vários momentos antes do final do carregamento de todos os elementos)
    watchUtils.whenFalse(view, "updating", function(evt) {
		var divattr = query('.esri-attribution__powered-by');
		changeAtrribution(divattr);
		document.getElementById("loading").style.display = "none";
    });	
	// ========================================================================
	
});



		
		