
function mapInit() {

	// ========================================================================
	//  Mapa base e MapView 
	// ========================================================================

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
		
	var singleSelLayer = null;  // Layer a usar para a sel. interativa

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
	// ========================================================================	

	return [webmap, view, singleSelLayer, layerList];
}