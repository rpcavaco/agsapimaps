
var LayerInteractionMgr = {
	interactionLayersIds: [],
	selectedLayerId: null,
	addedInteractionLayers: {},
	clearFunc: null,
	onSelect: null,
	doClear: function() {
		if (this.clearFunc) {
			this.clearFunc();
		}
	},
	init: function() {
		if (typeof LYRS_SELECCAO_INTERACTIVA == 'undefined') {
			throw new Error("LayerInteractionMgr: LYRS_SELECCAO_INTERACTIVA não está definda.");
		}
		if (LYRS_SELECCAO_INTERACTIVA.length < 1) {
			throw new Error("LayerInteractionMgr: LYRS_SELECCAO_INTERACTIVA está definida mas vazia.");
		}
		this.interactionLayersIds = clone(LYRS_SELECCAO_INTERACTIVA);
		this.selectedLayerId = LYRS_SELECCAO_INTERACTIVA[0];
    },	
	select: function(p_lyrId) {
		if (this.interactionLayersIds.indexOf(p_lyrId) < 0) {
			throw new Error("LayerInteractionMgr.select: layer não configurada:"+p_lyrId);
		}
		if (Object.keys(this.addedInteractionLayers).indexOf(p_lyrId) < 0) {
			throw new Error("LayerInteractionMgr.select: layer ainda não adicionado:"+p_lyrId);
		}
		this.selectedLayerId = p_lyrId;
		this.onSelect(this.selectedLayerId);
		this.doClear();
	},
	hasSelection: function() {
		return this.selectedLayerId != null;
	},
	addLayer: function(p_lyrId, p_lyr_obj, p_dont_throw_error) {
		if (this.interactionLayersIds.indexOf(p_lyrId) < 0) {
			if (!p_dont_throw_error) {
				throw new Error("LayerInteractionMgr.addLayer: layer não configurada:"+p_lyrId);
			}
			return;
		}
		this.addedInteractionLayers[p_lyrId] = p_lyr_obj;
	},
	getSelectedLayer: function() {
		if (this.selectedLayerId == null) {
			throw new Error("LayerInteractionMgr.getSelectedLayer: selectedLayerId nulo.");
		}
		if (Object.keys(this.addedInteractionLayers).indexOf(this.selectedLayerId) < 0) {
			throw new Error("LayerInteractionMgr.getSelectedLayer: layer ainda não adicionado:"+this.selectedLayerId);
		}
		return this.addedInteractionLayers[this.selectedLayerId];
	}
};

(function() {
	LayerInteractionMgr.init();
	LayerInteractionMgr.onSelect = function(p_sel_layer_id) {
		const spEmLoteam = document.getElementById("sp-emloteam");
		if (spEmLoteam) {
			if (p_sel_layer_id.indexOf("_loteam") > 1) {
				spEmLoteam.style.visibility = 'visible';
			} else {
				spEmLoteam.style.visibility = 'hidden';
			}
		}		
	}
})();


function when_view_ready(p_view, p_griddiv, p_extclass) {

	let hlight; //, grid;

	function qryFeats(scrPt) {

		const pt = p_view.toMap(scrPt);
		const growthOffset = 2 * (p_view.scale / 1000.0);
		const srchEnv = new p_extclass({
			xmin: pt.x - growthOffset,
			ymin: pt.y - growthOffset,
			xmax: pt.x + growthOffset,
			ymax: pt.y + growthOffset,
			spatialReference: {
				wkid: VIEW_SRID
			}
		});

		const selLayer = LayerInteractionMgr.getSelectedLayer();

		selLayer.queryObjectIds({
			geometry: srchEnv,
			spatialRelationship: "intersects",
			returnGeometry: false,
			outFields: ["*"]
		}).then(
			function(_objectIds) {
				
				// console.log("objectIds:", _objectIds);
				
				if(_objectIds==null || _objectIds.length==0) { return; }
				
				// apenas um objectid de cada vez
				objectIds = [_objectIds[0]];
				
				p_view.whenLayerView(selLayer).then(
					function(layerView) {
						if (hlight) {
							hlight.remove();
						}
						hlight = layerView.highlight(objectIds);
					}
				);

                // pan se demasiadamente proximo do painel de dados
                const gdiv = document.getElementById(p_griddiv);
                if (gdiv) {
                    const sty = window.getComputedStyle(gdiv);
                    const gdiv_w = parseInt(sty.width, 10);
                    const hlim = p_view.size[0] - gdiv_w;
                    if (scrPt.x > hlim) {
                        const newPt = {
                            x: scrPt.x + (p_view.size[0] / 6),
                            y: scrPt.y,
                        }
                        const newMapPt = p_view.toMap(newPt);
                        p_view.goTo(newMapPt);
                    }
                }
                   				
				return selLayer.queryRelatedFeatures({
					outFields:  ["*"],
					relationshipId: selLayer.relationships[0].id,
					objectIds: objectIds
				});

			}					
		).then(
			function(relatedFeatureSetByObjectId) {
			
				if (!relatedFeatureSetByObjectId) { return; }
				// Create a grid with the data

				RecordsViewMgr.clear("main");

				Object.keys(relatedFeatureSetByObjectId)
				.every(function(objectId){

					// get the attributes of the FeatureSet
					const relatedFeatureSet = relatedFeatureSetByObjectId[objectId];

					if (!relatedFeatureSet.features.length) {
						return;
					}

					const rows = relatedFeatureSet.features.map(function(feature) {
						// console.log(feature.attributes);
						return feature.attributes;
					});

						
					RecordsViewMgr.show("main", rows);
					// apenas o primeiro registo
					return false;
						
				}); // .forEach(function(objectId){
					
			}
		).catch(
			function(error) {
				console.error(error);
			}
		); // function(relatedFeatureSetByObjectId){
	}

	function clearMap(){
		if (hlight) {
			hlight.remove();
		}
		const resultsDiv = document.getElementById(p_griddiv);
		if (resultsDiv) {
			while (resultsDiv.firstChild) {
				resultsDiv.removeChild(resultsDiv.firstChild);
			}
			resultsDiv.style.removeProperty('height');
		}
		const mainmsgDiv = document.getElementById("mainmsg");
		if (mainmsgDiv) {
			mainmsgDiv.style.display = "block"
		}


		/* if (grid) {
			grid.destroy();
		} */
		//clearbutton.style.display = "none";
	}
	
	LayerInteractionMgr.clearFunc = clearMap;

	/*selLayer.load().then(function() {
		return g = new Grid();
	});*/
	
	p_view.on("click", function(evt) {
		clearMap();
		qryFeats(evt);
	});
			

}


