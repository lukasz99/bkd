BKDconf = {
  "report": {     
     "feature":{
        "protein":{
           "type":"protein-feature",
           "subject":[
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
                  {"name":"Sequence variant",
                   "id":"report_target_feature",
                   "list": true,
                   "value":[
                      {"name":"Name",
                      'id':'report_target_feature_label',
                       "vpath":['feature','label'],
                       "edit": true
                      },
                      {"name":"Type",
                       "id":"report_target_feature_cvtype",
                       "vpath":['feature','cvType'],
                       "type": 'cvterm',
                       "cvt-list":[{"value":"MI:0000","name":"--not specified--"},
                                   {"value":"MI:0001","name":"variant"},
                                   {"value":"MI:0118","name":"mutation"}],
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
                       "id":'report_target_feature_xrefs', 
                       "vpath":['feature','xrefs'],
                       "type":"xref",
                       "xref-ns":["--not specified--", "dbSNP","OMIM","Cosmic","PubMed"],
                       "xref-type":[{"value":"MI:0000","name":"--not specified--"},
                                    {"value":"MI:0001","name":"sequence variant"},
                                    {"value":"MI:0002","name":"phenotype"},
                                    {"value":"MI:0002","name":"describes"}],
                       "list":true,
                       "edit": true

                      }]
                  }],
           "value":[ {"name":'Channel activation',
                      'ns':"cvd",  
                      'ac':"cvd:0001",  
                      'value':'channel-activation',
                      'id': 'report_value_channel-activation',
                      "edit": true},
                     {"name":'Channel inactivation',
                      'ns':"cvd",  
                      'ac':"cvd:0002",  
                      'id':'report_value_channel-inactivation',
                      'value':'channel-inactivation',
                      "edit": true},
                     {"name":'Channel selectivity',
                      'ns':"cvd",  
                      'ac':"cvd:0003",  
                      'id':'report_value_channel-selectivity',
                      'value':'channel-selectivity',
                      "edit": true},
                     {"name":'Channel expression',
                      'ns':"cvd",  
                      'ac':"cvd:0004",
                      'id':'report_value_channel-expression',
                      'value':'channel-expression',
                      "edit": true},
                     {"name":'Comments',
                      'ns':"cvd",
                      'ac':"cvd:0005",
                      'id':'report_value_comments',
                      'value':'comments',
                      "edit": true}]
        },
        "gene":{
           "fld":[]
        }
     }
  },
  "node":{
        "protein":{
           "fld":[]
         },
         "gene":{
            "fld":[]
         }
     }
};
                

