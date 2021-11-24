curl -X PUT "10.1.7.103:9200/cvdb-node-index-000001?pretty" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": { 
      "node": { 
        "properties": {
          "ac":{ "type": "text" },
          "type": { 
            "properties": {
              "name": { "type": "text" },
              "ac":  { "type": "text" }
            }
          },
          "name":{
            "properties":{
              "short": { "type": "text" },
              "full": { "type": "text" },
             "synonym": { "type": "text" }
            }   
          },
          "xref":{         
            "properties":{
              "ac": { "type": "text" },
              "type": { "type": "text" },
              "tns": { "type": "text" },
              "tac": { "type": "text" },
            }   
          },
          "attribute":{         
            "properties":{
              "ac": { "type": "text" },
              "name": { "type": "text" },
              "value": { "type": "text" },
            }   
          },
          "feature":{         
            "properties":{
              "ac": { "type": "text" },
              "name": {
                "properties":{
                  "short": { "type": "text" },
                  "full": { "type": "text" }
                }
              },
              "range":{
                "type":"nested",
                "start": { "type": "text" },
                "stop": { "type": "text" },
                "sequence": { "type": "text" }
              },
              "xref":{         
                "properties":{
                  "ac": { "type": "text" },
                  "type": { "type": "text" },
                  "tns": { "type": "text" },
                  "tac": { "type": "text" },
                }   
              },
              "attribute":{         
                "properties":{
                  "ac": { "type": "text" },
                  "name": { "type": "text" },
                  "value": { "type": "text" },
                }   
              }   
            }   
          },
          "sequence"{  "type": "text" }
        }
      }
    }
  }
}
'
