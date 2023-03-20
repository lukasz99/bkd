curl -X GET "10.1.8.202:9200/cvdb-flop-node-index-000000/_search?pretty" -H 'Content-Type: application/json' -d'
{"size":500,
 "query":{
   "bool":{
     "filter":[],
     "must":{
         "simple_query_string":{
              "default_operator":"and",
               "query":"%%QUERY%%%"
          }
      }
      }
    },
    "from":0,
    "_source":["id"],
    "sort":[]
}'
