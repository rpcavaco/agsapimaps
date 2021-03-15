
function valCount(p_rows, p_attrs_cfg) {
    let maxcnt=0, valcount;
    for (let i=0; i<p_rows.length; i++) {  
        valcount = 0;
        for (let fld in p_attrs_cfg) {
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
}

var LayerInteractionMgr = {
	interactionLayersIds: [],
	selectedLayerId: null,
	selectedLayer: null,
	addedInteractionLayers: {},
	init: function() {
		this.interactionLayersIds = clone(LYRS_SELECCAO_INTERACTIVA);
		this.selectedLayerId = this.interactionLayersIds[0];
		this.addedInteractionLayers = {}
	},
	select: function(p_lyrId) {
		if (this.interactionLayersIds.indexOf(p_lyrId) < 0) {
			throw new Error("LayerInteractionMgr.select: layer não configurada:"+p_lyrId);
		}
		if (Object.keys(this.addedInteractionLayers).indexOf(p_lyrId) < 0) {
			throw new Error("LayerInteractionMgr.select: layer ainda não adicionado:"+p_lyrId);
		}
		this.selectedLayerId = p_lyrId;
		this.selectedLayer = this.addedInteractionLayers[p_lyrId];
	},
	addLayer: function(p_lyrId, p_lyr_obj, p_dont_throw_error) {
		if (this.interactionLayersIds.indexOf(p_lyrId) < 0) {
			if (!p_dont_throw_error) {
				throw new Error("LayerInteractionMgr.addLayer: layer não configurada:"+p_lyrId);
			}
			return;
		}
		this.addedInteractionLayers[p_lyrId] = p_lyr_obj;
	}
}

(function() {
	LayerInteractionMgr.init();
})();


function when_view_ready(p_view, p_griddiv) {

	let hlight; //, grid;

	function qryFeats(scrPt) {

		const pt = p_view.toMap(scrPt);
		const rec_rps = new RecordPanelSwitcher();
		rec_rps.max_attrs_per_page = 12;
		rec_rps.registos_fmt = "Processo {0} de {1}"

		if (LayerInteractionMgr.selectedLayer == null) {
			return;
		}

		LayerInteractionMgr.selectedLayer.queryObjectIds({
			geometry: pt,
			spatialRelationship: "intersects",
			returnGeometry: false,
			outFields: ["*"]
		}).then(
			function(objectIds) {
				
				if(objectIds==null || objectIds.length==0) { return; }
				
				p_view.whenLayerView(LayerInteractionMgr.selectedLayer).then(
					function(layerView) {
						if (hlight) {
							hlight.remove();
						}
						hlight = layerView.highlight(objectIds);
					}
				);

                // pan se demasiadamente proximo do painel de dados
                const gdiv = document.getElementById("gridDiv");
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
                   				
				return LayerInteractionMgr.selectedLayer.queryRelatedFeatures({
					outFields:  ["*"],
					relationshipId: LayerInteractionMgr.selectedLayer.relationships[0].id,
					objectIds: objectIds
				});

			}					
		).then(
			function(relatedFeatureSetByObjectId) {
			
				if (!relatedFeatureSetByObjectId) { return; }
				// Create a grid with the data

				rec_rps.clear();

				Object.keys(relatedFeatureSetByObjectId)
				.every(function(objectId){

					// get the attributes of the FeatureSet
					const relatedFeatureSet = relatedFeatureSetByObjectId[objectId];
					const rows = relatedFeatureSet.features.map(function(feature) {
						// console.log(feature.attributes);
						return feature.attributes;
					});

					if (!rows.length) {
						return;
					}

					// esconder msg introdutória
					const mainmsgDiv = document.getElementById("mainmsg");
					if (mainmsgDiv) {
						mainmsgDiv.style.display = "none"
					}

					// expandir gridDiv
					let valcount, heightv=null;

					valcount = valCount(rows, ATTRS_CFG);
					for (let i=0; i<ALT_EXPANSAO_PAINEL_DADOS.length; i++) {
						if (ALT_EXPANSAO_PAINEL_DADOS[i][0] >= valcount) {
							heightv = ALT_EXPANSAO_PAINEL_DADOS[i][1];
							break;
						}
					}
					if (heightv == null) {
						// se heightv nao tiver sido definida, colocar valor mais alto
						heightv = ALT_EXPANSAO_PAINEL_DADOS[ALT_EXPANSAO_PAINEL_DADOS.length-1][1];
					}
					rec_rps.generatePanels(rows, ATTRS_CFG, "queryResults", heightv);

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

	/*selLayer.load().then(function() {
		return g = new Grid();
	});*/
	
	p_view.on("click", function(evt) {
		clearMap();
		qryFeats(evt);
	});
			

}
