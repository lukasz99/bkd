curl -X PUT "10.1.8.202:9200/cvdb-flip-node-index-000000?pretty" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": { 
      "node": { 
        "properties": {
          "ac":{ "type": "text", "copy_to":"full_text"},
          "type": { 
            "properties": {
              "name": { "type": "text", "copy_to":"full_text" },
              "ac":  { "type": "text" }
            }
          },
          "name":{
            "properties":{
              "short": { "type": "text","copy_to":"full_text" },
              "full": { "type": "text","copy_to":"full_text" },
             "synonym": { "type": "text","copy_to":"full_text" }
            }   
          },
          "xref":{
            "type":"nested",
            "properties":{
              "ns": { "type": "text" },   
              "ac": { "type": "text","copy_to":"full_text" },
              "type": { "type": "text","copy_to":"full_text" },
              "tac": { "type": "text" }
            }   
          },
          "attribute":{         
            "properties":{
              "ac": { "type": "text" },
              "name": { "type": "text","copy_to":"full_text" },
              "value": { "type": "text","copy_to":"full_text" }
            }   
          },
          "feature":{         
            "properties":{
              "ac": { "type": "text","copy_to":"full_text" },
              "name": {
                "properties":{
                  "short": { "type": "text","copy_to":"full_text" },
                  "full": { "type": "text","copy_to":"full_text" }
                }
              },
              "range":{
                "type":"nested",
                "properties":{
                  "start": { "type": "integer" },
                  "stop": { "type": "integer" },
                  "sequence": { "type": "text" }
                }
              },
              "xref":{         
                "properties":{
                  "ac": { "type": "text","copy_to":"full_text" },
                  "type": { "type": "text","copy_to":"full_text" },                 
                  "tac": { "type": "text" }
                }   
              },
              "attribute":{         
                "properties":{
                  "ac": { "type": "text" },
                  "name": { "type": "text","copy_to":"full_text" },
                  "value": { "type": "text","copy_to":"full_text" }
                }   
              }   
            }   
          },
          "sequence":{  "type": "text","copy_to":"full_text" }
        }
      }
    }
  }
}
'
