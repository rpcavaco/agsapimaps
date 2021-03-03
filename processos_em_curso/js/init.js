require([
	"esri/config",
	"esri/WebMap",
	"esri/views/MapView"
	], function(
		esriConfig, 
		WebMap,
		MapView
	) {
		esriConfig.portalUrl = "https://portalsig.cm-porto.pt/arcgis";

		const webmap = new WebMap({
		  portalItem: { // autocasts as new PortalItem()
			id: "343749483d5d4c86b417a8b6f0aec18d" // Licenciamento em curso
		  }
		});
		var view = new MapView({
			container: "viewDiv", // Reference to the view div created in step 5
			map: webmap // Reference to the map object created before the view
		});
  	});
