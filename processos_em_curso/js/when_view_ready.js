

function when_view_ready(p_view, p_sellayer, p_griddiv) {

	let hlight; //, grid;
	let rps = RecordPanelSwitcher();

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

				PanelSwitcherSingleton.createRecordsCollection();
				
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

					const resultsDiv = document.getElementById(p_griddiv);

					// Listas

					/*let gridPageDiv;
					const gdpages = {};
					for (let pg in ATTRS_CFG) {
						gridPageDiv = document.createElement("div")
						gdpages[pg] = gridPageDiv;
						gridPageDiv.setAttribute("id", "gridpage_"+pg);
						if (pg != "PAG01") {
							gridPageDiv.style.display = "none";
						}
						results.appendChild(gridPageDiv);
					}*/

					let attrs_per_page_cnt = 0;
					let max_attrs_per_page = 10;
					let pageDiv = null;
					let ulEl = null;
					let pageNum = 0;
					let reckey, pagekey;

					let liEl, spEl, btEl;

					for (let i=0; i<rows.length; i++) {
						
						reckey = rps.recKey(i+1);
						pagekey = rps.pageKey(pageNum+1)
						rps.newRecord(reckey);
						
						for (let fld in ATTRS_CFG) {

							if (pageDiv == null || attrs_per_page_cnt >= max_attrs_per_page) {	
								if (pageDiv) {
									rps.addPanel(reckey, pageDiv, rps.pageKey(pageNum+1));
									pageNum++;
									pagekey = rps.pageKey(pageNum+1);
								}
								pageDiv = document.createElement("div");	
								resultsDiv.appendChild(pageDiv);				
								ulEl = document.createElement("ul");
								pageDiv.appendChild(ulEl);				
								ulEl.setAttribute("class", "attrs-list");
							}
							
							liEl = document.createElement("li");
							ulEl.appendChild(liEl);
							liEl.setAttribute("class", "nobull");
							liEl.insertAdjacentHTML('afterBegin', ATTRS_CFG[fld]);
							//liEl.innerText = String.format("{0}: {1}", ATTRS_CFG[fld], rows[i][fld]);
							spEl = document.createElement("span");
							spEl.setAttribute("style", "float: right");
							spEl.textContent = rows[i][fld];
							liEl.appendChild(spEl);

						}

					}

					rps.resetIteration(); 
					let recpanelcoll = rps.iterateNext();
					while (recpanelcoll) {
						let recPanels = recpanelcoll.content;
						recPanels.resetIteration(); 
						let recpanel = recPanels.iterateNext();
						while (recpanel) {
							if (!recpanel.is_first) {
								btEl = document.createElement("button");
								gdpages[pg].appendChild(btEl);
								btEl.setAttribute("class", "iconbtn float-left");
								spEl = document.createElement("span");
								spEl.setAttribute("class", "left-arrow");
								btEl.appendChild(spEl);
								spEl.textContent = "Página anterior";
								attEventHandler(btEl, 'click', 
									function(evt) {
										const el1 = document.getElementById("gridpage_PAG02");
										const el2 = document.getElementById("gridpage_PAG01");
										if (el1!=null && el2!=null) {
											el1.style.display = "none";
											el2.style.display = "block";
										}
									}
								);
							}
							if (!recpanel.is_last) {
								btEl = document.createElement("button");
								gdpages[pg].appendChild(btEl);
								btEl.setAttribute("class", "iconbtn float-right");
								spEl = document.createElement("span");
								spEl.setAttribute("class", "right-arrow");
								btEl.appendChild(spEl);
								spEl.textContent = "Página seguinte";
								attEventHandler(btEl, 'click', 
									function(evt) {
										const el1 = document.getElementById("gridpage_PAG01");
										const el2 = document.getElementById("gridpage_PAG02");
										if (el1!=null && el2!=null) {
											el1.style.display = "none";
											el2.style.display = "block";
										}
									}
								);
							}
							recpanel = recPanels.iterateNext();
						}
						recpanelcoll = rps.iterateNext();
					}
				}); // .forEach(function(objectId){
					
			}).catch(
				function(error) {
					console.error(error);
				}
			); // function(relatedFeatureSetByObjectId){
				// >>>>>>>>>>>>>>>>>>>>>>>>

				//clearbutton.style.display = "inline";
		}
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
