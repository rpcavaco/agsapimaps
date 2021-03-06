
require([
	"esri/config",
	"esri/WebMap",
	"esri/views/MapView",
	"esri/geometry/Extent",
	"esri/core/watchUtils",
	"esri/widgets/LayerList",
	"esri/widgets/ScaleBar",
	"esri/widgets/CoordinateConversion"
	//"esri/widgets/Expand",
	//"dgrid/Grid",
], function(
	esriConfig, 
	WebMap,
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
		map: webmap, // Reference to the map object created before the view
		extent: new Extent(VIEW_EXTENT),
		highlightOptions: HIGHLIGHT_OPTS	
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
				const found = (LYRS_DA_LEGENDA.indexOf(item.layer.layerId) >= 0);				
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



		
		