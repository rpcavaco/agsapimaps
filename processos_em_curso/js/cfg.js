//  ===========================================================================
//  Configuração geral
//  ---------------------------------------------------------------------------
var WEBMAP_SOURCE = "https://portalsig.cm-porto.pt/portal";
var PORTALITEM_ID = "343749483d5d4c86b417a8b6f0aec18d" // Licenciamento em curso

var ATTR_TEXT = "2021 CM-Porto / Dados: DM Gestão Urbanística, dev: DM Sistemas Informação / Datum 73";

var LYRS_DA_LEGENDA = [ 2 ];
var LYR_SELECCAO_INTERACTIVA = 2;

var SCALEBAR_SHOW = false;
var COORDSDISPLAY_SHOW = true;
//  ===========================================================================


//  ===========================================================================
//  Configuração específica
//  ---------------------------------------------------------------------------
//
//  A. Lista de atributos
// 
var ATTRS_CFG = {
	"nud_capa": ["Processo", null],
	"nud_reg": ["Documento",  null],
	"desc_tipo_proc":  ["Tipo de processo", null],
	"desc_oper_urb":  ["Operação urbanística", null],
	"num_conservatoria":  ["Registo predial", null],

	"num_titulo":  ["Número de tí­tulo", null],
	"data_emissao":  ["Data emissão tí­tulo", 'date'],
	"data_entrada":  ["Data entrada", 'date'],

	"aprov_arq_despacho":  ["Despacho aprovacão arq.ª", null],
	"aprov_arq_data_despacho":  ["Data despacho aprov.arq.ª", 'date'],

	"entrada":  ["Em 'entrada'", null],

	"total":  ["Número total de fogos", null],
	"abc":  ["Área bruta construção (m2)", null],
	"atc":  ["Área total construção (m2)", null],
	"estorcam":  ["Estimativa orçamental (€)", null],
	"volum_constr":  ["Volume construção", null],
	"area_implant":  ["Área implantação (m2)", null],
	"cercea":  ["Cércea (nº pisos)",  null],
	"pisos_abaixo_csol":  ["Pisos abaixo cot.soleira",  null],
	"pisos_acima_csol":  ["Pisos acima cot.soleira", null],
	"prazo":  ["Prazo (dias)", null]
};