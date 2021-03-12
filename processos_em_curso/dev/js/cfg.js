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
    "base": "/arcgis/rest/services/INFORMACAO_BASE/ENQUADRAMENTO_BW_SemFregs_PTTM06/MapServer",
    "lyr99_top": "/arcgis/rest/services/INFORMACAO_BASE/ENQUADRAMENTO_Top_PTTM06/MapServer"
}

var FEATLAYERS = {
    "lyr10_lotesProcEmCurso": "/arcgis/rest/services/GOU/GOU_ProcEmCurso_Pub_Final_PTTM06_Dev/MapServer"
}

var LYR_TITLES = {
	"lyr10_lotesProcEmCurso": "Lotes com processos em curso"
}

var FEATURE_MAP = "/arcgis/rest/services/INFORMACAO_BASE/ENQUADRAMENTO_Top_PTTM06/MapServer";

var QUERIES_CFG = {

	"eixosVia": {
		"url": FEATURE_MAP,
		"template": "cod_topo='{0}'",
		"layerId": 3,
		"symb": {
			type: "simple-line",
			width: 4,
			color: [255, 100, 0]
		}
	},

	"numPol": {
		"url": FEATURE_MAP,
		"template": "cod_topo='{0}' and n_policia='{0}'",
		"layerId": 2,
		"symb": {
			type: "simple-marker",  
			style: "square",
			color: "blue",
			size: "8px",  // pixels
			outline: {  // autocasts as new SimpleLineSymbol()
			  color: [ 255, 255, 0 ],
			  width: 3  // points
			}
		}
	}

	
}

var LYR_SELECCAO_INTERACTIVA_KEY = "lyr10_lotesProcEmCurso";
var LYRS_DA_LEGENDA = ["lyr10_lotesProcEmCurso"];

var VIEW_EXTENT = {
	xmin: -41600.0,
	ymin: 165400.0,
	xmax: -40000.0, 
	ymax: 166600.0,
	spatialReference: {
		wkid: 3763
	}
};

var ATTR_TEXT = "2021 CM-Porto / Dados: DM Gestão Urbanística, dev: DM Sistemas Informação / PT-TM06";


var SCALEBAR_SHOW = false;
var COORDSDISPLAY_SHOW = true;

var TITLE_FADING_MSECS = 250;

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
	QRY: "https://loc.cm-porto.net/loc/c/lq"
}
//  ===========================================================================


//  ===========================================================================
//  Configuração específica
//  ---------------------------------------------------------------------------
//
//  A. Lista de atributos
// 
var ATTRS_CFG = {
	"nud_capa": ["Processo", null],
	// "nud_reg": ["Documento",  null],
	"desc_tipo_proc":  ["Tipo de processo", null],
	"desc_oper_urb":  ["Operação urbanística", null],
	"num_conservatoria":  ["Registo predial", null],

	/* "num_titulo":  ["Número de tí­tulo", null],
	"data_emissao":  ["Data emissão tí­tulo", 'date'],
	"data_entrada":  ["Data entrada", 'date'], 

	"aprov_arq_despacho":  ["Despacho aprovação arq.ª", null],
	"aprov_arq_data_despacho":  ["Data despacho aprov.arq.ª", 'date'],

	"entrada":  ["Em 'entrada'", null], */

	"total":  ["Número total de fogos", null],
	// "abc":  ["Área bruta construção (m2)", null],
	"atc":  ["Área total construção (m2)", null],
	// "estorcam":  ["Estimativa orçamental (€)", null],
	"volum_constr":  ["Volume construção", null],
	"area_implant":  ["Área implantação (m2)", null],
	"cercea":  ["Cércea",  null],
	"pisos_abaixo_csol":  ["Pisos abaixo cot.soleira",  null],
	"pisos_acima_csol":  ["Pisos acima cot.soleira", null],
	"prazo":  ["Prazo (dias)", null]
};