
require([
	"esri/Map",
	"esri/Basemap",
	"esri/layers/MapImageLayer",
	"esri/layers/FeatureLayer",
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
	MapView,
	Extent,
	watchUtils,
	LayerList,
	ScaleBar,
	CoordinateConversion
	//Expand,
	//Grid,
) {
	var titlefader = new DivFader("titlearea", TITLE_FADING_MSECS);
	titlefader.hideMessage(true);

	var basemap = new Basemap({
		baseLayers: [
		  new MapImageLayer({
			url: MAPLAYERS["base"],
			title: "Basemap"
		  })
		],
		title: "basemap",
		id: "basemap"
	});

	// ========================================================================
	//  Layers, mapa base e MapView 
	// ========================================================================

	const layerDict = {}, layerorder = [], layers = [], flayers=[];
	
	for (let lkey in MAPLAYERS) {
		if (lkey == "base") {
			continue;
		}
		layerDict[lkey] = new MapImageLayer({ url: MAPLAYERS[lkey] });
		layerorder.push(lkey);
	}

	for (let lkey in FEATLAYERS) {
		layerorder.push(lkey);
		flayers.push(lkey);
		layerDict[lkey] = new FeatureLayer({ url: FEATLAYERS[lkey] })
	}
	layerorder.sort();
	console.log("layerorder:", layerorder);

	for (let i=0; i<layerorder.length; i++) {
		layers.push(layerDict[layerorder[i]]);
	}

	const the_map = new Map({
		basemap: basemap,
		layers: layers
	});
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
	let selLayer = null;
	if (Object.keys(layerDict).indexOf(LYR_SELECCAO_INTERACTIVA_KEY) < 0) {
		console.warn("Layer a usar para a sel. interativa '"+LYR_SELECCAO_INTERACTIVA_KEY+"' não encontrada na configuração do mapa.");
	} else {		
		selLayer = layerDict[LYR_SELECCAO_INTERACTIVA_KEY];
	}

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
		console.assert(typeof when_view_ready === 'function', "função 'when_view_ready' está indefinida, popup desativado");		

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
		document.getElementById("loading").style.display = "block";
    });
	
	// Final de uma atualização da view (ocorre em vários momentos antes do final do carregamento de todos os elementos)
    watchUtils.whenFalse(view, "updating", function(evt) {
		var divattr = document.getElementsByClassName('esri-attribution__powered-by');
		changeAtrribution(divattr);
		document.getElementById("loading").style.display = "none";
    });	
	// ========================================================================
	
});



		
		