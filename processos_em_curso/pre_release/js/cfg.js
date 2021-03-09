//  ===========================================================================
//  Configuração geral
//  ---------------------------------------------------------------------------
var WEBMAP_SOURCE = "https://portalsig.cm-porto.pt/portal";
var PORTALITEM_ID = "25f42060fa80453fba15320eb85d7b25" // Processos em curso prod

var VIEW_EXTENT = {
	xmin: -46900.0,
	ymin: 162000.0,
	xmax: -34700.0, 
	ymax: 170000.0,
	spatialReference: {
		wkid: 102161
	}
};

var ATTR_TEXT = "2021 CM-Porto / Dados: DM Gestão Urbanística, dev: DM Sistemas Informação / Datum 73";

var LYRS_DA_LEGENDA = [ 4 ];
var LYR_SELECCAO_INTERACTIVA = 4;

var SCALEBAR_SHOW = false;
var COORDSDISPLAY_SHOW = true;

var TITLE_FADING_MSECS = 200;

var HIGHLIGHT_OPTS = {
	color: [255, 255, 0, 1],
	haloOpacity: 0.9,
	fillOpacity: 0.2
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
	"cercea":  ["Cércea (nº pisos)",  null],
	"pisos_abaixo_csol":  ["Pisos abaixo cot.soleira",  null],
	"pisos_acima_csol":  ["Pisos acima cot.soleira", null],
	"prazo":  ["Prazo (dias)", null]
};
