curl -X POST "10.1.7.103:9200/cvdb-index-000001/_doc" -H 'Content-Type: application/json' -d'
{"node":{
     "type": { 
       "name": "protein",
         "ns": "dxf",
         "ac": "dxf:0001"
       },    
     "name":{
        "short": "Act",
        "full": "Actin",
        "synonym": "skeletal actin"
     }  
    }
 }
'
