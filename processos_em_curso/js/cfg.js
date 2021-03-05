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
	"PAG01": {
		"nud_capa": "Processo", 
		"nud_reg": "Documento", 
		"desc_tipo_proc": "Tipo de processo",
		"desc_oper_urb": "Operação urbanística",
		"num_conservatoria": "Registo predial",

		"num_titulo": "Número de tí­tulo",
		"data_emissao": "Data emissão tí­tulo",
		"data_entrada": "Data entrada",

		"aprov_arq_despacho": "Despacho aprovacão arq.ª",
		"aprov_arq_data_despacho": "Data despacho aprov.arq.ª",

		"entrada": "Em 'entrada'"
	},
	"PAG02": {
		"total": "Número total de fogos",
		"abc": "Área bruta construção",
		"atc": "Área total construção",
		"estorcam": "Estimativa orçamental",
		"volum_constr": "Volume construção",
		"area_implant": "Área implantação",
		"cercea": "Cércea", 
		"pisos_abaixo_csol": "Pisos abaixo cot.soleira", 
		"pisos_acima_csol": "Pisos acima cot.soleira",
		"prazo": "Prazo"
	}
};