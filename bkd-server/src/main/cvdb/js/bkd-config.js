BKDconf = {
    "report": {     
        "feature":{
            "channel-report":{
                active: true,
                type:"channel-report",
                cvType:{"ac":"dxf:0096","definition":"","name":"channel-report","ns":"dxf"},
                label:"Channel report",
                ac:{
                    "id":"ac",
                    "vpath":['ac'],
                    "type":"hidden"
                },
                presubmit: "report_presubmit", 
                "header":[
                    { "name":"CVUS Experimental Protein Report",
                      "value":"Voltage-gated Channel Report",                      
                      "type":"label",
                      "css-class": "bkd-rep-head-1",
                      "edit":false
                    },
                    { "name":"Report ID",
                      "vpath":['ac'],
                      "type":"label",
                      "css-class": "bkd-rep-head-3",
                      "edit":false
                    }
                ],
                
                "target":[
                    { "name":"ns",
                      "vpath":['target','ns'],
                      "id":"report_target_ns",
                      "type":"hidden" },
                    { "name":"ac",
                      "vpath":['target','ac'],
                      "id":"report_target_ac",
                      "type":"hidden" },
                    
                    { "name":"Protein",
                      "css-class": "bkd-rep-head-1",
                      "vpath":['target','name'],
                      "vpath-short":['target','label']},
                    { "name":"Gene",
                      "vpath":['target','gene']},
                    
                    {name:"Experimental Sequence ID",
                     value:"",
                     type:"label",
                     id: "report_target_feature_seqid", 
                     "css-class": "bkd-rep-head-3",
                     edit: true,                     
                     custom_edit: "report_tgt_edit",
                     custom_view: "report_tgt_view"                     
                    },
                    
                    {"name":"Taxon",
                     "vpath":['target','taxon'],
                     "type":"taxon" },
                    
                    {"name":"Cross-references",
                     "css-class": "bkd-rep-head-3",
                     vpath:['target','xrefs'],
                     type:"xref",                     
                     "id":"report_target_feature_node_xrefs",
                     "list":true,
                     "collapse":true
                    },
                    
                    {name:"Protein Sequence Variant",
                     "css-class": "bkd-rep-head-2",
                     id:"report_target_feature",
                     list: true,
                     value:[ 
                         {"name":"Name",
                          'id':'report_target_feature_label',
                          "vpath":['target','feature','label'],
                          "edit": true
                         },
                         {"name":"Type",
                          "id":"report_target_feature_cvtype",
                          "vpath":['target','feature'], 
                          "type": 'cvtype',
                          "cvt-list":[{ns:"psi-mi", ac:"MI:0000", name:"",
                                       label:"-- not specified --"},
                                      {ns:"psi-mi", ac:"MI:1241", name:"variant",
                                       label:"Variant(natural)"},
                                      {ns:"psi-mi", ac:"MI:0118", name:"mutation",
                                       label:"Mutation"}],
                          "edit": true
                         },                      
                         {"name":"Position/Range",
                          "css-class": "bkd-rep-head-3",
                          "id":'report_target_feature_ranges',
                          "list": true,
                          "edit": true,
                          "vpath":['target','feature','range'],
                          "type": 'range'
                         },
                         {"name":"Cross-references",
                          "css-class": "bkd-rep-head-3",
                          "id":'report_target_feature_xrefs',
                          xref_type_exclude: "describes",
                          "vpath":['target','feature','xref'],
                          "type":"xref",
                          "xref-ns":[{"ns":"psi-mi",label:"-- database --"},
                                     {"ns":"cvdb",label:"CVUS"},
                                     {"ns":"dbsnp",label:"dbSNP"},
                                     {"ns":"clinvar",label:"ClinVar"},
                                     {"ns":"mim",label:"OMIM"},
                                     {"ns":"cosmic",label:"Cosmic"},
                                     {"ns":"pmid",label:"PubMed"}],
                          "xref-type":[{"ns":"dxf","ac":"dxf:0000",
                                        "name":"","label":"-- xref type --"},
                                       {"ns":"psi-mi","ac":"MI:1241",
                                        "name":"variant","label":"Variant (natural)"},
                                       {"ns":"psi-mi","ac":"MI:0118",
                                        "name":"mutation","label":"Mutation"},
                                       {"ns":"dxf","ac":"dxf:0077",
                                        "name":"has-phenotype","label":"Phenotype"},
                                       {"ns":"dxf","ac":"dxf:0014",
                                        "name":"described-by","label":"Data source"}],
                          "list":true,
                          "edit": true
                         }
                     ]
                    }
                ],  // end of target section
                
                value:[
                    {"name":'Report type',
                     'ns':"cvd",  
                     'ac':"cvd:0001",  
                     'value':'channel-report',
                     'label':'Channel report',
                     'id': 'report_type',
                     "type":"label",
                     "css-class": "bkd-rep-head-1",
                     "edit": false},
                    {"name":'Report Status',
                     'ns':"dxf",  
                     'ac':"dxf:0125",  
                     'value':'status',
                     'label':'Report status',
                     'id': 'report_value_status',
                     'type': 'cvterm',
                     'cvt-list':[{ns:"dxf", ac:"dxf:0000", name:"",
                                  label:"-- not specified --"},
                                 {ns:"dxf", ac:"dxf:0121", name:"processing",
                                  label:"Processing"},
                                 {ns:"dxf", ac:"dxf:0122", name:"processed",
                                  label:"Processed"},
                                 {ns:"dxf", ac:"dxf:0123", name:"validated",
                                  label:"Validated"},
                                 {ns:"dxf", ac:"dxf:0124", name:"released",
                                  label:"Released"}],
                     "edit": true},
                    {"name":'Channel activation',
                     'ns':"cvd",  
                     'ac':"cvd:0002",  
                     'value':'channel-activation',           
                     'id': 'report_value_channel-activation',
                     "type":"text",
                     "edit": true},
                    {"name":'Channel inactivation',
                     'ns':"cvd",  
                     'ac':"cvd:0003",  
                     'id':'report_value_channel-inactivation',
                     'value':'channel-inactivation',
                     "type":"text",
                     "edit": true},
                    {"name":'Channel selectivity',
                     'ns':"cvd",  
                     'ac':"cvd:0004",  
                     'id':'report_value_channel-selectivity',
                     'value':'channel-selectivity',
                     "type":"text",
                     "edit": true},
                    {"name":'Channel expression',
                     'ns':"cvd",  
                     'ac':"cvd:0005",
                     'id':'report_value_channel-expression',
                     'value':'channel-expression',
                     "type":"text",
                     "edit": true},
                    {"name":'Comments',
                     'ns':"cvd",
                     'ac':"cvd:0006",
                     'id':'report_value_comments',
                     'value':'comments',
                     "type":"text",
                     "edit": true}]
            },   // END: channel-report
       
            "transporter-report":{
                "active": true,
                "type":"transporter-report",
                cvType:{"ac":"dxf:0097","definition":"","name":"transporter-report","ns":"dxf"},
                "label":"Transporter report",
                "ac":{
                    "id":"ac",
                    "vpath":['ac'],
                    "type":"hidden"},
                presubmit: "report_presubmit",
                "header":[
                    { "name":"CVUS Experimental Protein Report",
                      "value":"Membrane Tansporter Report",                      
                      "type":"label",
                      "css-class": "bkd-rep-head-1",
                      "edit":false
                    },
                    { "name":"Report ID",
                      "vpath":['ac'],
                      "type":"label",
                      "css-class": "bkd-rep-head-3",
                      "edit":false
                    }
                ],
                "target":[
                    {"name":"ns",
                     "vpath":['target','ns'],
                     "id":"report_target_ns",
                     "type":"hidden" },
                    {"name":"ac",
                     "vpath":['target','ac'],
                     "id":"report_target_ac",
                     "type":"hidden" },
                    
                    {"name":"Protein",
                     "css-class": "bkd-rep-head-1",
                     "vpath":['target','name']},
                    {"name":"Gene",
                     "vpath":['target','gene']},
                    
                    {name:"Experimental Sequence ID",
                     value:"O6503-2",
                     type:"label",
                     id: "report_target_feature_seqid", 
                     "css-class": "bkd-rep-head-3",
                     edit: true,                     
                     custom_edit: "report_tgt_edit",
                     custom_view: "report_tgt_view"                     
                    },
                    
                    {"name":"Taxon",
                     "vpath":['target','taxon'],
                     "type":"taxon" },

                    
                    {"name":"Cross-references",
                     "css-class": "bkd-rep-head-3",
                     "vpath":['target','xref'],
                     "type":"xref",
                     "id":"report_target_feature_node_xrefs",
                     "list":true,
                     "collapse":true
                    },
                    
                    {"name":"Protein Sequence Variant",
                     "css-class": "bkd-rep-head-2",
                     "id":"report_target_feature",
                     "list": true,
                     "value":[
                         {"name":"Name",
                          'id':'report_target_feature_label',
                          "vpath":['target','feature','label'],
                          "edit": true
                         },
                         {"name":"Type",
                          "id":"report_target_feature_cvtype",
                          "vpath":['target','feature'],
                          "type": 'cvtype',
                          "cvt-list":[{ns:"psi-mi", ac:"MI:0000", name:"",
                                       label:"-- not specified --"},
                                      {ns:"psi-mi", ac:"MI:1241", name:"variant",
                                       label:"Variant(natural)"},
                                      {ns:"psi-mi", ac:"MI:0118", name:"mutation",
                                       label:"Mutation"}],
                          "edit": true
                      },
                      {"name":"Position/Range",
                       "id":'report_target_feature_ranges',
                       "list": true,
                       "edit": true,
                       "vpath":['target','feature','range'],
                       "type": 'range'
                       },
                      {"name":"Cross-references",
                       "css-class": "bkd-rep-head-3",
                       "id":'report_target_feature_xrefs',
                       xref_type_exclude: "describes",
                       "vpath":['target','feature','xref'],
                       "type":"xref",
                       "xref-ns":[{ns:"psi-mi",label:"-- database --"},
                                  {ns:"cvdb",label:"CVUS"},
                                  {ns:"dbsnp",label:"dbSNP"},
                                  {ns:"clinvar",label:"ClinVar"},
                                  {ns:"mim",label:"OMIM"},
                                  {ns:"cosmic",label:"Cosmic"},
                                  {ns:"pmid",label:"PubMed"}],
                       "xref-type":[{ns:"dxf",ac:"dxf:0000",
                                   name:"",label:"-- xref type --"},
                                  {ns:"psi-mi","ac":"MI:1241",
                                   "name":"variant",label:"Variant (natural)"},
                                  {ns:"psi-mi","ac":"MI:0118",
                                   "name":"mutation",label:"Mutation"},
                                  {ns:"dxf","ac":"dxf:0077",
                                   "name":"has-phenotype",label:"Phenotype"},
                                  {ns:"dxf","ac":"dxf:0014",
                                   "name":"described-by",label:"Data source"}],
                       "list":true,
                       "edit": true

                      }]
                    }],  //end of target section
                
            "value":[ {"name":'Report type',
                      'ns':"cvd",  
                      'ac':"cvd:0001",  
                      'value':'transporter-report',
                      'label':'Transporter report',
                      'id': 'report_type',
                      "type":"label",
                       "edit": false},
                      {"name":'Report Status',
                       'ns':"dxf",  
                       'ac':"dxf:0125",  
                       'value':'status',
                       'label':'Report status',
                       'id': 'report_value_status',
                       'type': 'cvterm',
                       'cvt-list':[{ns:"dxf", ac:"dxf:0000", name:"",
                                    label:"-- not specified --"},
                                   {ns:"dxf", ac:"dxf:0121", name:"processing",
                                    label:"Processing"},
                                   {ns:"dxf", ac:"dxf:0122", name:"processed",
                                    label:"Processed"},
                                   {ns:"dxf", ac:"dxf:0123", name:"validated",
                                    label:"Validated"},
                                   {ns:"dxf", ac:"dxf:0124", name:"released",
                                  label:"Released"}],
                       "edit": true},
                      {"name":'Transporter activation',
                      'ns':"cvd",  
                      'ac':"cvd:0007",  
                      'value':'transporter-activation',
                      'id': 'report_value_transporter-activation',
                      "type":"text",
                      "edit": true},
                     {"name":'Transporter inactivation',
                      'ns':"cvd",  
                      'ac':"cvd:0008",  
                      'id':'report_value_transporter-inactivation',
                      'value':'transporter-inactivation',
                      "type":"text",
                      "edit": true},
                     {"name":'Transporter selectivity',
                      'ns':"cvd",  
                      'ac':"cvd:0009",  
                      'id':'report_value_transporter-selectivity',
                      'value':'transporter-selectivity',
                      "type":"text",
                      "edit": true},
                     {"name":'Transporter expression',
                      'ns':"cvd",  
                      'ac':"cvd:0010",
                      'id':'report_value_transporter-expression',
                      'value':'transporter-expression',
                      "type":"text",
                      "edit": true},
                     {"name":'Comments',
                      'ns':"cvd",
                      'ac':"cvd:0006",
                      'id':'report_value_comments',
                      "type":"text",
                      'value':'comment',
                      "edit": true}]
            },

            "gene-report":{
                "active": false,
                cvType:{ac:"dxf:0099",definition:"",name:"gene-report",ns:"dxf"},
                "type":"gene-report",
                "label":"Gene report",
                "target":[],
                "value":[]
            },
            "clinical-report":{
                "active": true,
                cvType:{ac:"dxf:0093",definition:"",name:"clinical-report",ns:"dxf"},
                "type":"clinical-report",
                "label":"Clinical report",
                "ac":{
                    "id":"ac",
                    "vpath":['ac'],
                    "type":"hidden"},
                presubmit: "report_presubmit", 
                "header":[
                    { "name":"CVUS Report",
                      "value":"Clinical Report",                      
                      "type":"label",
                      "css-class": "bkd-rep-head-1",
                      "edit":false
                    },
                    { "name":"Report ID",
                      "vpath":['ac'],
                      "type":"label",
                      "css-class": "bkd-rep-head-3",
                      "edit":false
                    }
                ],              
                "target":[
                    {"name":"ns",
                     "vpath":['target','ns'],
                     "id":"report_target_ns",
                     "type":"hidden" },
                    {"name":"ac",
                     "vpath":['target','ac'],
                     "id":"report_target_ac",
                     "type":"hidden" },
                    {"name":"Protein name",
                     "css-class": "bkd-rep-head-1",
                     "vpath":['target','name']},
                    {"name":"Gene",
                     "vpath":['target','gene']},
                    {"name":"Taxon",
                     "vpath":['target','taxon'],
                     "type":"taxon" },
                    {"name":"Cross-references",
                     "css-class": "bkd-rep-head-3",
                     "vpath":['target','xref'],
                     "type":"xref",
                     "id":"report_target_feature_node_xrefs",
                     "list":true,
                     "collapse":true
                    },
                    {"name":"Nucleotide Sequence Variant",
                     "css-class": "bkd-rep-head-2",
                     "id":"report_target_feature",
                     "list": true,
                     "value":[
                         {"name":"Name",
                          'id':'report_target_feature_label',
                          "vpath":['target','feature','label'],
                          "edit": true
                         },
                         {"name":"Type",
                          "id":"report_target_feature_cvtype",
                          "vpath":['target','feature'],
                          "type": 'cvterm',
                          
                          "cvt-list":[{ns:"psi-mi", ac:"MI:0000", name:"",
                                       label:"-- not specified --"},
                                      {ns:"psi-mi", ac:"MI:1241", name:"variant",
                                       label:"Variant(natural)"},
                                      {ns:"psi-mi", ac:"MI:0118", name:"mutation",
                                       label:"Mutation"}],
                          "edit": true
                          
                         },
                         {"name":"GRCh37 coordinate", 
                          "id":"report_target_feature_grch37",
                          "vpath":['target','feature','grch37'],
                          "edit":true                      
                         },
                         {"name":"GRCh38 coordinate", 
                          "id":"report_target_feature_grch38",
                          "vpath":['target','feature','grch38'],
                          "edit":true                      
                         },

                         //{name:"Protein Sequence ID",
                         // value:"",
                         // type:"label",
                         // id: "report_target_feature_seqid", 
                         // "css-class": "bkd-rep-head-3",
                         // edit: true,                     
                         // custom_edit: "report_tgt_edit",
                         // custom_view: "report_tgt_view"                     
                         //},
                                             
                         {"name":"Position/Range",
                          "id":'report_target_feature_ranges',
                          "list": true,
                          "edit": true,
                          "vpath":['target','feature','range'],
                          "type": 'range'
                         },
                         {"name":"Cross-references",
                          "css-class": "bkd-rep-head-3",
                          "id":'report_target_feature_xrefs', 
                          "vpath":['target','feature','xref'],
                          "type":"xref",
                          "xref-ns":[{ns:"psi-mi",label:"-- database --"},
                                     {ns:"cvdb",label:"CVUS"},
                                     {ns:"dbsnp",label:"dbSNP"},
                                     {ns:"clinvar",label:"ClinVar"},
                                     {ns:"mim",label:"OMIM"},
                                     {ns:"cosmic",label:"Cosmic"},
                                     {ns:"pmid",label:"PubMed"}],
                          "xref-type":[{ns:"dxf",ac:"dxf:0000",
                                        name:"",label:"-- xref type --"},
                                       {ns:"psi-mi","ac":"MI:1241",
                                        "name":"variant",label:"Variant (natural)"},
                                       {ns:"psi-mi","ac":"MI:0118",
                                        "name":"mutation",label:"Mutation"},
                                       {ns:"dxf","ac":"dxf:0077",
                                        "name":"has-phenotype",label:"Phenotype"},
                                       {ns:"dxf","ac":"dxf:0014",
                                        "name":"described-by",label:"Data source"}],
                          
                          "list":true,
                          "edit": true
                          
                         }]
                    }
                ],
                "value":[{"name":'Report type',
                          'ns':"cvd",  
                          'ac':"cvd:0001",  
                          'value':'clinical-report',
                          'label':'Clinical report',
                          'id': 'report_type',
                          "type":"label",
                          "edit": false},
                         {"name":'Patient information',
                          'ns':"cvd",  
                          'ac':"cvd:0011",  
                          'value':'clinical-patient-information',
                          'id': 'report_value_patient-information',
                          "type":"text",
                          "edit": true},
                         {"name":'Genetic testing (background ?)',
                          'ns':"cvd",  
                          'ac':"cvd:0012",  
                          'value':'clinical-genetic-tresting',
                          'id': 'report_value_clinical-genetic-testing',
                          "type":"text",
                          "edit": true},                      
                         {"name":'Physical exam',
                          'ns':"cvd",  
                          'ac':"cvd:0013",  
                          'value':'clinical-physical-exam',
                          'id': 'report_value_clinical-physical-exam',
                          "type":"text",
                          "edit": true},                      
                         {"name":'Comments',
                          'ns':"cvd",
                          'ac':"cvd:0006",
                          'id':'report_value_comments',
                          "type":"text",
                          'value':'comments',
                          "edit": true}]
            }
        },
     "protein":{
           "active": false,
           type:"protein-report",
           cvType:{ac:"dxf:0098",definition:"",name:"protein-report",ns:"dxf"},
           label:"Protein report",
           "ac":{
              "id":"report_ac",
              "vpath":['ac'],
              "type":"hidden"
           },
           "target":[
                  {"name":"ns",
                   "vpath":['feature','node','ns'],
                   "id":"report_target_ns",
                   "type":"hidden" },
                  {"name":"ac",
                   "vpath":['feature','node','ac'],
                   "id":"report_target_ac",
                   "type":"hidden" },
                  {"name":"Protein name",
                   "vpath":['feature','node','name']},
                  {"name":"Gene",
                   "vpath":['feature','node','gene']},
                  {"name":"Taxon",
                   "vpath":['feature','node','taxon'],
                   "type":"taxon" },
                  {"name":"Cross-references",
                   "vpath":['feature','node','xrefs'],
                   "type":"xref",
                   "id":"report_target_feature_node_xrefs",
                   "list":true
                  },
                  {"name":"Protein Sequence variant",
                   "id":"report_target_feature",
                   "list": true,
                   "value":[
                      {"name":"Name",
                      'id':'report_target_feature_label',
                       "vpath":['feature','label'],
                       "edit": true
                      },
                      {
                       "name":"feature_name",
                       "id":'report_target_feature_name',
                       "vpath":['feature','name'],
                       "edit": false,
                       "type": "hidden"
                      },
                      {"name":"Type",
                       "id":"report_target_feature_cvtype",
                       "vpath":['feature','cvType'],
                       "type": 'cvterm',
                       "cvt-list":[{"ns":"psi-mi","ac":"MI:0000",
                                    "value":"MI:0000","name":"--not specified--"},
                                   {"ns":"psi-mi","ac":"MI:0001",
                                    "value":"MI:0001","name":"variant"},
                                   {"ns":"psi-mi","ac":"MI:0118",
                                    "value":"MI:0118","name":"mutation"}],
                       "edit": true

                      },
                      {"name":"GRCh37 coordinate", 
                       "id":"report_target_feature_grch37",
                       "vpath":['feature','grch37'],
                       "edit":true                      
                      },
                      {"name":"GRCh38 coordinate", 
                       "id":"report_target_feature_grch38",
                       "vpath":['feature','grch38'],
                       "edit":true                      
                      },
                      {"name":"Position/Range",
                       "id":'report_target_feature_ranges',
                       "list": true,
                       "edit": true,
                       "vpath":['feature','ranges'],
                       "type": 'range'
                       },
                      {"name":"Cross-references",
                       "css-class": "bkd-rep-head-3",
                       "id":'report_target_feature_xrefs', 
                       "vpath":['feature','xrefs'],
                       "type":"xref",
                       "xref-ns":[{"ns":"","label":"--not specified--"},
                                  {"ns":"dbsnp","label":"dbSNP"},
                                  {"ns":"omim","label":"OMIM"},
                                  {"ns":"cosmic","label":"Cosmic"},
                                  {"ns":"pubmed","label":"PubMed"}],
                       "xref-type":[{"ns":"psi-mi","ac":"MI:0000","value":"MI:0000",
                                     "name":"--not specified--","label":"--not specified--"},
                                    {"ns":"psi-mi","ac":"MI:0001","value":"MI:0001",
                                     "name":"sequence-variant","label":"Sequence variant"},
                                    {"ns":"dxf","ac":"dxf:0077","value":"dxf:0077",
                                     "name":"has-phenotype","label":"Phenotype"},
                                    {"ns":"dxf","ac":"dxf:0014","value":"dxf:0014",
                                     "name":"described-by","label":"Describes"}],
                       "list":true,
                       "edit": true

                      }]
                  }],
           "value":[ {"name":'Report type',
                      'ns':"cvd",  
                      'ac':"cvd:0000",  
                      'value':'report-channel',
                      'label':'Protein report',
                      'id': 'report_type',
                      "type":"label",
                      "edit": false},
                     {"name":'Protein field #1',
                      'ns':"cvd",  
                      'ac':"cvd:0001",  
                      'value':'channel-activation',
                      'id': 'report_value_channel-activation',
                      "type":"text",
                      "edit": true},
                     {"name":'Protein field #2',
                      'ns':"cvd",  
                      'ac':"cvd:0002",  
                      'id':'report_value_channel-inactivation',
                      'value':'channel-inactivation',
                      "type":"text",
                      "edit": true},
                     {"name":'Protein field #3',
                      'ns':"cvd",  
                      'ac':"cvd:0003",  
                      'id':'report_value_channel-selectivity',
                      'value':'channel-selectivity',
                      "type":"text",
                      "edit": true},
                     {"name":'Protein field #4',
                      'ns':"cvd",  
                      'ac':"cvd:0004",
                      'id':'report_value_channel-expression',
                      'value':'channel-expression',
                      "type":"text",
                      "edit": true},
                     {"name":'Comments',
                      'ns':"cvd",
                      'ac':"cvd:0005",
                      'id':'report_value_comments',
                      'value':'comments',
                       "type":"text",
                       "edit": true}]
          }
   },
   "node":{
    "type":{
      "vpath":['type-name'],      
      "view":{
        "protein":{
            "type":{
                "val":"protein",
                "label":"",
            },
            "ac":{                
                "vpath":['name'],
                "id":"node_ac"
            },
            "defpane": "feature",
            "pane":[
                {id:"function",
                 label:"Function",
                 header: true,
                 field:[
                     {name:"Function",
                      vpath:['attrs'],
                      type:"text",
                      condition:[
                          {  
                              test:['type-name'],
                              equal:"function"
                          },                  
                          {  
                              test:['xrefs','ac'],
                              equal:['upr']
                          }],
                      value:["value"],
                      list:false,
                      miss:"%DROP%"
                     },
                     {name:"Activity",
                      vpath:['attrs'],
                      type:"text",
                      condition:[
                          {
                              test:['type-name'],
                              equal:"activity-regulation"                  
                          }],
                      value:["value"],
                      list:false,
                      miss:"%DROP%"
                     }
                 ]
                },
                {"id":"sequence",
                 "label":"Sequence",
                 "header": true,
                 "field":[
                     {name:"Sequence",
                      vpath:['sequence'],  // 'feats' 
                      type:"sequence",
                      "config":{}
                     }]
                },                
                {id:"feature",
                 label:"Features",
                 header: true,
                 header_conf: {
                     query_id: "poi",
                     query_prelabel: ": ",
                     query_postlabel: " position of interest",
                     query_tp: "type_set_clear",
                     query_vtype: "%%int%%",
                     query_vlen: 10,
                     query_tlist: [
                         { label: "Protein", value: "protein" },
                         { label: "Genome", value: "genome" } ]

                     /*
                     query_val:[
                         //{ label: "All",
                         //  id: "poi-all",
                         //  value: "all" },
                         { label: "Protein position of interest:",
                           id: "poi-protein",
                           value: "%%text%%",
                           textid: "poi-protein-id",
                           flen: 4 },
                         { label: "Genome position of interest:",
                           id: "poi-genome",
                           value: "%%text%%",
                           textid: "poi-genome-id",
                           flen: 8 }]
                     */
                 },
                 help: true,
                 help_conf: {
                     anchor: "#bkd-modal-div",
                     url: "page?id=help-feature-selection&ret=body"
                 },
                 field:[
                     {name:"Features",
                      vpath:['feature'],  // 'feats' 
                      type:"feature",
                      condition:[{  
                          test:['type-name'],
                          equal:"mutation"
                      }],
                      config:{
                          "lollipanel":{
                              anchor: "#flist-lollipop",
                              detailtable:{
                                  anchor: "#flist-details",
                                  table_class: 'bkd-fdet-table-style',
                                  head_class: 'bkd-fdet-th-style',
                                  aapos_class: 'bkd-fdet-pos-style',
                                  column:[

                                      { cid:'c1', name:"Variant",
                                        data_class:'bkd-fdet-td-style',
                                        value:'shrt', type:'string', "xref-ns": null
                                      },
                                      { cid:'c2', name:"Clinical Significance",
                                        data_class:'bkd-fdet-td-style',
                                        value:'clinsig',default:'unspecified',
                                        type:'string', "xref-ns": null
                                      },
                                      { cid:'c6', name:"ClinGen",
                                        data_class:'bkd-fdet-td-style',
                                        value:'cglink', type:'hlink', "xref-ns": 'clingen',
                                        url: "https://reg.clinicalgenome.org/redmine/projects/registry/genboree_registry/by_canonicalid?canonicalid="},
                                      
                                      { cid:'c4', name:"ClinVar",
                                        data_class:'bkd-fdet-td-style',
                                        value:'cvlink', trim:'\\.\\d+$',
                                        type:'hlink',
                                        "xref-ns": 'clinvar',
                                        url: "https://www.ncbi.nlm.nih.gov/clinvar/variation/" },
                                      
                                      { cid:'c3', name:"dbSNP", data_class:'bkd-fdet-td-style',
                                        value:'snlink', type:'hlink', "xref-ns": 'dbsnp',
                                        url: "https://www.ncbi.nlm.nih.gov/snp/" },
                                      
                                      { cid:'c5', name:"Gnomad", data_class:'bkd-fdet-td-style',
                                        value:'gnlink', type:'hlink', "xref-ns": 'gnomad',
                                        url: "https://gnomad.broadinstitute.org/variant/" },
                                      
                                      { cid:'c7', name:"CVDB", data_class:'bkd-fdet-td-style',
                                        value:'cvdblink', type:'hlink', "xref-ns": 'cvdb',
                                        url: "report" }
                                  ]
                              }
                          },
                          "tabs":{
                              "tab-anchor": "#flist-tabs",
                              "tab-class":"tab-view",
                              "view-anchor":"#flist-view",
                              "view-class":"bkd-feat-tab-port",
                              "tablist": [
                                  { "tab-id":"track-tab",
                                    "view-id":"track-port"},
                                  
                                  { "tab-id":"homo-tab-panther",
                                    "view-id":"homo-port-panther"},
                                  
                                  { "tab-id":"homo-tab-ucsc",
                                    "view-id":"homo-port-ucsc"},
                                  
                                  { "tab-id":"topo-tab",
                                    "view-id":"topo-port"},
                                  
                                  { "tab-id":"swm-tab",
                                    "view-id":"swm-port"},
                                  
                                  { "tab-id":"str-tab",
                                    "view-id":"str-port"}
                              ]
                          }
                      },
                      header:true,
                      list:true,
                      miss: "%DROP%",
                      header:true
                     }
                 ]
                },                
                //{id:"variant",
                // label:"Variants",
                // header: true,
                // field:[]
                //},                
                //{id:"structure",
                // label:"Structure",
                // header: true,
                // field:[]
                //},
                //{id:"homologs",
                // label:"Homologs",
                // header: true,
                // field:[]
                //},
                //{id:"medical",
                // label:"Medical",
                // header: true,
                // field:[]
                //},
                {id:"xrefs",
                 label:"Cross-Refs",
                 header: true,
                 field:[
                     {name:"Cross-references",
                      vpath:['xrefs'],
                      type:"xref",
                      header:true,
                      list:true,
                      miss: "%DROP%"}
                 ]
                }          
            ],
            field:[
                //{name:"CVDB Accession",
                // vpath:['ac'],
                // type:"text"
                //},
                {name:"Short name",
                 vpath:['label'],
                 type:"text"
                },            
                {name:"Alternative name(s)",
                 vpath:['alias'],
                 type:"text",
                 condition:[{
                     test:['type-name'],
                     equal:"synonym"
                 }],
                 value:["alias"],
                 header: true,
                 list: true,
                 hide: true,
                 miss: "%DROP%" 
                },           
                {name:"Gene Name",
                 vpath:['alias'],
                 type:"text",
                 condition:[{
                     test:['type-name'],
                     equal:"gene-name"
                 }],
                 value:["alias"],              
                 list:false,
                 miss:"%DROP%"
                },
                {name:"Gene synonym(s)",
                 vpath:['alias'],
                 type:"text",
                 condition:[{
                     test:['type-name'],
                     equal:"gene-synonym"
                 }],
                 value:["alias"],
                 header:true,
                 list:false,
                 miss:"%DROP%"
                },
                {name:"NCBI Gene",
                 vpath:['xref'],
                 type:"link",
                 "url":"https://www.ncbi.nlm.nih.gov/gene/%%VAL%%",
                 condition:[{
                     test:['ns'],
                     equal:"GeneID"
                 }],
                 value:["ac"],              
                 list:false,
                 miss:"%DROP%"
                },
                {name:"AllianceGenome",
                 vpath:['xref'],
                 type:"link",
                 "url":"https://www.alliancegenome.org/gene/%%VAL%%",
                 condition:[{
                     test:['ns'],
                     equal:"AllianceGenome"
                 }],
                 value:["ac"],              
                 list:false,
                 miss:"%DROP%"
                },

                {name:"OMIM Gene",
                 vpath:['xref'],
                 type:"link",
                 "url":"https://www.omim.org/entry/%%VAL%%",
                 condition:[
                     { test:['ns'],
                       equal:"MIM" }
                 ],
                 value:["ac"],              
                 list:false,
                 miss:"%DROP%"
                },
                
                {"name":"UniprotKB",
                 "vpath":['upr'],
                 "type":"link",
                 "url":"https://www.uniprot.org/uniprot/%%VAL%%",
                 "miss":"N/A"},
                
                {"name":"RefSeq",
                 "vpath":['rsq'],
                 "type":"link",
                 "url":"https://www.ncbi.nlm.nih.gov/protein/%%VAL%%",
                 "miss":"%DROP%"
                },

                {"name":"Taxon",
                 "vpath":['taxon'],
                 "type":"taxon",
                 "url":"https://www.ncbi.nlm.nih.gov/Taxonomy/Browser/wwwtax.cgi?id=%%VAL%%"
                }
                                
            ],
            "tab":[
            ]
         },
         gene:{
           type:{
              "val":"gene",
              "label":"Gene Record:",
                
           },
           "ac":{
               "vpath":['ac'],
               "id":"node_ac"
           },
           defpane: "function",
           pane:[
             {id:"function",
              label:"Function",           
              field:[]
             }
           ],
           "field":[]
         }
          
      }
    }
  },
     
  "xref-type":[{"ns":"psi-mi","ac":"MI:0000","value":"MI:0000",
                "name":"--not specified--","label":"--not specified--"},
               {"ns":"psi-mi","ac":"MI:1241","value":"MI:0001",
                "name":"sequence-variant","label":"Variant (natural)"},
               {"ns":"dxf","ac":"dxf:0077","value":"dxf:0077",
                "name":"has-phenotype","label":"Phenotype"},
               {"ns":"dxf","ac":"dxf:0014","value":"dxf:0014",
                "name":"described-by","label":"Data source"}]
};
                

