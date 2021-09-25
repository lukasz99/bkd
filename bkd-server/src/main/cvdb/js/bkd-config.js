BKDconf = {
  "report": {     
     "feature":{
        "protein":{
           type:"protein-report",
           cvType:{ac:"dxf:0098",definition:"",name:"protein-report",ns:"dxf"},
           label:"Protein report",
           "ac":{
              "id":"report_ac",
              "vpath":['ac'],
              "type":"hidden"
           },
           "target":[
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
                       "cvt-list":[{"ns":"psi-mi","ac":"MI:0000","value":"MI:0000","name":"--not specified--"},
                                   {"ns":"psi-mi","ac":"MI:0001","value":"MI:0001","name":"variant"},
                                   {"ns":"psi-mi","ac":"MI:0118","value":"MI:0118","name":"mutation"}],
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
          },

          "protein-channel":{
             "type":"channel-report",
             cvType:{"ac":"dxf:0096","definition":"","name":"channel-report","ns":"dxf"},
             "label":"Channel report",
             "ac":{
                "id":"ac",
                "vpath":['ac'],
                "type":"hidden"
             },
             "target":[
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
              "value":[{"name":'Report type',
                      'ns':"cvd",  
                      'ac':"cvd:0000",  
                      'value':'report-channel',
                      'label':'Channel report',
                      'id': 'report_type',
                      "type":"label",
                      "edit": false},
                     {"name":'Channel activation',
                      'ns':"cvd",  
                      'ac':"cvd:0001",  
                      'value':'channel-activation',
                      'id': 'report_value_channel-activation',
                      "type":"text",
                      "edit": true},
                     {"name":'Channel inactivation',
                      'ns':"cvd",  
                      'ac':"cvd:0002",  
                      'id':'report_value_channel-inactivation',
                      'value':'channel-inactivation',
                      "type":"text",
                      "edit": true},
                     {"name":'Channel selectivity',
                      'ns':"cvd",  
                      'ac':"cvd:0003",  
                      'id':'report_value_channel-selectivity',
                      'value':'channel-selectivity',
                      "type":"text",
                      "edit": true},
                     {"name":'Channel expression',
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
          },

        "protein-transporter":{
           "type":"transporter-report",
           cvType:{"ac":"dxf:0097","definition":"","name":"transporter-report","ns":"dxf"},
           "label":"Transporter report",
           "ac":{
              "id":"ac",
              "vpath":['ac'],
              "type":"hidden"},
           "target":[
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
                                    {"value":"MI:0003","name":"describes"}],
                       "list":true,
                       "edit": true

                      }]
                  }],
           "value":[ {"name":'Report type',
                      'ns':"cvd",  
                      'ac':"cvd:0000",  
                      'value':'report-transporter',
                      'label':'Transporeter report',
                      'id': 'report_type',
                      "type":"label",
                      "edit": false},
                      {"name":'Transporter field #1',
                      'ns':"cvd",  
                      'ac':"cvd:0001",  
                      'value':'channel-activation',
                      'id': 'report_value_channel-activation',
                      "type":"text",
                      "edit": true},
                     {"name":'Transporter field #2',
                      'ns':"cvd",  
                      'ac':"cvd:0002",  
                      'id':'report_value_channel-inactivation',
                      'value':'channel-inactivation',
                      "type":"text",
                      "edit": true},
                     {"name":'Transporter field #3',
                      'ns':"cvd",  
                      'ac':"cvd:0003",  
                      'id':'report_value_channel-selectivity',
                      'value':'channel-selectivity',
                      "type":"text",
                      "edit": true},
                     {"name":'Transporter field #4',
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
                      "type":"text",
                      'value':'comments',
                      "edit": true}]
        },

        "gene":{
           cvType:{ac:"dxf:0099",definition:"",name:"gene-report",ns:"dxf"},
           "type":"gene-report",
           "label":"Gene report",
           "fld":[]
        },
        "clinical-report":{
           cvType:{ac:"dxf:0000",definition:"",name:"protein-report",ns:"dxf"},
           "type":"clinical-report",
           "label":"Clinical report",
           "fld":[]
        }
     }
  },
  node:{
    type:{
      vpath:['cvType','name'],      
      view:{
        protein:{
            "type":{
              "val":"protein",
              "label":"Protein Record: ",
            },
            "ac":{
              "vpath":['ac'],
              "id":"node_ac"
            },
            defpane: "function",
            pane:[
              {id:"function",
               label:"Function",
               header: true,
               field:[
                 {name:"Function",
                  vpath:['attrs'],
                  type:"text",
                  condition:{
                    test:['cvType','name'],
                    equal:"function",
                    value:["value"]
                  },
                  list:false,
                  miss:"%DROP%"
                 },
                 {name:"Activity",
                  vpath:['attrs'],
                  type:"text",
                  condition:{
                    test:['cvType','name'],
                    equal:"activity-regulation",
                    value:["value"]
                  },
                  list:false,
                  miss:"%DROP%"
                 }
               ]
              },
              {id:"sequence",
               label:"Sequence",
                header: false,
               field:[
                 {name:"Sequence",
                  vpath:['sequence'],
                  type:"sequence",
                  header:true
                 }]
              },
              {id:"variant",
               label:"Variants",
               header: true,
               field:[]
              },
              {id:"feature",
               label:"Features",
               header: true,
               field:[
                 {name:"Features",
                  vpath:['feats'],
                  type:"feature",
                  header:true,
                  list:true,
                  miss: "%DROP%",
                  header:true
                 }
               ]
              },
              {id:"structure",
               label:"Structure",
               header: true,
               field:[]
              },
              {id:"homologs",
               label:"Homologs",
               header: true,
               field:[]
              },
              {id:"medical",
               label:"Medical",
               header: true,
               field:[]
              },
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
              {name:"Accession",
               vpath:['ac'],
               type:"text"
              },
              {name:"Short name",
               vpath:['label'],
               type:"text"
              },
              {name:"Recommended name",
               vpath:['name'],
               type:"text"
               },           
              {name:"Alternative name(s)",
               vpath:['alias'],
               type:"text",
               condition:{
                 test:['cvType','name'],
                 equal:"synonym",
                 value:["alias"]
               },
               header:true,
               list:true,
               miss:"%DROP%" 
              },           
              {name:"Gene",
               vpath:['alias'],
               type:"text",
               condition:{
                 test:['cvType','name'],
                 equal:"gene-name",
                 value:["alias"]
               },
               list:false,
               miss:"%DROP%"
              },
              {name:"Gene synonym(s)",
               vpath:['alias'],
               type:"text",
               condition:{
                 test:['cvType','name'],
                 equal:"gene-synonym",
                 value:["alias"]
               },
               header:true,
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
               "miss":"N/A"
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
               {"ns":"psi-mi","ac":"MI:0001","value":"MI:0001",
                "name":"sequence-variant","label":"Sequence variant"},
               {"ns":"dxf","ac":"dxf:0077","value":"dxf:0077",
                "name":"has-phenotype","label":"Phenotype"},
               {"ns":"dxf","ac":"dxf:0014","value":"dxf:0014",
                "name":"described-by","label":"Describes"}]
};
                

