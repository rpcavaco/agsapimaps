//  ===========================================================================
//  Configuração 
//  ---------------------------------------------------------------------------

var MAPLAYERS = {
    base: { url: "/public/rest/services/INFORMACAO_BASE/ENQUADRAMENTO_BW_SemFregs_PTTM06/MapServer" },
    lyr99_top: { url: "/public/rest/services/INFORMACAO_BASE/ENQUADRAMENTO_Top_PTTM06/MapServer" }
}

var FEATLAYERS = {
    lyr10_lotesProcEmCurso: {
		url: "/public/rest/services/GOU/ProcEmCurso_Pub_Final_PTTM06_Dev/MapServer",
		layerId: 0
	},
    lyr12_loteamProcEmCurso: {
		url: "/public/rest/services/GOU/ProcEmCurso_Pub_Final_PTTM06_Dev/MapServer",
		layerId: 1
	},
    lyr13_locSRUProcEmCurso: {
		url: "/public/rest/services/GOU/ProcEmCurso_Pub_Final_PTTM06_Dev/MapServer",
		layerId: 2
	},
    lyr11_entradasProcEmCurso: {
		url: "/public/rest/services/GOU/ProcEmCurso_Pub_Final_PTTM06_Dev/MapServer",
		layerId: 3
	}	
}

var LYR_TITLES = {
	lyr10_lotesProcEmCurso: "Alvarás de obras em curso",
	lyr12_loteamProcEmCurso: "Alvarás de loteamento em curso",
	lyr13_locSRUProcEmCurso: "Alvarás de obras SRU em curso",
	lyr11_entradasProcEmCurso: "Operações urbanísticas em curso"
}

var LYRS_SELECCAO_INTERACTIVA = [
	"lyr10_lotesProcEmCurso",
	"lyr12_loteamProcEmCurso",
	"lyr11_entradasProcEmCurso",
	"lyr13_locSRUProcEmCurso"
];

var LYRS_DA_LEGENDA = LYRS_SELECCAO_INTERACTIVA;

var LAYERVIZ_MODE = 'radiobutton'; // null ou 'radiobutton' -- visibilidade das FEATLAYERS é mutuamente exclusiva, ligar uma apaga  as outras

var AJAX_ENDPOINTS = {
	locqry: "https://loc.cm-porto.net/loc/c/lq",
	qry_map: "/public/rest/services/INFORMACAO_BASE/ENQUADRAMENTO_Top_PTTM06/MapServer",
	spec_queries: "https://munisig.cm-porto.pt/riscobdt/doget"
}

var QUERIES_CFG = {

	eixosVia: {
		type: "onfeatlayer",
		gtypes: ["polyline"],
		url: AJAX_ENDPOINTS.qry_map,
		template: "cod_topo='{0}'",
		layerId: 3,
		symb: {
			line: {
			type: "simple-line",
			width: 4,
			color: [255, 100, 0]
			}
		},
		expand: 1.5
	},

	numPol: {
		type: "onfeatlayer",
		gtypes: ["point"],
		url: AJAX_ENDPOINTS.qry_map,
		template: "cod_topo='{0}' and n_policia='{1}'",
		zoomscale: 800,
		layerId: 2,
		symb: {
			marker: {
			type: "simple-marker",  
            style: "x",
            color: "red",
            size: "16px",  // pixels
            outline: {  // autocasts as new SimpleLineSymbol()
              color: [ 255, 30, 30 ],
              width: 4  // points
            }
			}
		},
		expand: 1.5
	},
	
	byDoc: {
		url: AJAX_ENDPOINTS.spec_queries,
		gtypes: ["polygon", "point"],
		zoomscale: 800,
		symb: {
			line: {
			type: "simple-line",
			width: 4,
			color: [176, 6, 108]
		},
			marker: {
				type: "simple-marker",
				style: "x",
				color: [176, 6, 108],
				size: "16px",  // pixels
				outline: {  // autocasts as new SimpleLineSymbol()
				  color: [176, 6, 108],
				  width: 4  // points
				}
			}
		},
		qrylyr2maplyr: {
			nao_alv: "lyr10_lotesProcEmCurso",
			alvara: "lyr12_loteamProcEmCurso",
			entrada: "lyr11_entradasProcEmCurso",
			alvsru: "lyr13_locSRUProcEmCurso"
		},
		expand: 4.0
	}
}

var RECORD_PANELS_CFG = {
	main: {
		type: "switcher", // para já só 'switcher'
		max_attrs_per_page: 10,
		rotator_msg: "Processo {0} de {1}",
		attr_cfg: {
			
			nud_capa: ["Processo", null],
			n_processo: ["Processo", null],
			desc_tipo_proc:  ["Tipo de processo", null],
			tipo_processo: ["Tipo de processo", null],
			desc_oper_urb:  ["Operação urbanística", null],
			op_urbanistica: ["Operação urbanística", null], 
			uso: ["Uso", null], 
			num_conservatoria:  ["Registo predial", null],
			requerente: ["Requerente", null], 
			num_titulo:  ["Número de título", null],
			
			/* data_entrada:  ["Data entrada", 'epoch'], 
			aprov_arq_despacho:  ["Despacho aprovação arq.ª", null],
			aprov_arq_data_despacho:  ["Data despacho aprov.arq.ª", 'epoch'],
			entrada:  ["Em 'entrada'", null], */

			total:  ["Número total de fogos", null],
			// abc:  ["Área bruta construção (m2)", null],
			atc:  ["Área total construção (m2)", null],
			atc2:  ["Área total construção (m2)", null],
			volum_constr:  ["Volume construção", null],
			area_implant:  ["Área implantação (m2)", null],
			cercea:  ["Cércea",  null],
			pisos_abaixo_csol:  ["Pisos abaixo cot.soleira",  null],
			pisos_acima_csol:  ["Pisos acima cot.soleira", null],
			prazo:  ["Prazo (dias)", null],
			data_emissao:  ["Data emissão título", 'epoch'],
			aru: ["Área reabilitação urbana",null]
			
		},
		height_limits: [  // por numero de registos
			//até num linhas, altura
			[5, "180px"], 
			[10, "300px"], 
			[20, "380px"] 
		]		
	}
};

VIEW_SRID = 3763;

var VIEW_EXTENT = {
	xmin: -41600.0,
	ymin: 165400.0,
	xmax: -40000.0, 
	ymax: 166600.0,
	spatialReference: {
		wkid: VIEW_SRID
	}
};

var SCALE_LIMIT_FUNCS = [
	function(p_zoomval) {
		const ref  = 30000, wdg = document.getElementById("zoominmsg");
		if (wdg) {
			if (p_zoomval > ref) {
				wdg.style.display = 'block';
			} else {
				wdg.style.display = 'none';
			}
		}
	}
];

var ATTR_TEXT = "2021 CM-Porto / Dados: DM Gestão Urbanística, dev: DM Sistemas Informação / PT-TM06";

var SCALEBAR_SHOW = false;
var COORDSDISPLAY_SHOW = true;

var INITIAL_ANIM_MSECS = 6000;

var HIGHLIGHT_OPTS = {
	color: [255, 255, 0, 1],
	haloOpacity: 0.9,
	fillOpacity: 0.2
  }		

// Ao ativar as layers indicadas nas chaves deste dict,
//	 fazer-se-á zoom aos extents indicados, caso o extent
//   corrente esteja fora.
//
//	SE houver repetições / sobreposições de extents ativos para o 
//	 mesmo contexto de layers, apenas o primeiro extent é aplicado.
// 
var EXTENTS2CHK_ON_LYRVIZ_CHANGE = {
	lyr13_locSRUProcEmCurso: {
		env: {
		xmin: -41900.0,
		ymin: 163200.0,
		xmax: -39400.0, 
		ymax: 164900.0,
		spatialReference: {
			wkid: VIEW_SRID
			},
		},
		scale: 2000 
	}
}

var INTRO_MSG = "Introduza um topónimo, uma morada, um número de processo ou documento (NUP/NUD/ALV) ou número de alvará SRU.<br/><br/> Deve clicar num dos polígonos do mapa para ver os dados associados.";
var MSG_TIMEOUT_SECS = 7;
var HELP_MSG = "<b>Processos de operações urbanistas em curso</b> referem-se aos processos que se encontram a decorrer nos serviços do Departamento Municipal de Gestão Urbanística ainda sem decisão final emitida<br/><br/><b>Alvarás de obras SRU em curso</b> - alvarás emitidos pela Porto Vivo, SRU que se encontram em fase de obra;<br/><br/><b>Alvarás de loteamento em curso</b> – esta informação agrega alvarás para novas operações de loteamento, operações de loteamento com obras de urbanização e obras de urbanização que ainda não foram concretizados;<br/><br/><b>Alvarás de obras em curso</b> - alvarás emitidos pela Câmara Municipal do Porto que se encontram em fase de obra;<br/><br/><b>Num. processos em curso / Nº alvarás em curso para o local</b> – identifica no nº de processos/alvarás que se encontram a decorrer para o local<br/><br/>(clique com o rato nesta mensagem para a fechar)";
