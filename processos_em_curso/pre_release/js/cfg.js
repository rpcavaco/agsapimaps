//  ===========================================================================
//  Configuração geral
//  ---------------------------------------------------------------------------

// Para modo WEBMAP -----------------------------------------------------------
/*
var WEBMAP_SOURCE = "https://portalsig.cm-porto.pt/portal";
var PORTALITEM_ID = "8c75c44b8e734aa5aba643598f3c8c9e";

var LYRS_DA_LEGENDA = [ 4 ];
var LYR_SELECCAO_INTERACTIVA = 4;
*/
// ----------------------------------------------------------------------------


// Para acesso direto a serviços ----------------------------------------------

var MAPLAYERS = {
    base: { url: "/arcgis/rest/services/INFORMACAO_BASE/ENQUADRAMENTO_BW_SemFregs_PTTM06/MapServer" },
    lyr99_top: { url: "/arcgis/rest/services/INFORMACAO_BASE/ENQUADRAMENTO_Top_PTTM06/MapServer" }
}

var FEATLAYERS = {
    lyr10_lotesProcEmCurso: {
		url: "/arcgis/rest/services/GOU/GOU_ProcEmCurso_Pub_Final_PTTM06/MapServer",
		layerId: 0
	},
    lyr11_loteamProcEmCurso: {
		url: "/arcgis/rest/services/GOU/GOU_ProcEmCurso_Pub_Final_PTTM06/MapServer",
		layerId: 1
	},
    lyr12_locSRUProcEmCurso: {
		url: "/arcgis/rest/services/GOU/GOU_ProcEmCurso_Pub_Final_PTTM06/MapServer",
		layerId: 2
	}	
}

var LYR_TITLES = {
	lyr10_lotesProcEmCurso: "Lotes com processos em curso",
	lyr11_loteamProcEmCurso: "Loteamentos com processos em curso",
	lyr12_locSRUProcEmCurso: "Licenciamento SRU em curso"	
}

var FEATURE_MAP = "/arcgis/rest/services/INFORMACAO_BASE/ENQUADRAMENTO_Top_PTTM06/MapServer";

var QUERIES_CFG = {

	eixosVia: {
		gtype: "ln",
		url: FEATURE_MAP,
		template: "cod_topo='{0}'",
		layerId: 3,
		symb: {
			type: "simple-line",
			width: 4,
			color: [255, 100, 0]
		}
	},

	numPol: {
		gtype: "pt",
		url: FEATURE_MAP,
		template: "cod_topo='{0}' and n_policia='{1}'",
		zoomscale: 800,
		layerId: 2,
		symb: {
			type: "simple-marker",  
            style: "x",
            color: "red",
            size: "16px",  // pixels
            outline: {  // autocasts as new SimpleLineSymbol()
              color: [ 255, 30, 30 ],
              width: 4  // points
            }
		}
	}

	
}

var LYRS_SELECCAO_INTERACTIVA = [
	"lyr10_lotesProcEmCurso",
	"lyr11_loteamProcEmCurso",
	"lyr12_locSRUProcEmCurso"
];

var LYRS_DA_LEGENDA = [
	"lyr10_lotesProcEmCurso",
	"lyr11_loteamProcEmCurso",
	"lyr12_locSRUProcEmCurso"
];

VIEW_SRID = 3763;

var VIEW_EXTENT = {
	xmin: -47200.0,
	ymin: 161900.0,
	xmax: -34700.0,
	ymax: 169500.0,
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

var ALT_EXPANSAO_PAINEL_DADOS = [
	//até num linhas, altura
	[5, "180px"], 
	[10, "280px"], 
	[20, "320px"] 
];

var AJAX_ENDPOINTS = {
	QRY: "https://servsig.cm-porto.net/loc/c/lq"
}
//  ===========================================================================



// Ao ativar as layers indicadas nas chaves deste dict,
//	 fazer-se-á zoom aos extents indicados, caso o extent
//   corrente esteja fora.
//
//	SE houver repetições / sobreposições de extents ativos para o 
//	 mesmo contexto de layers, apenas o primeiro extent é aplicado.
// 
var EXTENTS2CHK_ON_LYRVIZ_CHANGE = {
	lyr12_locSRUProcEmCurso: {
		xmin: -41900.0,
		ymin: 163200.0,
		xmax: -39400.0, 
		ymax: 164900.0,
		spatialReference: {
			wkid: VIEW_SRID
		}
	}
}

//  Lista de atributos
// 

var ATTRS_CFG = {
	nud_capa: ["Processo", null],
	n_processo: ["Processo", null],
	// nud_reg: ["Documento",  null],
	desc_tipo_proc:  ["Tipo de processo", null],
	tipo_processo: ["Tipo de processo", null],
	desc_oper_urb:  ["Operação urbanística", null],
	op_urbanistica: ["Operação urbanística", null], 
	uso: ["Uso", null], 
	num_conservatoria:  ["Registo predial", null],
	requerente: ["Requerente", null], 

	/* num_titulo:  ["Número de tí­tulo", null],

	data_entrada:  ["Data entrada", 'date'], 

	aprov_arq_despacho:  ["Despacho aprovação arq.ª", null],
	aprov_arq_data_despacho:  ["Data despacho aprov.arq.ª", 'date'],

	entrada:  ["Em 'entrada'", null], */

	total:  ["Número total de fogos", null],
	// abc:  ["Área bruta construção (m2)", null],
	atc:  ["Área total construção (m2)", null],
	atc2:  ["Área total construção (m2)", null],
	// "estorcam:  ["Estimativa orçamental (€)", null],
	volum_constr:  ["Volume construção", null],
	area_implant:  ["Área implantação (m2)", null],
	cercea:  ["Cércea",  null],
	pisos_abaixo_csol:  ["Pisos abaixo cot.soleira",  null],
	pisos_acima_csol:  ["Pisos acima cot.soleira", null],
	prazo:  ["Prazo (dias)", null],
	data_emissao:  ["Data emissão título", 'date'],
	aru: ["Área reabilitação urbana",null]
};
