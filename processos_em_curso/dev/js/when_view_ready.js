
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

function when_view_ready(p_view, p_sellayer, p_griddiv) {

	let hlight; //, grid;

	function qryFeats(scrPt) {

		const pt = p_view.toMap(scrPt);
		const rec_rps = new RecordPanelSwitcher();
		rec_rps.max_attrs_per_page = 12;
		rec_rps.registos_fmt = "Processo {0} de {1}"

		p_sellayer.queryObjectIds({
			geometry: pt,
			spatialRelationship: "intersects",
			returnGeometry: false,
			outFields: ["*"]
		}).then(
			function(objectIds) {
				
				if(objectIds==null || objectIds.length==0) { return; }
				
				p_view.whenLayerView(p_sellayer).then(
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
                   				
				return p_sellayer.queryRelatedFeatures({
					outFields:  ["*"],
					relationshipId: p_sellayer.relationships[0].id,
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
