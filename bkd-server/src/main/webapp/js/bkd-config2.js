BKDconf = {
  "report": {
     "subject":{
        "node":{
           "protein":[
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
                "list":true
               }


],
           "gene":[]
        },
        "feature":{}
        },
     },
     "value":{}      
  }
}



     "node":{
        "protein":{
           "fld":[]
         },
         "gene":{
            "fld":[]
         }
     },
     "feature":{
        "protein":{
           "subject":[
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
                   "list":true
                  },
                  {"name":"Sequence variant",
                   "list": true,
                   "value":[
                      {"name":"Variant name",
                       "vpath":['feature','label'],
                       "edit": true
                      },
                      {"name":"Variant type",
                       "vpath":['feature','cvType','name'],
                       "type": 'cvterm',
                       "edit": true

                      },
                      {"name":"Cross-references",
                       "vpath":['feature','xrefs'],
                       "type":"xref",
                       "list":true,
                       "edit": true

                      }]
                  }],
           "value":[ {"name":'Channel activation',
                      'value':'channel-activation',
                      "edit": true},
                     {"name":'Channel inactivation',
                      'value':'channel-inactivation',
                      "edit": true},
                     {"name":'Channel selectivity',                    
                      'value':'channel-selectivity',
                      "edit": true},
                     {"name":'Channel expression',
                      'value':'channel-expression',
                      "edit": true},
                     {"name":'Comments',
                      'value':'comments',
                      "edit": true}]
        },
        "gene":{
           "fld":[]
        }
     }
  }
};
                

