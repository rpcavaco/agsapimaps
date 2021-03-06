
function when_view_ready(p_view, p_sellayer, p_griddiv) {

	let hlight; //, grid;

	function qryFeats(scrPt) {
		const pt = p_view.toMap(scrPt);
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

				const flds = [];
				for (let pg in ATTRS_CFG) {						
					flds.push.apply(flds, Object.keys(ATTRS_CFG[pg]))
				} 
				
				return p_sellayer.queryRelatedFeatures({
					outFields: flds,
					relationshipId: p_sellayer.relationships[0].id,
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
					const results = document.getElementById(p_griddiv);

					/*
					const gridDiv = document.createElement("div")
					results.appendChild(gridDiv);

					// destroy current grid if exists
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

					let gridPageDiv;
					const gdpages = {};
					for (let pg in ATTRS_CFG) {
						gridPageDiv = document.createElement("div")
						gdpages[pg] = gridPageDiv;
						gridPageDiv.setAttribute("id", "gridpage_"+pg);
						if (pg != "PAG01") {
							gridPageDiv.style.display = "none";
						}
						results.appendChild(gridPageDiv);
					}

					let ulEl, liEl, spEl, btElRight;
					for (let i=0; i<rows.length; i++) {
						
						for (let pg in ATTRS_CFG) {

							ulEl = document.createElement("ul");
							gdpages[pg].appendChild(ulEl);
							ulEl.setAttribute("class", "attrs-list");
							
							for (let fld in ATTRS_CFG[pg]) {

								liEl = document.createElement("li");
								ulEl.appendChild(liEl);
								liEl.setAttribute("class", "nobull");
								liEl.insertAdjacentHTML('afterBegin', ATTRS_CFG[pg][fld]);
								//liEl.innerText = String.format("{0}: {1}", ATTRS_CFG[fld], rows[i][fld]);
								spEl = document.createElement("span");
								spEl.setAttribute("style", "float: right");
								spEl.textContent = rows[i][fld];
								liEl.appendChild(spEl);
							}

							switch (pg) {
								case "PAG01":
									btElRight = document.createElement("button");
									gdpages[pg].appendChild(btElRight);
									btElRight.setAttribute("class", "iconbtn float-right");
									spEl = document.createElement("span");
									spEl.setAttribute("class", "right-arrow");
									btElRight.appendChild(spEl);
									spEl.textContent = "Página seguinte";
									attEventHandler(btElRight, 'click', 
										function(evt) {
											const el1 = document.getElementById("gridpage_PAG01");
											const el2 = document.getElementById("gridpage_PAG02");
											if (el1!=null && el2!=null) {
												el1.style.display = "none";
												el2.style.display = "block";
											}
										}
									);
									break;

								case "PAG02":
									btElRight = document.createElement("button");
									gdpages[pg].appendChild(btElRight);
									btElRight.setAttribute("class", "iconbtn float-left");
									spEl = document.createElement("span");
									spEl.setAttribute("class", "left-arrow");
									btElRight.appendChild(spEl);
									spEl.textContent = "Página anterior";
									attEventHandler(btElRight, 'click', 
										function(evt) {
											const el1 = document.getElementById("gridpage_PAG02");
											const el2 = document.getElementById("gridpage_PAG01");
											if (el1!=null && el2!=null) {
												el1.style.display = "none";
												el2.style.display = "block";
											}
										}
									);
									break;

							}
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
	
	p_view.on("click", function(evt) {
		clearMap();
		qryFeats(evt);
	});
			

}
