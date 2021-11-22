curl -X GET "10.1.7.103:9200/cvdb-node-index-000001/_search?pretty" -H 'Content-Type: application/json' -d'
{"size":500,
  "query":{
    "bool":{"filter":[],
            "must":{"simple_query_string":{"default_operator":"and",
                                          "query":"actin"}
                  }
          }
  },
  "from":0,
  "_source":["id"],
  "sort":[]
}
'
