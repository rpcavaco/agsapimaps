

function when_view_ready(p_view, p_sellayer, p_griddiv) {

	let hlight; //, grid;

	function qryFeats(scrPt) {

		const pt = p_view.toMap(scrPt);
		const rec_rps = new RecordPanelSwitcher();

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

				/*const flds = [];
				for (let pg in ATTRS_CFG) {						
					flds.push.apply(flds, Object.keys(ATTRS_CFG[pg]))
				} */
				
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
				let registos_fmt = "Processo {0} de {1}"
				const exph = "380px";

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

					while (resultsDiv.firstChild) {
						resultsDiv.removeChild(resultsDiv.firstChild);
					}
				  

					let attrs_per_page_cnt;
					let max_attrs_per_page = 12;
					let navDiv, navInnerDiv, pageDiv;
					let pageNum;
					let reckey, pagekey;

					let spEl, btEl;

					if (rows.length>0) {
						// expandir gridDiv
						const mainmsgDiv = document.getElementById("mainmsg");
						if (mainmsgDiv) {
							mainmsgDiv.style.display = "none"
						}
						resultsDiv.style.height = exph;						
					}

					if (rows.length>1) {

						// inserir botões de navegação entre registos
						navDiv = document.createElement("div");
						resultsDiv.appendChild(navDiv);

						navInnerDiv = document.createElement("div");
						resultsDiv.appendChild(navInnerDiv);
						navInnerDiv.setAttribute("class", "graybtn");
						
						btEl = document.createElement("button");
						navInnerDiv.appendChild(btEl);
						//btEl.setAttribute("class", "graybtn");
						spEl = document.createElement("span");
						spEl.setAttribute("class", "left-arrow");
						btEl.appendChild(spEl);
						(function(p_btEl, p_rec_rps, p_nrows) {
							attEventHandler(p_btEl, 'click', 
								function(evt) {
									const num = p_rec_rps.rotatePrev();
									const el = document.getElementById("rec-nav-nums");
									if (el) {
										el.textContent = String.format(registos_fmt, num, p_nrows);
									}
								}
							);							
						})(btEl, rec_rps, rows.length);

						spEl = document.createElement("span");
						spEl.setAttribute("id", "rec-nav-nums");
						//spEl.setAttribute("class", "graybtn");
						navInnerDiv.appendChild(spEl);
						spEl.textContent = String.format(registos_fmt, 1, rows.length);

						btEl = document.createElement("button");
						navInnerDiv.appendChild(btEl);
						//btEl.setAttribute("class", "graybtn");
						spEl = document.createElement("span");
						spEl.setAttribute("class", "right-arrow");
						btEl.appendChild(spEl);
						// spEl.textContent = "Rec seguinte";
						(function(p_btEl, p_rec_rps, p_nrows) {
							attEventHandler(p_btEl, 'click', 
								function(evt) {
									const num = p_rec_rps.rotateNext();
									const el = document.getElementById("rec-nav-nums");
									if (el) {
										el.textContent = String.format(registos_fmt, num, p_nrows);
									}
								}
							);							
						})(btEl, rec_rps, rows.length);	

					}

					let ulEl, liEl, val;

					for (let i=0; i<rows.length; i++) {
						
						reckey = rec_rps.recKey(i+1);
						pageNum = 0;
						ulEl = null;
						pageDiv = null;
						attrs_per_page_cnt = 0;
						pageNum = 0;

						pagekey = rec_rps.pageKey(pageNum+1)
						rec_rps.newRecord(reckey);
						
						for (let fld in ATTRS_CFG) {

							let lbl = ATTRS_CFG[fld][0];
							let fmt = ATTRS_CFG[fld][1];
							let preval = rows[i][fld];

							if (preval == null || preval.length==0) {
								continue;
							}

							switch (fmt) {
								case 'date':
									d = new Date(0);
									d.setUTCSeconds(preval / 1000);
									val = d.toLocaleDateString();
									break;

								default:
									val = preval;
							}

							if (pageDiv == null || attrs_per_page_cnt >= max_attrs_per_page) {	
								if (pageDiv) {
									rec_rps.addPanel(reckey, pageDiv, pagekey);
									pageNum++;
									pagekey = rec_rps.pageKey(pageNum+1);
									attrs_per_page_cnt = 0;
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
							liEl.insertAdjacentHTML('afterBegin', lbl);
							spEl = document.createElement("span");
							spEl.setAttribute("style", "float: right");
							spEl.textContent = val;
							liEl.appendChild(spEl);

							attrs_per_page_cnt++;
						}
						// todo - não fazer se n houver conteudo
						if (pageDiv != null) {
							rec_rps.addPanel(reckey, pageDiv, pagekey);
						}
	
					} // for row in  rows
					// atualizar mensagem "1 de n registos"

					rec_rps.resetIteration(); 
					let recpanelcoll = rec_rps.iterateNext();
					while (recpanelcoll) {

						let recPanels = recpanelcoll.content;
						recPanels.resetIteration(); 
						let recpaneliter = recPanels.iterateNext();
						let recpanel_count = 0;

						while (recpaneliter && recpanel_count < 50) {

							recpanel_count++;

							// inserir botões de navegação entre páginas do mesmo registo
							if (!recpaneliter.is_first) {
								btEl = document.createElement("button");
								recpaneliter.content.dom_elem.appendChild(btEl);
								btEl.setAttribute("class", "graybtn float-left");
								spEl = document.createElement("span");
								spEl.setAttribute("class", "left-arrow");
								btEl.appendChild(spEl);
								spEl.textContent = "Página anterior";
								(function(p_btEl, p_rec_rps, p_reckey, p_panelkey) {
									attEventHandler(p_btEl, 'click', 
										function(evt) {
											p_rec_rps.activatePanel(p_reckey, p_panelkey);
										}
									);							
								})(btEl, rec_rps, recpanelcoll.reckey, recpaneliter.prevkey);
							}
							if (!recpaneliter.is_last) {
								btEl = document.createElement("button");
								recpaneliter.content.dom_elem.appendChild(btEl);
								btEl.setAttribute("class", "graybtn float-right");
								spEl = document.createElement("span");
								spEl.setAttribute("class", "right-arrow");
								btEl.appendChild(spEl);
								spEl.textContent = "Página seguinte";
								(function(p_btEl, p_rec_rps, p_reckey, p_panelkey) {
									attEventHandler(p_btEl, 'click', 
										function(evt) {
											p_rec_rps.activatePanel(p_reckey, p_panelkey);
										}
									);							
								})(btEl, rec_rps, recpanelcoll.reckey, recpaneliter.nextkey);
							}
							recpaneliter = recPanels.iterateNext();
						}
						recpanelcoll = rec_rps.iterateNext();
					}
				}); // .forEach(function(objectId){
					
			}
		/*).catch(
			function(error) {
				console.error(error);
			}*/
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
